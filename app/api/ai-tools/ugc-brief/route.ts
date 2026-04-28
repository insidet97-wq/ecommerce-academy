import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateUGCBrief, type UGCBriefInput } from "@/lib/perplexity";
import { gateAITool, logAITool } from "@/lib/ai-tool-gate";

export const dynamic = "force-dynamic";

const ALLOWED_FRAMEWORKS = ["Pattern Interrupt", "Problem Agitation", "Curiosity Gap", "Transformation Reveal", "Social Proof", "Contrarian"] as const;

/**
 * POST /api/ai-tools/ugc-brief
 * Body: UGCBriefInput
 *
 * Generates a complete UGC creator brief. Pro: 5/day, Growth: 50/day.
 */
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const gate  = await gateAITool(supabase, token, "ugc_brief");
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, upgrade: gate.upgrade, rateLimited: gate.rateLimited, tier: gate.tier, limit: gate.limit },
      { status: gate.status },
    );
  }

  const body = await request.json().catch(() => null) as UGCBriefInput | null;
  if (!body?.product_name || !body?.target_customer || !body?.main_benefit) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const framework = body.hook_framework && (ALLOWED_FRAMEWORKS as readonly string[]).includes(body.hook_framework)
    ? body.hook_framework
    : undefined;

  const input: UGCBriefInput = {
    product_name:    String(body.product_name).slice(0, 200),
    target_customer: String(body.target_customer).slice(0, 300),
    main_benefit:    String(body.main_benefit).slice(0, 400),
    hook_framework:  framework,
  };

  try {
    const brief = await generateUGCBrief(input);
    await logAITool(supabase, gate.user.id, "ugc_brief", input, brief);
    return NextResponse.json({ success: true, brief, used: gate.used + 1, limit: gate.limit, tier: gate.tier });
  } catch (err) {
    console.error("UGC brief error:", err);
    return NextResponse.json({ error: "Couldn't generate brief. Try again in a moment." }, { status: 500 });
  }
}
