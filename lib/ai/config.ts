import type { AIChain, AIProvider, Tier } from "./types";

/**
 * Default model when a provider is selected without specifying one.
 */
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  groq:      "llama-3.3-70b-versatile",
  openai:    "gpt-4o-mini",
  anthropic: "claude-sonnet-4-5",
  gemini:    "gemini-2.0-flash",
};

/**
 * Tier-based routing. Edit this single object to change which provider/model
 * each tier uses — no other code changes needed.
 *
 *   - `default` runs all crons + free-tier features (Niche Picker, blog, briefings)
 *   - `pro` runs Pro tools (Supplier AI, Module Q&A, Ad Copywriter, etc.)
 *   - `growth` runs Scale Lab tools (Store Autopsy + Growth-tier rate-limits)
 *
 * Each chain is tried in order — primary first, then fallbacks if it errors.
 * Fallbacks only kick in if the corresponding API key is configured (else skipped).
 *
 * Right now everything uses Groq because that's what the owner has set up.
 * To upgrade Scale Lab to Claude later: change the `growth` chain's first entry.
 */
export const TIER_CHAINS: Record<Tier, AIChain> = {
  default: [
    { provider: "groq", model: "llama-3.3-70b-versatile" },
  ],
  pro: [
    { provider: "groq", model: "llama-3.3-70b-versatile" },
  ],
  growth: [
    // Scale Lab uses Gemini 2.0 Flash for a different "voice" than Pro/Free (which use Groq).
    // If Gemini errors or hits its 1,500/day free-tier cap, we fall through to Groq below
    // so Growth users never see an error.
    { provider: "gemini", model: "gemini-2.0-flash" },
    { provider: "groq",   model: "llama-3.3-70b-versatile" },
    // When ready to upgrade Scale Lab quality (≈ $1k MRR threshold):
    // swap the first entry to { provider: "anthropic", model: "claude-sonnet-4-5" }
    // and add ANTHROPIC_API_KEY to Vercel.
  ],
};

/**
 * Global fallback chain: tried after the tier chain fails. Only the entries
 * with API keys configured will actually run; others are skipped silently.
 */
export const FALLBACK_CHAIN: AIChain = [
  { provider: "gemini",    model: "gemini-2.0-flash" },
  { provider: "openai",    model: "gpt-4o-mini" },
  { provider: "anthropic", model: "claude-haiku-4-5" },
];

/** Returns true if the provider has its API key set in env. */
export function isProviderAvailable(provider: AIProvider): boolean {
  switch (provider) {
    case "groq":      return !!process.env.GROQ_API_KEY;
    case "openai":    return !!process.env.OPENAI_API_KEY;
    case "anthropic": return !!process.env.ANTHROPIC_API_KEY;
    case "gemini":    return !!process.env.GEMINI_API_KEY;
  }
}
