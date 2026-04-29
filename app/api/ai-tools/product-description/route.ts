import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateProductDescription, type ProductDescInput } from "@/lib/perplexity";
import { gateAITool, logAITool } from "@/lib/ai-tool-gate";

export const dynamic = "force-dynamic";

const ALLOWED_TONES   = ["professional", "conversational", "playful", "luxury"] as const;
const ALLOWED_LENGTHS = ["short", "medium", "long"] as const;

/**
 * POST /api/ai-tools/product-description
 * Body: ProductDescInput
 *
 * Returns 3 product description variants (benefit / story / social_proof angles).
 * Pro: 5/day. Growth: 20/day. Free: 403.
 */
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const gate  = await gateAITool(supabase, token, "product_description");
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, upgrade: gate.upgrade, rateLimited: gate.rateLimited, tier: gate.tier, limit: gate.limit },
      { status: gate.status },
    );
  }

  const body = await request.json().catch(() => null) as ProductDescInput | null;
  if (!body?.product_name || !body?.benefits || !body?.target_customer) {
    return NextResponse.json({ error: "Missing required fields (product_name, benefits, target_customer)" }, { status: 400 });
  }

  const tone   = (ALLOWED_TONES   as readonly string[]).includes(body.tone)   ? body.tone   : "conversational";
  const length = (ALLOWED_LENGTHS as readonly string[]).includes(body.length) ? body.length : "medium";

  const input: ProductDescInput = {
    product_name:    String(body.product_name).slice(0, 200),
    benefits:        String(body.benefits).slice(0, 1500),
    target_customer: String(body.target_customer).slice(0, 300),
    tone:            tone   as ProductDescInput["tone"],
    length:          length as ProductDescInput["length"],
  };

  try {
    const result = await generateProductDescription(input, gate.tier);
    await logAITool(supabase, gate.user.id, "product_description", input, result);
    return NextResponse.json({ success: true, variants: result.variants, used: gate.used + 1, limit: gate.limit, tier: gate.tier });
  } catch (err) {
    console.error("Product description error:", err);
    return NextResponse.json({ error: "Couldn't generate descriptions. Try again in a moment." }, { status: 500 });
  }
}
