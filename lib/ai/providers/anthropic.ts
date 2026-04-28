import type { AIRequest } from "../types";

/**
 * Anthropic Claude provider.
 *
 * Pricing (early 2026):
 *   claude-haiku-4-5:  ~$0.80/M input,  ~$4/M output  (fast, cheap, ~GPT-4o-mini quality)
 *   claude-sonnet-4-5: ~$3/M input,    ~$15/M output (premium — best for nuanced copy)
 *
 * Anthropic doesn't have a strict "JSON mode" like OpenAI; we rely on the
 * prompt instruction to return JSON and parse the response. The system
 * prompts in lib/perplexity.ts already say "respond with valid JSON only".
 *
 * One quirk: Claude can occasionally wrap JSON in ```json fences. We strip
 * those if present so JSON.parse() doesn't fail.
 */
export async function callAnthropic(req: AIRequest, model: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  // Re-emphasise JSON if requested (prompt-engineering substitute for json_object mode)
  const userPrompt = req.json !== false
    ? `${req.userPrompt}\n\nRespond with raw JSON only — no prose, no markdown code fences.`
    : req.userPrompt;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type":      "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: req.systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      temperature: req.temperature ?? 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text ?? "";

  // Strip ```json fences if Claude added them despite the instruction
  return String(content)
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}
