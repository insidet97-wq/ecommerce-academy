/* ─────────────────────────────────────────────────────────────
   AI content helper — uses Google Gemini (free tier).
   Model: gemini-1.5-flash  |  Free: 1,500 req/day, 15 req/min
   Get a free API key at: aistudio.google.com
   ───────────────────────────────────────────────────────────── */

export type Product = {
  name: string;
  category: string;
  why_trending: string;
  aliexpress_cost: string;
  sell_price: string;
  margin_pct: number;
  target_audience: string;
  ad_hook: string;
  aliexpress_search: string;
};

export type ProductDrop = {
  id: string;
  week_start: string;
  products: Product[];
  status: "draft" | "published";
  created_at: string;
};

export type BriefingContent = {
  meta_ads: string;
  tiktok_ads: string;
  trending_niche: { name: string; why: string; signals: string };
  add_tactic: string;
  drop_tactic: string;
  platform_changes: string;
  summary: string;
};

export type Briefing = {
  id: string;
  month: string;
  content: BriefingContent;
  status: "draft" | "published";
  created_at: string;
};

// ── Internal helper ───────────────────────────────────────────

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: {
        parts: [{
          text: "You are an ecommerce research assistant. Always respond with valid JSON only. No markdown, no code blocks, no explanation — raw JSON only.",
        }],
      },
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

// ── Public generators ─────────────────────────────────────────

export async function generateProducts(
  exclude: string[] = []
): Promise<Product[]> {
  const month = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const excludeClause =
    exclude.length > 0
      ? `\n\nDo NOT include any of these: ${exclude.join(", ")}`
      : "";

  const prompt = `Find 5 trending dropshipping products for Shopify stores in ${month}. Each must have 3X margin potential (sell price must be at least 3× the AliExpress cost).${excludeClause}

Return a JSON array of exactly 5 objects, each with these fields:
{
  "name": "product name",
  "category": "niche category",
  "why_trending": "specific reason it is trending right now with evidence (1-2 sentences)",
  "aliexpress_cost": "$X–Y range",
  "sell_price": "$XX.XX",
  "margin_pct": 75,
  "target_audience": "specific buyer description (1 sentence)",
  "ad_hook": "compelling opening line for a TikTok or Meta ad",
  "aliexpress_search": "exact search term to find this on AliExpress"
}`;

  const raw = await callGemini(prompt);
  return JSON.parse(raw);
}

export async function generateOneProduct(exclude: string[]): Promise<Product> {
  const month = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prompt = `Find ONE trending dropshipping product for Shopify in ${month} with 3X margin potential.

Do NOT suggest any of these: ${exclude.join(", ")}

Return a single JSON object with these fields:
{
  "name": "product name",
  "category": "niche category",
  "why_trending": "specific reason it is trending right now (1-2 sentences)",
  "aliexpress_cost": "$X–Y range",
  "sell_price": "$XX.XX",
  "margin_pct": 75,
  "target_audience": "specific buyer description",
  "ad_hook": "compelling opening line for a TikTok or Meta ad",
  "aliexpress_search": "exact search term for AliExpress"
}`;

  const raw = await callGemini(prompt);
  return JSON.parse(raw);
}

export async function generateBriefing(): Promise<BriefingContent> {
  const month = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prompt = `Create a monthly ecommerce briefing for Shopify dropshippers for ${month}.

Return a single JSON object with exactly these fields:
{
  "meta_ads": "what is currently working on Meta/Facebook/Instagram ads (2-3 specific sentences)",
  "tiktok_ads": "what is currently working on TikTok ads (2-3 specific sentences)",
  "trending_niche": {
    "name": "niche name",
    "why": "why it is growing right now (1-2 sentences)",
    "signals": "specific data points or evidence"
  },
  "add_tactic": "one specific actionable tactic to implement this month (2-3 sentences)",
  "drop_tactic": "one outdated tactic to stop doing and why (1-2 sentences)",
  "platform_changes": "recent algorithm or policy changes affecting ecom stores (1-2 sentences)",
  "summary": "one sentence overview of the ecom landscape this month"
}`;

  const raw = await callGemini(prompt);
  return JSON.parse(raw);
}
