import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateBriefing } from "@/lib/perplexity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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
    const content = await generateBriefing();

    // First day of the current month
    const now = new Date();
    const month = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const { error } = await supabase.from("briefings").insert({
      month,
      content,
      status: "draft",
    });

    if (error) throw error;

    return NextResponse.json({ success: true, month });
  } catch (err) {
    console.error("Cron briefing error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
