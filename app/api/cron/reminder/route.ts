import { NextResponse } from "next/server";
import { getAdminSupabase, reminderEmailHTML } from "@/lib/email-helpers";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Check if there's a draft product drop for this week
    const monday = new Date();
    monday.setDate(monday.getDate() + ((1 - monday.getDay() + 7) % 7 || 7));
    const weekStart = monday.toISOString().split("T")[0];

    const { data: draft } = await supabase
      .from("product_drops")
      .select("id")
      .eq("week_start", weekStart)
      .eq("status", "draft")
      .maybeSingle();

    // Send to all admin addresses (comma-separated ADMIN_EMAILS, or fallback)
    const adminEmails = (process.env.ADMIN_EMAILS ?? "hello@firstsalelab.com")
      .split(",")
      .map(e => e.trim())
      .filter(Boolean);

    await resend.emails.send({
      from: "First Sale Lab <hello@firstsalelab.com>",
      to: adminEmails,
      subject: `⏰ Review this week's product drop before Monday`,
      html: reminderEmailHTML(!!draft),
    });

    return NextResponse.json({ success: true, hasDraft: !!draft, weekStart });
  } catch (err) {
    console.error("Cron reminder error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
