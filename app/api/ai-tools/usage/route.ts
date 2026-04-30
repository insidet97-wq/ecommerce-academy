import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";
import { AI_TOOLS, type AITool, type ToolTier } from "@/lib/ai-tool-gate";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai-tools/usage
 *
 * Returns current 24h usage + limit per AI tool for the authenticated user.
 * Drives the "X / 20 today" counter pill in each AI tool component.
 *
 * Response:
 *   {
 *     tier: "free" | "pro" | "growth",
 *     usage: { ad_copywriter: { used, limit }, ugc_brief: {...}, ad_audit: {...}, store_autopsy: {...} }
 *   }
 *
 * Free users get limit=0 for everything (UI will show locked state instead of counter).
 */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Log in to see usage" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const admin = isAdmin(user.email);
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_pro, is_growth")
    .eq("id", user.id)
    .single();

  const isGrowth = admin || (profile?.is_growth ?? false);
  const isPro    = isGrowth || (profile?.is_pro ?? false);
  const tier: ToolTier = isGrowth ? "growth" : isPro ? "pro" : "free";

  const limit = tier === "growth" ? 20 : tier === "pro" ? 5 : 0;
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // One COUNT query per tool. Could fold into a single grouped query but
  // Supabase JS doesn't expose group-by neatly; small counts in parallel is fine.
  // Free / Pro users see limit:0 on Growth-only tools (the UI renders the
  // locked card from that signal). Pro tools get the standard tier limit.
  const growthOnlyLimit = tier === "growth" ? limit : 0;
  const usage: Record<AITool, { used: number; limit: number }> = {
    ad_copywriter:       { used: 0, limit },
    ugc_brief:           { used: 0, limit },
    ad_audit:            { used: 0, limit },
    product_description: { used: 0, limit },
    subject_lines:       { used: 0, limit },
    // Growth-tier exclusive
    store_autopsy:       { used: 0, limit: growthOnlyLimit },
    offer_builder:       { used: 0, limit: growthOnlyLimit },
    cialdini_audit:      { used: 0, limit: growthOnlyLimit },
    aov_audit:           { used: 0, limit: growthOnlyLimit },
    decision_helper:     { used: 0, limit: growthOnlyLimit },
  };

  await Promise.all(
    AI_TOOLS.map(async (tool) => {
      const { count } = await supabase
        .from("ai_tool_log")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("tool",    tool)
        .gte("created_at", dayAgo);
      usage[tool].used = count ?? 0;
    }),
  );

  return NextResponse.json({ tier, usage });
}
