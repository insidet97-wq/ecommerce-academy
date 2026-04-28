import type { AIRequest } from "../types";

/**
 * OpenAI provider.
 *
 * Pricing (early 2026):
 *   gpt-4o-mini: $0.15/M input, $0.60/M output (cheap, good quality)
 *   gpt-4o:      $2.50/M input, $10.00/M output (premium)
 */
export async function callOpenAI(req: AIRequest, model: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: req.systemPrompt },
        { role: "user",   content: req.userPrompt },
      ],
      temperature: req.temperature ?? 0.4,
      ...(req.json !== false ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}
