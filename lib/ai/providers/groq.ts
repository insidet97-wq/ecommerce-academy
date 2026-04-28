import type { AIRequest } from "../types";

/**
 * Groq provider. Uses the OpenAI-compatible chat-completions endpoint.
 *
 * Free tier: 14,400 requests/day, 30/min, 6,000 tokens/min.
 * Paid tier (when needed): ~$0.59/M input + $0.79/M output for llama-3.3-70b.
 */
export async function callGroq(req: AIRequest, model: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
    throw new Error(`Groq API error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}
