import { NextResponse } from "next/server";
import { getAdminSupabase, reengagementEmailHTML } from "@/lib/email-helpers";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/reengagement
 *
 * Daily cron — sends a single re-engagement email to users who:
 *   - Signed up between 3 and 14 days ago
 *   - Have completed 0 modules
 *   - Have NOT received this email yet (`reengagement_sent_at IS NULL`)
 *
 * Updates `user_profiles.reengagement_sent_at` so each user gets it at most once.
 *
 * SQL migration required (run once in Supabase SQL editor):
 *   ALTER TABLE user_profiles
 *     ADD COLUMN reengagement_sent_at timestamptz;
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Window: signed up between 3 and 14 days ago (don't nag forever)
    const now = new Date();
    const windowEnd   = new Date(now); windowEnd.setDate(now.getDate() - 3);   // signed up >= 3 days ago
    const windowStart = new Date(now); windowStart.setDate(now.getDate() - 14); // signed up <= 14 days ago

    // Get all auth users in the window
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const candidates = users.filter(u => {
      if (!u.email || !u.created_at) return false;
      const created = new Date(u.created_at);
      return created <= windowEnd && created >= windowStart;
    });

    if (candidates.length === 0) {
      return NextResponse.json({ success: true, sent: 0, reason: "no candidates in window" });
    }

    const candidateIds = candidates.map(u => u.id);

    // Pull profiles to filter out users who already got the email
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id, first_name, reengagement_sent_at")
      .in("id", candidateIds);

    const profileById = new Map<string, { first_name: string | null; reengagement_sent_at: string | null }>();
    (profiles ?? []).forEach(p => profileById.set(p.id, p));

    // Pull progress to filter out users with completions
    const { data: progress } = await supabase
      .from("user_progress")
      .select("user_id")
      .in("user_id", candidateIds);

    const usersWithProgress = new Set<string>((progress ?? []).map((r: { user_id: string }) => r.user_id));

    // Filter to truly inactive, never-emailed users
    const targets = candidates.filter(u => {
      if (usersWithProgress.has(u.id)) return false;          // they started a module
      const profile = profileById.get(u.id);
      if (profile?.reengagement_sent_at) return false;        // already nudged
      return true;
    });

    if (targets.length === 0) {
      return NextResponse.json({ success: true, sent: 0, reason: "no eligible users" });
    }

    // Send emails one at a time to avoid Resend batch failure cascading
    let sent = 0;
    const failures: string[] = [];

    for (const user of targets) {
      const profile = profileById.get(user.id);
      const firstName = profile?.first_name || user.email!.split("@")[0];
      try {
        await resend.emails.send({
          from: "First Sale Lab <hello@firstsalelab.com>",
          to: user.email!,
          subject: `${firstName}, your roadmap is waiting`,
          html: reengagementEmailHTML(firstName),
        });

        // Mark sent in DB (upsert in case profile row missing)
        await supabase
          .from("user_profiles")
          .upsert(
            { id: user.id, reengagement_sent_at: new Date().toISOString() },
            { onConflict: "id" }
          );

        sent++;
      } catch (err) {
        failures.push(`${user.email}: ${err instanceof Error ? err.message : "unknown"}`);
      }
    }

    return NextResponse.json({ success: true, sent, eligible: targets.length, failures });
  } catch (err) {
    console.error("Cron reengagement error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
