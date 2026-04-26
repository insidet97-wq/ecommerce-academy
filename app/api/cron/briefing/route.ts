import { NextResponse } from "next/server";
import { getAdminSupabase, getProUsers, sendBatch, briefingNewsletterHTML } from "@/lib/email-helpers";
import { generateBriefing } from "@/lib/perplexity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();

  try {
    const content = await generateBriefing();

    // First day of the current month
    const now = new Date();
    const month = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    // Auto-publish directly (no draft review needed)
    const { error } = await supabase.from("briefings").insert({
      month,
      content,
      status: "published",
    });

    if (error) throw error;

    // Send to all Pro users immediately
    const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const proUsers = await getProUsers(supabase);

    if (proUsers.length > 0) {
      const emails = proUsers.map(user => ({
        to: user.email,
        subject: `📋 Your ${monthLabel} ecom briefing is here`,
        html: briefingNewsletterHTML(user.firstName, content, monthLabel),
      }));

      await sendBatch(emails);
    }

    return NextResponse.json({ success: true, month, sent: proUsers.length });
  } catch (err) {
    console.error("Cron briefing error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
