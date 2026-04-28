import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { analyzeStore } from "@/lib/perplexity";
import { gateAITool, logAITool } from "@/lib/ai-tool-gate";

export const dynamic = "force-dynamic";

/**
 * POST /api/store-autopsy
 * Body: { url, description?, niche? }
 *
 * Growth-tier exclusive. Routes through the shared `gateAITool` so it gets
 * the same rate-limit (20/day) + logging (`ai_tool_log`) as the other AI tools,
 * then explicitly rejects Pro users since this is Growth-only.
 *
 * Calls Gemini's url_context tool via analyzeStore() to fetch + analyse the URL.
 */
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const gate  = await gateAITool(supabase, token, "store_autopsy");
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, upgrade: gate.upgrade, rateLimited: gate.rateLimited, tier: gate.tier, limit: gate.limit },
      { status: gate.status },
    );
  }

  // Growth-only: Pro users got past the gate (they're paid) but this tool isn't theirs
  if (gate.tier !== "growth") {
    return NextResponse.json(
      { error: "Store Autopsy is a Scale Lab exclusive. Upgrade from Pro to Scale Lab to unlock.", upgrade: true, tier: gate.tier },
      { status: 403 },
    );
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
    await logAITool(supabase, gate.user.id, "store_autopsy", input, autopsy);
    return NextResponse.json({ success: true, autopsy, used: gate.used + 1, limit: gate.limit, tier: gate.tier });
  } catch (err) {
    console.error("Store autopsy error:", err);
    return NextResponse.json({ error: "Analysis failed. Try again in a moment." }, { status: 500 });
  }
}
