import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateBriefing } from "@/lib/perplexity";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

  try {
    const content = await generateBriefing();

    const now = new Date();
    const month = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const { data, error } = await supabase
      .from("briefings")
      .insert({ month, content, status: "draft" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, briefing: data });
  } catch (err) {
    console.error("Manual generate briefing error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
