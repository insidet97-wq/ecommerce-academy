import { NextResponse } from "next/server";
import { getAdminSupabase, weeklyDigestEmailHTML } from "@/lib/email-helpers";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const MODULES: Record<number, string> = {
  1: "The Rules of the Game",
  2: "Find Your Niche",
  3: "Find Your Winning Product",
  4: "Know Your Customer",
  5: "Build Your Shopify Store",
  6: "Build Your First Sales Funnel",
  7: "Drive Traffic: TikTok Organic",
  8: "Run Your First Paid Ad",
  9: "Conversion Optimisation",
  10: "Build Your Email List",
  11: "Make Your First Sale",
  12: "Scale and Grow",
};

/**
 * GET /api/cron/digest
 *
 * Sunday cron — sends a weekly progress digest to all users showing:
 *   - modules completed this week
 *   - total progress (X / 12)
 *   - current streak
 *   - next module suggestion
 *
 * Sent to ALL users (free and Pro) — not gated. Schedule: Sundays 17:00 UTC
 * which lands at a sensible Sunday afternoon for most timezones.
 *
 * No tracking column needed — it's a regular weekly newsletter, not a
 * one-shot prompt. If a user wants to stop receiving it later, we'll add
 * an unsubscribe flow.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Window for "this week": last 7 days (rolling)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoIso = weekAgo.toISOString();

    // Pull all profiles + auth users + progress in parallel
    const [profilesRes, authRes, progressRes] = await Promise.all([
      supabase.from("user_profiles").select("id, first_name, streak_days"),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
      supabase.from("user_progress").select("user_id, module_id, completed_at"),
    ]);

    const profileById = new Map<string, { first_name: string | null; streak_days: number | null }>();
    (profilesRes.data ?? []).forEach(p => profileById.set(p.id, p));

    // Group progress by user
    const progressByUser = new Map<string, { module_id: number; completed_at: string | null }[]>();
    (progressRes.data ?? []).forEach((r: { user_id: string; module_id: number; completed_at: string | null }) => {
      const arr = progressByUser.get(r.user_id) ?? [];
      arr.push({ module_id: r.module_id, completed_at: r.completed_at });
      progressByUser.set(r.user_id, arr);
    });

    let sent = 0;
    const failures: string[] = [];

    for (const user of authRes.data?.users ?? []) {
      if (!user.email) continue;
      const profile = profileById.get(user.id);
      const firstName = profile?.first_name || user.email.split("@")[0];

      const progress = progressByUser.get(user.id) ?? [];
      const totalDone = progress.length;
      const doneThisWeek = progress.filter(p => p.completed_at && p.completed_at >= weekAgoIso).length;

      // Find next module to suggest
      const completedSet = new Set(progress.map(p => p.module_id));
      let nextId: number | null = null;
      for (let i = 1; i <= 12; i++) {
        if (!completedSet.has(i)) { nextId = i; break; }
      }
      const nextTitle = nextId ? MODULES[nextId] : null;

      try {
        await resend.emails.send({
          from: "First Sale Lab <hello@firstsalelab.com>",
          to: user.email,
          subject: `Your week at First Sale Lab — ${doneThisWeek} module${doneThisWeek === 1 ? "" : "s"} done`,
          html: weeklyDigestEmailHTML(firstName, {
            totalDone,
            doneThisWeek,
            streak: profile?.streak_days ?? 0,
            nextModuleId: nextId,
            nextModuleTitle: nextTitle,
          }),
          tags: [
            { name: "type", value: "weekly_digest" },
            { name: "user_id", value: user.id },
          ],
        });
        sent++;
      } catch (err) {
        failures.push(`${user.email}: ${err instanceof Error ? err.message : "unknown"}`);
      }
    }

    return NextResponse.json({ success: true, sent, failures });
  } catch (err) {
    console.error("Cron digest error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
