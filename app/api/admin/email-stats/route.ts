import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/email-stats
 *
 * Aggregates email_events into per-`email_type` open/click/bounce rates.
 * Used by the admin email performance dashboard.
 *
 * Reads the last 90 days by default; pass `?days=N` to override.
 */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const days = Math.max(1, Math.min(365, Number(url.searchParams.get("days") ?? 90)));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: events } = await supabase
    .from("email_events")
    .select("event_type, email_type, click_url, created_at, resend_id")
    .gte("created_at", since);

  const list = events ?? [];

  // Aggregate by email_type. Each Resend email_id can produce multiple events
  // (delivered, opened, clicked) — we count UNIQUE resend_ids for delivered/
  // opened/clicked rates, so opening the same email 3 times doesn't double-
  // count.
  type Stats = { delivered: Set<string>; opened: Set<string>; clicked: Set<string>; bounced: Set<string>; complained: Set<string> };
  const byType = new Map<string, Stats>();
  const ensure = (t: string) => {
    let s = byType.get(t);
    if (!s) { s = { delivered: new Set(), opened: new Set(), clicked: new Set(), bounced: new Set(), complained: new Set() }; byType.set(t, s); }
    return s;
  };

  // Most-clicked URLs (across all email types)
  const clickUrlCounts = new Map<string, number>();

  for (const ev of list) {
    const type = ev.email_type ?? "untagged";
    const id = ev.resend_id ?? `unknown-${Math.random()}`;
    const s = ensure(type);
    if (ev.event_type === "email.delivered")  s.delivered.add(id);
    if (ev.event_type === "email.opened")     s.opened.add(id);
    if (ev.event_type === "email.clicked") {
      s.clicked.add(id);
      if (ev.click_url) clickUrlCounts.set(ev.click_url, (clickUrlCounts.get(ev.click_url) ?? 0) + 1);
    }
    if (ev.event_type === "email.bounced")    s.bounced.add(id);
    if (ev.event_type === "email.complained") s.complained.add(id);
  }

  const summary = Array.from(byType.entries()).map(([type, s]) => {
    const delivered = s.delivered.size;
    const opened    = s.opened.size;
    const clicked   = s.clicked.size;
    const bounced   = s.bounced.size;
    const complained = s.complained.size;
    return {
      email_type: type,
      delivered,
      opened,
      clicked,
      bounced,
      complained,
      open_rate:  delivered > 0 ? Math.round((opened  / delivered) * 1000) / 10 : 0,
      click_rate: delivered > 0 ? Math.round((clicked / delivered) * 1000) / 10 : 0,
      bounce_rate: delivered + bounced > 0 ? Math.round((bounced / (delivered + bounced)) * 1000) / 10 : 0,
    };
  }).sort((a, b) => b.delivered - a.delivered);

  // Top click URLs
  const topClicks = Array.from(clickUrlCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([url, count]) => ({ url, count }));

  // Total event count (all events, all types) for perspective
  const totalEvents = list.length;

  return NextResponse.json({
    days,
    totalEvents,
    summary,
    topClicks,
  });
}
