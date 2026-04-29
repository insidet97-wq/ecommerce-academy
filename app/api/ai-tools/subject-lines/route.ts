import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateSubjectLines, type SubjectLineInput } from "@/lib/perplexity";
import { gateAITool, logAITool } from "@/lib/ai-tool-gate";

export const dynamic = "force-dynamic";

const ALLOWED_PURPOSES = ["welcome", "promo", "cart_abandon", "re_engage", "newsletter", "re_launch"] as const;

/**
 * POST /api/ai-tools/subject-lines
 * Body: SubjectLineInput
 *
 * Returns 10 email subject line variants with framework + predicted open + preheader.
 * Pro: 5/day. Growth: 20/day. Free: 403.
 */
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const gate  = await gateAITool(supabase, token, "subject_lines");
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, upgrade: gate.upgrade, rateLimited: gate.rateLimited, tier: gate.tier, limit: gate.limit },
      { status: gate.status },
    );
  }

  const body = await request.json().catch(() => null) as SubjectLineInput | null;
  if (!body?.email_purpose || !body?.topic || !body?.audience) {
    return NextResponse.json({ error: "Missing required fields (email_purpose, topic, audience)" }, { status: 400 });
  }

  const purpose = (ALLOWED_PURPOSES as readonly string[]).includes(body.email_purpose) ? body.email_purpose : "newsletter";

  const input: SubjectLineInput = {
    email_purpose: purpose as SubjectLineInput["email_purpose"],
    topic:         String(body.topic).slice(0, 300),
    audience:      String(body.audience).slice(0, 300),
  };

  try {
    const result = await generateSubjectLines(input, gate.tier);
    await logAITool(supabase, gate.user.id, "subject_lines", input, result);
    return NextResponse.json({ success: true, variants: result.variants, used: gate.used + 1, limit: gate.limit, tier: gate.tier });
  } catch (err) {
    console.error("Subject lines error:", err);
    return NextResponse.json({ error: "Couldn't generate subject lines. Try again in a moment." }, { status: 500 });
  }
}
