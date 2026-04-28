/**
 * Shared AI provider types.
 *
 * The whole point of this `lib/ai/` directory is to make swapping providers
 * (Groq → OpenAI → Anthropic → Gemini) a config change, not a code rewrite.
 * Every Groq-specific call in `lib/perplexity.ts` goes through `callAI()`
 * which routes to whichever provider is configured + falls back if one fails.
 */

export type AIProvider = "groq" | "openai" | "anthropic" | "gemini";

export type AIRequest = {
  /** System prompt — sets the assistant's persona and rules. */
  systemPrompt: string;
  /** User prompt — the actual question or task. */
  userPrompt: string;
  /** Force a JSON-object response. Default true (most of our prompts expect JSON). */
  json?: boolean;
  /** 0-1. Lower = more deterministic. Default 0.4 (mildly creative). */
  temperature?: number;
  /** Override the default model for the chosen provider. */
  model?: string;
  /**
   * URLs the model should fetch and read as context. Currently only Gemini
   * supports this natively (via the `url_context` tool); other providers
   * silently ignore this field. The URL should also appear in the prompt text
   * (Gemini picks them up from there).
   */
  urls?: string[];
};

/** A single (provider, model) pair. */
export type ProviderConfig = {
  provider: AIProvider;
  model:    string;
};

/** Ordered list — first one tried, falls back to next if it errors. */
export type AIChain = ProviderConfig[];

/** Tier-based routing. Edit `TIER_CHAINS` in `lib/ai/config.ts` to change. */
export type Tier = "default" | "pro" | "growth";
