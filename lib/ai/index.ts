/**
 * AI orchestrator — unified entry point for all AI calls in the app.
 *
 * Workflow:
 *   1. Take the configured chain for the requested tier (TIER_CHAINS)
 *   2. Append the global FALLBACK_CHAIN
 *   3. Try each (provider, model) in order
 *      - Skip if the provider's API key isn't set
 *      - On API error, log and try the next one
 *   4. If all fail, throw the last error
 *
 * Existing code (lib/perplexity.ts) just calls `callAI({ tier: "default", ... })`
 * and gets a string back. To swap which provider runs Scale Lab tools, edit
 * `TIER_CHAINS.growth[0]` in `lib/ai/config.ts` — that's it.
 */

import type { AIRequest, AIChain, Tier, AIProvider } from "./types";
import { TIER_CHAINS, FALLBACK_CHAIN, isProviderAvailable } from "./config";
import { callGroq }      from "./providers/groq";
import { callOpenAI }    from "./providers/openai";
import { callAnthropic } from "./providers/anthropic";
import { callGemini }    from "./providers/gemini";

const PROVIDER_FNS: Record<AIProvider, (req: AIRequest, model: string) => Promise<string>> = {
  groq:      callGroq,
  openai:    callOpenAI,
  anthropic: callAnthropic,
  gemini:    callGemini,
};

/**
 * Main AI call. Routes to the right provider based on tier + falls back if any fail.
 *
 * @param req     System prompt, user prompt, JSON flag, temperature, optional model override
 * @param tier    "default" (cron / free) | "pro" | "growth" — defaults to "default"
 * @returns       The model's response string (for JSON requests, the caller `JSON.parse()`s it)
 */
export async function callAI(req: AIRequest, tier: Tier = "default"): Promise<string> {
  // Build the full chain: tier-specific first, then global fallbacks (deduped)
  const tierChain = TIER_CHAINS[tier] ?? TIER_CHAINS.default;
  const fullChain: AIChain = [...tierChain, ...FALLBACK_CHAIN];
  const seen = new Set<string>();
  const dedupedChain = fullChain.filter(c => {
    const key = `${c.provider}::${c.model}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let lastError: unknown = null;
  let attempts = 0;

  for (const { provider, model } of dedupedChain) {
    if (!isProviderAvailable(provider)) {
      // Provider key not set — silently skip
      continue;
    }
    const fn = PROVIDER_FNS[provider];
    attempts++;
    try {
      const result = await fn(req, req.model ?? model);
      // Light sanity-check: empty string usually means upstream silently truncated
      if (!result || result.trim().length === 0) {
        throw new Error(`${provider}/${model} returned empty response`);
      }
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`[ai] ${provider}/${model} failed, trying next provider:`, err instanceof Error ? err.message : err);
    }
  }

  if (attempts === 0) {
    throw new Error("No AI providers configured. Set at least GROQ_API_KEY in env.");
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("All AI providers failed");
}

// Re-export types for convenience
export type { AIRequest, Tier } from "./types";
