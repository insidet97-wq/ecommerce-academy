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
 *
 * URL Context (req.urls): when provided, attaches the `url_context` tool
 * so Gemini fetches the page and reasons over its actual content. Tools +
 * native JSON mime type don't combine reliably, so when fetching URLs we
 * fall back to prompt-engineered JSON + fence stripping (same approach as
 * the Anthropic provider).
 */
export async function callGemini(req: AIRequest, model: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const useUrlContext = !!(req.urls && req.urls.length > 0);
  const wantsJSON     = req.json !== false;

  // When URL context is on, ask for JSON via the prompt instead of mime type.
  const userPrompt = useUrlContext && wantsJSON
    ? `${req.userPrompt}\n\nRespond with raw JSON only — no prose, no markdown code fences.`
    : req.userPrompt;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: req.systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: req.temperature ?? 0.4,
      ...(wantsJSON && !useUrlContext ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (useUrlContext) {
    body.tools = [{ url_context: {} }];
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip ```json ... ``` fences if the model wrapped the JSON (URL-context path).
  if (useUrlContext && wantsJSON) {
    return stripJSONFences(raw);
  }
  return raw;
}

function stripJSONFences(s: string): string {
  const trimmed = s.trim();
  // ```json\n...\n``` or ```\n...\n```
  const fence = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
  if (fence) return fence[1].trim();
  return trimmed;
}
