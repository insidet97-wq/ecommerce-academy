/* ─────────────────────────────────────────────────────────────
   AI content helper — uses Groq (free tier, no credit card).
   Model: llama-3.3-70b-versatile
   Free tier: 14,400 requests/day, 6,000 tokens/min
   Get a free API key at: console.groq.com
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

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an ecommerce research assistant. Always respond with valid JSON only. No markdown, no code blocks, no explanation — raw JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
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

  const prompt = `Find 5 trending dropshipping products for Shopify stores in ${month}. Each must have 3X margin potential (sell price must be at least 3x the AliExpress cost).${excludeClause}

Return a JSON object with a "products" array containing exactly 5 objects, each with these fields:
{
  "products": [
    {
      "name": "product name",
      "category": "niche category",
      "why_trending": "specific reason it is trending right now with evidence (1-2 sentences)",
      "aliexpress_cost": "$X-Y range",
      "sell_price": "$XX.XX",
      "margin_pct": 75,
      "target_audience": "specific buyer description (1 sentence)",
      "ad_hook": "compelling opening line for a TikTok or Meta ad",
      "aliexpress_search": "exact search term to find this on AliExpress"
    }
  ]
}`;

  const raw = await callGroq(prompt);
  const parsed = JSON.parse(raw);
  return parsed.products ?? parsed;
}

export async function generateOneProduct(exclude: string[]): Promise<Product> {
  const month = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prompt = `Find ONE trending dropshipping product for Shopify in ${month} with 3X margin potential.

Do NOT suggest any of these: ${exclude.join(", ")}

Return a JSON object with a "product" key containing:
{
  "product": {
    "name": "product name",
    "category": "niche category",
    "why_trending": "specific reason it is trending right now (1-2 sentences)",
    "aliexpress_cost": "$X-Y range",
    "sell_price": "$XX.XX",
    "margin_pct": 75,
    "target_audience": "specific buyer description",
    "ad_hook": "compelling opening line for a TikTok or Meta ad",
    "aliexpress_search": "exact search term for AliExpress"
  }
}`;

  const raw = await callGroq(prompt);
  const parsed = JSON.parse(raw);
  return parsed.product ?? parsed;
}

export async function generateBriefing(): Promise<BriefingContent> {
  const month = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prompt = `Create a monthly ecommerce briefing for Shopify dropshippers for ${month}.

Return a JSON object with a "briefing" key containing:
{
  "briefing": {
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
  }
}`;

  const raw = await callGroq(prompt);
  const parsed = JSON.parse(raw);
  return parsed.briefing ?? parsed;
}
