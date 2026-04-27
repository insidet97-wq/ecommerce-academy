import { NextResponse } from "next/server";
import { getAdminSupabase, nichePickerDay2HTML, nichePickerDay5HTML, nichePickerDay7HTML } from "@/lib/email-helpers";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/niche-drip
 *
 * Daily cron — sends the next email in the Niche Picker drip sequence
 * to leads who haven't unsubscribed.
 *
 * Drip schedule (based on the lead's `created_at`):
 *   Day 0  →  "Your 3 niches"               (sent immediately by /api/niche-picker)
 *   Day 2  →  "Validate in 48 hours"
 *   Day 5  →  "The niche mistake"
 *   Day 7  →  "Take the quiz"               (final)
 *
 * Stage tracking via `niche_leads.drip_stage`:
 *   1 = day-0 sent (set by /api/niche-picker)
 *   2 = day-2 sent
 *   3 = day-5 sent
 *   4 = day-7 sent  (drip complete)
 *
 * SQL migration required:
 *   ALTER TABLE niche_leads ADD COLUMN drip_stage int NOT NULL DEFAULT 0;
 *
 * Schedule: daily at 14:00 UTC.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const now = new Date();

    // Pull all leads currently in the drip sequence (stage 1-3 — stage 4 means done)
    const { data: leads } = await supabase
      .from("niche_leads")
      .select("id, email, niches, created_at, drip_stage")
      .gte("drip_stage", 1)
      .lte("drip_stage", 3);

    if (!leads?.length) {
      return NextResponse.json({ success: true, sent: 0, reason: "no leads in drip" });
    }

    let sent = 0;
    const failures: string[] = [];

    for (const lead of leads) {
      const ageDays = (now.getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24);

      // Determine which email is due next based on current stage + age
      let nextStage: 2 | 3 | 4 | null = null;
      let html = "";
      let subject = "";
      let tagValue = "";

      const firstName = nameFromEmail(lead.email);
      const topNiche = Array.isArray(lead.niches) && lead.niches[0]?.name ? String(lead.niches[0].name) : "your top niche";

      if (lead.drip_stage === 1 && ageDays >= 2) {
        nextStage = 2;
        subject = `${firstName}, validate ${topNiche} in 48 hours`;
        html = nichePickerDay2HTML(firstName, topNiche);
        tagValue = "niche_day2";
      } else if (lead.drip_stage === 2 && ageDays >= 5) {
        nextStage = 3;
        subject = `The niche mistake that kills 90% of new stores`;
        html = nichePickerDay5HTML(firstName);
        tagValue = "niche_day5";
      } else if (lead.drip_stage === 3 && ageDays >= 7) {
        nextStage = 4;
        subject = `${firstName}, your roadmap is one quiz away`;
        html = nichePickerDay7HTML(firstName);
        tagValue = "niche_day7";
      }

      if (!nextStage) continue; // not yet due

      try {
        await resend.emails.send({
          from: "First Sale Lab <hello@firstsalelab.com>",
          to: lead.email,
          subject,
          html,
          tags: [
            { name: "type", value: tagValue },
            { name: "drip_stage", value: String(nextStage) },
          ],
        });

        await supabase
          .from("niche_leads")
          .update({ drip_stage: nextStage })
          .eq("id", lead.id);

        sent++;
      } catch (err) {
        failures.push(`${lead.email}: ${err instanceof Error ? err.message : "unknown"}`);
      }
    }

    return NextResponse.json({ success: true, sent, total_in_drip: leads.length, failures });
  } catch (err) {
    console.error("Cron niche-drip error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || "there";
  const cleaned = local.split(/[._+-]/)[0] || local;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
