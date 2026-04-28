import type { AIRequest } from "../types";

/**
 * Google Gemini provider.
 *
 * Pricing (early 2026):
 *   gemini-2.0-flash:  ~$0.10/M input, ~$0.40/M output (very cheap, generous free tier)
 *   gemini-2.0-pro:    ~$1.25/M input, ~$5/M output    (better quality)
 *
 * Free tier is generous — good fallback. Uses native JSON mode via
 * `response_mime_type: "application/json"`.
 */
export async function callGemini(req: AIRequest, model: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: req.systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: req.userPrompt }] }],
      generationConfig: {
        temperature: req.temperature ?? 0.4,
        ...(req.json !== false ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
