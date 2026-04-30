import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decideScale, type ScaleDecisionInput } from "@/lib/perplexity";
import { gateAITool, logAITool } from "@/lib/ai-tool-gate";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai-tools/decision-helper
 * Body: ScaleDecisionInput
 *
 * Growth-tier exclusive (Module 23 fit). Applies the Scale Lab Module 23
 * decision framework to the user's last-7-day ad performance and returns
 * scale | iterate | kill with the exact next action.
 */
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const gate  = await gateAITool(supabase, token, "decision_helper");
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, upgrade: gate.upgrade, rateLimited: gate.rateLimited, tier: gate.tier, limit: gate.limit },
      { status: gate.status },
    );
  }

  if (gate.tier !== "growth") {
    return NextResponse.json(
      { error: "Scale or Kill is a Scale Lab exclusive. Upgrade from Pro to Scale Lab to unlock.", upgrade: true, tier: gate.tier },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null) as ScaleDecisionInput | null;
  if (!body?.product_name || !body?.target_cpa || !body?.spend_7d || !body?.roas || !body?.cpa) {
    return NextResponse.json({ error: "Missing required fields. We need at least: product, target CPA, 7-day spend, ROAS, CPA." }, { status: 400 });
  }

  // Truncate everything defensively. These are short numeric strings.
  const cap = (s: string | undefined, n: number) => (s ? String(s).slice(0, n) : "");
  const input: ScaleDecisionInput = {
    product_name:  cap(body.product_name,   200),
    target_cpa:    cap(body.target_cpa,      30),
    spend_7d:      cap(body.spend_7d,        30),
    revenue_7d:    cap(body.revenue_7d,      30),
    roas:          cap(body.roas,            20),
    ctr:           cap(body.ctr,             20),
    cpc:           cap(body.cpc,             20),
    cpa:           cap(body.cpa,             20),
    aov:           cap(body.aov,             20),
    frequency:     cap(body.frequency,       20),
    days_running:  cap(body.days_running,    10),
    notes:         cap(body.notes,          800),
  };

  try {
    const decision = await decideScale(input);
    await logAITool(supabase, gate.user.id, "decision_helper", input, decision);
    return NextResponse.json({ success: true, decision, used: gate.used + 1, limit: gate.limit, tier: gate.tier });
  } catch (err) {
    console.error("Decision Helper error:", err);
    return NextResponse.json({ error: "Couldn't analyse. Try again in a moment." }, { status: 500 });
  }
}
