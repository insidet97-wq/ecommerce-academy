import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildOffer, type OfferBuilderInput } from "@/lib/perplexity";
import { gateAITool, logAITool } from "@/lib/ai-tool-gate";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai-tools/offer-builder
 * Body: OfferBuilderInput
 *
 * Growth-tier exclusive (Module 17 fit). Routes through gateAITool so it gets
 * the same 20/day rate limit + ai_tool_log row as the other AI tools, then
 * explicitly rejects Pro users since this tool teaches a Scale-Lab framework.
 */
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const gate  = await gateAITool(supabase, token, "offer_builder");
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, upgrade: gate.upgrade, rateLimited: gate.rateLimited, tier: gate.tier, limit: gate.limit },
      { status: gate.status },
    );
  }

  if (gate.tier !== "growth") {
    return NextResponse.json(
      { error: "Offer Builder is a Scale Lab exclusive. Upgrade from Pro to Scale Lab to unlock.", upgrade: true, tier: gate.tier },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null) as OfferBuilderInput | null;
  if (!body?.product_name || !body?.current_price || !body?.target_customer || !body?.dream_outcome || !body?.current_obstacles) {
    return NextResponse.json({ error: "Missing required fields (product_name, current_price, target_customer, dream_outcome, current_obstacles)" }, { status: 400 });
  }

  const input: OfferBuilderInput = {
    product_name:      String(body.product_name).slice(0, 200),
    current_price:     String(body.current_price).slice(0, 50),
    target_customer:   String(body.target_customer).slice(0, 400),
    dream_outcome:     String(body.dream_outcome).slice(0, 600),
    current_obstacles: String(body.current_obstacles).slice(0, 800),
  };

  try {
    const offer = await buildOffer(input);
    await logAITool(supabase, gate.user.id, "offer_builder", input, offer);
    return NextResponse.json({ success: true, offer, used: gate.used + 1, limit: gate.limit, tier: gate.tier });
  } catch (err) {
    console.error("Offer Builder error:", err);
    return NextResponse.json({ error: "Couldn't generate offer. Try again in a moment." }, { status: 500 });
  }
}
