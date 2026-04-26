import { NextResponse } from "next/server";
import { getAdminSupabase, getProUsers, sendBatch, productNewsletterHTML } from "@/lib/email-helpers";
import type { ProductDrop } from "@/lib/perplexity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();

  try {
    // Find the most recently published product drop
    const { data: drop, error } = await supabase
      .from("product_drops")
      .select("*")
      .eq("status", "published")
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!drop) {
      return NextResponse.json({ success: false, reason: "No published product drop found" });
    }

    const typedDrop = drop as ProductDrop;

    // Format week date nicely
    const weekDate = new Date(typedDrop.week_start).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Get all Pro users
    const proUsers = await getProUsers(supabase);
    if (!proUsers.length) {
      return NextResponse.json({ success: true, sent: 0, reason: "No Pro users found" });
    }

    // Build emails
    const emails = proUsers.map(user => ({
      to: user.email,
      subject: `📦 Your weekly product picks — ${weekDate}`,
      html: productNewsletterHTML(user.firstName, typedDrop.products, weekDate),
    }));

    await sendBatch(emails);

    return NextResponse.json({ success: true, sent: emails.length, weekStart: typedDrop.week_start });
  } catch (err) {
    console.error("Cron newsletter error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
