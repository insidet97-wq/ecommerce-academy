import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateAdCopy, type AdCopywriterInput } from "@/lib/perplexity";
import { gateAITool, logAITool } from "@/lib/ai-tool-gate";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai-tools/ad-copywriter
 * Body: AdCopywriterInput
 *
 * Returns 5 ad variants (different psychological angles).
 * Pro: 5/day. Growth: 20/day. Free: 403.
 */
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const gate  = await gateAITool(supabase, token, "ad_copywriter");
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, upgrade: gate.upgrade, rateLimited: gate.rateLimited, tier: gate.tier, limit: gate.limit },
      { status: gate.status },
    );
  }

  const body = await request.json().catch(() => null) as AdCopywriterInput | null;
  if (!body?.product_name || !body?.who_its_for || !body?.main_benefit) {
    return NextResponse.json({ error: "Missing required fields (product_name, who_its_for, main_benefit)" }, { status: 400 });
  }

  const input: AdCopywriterInput = {
    product_name:          String(body.product_name).slice(0, 200),
    who_its_for:           String(body.who_its_for).slice(0, 300),
    main_benefit:          String(body.main_benefit).slice(0, 400),
    what_makes_it_unique:  body.what_makes_it_unique ? String(body.what_makes_it_unique).slice(0, 400) : undefined,
    niche:                 body.niche ? String(body.niche).slice(0, 100) : undefined,
  };

  try {
    // Route through tier chain — Pro tier uses TIER_CHAINS.pro, Growth uses .growth.
    // When the owner upgrades the growth chain to Claude, Growth users get the better model automatically.
    const result = await generateAdCopy(input, gate.tier);
    await logAITool(supabase, gate.user.id, "ad_copywriter", input, result);
    return NextResponse.json({ success: true, variants: result.variants, used: gate.used + 1, limit: gate.limit, tier: gate.tier });
  } catch (err) {
    console.error("Ad copywriter error:", err);
    return NextResponse.json({ error: "Couldn't generate ads. Try again in a moment." }, { status: 500 });
  }
}
