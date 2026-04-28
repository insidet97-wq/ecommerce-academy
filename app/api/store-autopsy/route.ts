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
  if (!body?.url) {
    return NextResponse.json({ error: "Paste a competitor URL" }, { status: 400 });
  }

  const rawUrl = String(body.url).trim();
  // Light URL sanity check — Gemini's url_context tool needs a real URL
  try {
    const u = new URL(rawUrl);
    if (!["http:", "https:"].includes(u.protocol)) throw new Error("bad protocol");
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL (must start with https://)" }, { status: 400 });
  }

  // Truncate inputs. description + niche are optional now — Gemini fetches the URL.
  const input = {
    url:         rawUrl.slice(0, 500),
    description: body.description ? String(body.description).slice(0, 3000) : undefined,
    niche:       body.niche       ? String(body.niche).slice(0, 200)        : undefined,
  };

  try {
    const autopsy = await analyzeStore(input);
    return NextResponse.json({ success: true, autopsy });
  } catch (err) {
    console.error("Store autopsy error:", err);
    return NextResponse.json({ error: "Analysis failed. Try again in a moment." }, { status: 500 });
  }
}
