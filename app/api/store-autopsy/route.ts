import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { analyzeStore } from "@/lib/perplexity";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/store-autopsy
 * Body: { url, description, niche? }
 *
 * Growth-tier exclusive. Sends competitor info to Groq and returns a
 * structured teardown. Server-side gate ensures free/Pro users can't
 * bypass the UI lock.
 */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Log in to use Store Autopsy" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  // Growth / admin gate
  const admin = isAdmin(user.email);
  let isGrowth = false;
  if (!admin) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_growth")
      .eq("id", user.id)
      .single();
    isGrowth = profile?.is_growth ?? false;
  }
  if (!admin && !isGrowth) {
    return NextResponse.json({ error: "Store Autopsy is a Scale Lab feature.", upgrade: true }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.url || !body?.description) {
    return NextResponse.json({ error: "Missing required fields (url, description)" }, { status: 400 });
  }

  // Truncate inputs
  const input = {
    url:         String(body.url).slice(0, 500),
    description: String(body.description).slice(0, 3000),
    niche:       body.niche ? String(body.niche).slice(0, 200) : undefined,
  };

  if (input.description.length < 50) {
    return NextResponse.json({ error: "Tell us more about what you observed (at least a few sentences)" }, { status: 400 });
  }

  try {
    const autopsy = await analyzeStore(input);
    return NextResponse.json({ success: true, autopsy });
  } catch (err) {
    console.error("Store autopsy error:", err);
    return NextResponse.json({ error: "Analysis failed. Try again in a moment." }, { status: 500 });
  }
}
