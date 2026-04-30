/**
 * Shared tier-gating + rate-limiting helper for the 3 AI tools:
 * Ad Copywriter, UGC Brief Generator, Ad Auditor.
 *
 * Limits per user per tool per 24h:
 *   Free:   0  (locked — UI shows upgrade card)
 *   Pro:    5
 *   Growth: 20 (feels unlimited to legit users; cap exists to prevent runaway abuse
 *               and to stay safely under Gemini's 1,500/day free-tier cap)
 *   Admin:  treated as Growth
 *
 * Logs every successful run to `ai_tool_log` for rate-limiting + future
 * Vault feature (browse all your past AI outputs).
 *
 * SQL migration required:
 *   CREATE TABLE IF NOT EXISTS ai_tool_log (
 *     id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *     tool        text NOT NULL,
 *     input       jsonb,
 *     output      jsonb,
 *     created_at  timestamptz NOT NULL DEFAULT now()
 *   );
 *   CREATE INDEX IF NOT EXISTS ai_tool_log_user_tool_idx
 *     ON ai_tool_log (user_id, tool, created_at DESC);
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdmin } from "./admin";

export type ToolTier = "free" | "pro" | "growth";

/**
 * The 4 AI tools that share the rate-limit + logging infrastructure.
 * Add new tools here and they automatically:
 *   - get rate-limited per the tier table above
 *   - get logged to ai_tool_log
 *   - get a usage row on /api/ai-tools/usage for the UI counter
 */
export type AITool =
  | "ad_copywriter"
  | "ugc_brief"
  | "ad_audit"
  | "store_autopsy"
  | "product_description"
  | "subject_lines"
  | "offer_builder"          // Growth-only: Hormozi grand slam offer
  | "cialdini_audit"         // Growth-only: 6-principles page audit (uses Gemini url_context)
  | "aov_audit"              // Growth-only: missing AOV mechanisms audit (uses Gemini url_context)
  | "decision_helper";       // Growth-only: scale / kill / iterate ad recommendation

export const AI_TOOLS: AITool[] = [
  "ad_copywriter",
  "ugc_brief",
  "ad_audit",
  "store_autopsy",
  "product_description",
  "subject_lines",
  "offer_builder",
  "cialdini_audit",
  "aov_audit",
  "decision_helper",
];

export type GateResult = {
  ok: true;
  user: { id: string; email?: string };
  /** Only "pro" or "growth" — free users are rejected before this branch. */
  tier: "pro" | "growth";
  used: number;
  limit: number;
} | {
  ok: false;
  status: number;
  error: string;
  upgrade?: boolean;
  rateLimited?: boolean;
  tier?: ToolTier;
  limit?: number;
};

/**
 * Authenticate the request, look up the tier, count today's uses for `tool`,
 * and reject with 401/403/429 if needed.
 *
 * Returns ok=true with tier + used/limit if the request can proceed.
 */
export async function gateAITool(
  supabase: SupabaseClient,
  token: string | undefined,
  tool: AITool,
): Promise<GateResult> {
  if (!token) return { ok: false, status: 401, error: "Log in to use AI tools." };

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return { ok: false, status: 401, error: "Invalid session." };

  // Resolve tier
  const admin = isAdmin(user.email);
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_pro, is_growth")
    .eq("id", user.id)
    .single();

  const isGrowth = admin || (profile?.is_growth ?? false);
  const isPro    = isGrowth || (profile?.is_pro ?? false);
  const tier: ToolTier = isGrowth ? "growth" : isPro ? "pro" : "free";

  // Free users are locked out entirely
  if (tier === "free") {
    return {
      ok: false,
      status: 403,
      error: "AI tools are a paid feature. Upgrade to Pro or Scale Lab.",
      upgrade: true,
      tier: "free",
      limit: 0,
    };
  }

  const limit = tier === "growth" ? 20 : 5;

  // Count today's uses
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("ai_tool_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("tool",    tool)
    .gte("created_at", dayAgo);

  const used = count ?? 0;
  if (used >= limit) {
    return {
      ok: false,
      status: 429,
      rateLimited: true,
      error: `You've used your ${limit} ${tier === "growth" ? "Scale Lab" : "Pro"} runs of this tool today. ${tier === "pro" ? "Upgrade to Scale Lab for 10x higher limits." : "Try again tomorrow."}`,
      tier,
      limit,
    };
  }

  return { ok: true, user: { id: user.id, email: user.email }, tier, used, limit };
}

/**
 * Log a successful AI tool run to ai_tool_log. Used by the API routes
 * after a Groq response succeeds.
 */
export async function logAITool(
  supabase: SupabaseClient,
  userId: string,
  tool: AITool,
  input: unknown,
  output: unknown,
): Promise<void> {
  await supabase.from("ai_tool_log").insert({
    user_id: userId,
    tool,
    input,
    output,
  });
}
