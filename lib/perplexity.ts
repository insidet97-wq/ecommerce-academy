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

// ── Supplier AI analysis (Pro feature) ───────────────────────

export type SupplierAnalysis = {
  summary:        string;     // 2–3 sentence executive summary
  red_flags:      string[];   // 3–5 concerning patterns based on the inputs
  questions:      string[];   // 5–7 questions the user should ask the supplier
  likely_issues:  string[];   // 3–5 issues to watch for given the inputs
  checklist:      string[];   // 8–10 specific verification items before ordering
};

export type SupplierAnalysisInput = {
  supplier_name: string;
  supplier_url?: string | null;
  review_rating: number;     // 1–5
  review_count:  number;
  shipping_days: number;
  communication: number;     // 1–5
  quality:       number;     // 1–5
  margin_pct:    number;
  notes?:        string | null;
  total_score:   number;     // 0–100
  verdict:       string;     // good / risky / avoid
};

export async function analyzeSupplier(input: SupplierAnalysisInput): Promise<SupplierAnalysis> {
  const prompt = `You are an experienced ecommerce sourcing advisor reviewing a potential supplier for a Shopify dropshipping store. Your job is to give the user practical, specific advice based on the data they entered.

Supplier data:
- Name: ${input.supplier_name}
- URL: ${input.supplier_url ?? "not provided"}
- Average review rating: ${input.review_rating}/5 (${input.review_count} reviews)
- Shipping time: ${input.shipping_days} days
- Communication rating: ${input.communication}/5
- Product quality rating: ${input.quality}/5
- Margin: ${input.margin_pct}%
- User notes: ${input.notes ?? "none"}
- Computed trust score: ${input.total_score}/100 (verdict: ${input.verdict})

Be specific to THIS supplier's data — don't give generic advice. If a number is bad (e.g. shipping > 21 days, fewer than 50 reviews, margin under 50%), call it out directly. If a number is good, acknowledge it.

Return a JSON object:
{
  "summary": "2-3 sentence executive read on this supplier — would you personally order from them and why",
  "red_flags": ["specific concern 1 tied to the data", "specific concern 2", "specific concern 3"],
  "questions": ["question 1 the user should ask the supplier directly", "question 2", "...5-7 total"],
  "likely_issues": ["practical issue 1 to expect", "issue 2", "...3-5 total"],
  "checklist": ["specific verification step 1", "step 2", "...8-10 specific actions before ordering"]
}

Each item should be one short sentence — punchy, actionable, no fluff. Reference the specific numbers from the inputs where relevant (e.g. "With only ${input.review_count} reviews, request ..."). Don't pad the lists — better 4 sharp items than 5 weak ones.`;

  const raw = await callGroq(prompt);
  const parsed = JSON.parse(raw);
  return {
    summary:       String(parsed.summary ?? "").slice(0, 600),
    red_flags:     Array.isArray(parsed.red_flags)     ? parsed.red_flags.slice(0, 6).map(String)     : [],
    questions:     Array.isArray(parsed.questions)     ? parsed.questions.slice(0, 8).map(String)     : [],
    likely_issues: Array.isArray(parsed.likely_issues) ? parsed.likely_issues.slice(0, 6).map(String) : [],
    checklist:     Array.isArray(parsed.checklist)     ? parsed.checklist.slice(0, 12).map(String)    : [],
  };
}

// ── AI Ad Copywriter ─────────────────────────────────────────

export type AdVariant = {
  angle:  string;       // e.g. "Reciprocity", "Curiosity Gap", "Transformation Reveal"
  hook:   string;       // first 3 seconds, scroll-stopping
  body:   string;       // the rest of the script
  cta:    string;       // call to action
  why_it_works: string; // 1-sentence explanation tying back to a framework
};

export type AdCopywriterInput = {
  product_name:    string;
  who_its_for:     string;     // target customer
  main_benefit:    string;     // transformation or main value
  what_makes_it_unique?: string;
  niche?:          string;
};

export async function generateAdCopy(input: AdCopywriterInput): Promise<{ variants: AdVariant[] }> {
  const prompt = `You are a direct response copywriter trained on Cialdini's 6 principles, Berger's STEPPS, and modern TikTok/Meta hook frameworks. Write 5 ad variants for the following product. Each variant must use a DIFFERENT psychological angle.

Product: ${input.product_name}
Target customer: ${input.who_its_for}
Main benefit / transformation: ${input.main_benefit}
${input.what_makes_it_unique ? `What makes it unique: ${input.what_makes_it_unique}\n` : ""}${input.niche ? `Niche: ${input.niche}\n` : ""}
Use these 5 angles, one per variant (assign in order):
1. Curiosity Gap — pose a question that demands resolution
2. Problem Agitation — name the pain immediately, viscerally
3. Transformation Reveal — show after, then explain how
4. Social Proof Opener — lead with a number, badge, or quote
5. Contrarian — challenge a common belief

Each variant needs:
- "angle": the angle name (one of the 5 above)
- "hook": first 3-second opener (must work muted, from 3 feet away). One short sentence, max 12 words.
- "body": 30-50 words. Spoken naturally, like a human talking. No corporate-speak.
- "cta": one short sentence that drives action. Specific, not generic.
- "why_it_works": one sentence tying back to the framework (Cialdini principle, STEPPS component, etc.)

Return JSON:
{ "variants": [ {...}, {...}, {...}, {...}, {...} ] }

Keep it punchy. No fluff. Every word earns its place.`;

  const raw = await callGroq(prompt);
  const parsed = JSON.parse(raw);
  const variants = Array.isArray(parsed.variants) ? parsed.variants : [];
  return {
    variants: variants.slice(0, 5).map((v: Record<string, unknown>) => ({
      angle:        String(v.angle ?? "").slice(0, 80),
      hook:         String(v.hook  ?? "").slice(0, 200),
      body:         String(v.body  ?? "").slice(0, 800),
      cta:          String(v.cta   ?? "").slice(0, 200),
      why_it_works: String(v.why_it_works ?? "").slice(0, 300),
    })),
  };
}

// ── UGC Creator Brief Generator ──────────────────────────────

export type UGCBrief = {
  hook_word_for_word: string;
  pain_to_dramatize:  string;
  transformation:     string;
  cta:                string;
  format_specs:       string;
  shot_list:          string[];
  reference_styles:   string[];
  do_not:             string[];
};

export type UGCBriefInput = {
  product_name:   string;
  target_customer: string;
  main_benefit:   string;
  hook_framework?: "Pattern Interrupt" | "Problem Agitation" | "Curiosity Gap" | "Transformation Reveal" | "Social Proof" | "Contrarian";
};

export async function generateUGCBrief(input: UGCBriefInput): Promise<UGCBrief> {
  const framework = input.hook_framework ?? "Problem Agitation";

  const prompt = `You are an ecommerce ads producer who briefs UGC creators on Billo, Insense, and similar platforms. Generate a complete, ready-to-send brief for the following product. The brief should be specific enough that 3 different creators would produce 3 similar but distinct videos from it.

Product: ${input.product_name}
Target customer: ${input.target_customer}
Main benefit: ${input.main_benefit}
Hook framework to use: ${framework}

Return JSON:
{
  "hook_word_for_word": "The exact opening line the creator should say in the first 3 seconds. Must use the ${framework} framework. Specific, scroll-stopping, works muted.",
  "pain_to_dramatize": "The specific pain point or moment of frustration the creator should physically act out (e.g. 'shows themselves struggling to fall asleep, tossing in bed at 2am')",
  "transformation": "The specific 'after' moment to show — what changes for them",
  "cta": "Word-for-word what the creator says at the end. One short sentence.",
  "format_specs": "Vertical 9:16, 15-30 seconds, natural lighting, no music (we'll add it), no overlay text needed",
  "shot_list": ["Shot 1: ...", "Shot 2: ...", "Shot 3: ...", "Shot 4: ..."],
  "reference_styles": ["3 specific style references — e.g. 'Lo-fi iPhone footage like Olipop ads', 'Authentic over-the-shoulder demo', 'Get-ready-with-me confessional style'"],
  "do_not": ["3-5 things the creator should NOT do — common pitfalls"]
}

Be specific. References to 'authentic' or 'natural' alone are useless — give concrete style guidance.`;

  const raw = await callGroq(prompt);
  const parsed = JSON.parse(raw);
  return {
    hook_word_for_word: String(parsed.hook_word_for_word ?? "").slice(0, 400),
    pain_to_dramatize:  String(parsed.pain_to_dramatize  ?? "").slice(0, 400),
    transformation:     String(parsed.transformation     ?? "").slice(0, 400),
    cta:                String(parsed.cta                ?? "").slice(0, 200),
    format_specs:       String(parsed.format_specs       ?? "").slice(0, 400),
    shot_list:          Array.isArray(parsed.shot_list)        ? parsed.shot_list.slice(0, 8).map(String)        : [],
    reference_styles:   Array.isArray(parsed.reference_styles) ? parsed.reference_styles.slice(0, 5).map(String) : [],
    do_not:             Array.isArray(parsed.do_not)           ? parsed.do_not.slice(0, 6).map(String)           : [],
  };
}

// ── AI Ad Audit ──────────────────────────────────────────────

export type AdAudit = {
  hook_framework:    string;       // identified hook framework
  hook_strength:     "Strong" | "OK" | "Weak";
  cialdini_scores: { reciprocity: number; commitment: number; social_proof: number; authority: number; liking: number; scarcity: number }; // each 0-2
  body_assessment:   string;
  cta_assessment:    string;
  overall_score:     number;       // 0-100
  rewrites: {
    hook_rewrite: string;
    body_rewrite: string;
    cta_rewrite:  string;
  };
  improvements: string[];
};

export type AdAuditInput = {
  ad_text:        string;        // user pastes their ad copy/script
  product_context?: string;      // optional product info
};

export async function auditAd(input: AdAuditInput): Promise<AdAudit> {
  const prompt = `You are a direct response copywriter performing an audit of someone's ad. Score the ad against Cialdini's 6 principles, identify which hook framework it uses, assess the body and CTA, and provide concrete rewrites.

${input.product_context ? `Product context: ${input.product_context}\n\n` : ""}AD TO AUDIT:
"""
${input.ad_text}
"""

Return JSON:
{
  "hook_framework": "Identify which framework the hook uses: 'Pattern Interrupt', 'Problem Agitation', 'Curiosity Gap', 'Transformation Reveal', 'Social Proof Opener', 'Contrarian', or 'None / Generic' if it doesn't use one",
  "hook_strength": "Strong" | "OK" | "Weak",
  "cialdini_scores": {
    "reciprocity":   0-2,
    "commitment":    0-2,
    "social_proof":  0-2,
    "authority":     0-2,
    "liking":        0-2,
    "scarcity":      0-2
  },
  "body_assessment": "1-2 sentences on the body of the ad — what's working, what's not",
  "cta_assessment": "1 sentence on the CTA — specific, generic, missing?",
  "overall_score": 0-100,
  "rewrites": {
    "hook_rewrite": "A specific, improved hook applying a strong framework",
    "body_rewrite": "An improved body weaving in 2-3 missing Cialdini principles",
    "cta_rewrite": "An improved CTA that's specific and action-oriented"
  },
  "improvements": ["3-5 specific concrete improvements the user should make"]
}

Score conservatively. 'OK' should mean genuinely OK, not a politeness rating. Most beginner ads should score 30-55 overall.`;

  const raw = await callGroq(prompt);
  const parsed = JSON.parse(raw);

  const scores = parsed.cialdini_scores ?? {};
  return {
    hook_framework: String(parsed.hook_framework ?? "None / Generic").slice(0, 80),
    hook_strength:  ["Strong", "OK", "Weak"].includes(parsed.hook_strength) ? parsed.hook_strength : "OK",
    cialdini_scores: {
      reciprocity:  Math.max(0, Math.min(2, Number(scores.reciprocity)  || 0)),
      commitment:   Math.max(0, Math.min(2, Number(scores.commitment)   || 0)),
      social_proof: Math.max(0, Math.min(2, Number(scores.social_proof) || 0)),
      authority:    Math.max(0, Math.min(2, Number(scores.authority)    || 0)),
      liking:       Math.max(0, Math.min(2, Number(scores.liking)       || 0)),
      scarcity:     Math.max(0, Math.min(2, Number(scores.scarcity)     || 0)),
    },
    body_assessment: String(parsed.body_assessment ?? "").slice(0, 500),
    cta_assessment:  String(parsed.cta_assessment  ?? "").slice(0, 300),
    overall_score:   Math.max(0, Math.min(100, Number(parsed.overall_score) || 0)),
    rewrites: {
      hook_rewrite: String(parsed.rewrites?.hook_rewrite ?? "").slice(0, 300),
      body_rewrite: String(parsed.rewrites?.body_rewrite ?? "").slice(0, 800),
      cta_rewrite:  String(parsed.rewrites?.cta_rewrite  ?? "").slice(0, 200),
    },
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 6).map(String) : [],
  };
}

// ── Store Autopsy (Growth-only Pro feature) ──────────────────

export type StoreAutopsy = {
  summary:           string;     // 2–3 sentence read on the store
  offer_analysis:    string[];   // 3–5 observations on their offer
  hook_analysis:     string[];   // 3–5 observations on their messaging / hooks
  social_proof:      string[];   // 2–4 observations on their proof
  conversion_gaps:   string[];   // 3–5 specific weaknesses
  exploitation_angles: string[]; // 3–5 specific angles you could use
  threat_level:      "Low" | "Medium" | "High"; // how hard to compete
};

export async function analyzeStore(input: { url: string; description: string; niche?: string }): Promise<StoreAutopsy> {
  const prompt = `You are an expert ecommerce competitive analyst. The user wants a teardown of a competitor store so they can either out-compete them or find gaps in the market.

Competitor URL: ${input.url}
${input.niche ? `Their niche: ${input.niche}\n` : ""}User's description of what they observed on the store:
${input.description}

You don't have web access — base your analysis ENTIRELY on the user's description plus what's plausible for a typical store in this niche. Don't make up specifics ("their hero image is...") that the user didn't mention. Instead, work with the patterns they describe and frame your analysis as:
- What they're doing well (and how that signals their strategy)
- What they're missing (and how that creates opening for the user)
- Specific angles the user could exploit

Return a JSON object:
{
  "summary": "2-3 sentences. What kind of competitor is this? Are they a serious operator or a thin store? Should the user worry about them or laugh at them?",
  "offer_analysis": ["specific observation tied to their pricing / bundles / guarantee / shipping (3-5 items)"],
  "hook_analysis": ["specific observation tied to their messaging, ad angles, value prop (3-5 items)"],
  "social_proof": ["specific observation tied to reviews, testimonials, trust signals (2-4 items)"],
  "conversion_gaps": ["specific gap or weakness — be concrete and exploitable (3-5 items)"],
  "exploitation_angles": ["specific positioning the user could take to differentiate or win against this store (3-5 items)"],
  "threat_level": "Low" | "Medium" | "High"
}

Each item: one sharp sentence. Reference specific things from the user's description where possible. Frame exploitation_angles as actions the user can take ("Position your store as ___ to differentiate from their generic positioning"). Threat level: Low = thin store, easy to beat; Medium = decent operator with gaps; High = serious player, find a niche they don't serve.`;

  const raw = await callGroq(prompt);
  const parsed = JSON.parse(raw);

  return {
    summary:             String(parsed.summary ?? "").slice(0, 800),
    offer_analysis:      Array.isArray(parsed.offer_analysis)      ? parsed.offer_analysis.slice(0, 6).map(String)      : [],
    hook_analysis:       Array.isArray(parsed.hook_analysis)       ? parsed.hook_analysis.slice(0, 6).map(String)       : [],
    social_proof:        Array.isArray(parsed.social_proof)        ? parsed.social_proof.slice(0, 5).map(String)        : [],
    conversion_gaps:     Array.isArray(parsed.conversion_gaps)     ? parsed.conversion_gaps.slice(0, 6).map(String)     : [],
    exploitation_angles: Array.isArray(parsed.exploitation_angles) ? parsed.exploitation_angles.slice(0, 6).map(String) : [],
    threat_level:        ["Low", "Medium", "High"].includes(parsed.threat_level) ? parsed.threat_level : "Medium",
  };
}

// ── Module Q&A (AI assistant) ────────────────────────────────

export async function answerModuleQuestion(input: {
  question: string;
  module_title: string;
  module_objective: string;
  module_concepts: { title: string; body: string }[];
  module_steps: string[];
  module_mistakes: string[];
}): Promise<{ answer: string }> {
  const conceptsBlock = input.module_concepts.map(c => `- ${c.title}: ${c.body}`).join("\n");
  const stepsBlock    = input.module_steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const mistakesBlock = input.module_mistakes.map(m => `- ${m}`).join("\n");

  const prompt = `You are a helpful ecommerce mentor for First Sale Lab. A student is working through a specific module and has a question. Answer their question using ONLY the module content below as your primary reference. If the answer isn't in the module, say so honestly and give your best ecommerce guidance with a note that the official course doesn't cover it.

MODULE: ${input.module_title}
OBJECTIVE: ${input.module_objective}

KEY CONCEPTS:
${conceptsBlock}

ACTION STEPS:
${stepsBlock}

COMMON MISTAKES:
${mistakesBlock}

STUDENT QUESTION:
${input.question}

Answer in 2-4 short paragraphs. Be direct, specific, and reference the module content where possible. No fluff, no apologies, no "great question." If the question is unrelated to ecommerce, redirect them politely to a relevant module.

Return a JSON object: { "answer": "your full answer here, with line breaks as \\n\\n between paragraphs" }`;

  const raw = await callGroq(prompt);
  const parsed = JSON.parse(raw);
  return { answer: String(parsed.answer ?? "").slice(0, 2000) };
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
