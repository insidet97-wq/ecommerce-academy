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

// ── Blog posts (SEO content, AI-drafted, admin-published) ────

export type BlogPostContent = {
  intro: string;
  sections: { heading: string; body: string }[];
  conclusion: string;
  cta: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: BlogPostContent;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
};

const BLOG_TOPIC_POOL = [
  "How to find a winning ecommerce product in 2026",
  "The 3X markup rule: why most dropshippers go broke ignoring it",
  "TikTok organic vs paid ads: which is better for new stores in 2026",
  "Best Shopify themes for dropshipping (and what to avoid)",
  "Email marketing for ecommerce: 5 flows every store needs",
  "How much budget do you really need to start dropshipping",
  "Niche down or go broad: ecommerce niche selection in 2026",
  "Common dropshipping mistakes that kill stores in the first month",
  "How to read a Meta ads dashboard without losing your mind",
  "The first 100 customers: how to get them when you have $0 budget",
  "Customer avatar templates for ecommerce — fill-in-the-blank guide",
  "How to spot a saturated product (before you waste money on ads)",
];

export async function generateBlogPost(suggestedTopic?: string): Promise<{
  slug: string;
  title: string;
  excerpt: string;
  content: BlogPostContent;
}> {
  // Pick a random topic if none provided
  const topic = suggestedTopic ?? BLOG_TOPIC_POOL[Math.floor(Math.random() * BLOG_TOPIC_POOL.length)];

  const prompt = `Write a long-form, SEO-optimised blog post for a beginner ecommerce education site (firstsalelab.com). The site teaches complete beginners how to launch a Shopify dropshipping store.

Topic: "${topic}"

Tone: direct, practical, no fluff. Target reader is a complete beginner who hasn't sold anything yet. Reference specific tools/numbers/frameworks where relevant (Shopify, AliExpress, Meta ads, the 3X markup rule, etc.). Avoid corporate-speak.

Length: ~1200–1600 words total. 4–6 sections. Each section's body should be 2–4 paragraphs of substance, not 1-line filler.

Return a JSON object:
{
  "title":  "5–10 word headline, punchy, searchable. Don't restate the topic verbatim — make it a real headline.",
  "slug":   "lowercase-hyphenated-version-of-title (URL safe, no special chars)",
  "excerpt": "1 sentence (under 160 chars) — meta description for SEO",
  "content": {
    "intro": "2 short paragraphs setting up the problem and what the reader will learn. Hook them.",
    "sections": [
      { "heading": "Section heading (5–8 words, no questions)", "body": "2–4 paragraphs. Concrete. Examples. Numbers." }
    ],
    "conclusion": "1 short paragraph summarising the takeaway.",
    "cta": "1 short paragraph nudging the reader to take the free First Sale Lab quiz at /quiz to get their personalised roadmap."
  }
}`;

  const raw = await callGroq(prompt);
  const parsed = JSON.parse(raw);

  // Defensive: ensure slug is URL-safe
  const slug = String(parsed.slug ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `post-${Date.now()}`;

  return {
    slug,
    title:   String(parsed.title ?? topic).slice(0, 200),
    excerpt: String(parsed.excerpt ?? "").slice(0, 200),
    content: parsed.content,
  };
}

// ── Niche picker (public lead magnet at /niche-picker) ───────

export type NicheSuggestion = {
  name: string;
  why_fits_you: string;
  ideal_customer: string;
  example_products: string[];
  starter_budget: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  growth_signal: string;
};

export type NichePickerInput = {
  interests: string;     // free text, e.g. "fitness, dogs, cooking"
  budget: string;        // "Under $200" | "$200-500" | "$500-1000" | "$1000+"
  experience: string;    // "Complete beginner" | "Some experience" | "Experienced"
  audience: string;      // "Gen Z (under 25)" | "Millennials" | "Parents" | "Professionals" | "Mixed"
};

export async function generateNiches(input: NichePickerInput): Promise<NicheSuggestion[]> {
  const prompt = `You are an ecommerce niche advisor. Suggest 3 specific, profitable ecommerce niches for someone with this profile:

Interests / passions: ${input.interests}
Starting budget: ${input.budget}
Experience level: ${input.experience}
Target customer demographic: ${input.audience}

Each niche must be:
- Specific (not "fitness" — instead "Home gym recovery tools for desk workers")
- Sellable on Shopify with a 3X markup
- Realistic for the user's budget and experience
- Aligned with current trends (2026)

Return a JSON object with a "niches" array containing exactly 3 objects:
{
  "niches": [
    {
      "name": "specific niche name (5-8 words)",
      "why_fits_you": "1-2 sentences explaining why this matches their interests/profile",
      "ideal_customer": "1 sentence describing the buyer persona",
      "example_products": ["product 1", "product 2", "product 3"],
      "starter_budget": "estimated $ amount to launch (e.g. '$300-500')",
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "growth_signal": "1 sentence on why this niche is trending right now"
    }
  ]
}`;

  const raw = await callGroq(prompt);
  const parsed = JSON.parse(raw);
  return parsed.niches ?? parsed;
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
