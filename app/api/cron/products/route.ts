import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateProducts } from "@/lib/perplexity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Vercel sends Authorization: Bearer <CRON_SECRET> on scheduled invocations
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const products = await generateProducts();

    // Monday of the current week
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const weekStart = monday.toISOString().split("T")[0];

    const { error } = await supabase.from("product_drops").insert({
      week_start: weekStart,
      products,
      status: "draft",
    });

    if (error) throw error;

    return NextResponse.json({ success: true, week_start: weekStart, count: products.length });
  } catch (err) {
    console.error("Cron products error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
