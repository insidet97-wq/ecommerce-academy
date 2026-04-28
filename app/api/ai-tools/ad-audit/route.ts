import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auditAd, type AdAuditInput } from "@/lib/perplexity";
import { gateAITool, logAITool } from "@/lib/ai-tool-gate";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai-tools/ad-audit
 * Body: AdAuditInput
 *
 * Audits a user's ad copy against Cialdini + hook frameworks, returns
 * structured scores + concrete rewrites. Pro: 5/day, Growth: 20/day.
 */
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const gate  = await gateAITool(supabase, token, "ad_audit");
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, upgrade: gate.upgrade, rateLimited: gate.rateLimited, tier: gate.tier, limit: gate.limit },
      { status: gate.status },
    );
  }

  const body = await request.json().catch(() => null) as AdAuditInput | null;
  if (!body?.ad_text || body.ad_text.trim().length < 20) {
    return NextResponse.json({ error: "Paste at least a few sentences of your ad copy." }, { status: 400 });
  }

  const input: AdAuditInput = {
    ad_text:         String(body.ad_text).slice(0, 4000),
    product_context: body.product_context ? String(body.product_context).slice(0, 600) : undefined,
  };

  try {
    const audit = await auditAd(input, gate.tier);
    await logAITool(supabase, gate.user.id, "ad_audit", input, audit);
    return NextResponse.json({ success: true, audit, used: gate.used + 1, limit: gate.limit, tier: gate.tier });
  } catch (err) {
    console.error("Ad audit error:", err);
    return NextResponse.json({ error: "Couldn't run audit. Try again in a moment." }, { status: 500 });
  }
}
