import { NextResponse } from "next/server";
import { getAdminSupabase, streakSaveEmailHTML } from "@/lib/email-helpers";
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
 * GET /api/cron/streak-save
 *
 * Daily cron — finds users whose streak is at risk:
 *   - streak_days >= 1
 *   - last_active = yesterday (i.e. they didn't complete a module today)
 *   - haven't received the streak-save email yet today
 *
 * Sends one "your streak is on the line" email per user per day.
 *
 * SQL migration required (run once in Supabase SQL editor):
 *   ALTER TABLE user_profiles ADD COLUMN streak_save_email_date date;
 *
 * Schedule: daily at 19:00 UTC — late-evening for most timezones, gives users
 * a few hours to complete a module before midnight.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const today     = new Date().toISOString().split("T")[0];
    const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split("T")[0]; })();

    // Find profiles with active streak whose last_active = yesterday
    // and who haven't received this email today
    const { data: candidates } = await supabase
      .from("user_profiles")
      .select("id, first_name, streak_days, last_active, streak_save_email_date")
      .gte("streak_days", 1)
      .eq("last_active", yesterday);

    if (!candidates?.length) {
      return NextResponse.json({ success: true, sent: 0, reason: "no candidates" });
    }

    const eligible = candidates.filter(c => c.streak_save_email_date !== today);
    if (eligible.length === 0) {
      return NextResponse.json({ success: true, sent: 0, reason: "all already nudged today" });
    }

    // Pull emails for the eligible users
    const eligibleIds = new Set(eligible.map(c => c.id));
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const emailById = new Map<string, string>();
    authUsers.forEach(u => { if (u.email && eligibleIds.has(u.id)) emailById.set(u.id, u.email); });

    // Pull their progress so we can pick the right "next module"
    const { data: progress } = await supabase
      .from("user_progress")
      .select("user_id, module_id")
      .in("user_id", Array.from(eligibleIds));

    const completedByUser = new Map<string, Set<number>>();
    (progress ?? []).forEach((r: { user_id: string; module_id: number }) => {
      const set = completedByUser.get(r.user_id) ?? new Set<number>();
      set.add(r.module_id);
      completedByUser.set(r.user_id, set);
    });

    let sent = 0;
    const failures: string[] = [];

    for (const profile of eligible) {
      const email = emailById.get(profile.id);
      if (!email) continue;

      const completed = completedByUser.get(profile.id) ?? new Set<number>();
      // Find the lowest module 1–12 they haven't completed
      let nextId = 1;
      for (let i = 1; i <= 12; i++) {
        if (!completed.has(i)) { nextId = i; break; }
        if (i === 12) nextId = 12; // edge: all done — shouldn't trigger here, but safe
      }
      const nextTitle = MODULES[nextId] ?? "the next module";
      const firstName = profile.first_name || email.split("@")[0];

      try {
        await resend.emails.send({
          from: "First Sale Lab <hello@firstsalelab.com>",
          to: email,
          subject: `🔥 Your ${profile.streak_days}-day streak is on the line, ${firstName}`,
          html: streakSaveEmailHTML(firstName, profile.streak_days ?? 0, nextId, nextTitle),
          tags: [
            { name: "type", value: "streak_save" },
            { name: "user_id", value: profile.id },
          ],
        });

        await supabase
          .from("user_profiles")
          .update({ streak_save_email_date: today })
          .eq("id", profile.id);

        sent++;
      } catch (err) {
        failures.push(`${email}: ${err instanceof Error ? err.message : "unknown"}`);
      }
    }

    return NextResponse.json({ success: true, sent, eligible: eligible.length, failures });
  } catch (err) {
    console.error("Cron streak-save error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
