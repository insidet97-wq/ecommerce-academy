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

// ── Internal AI helper ────────────────────────────────────────
// Goes through the provider abstraction in `lib/ai/` so this whole file
// stays provider-agnostic. To swap providers per tier, edit
// `TIER_CHAINS` in `lib/ai/config.ts` — no changes needed here.

import { callAI, type Tier } from "./ai";

const SYSTEM_PROMPT =
  "You are an ecommerce research assistant. Always respond with valid JSON only. No markdown, no code blocks, no explanation — raw JSON only.";

async function generate(prompt: string, tier: Tier = "default"): Promise<string> {
  return callAI({ systemPrompt: SYSTEM_PROMPT, userPrompt: prompt, json: true, temperature: 0.4 }, tier);
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

  const raw = await generate(prompt);
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

  // Supplier AI analysis is a Pro feature — route through the "pro" tier chain.
  const raw = await generate(prompt, "pro");
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

export async function generateAdCopy(input: AdCopywriterInput, tier: Tier = "pro"): Promise<{ variants: AdVariant[] }> {
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

  const raw = await generate(prompt, tier);
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

export async function generateUGCBrief(input: UGCBriefInput, tier: Tier = "pro"): Promise<UGCBrief> {
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

  const raw = await generate(prompt, tier);
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

export async function auditAd(input: AdAuditInput, tier: Tier = "pro"): Promise<AdAudit> {
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

  const raw = await generate(prompt, tier);
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

// ── Product Description Writer ────────────────────────────────

export type ProductDescVariant = {
  angle:    "benefit" | "story" | "social_proof";
  headline: string;     // punchy product page H1
  body:     string;     // the main description copy
  bullets:  string[];   // 3-5 highlight bullets
};

export type ProductDescInput = {
  product_name:    string;
  benefits:        string;                                          // textarea — features + benefits + materials, etc.
  target_customer: string;
  tone:            "professional" | "conversational" | "playful" | "luxury";
  length:          "short" | "medium" | "long";                     // ~50, ~120, ~250 words
};

const LENGTH_TARGETS: Record<ProductDescInput["length"], string> = {
  short:  "~50 words — punchy, single paragraph",
  medium: "~120 words — 2 short paragraphs",
  long:   "~250 words — 3 paragraphs with a sensory hook",
};

const TONE_GUIDES: Record<ProductDescInput["tone"], string> = {
  professional:  "clear, confident, no slang. Allow yourself one striking adjective per paragraph.",
  conversational:"like a friend recommending the product. Contractions OK, light humour, no exclamation marks.",
  playful:       "energetic, witty, surprising word choices. Up to one exclamation mark in the whole description. Never cringe.",
  luxury:        "restrained, evocative, sensory. Short sentences. Premium adjectives only when earned by a concrete detail.",
};

export async function generateProductDescription(input: ProductDescInput, tier: Tier = "pro"): Promise<{ variants: ProductDescVariant[] }> {
  const prompt = `You are an ecommerce copywriter who writes product page descriptions that convert browsers into buyers. Write 3 description variants for the same product, each using a DIFFERENT psychological angle.

Product: ${input.product_name}
Benefits / features / materials:
${input.benefits}
Target customer: ${input.target_customer}
Tone: ${input.tone} — ${TONE_GUIDES[input.tone]}
Length: ${LENGTH_TARGETS[input.length]}

Write 3 variants, one for each angle (assign in this order):
1. "benefit" — lead with the transformation. What changes for the customer the moment they own this? Make the outcome vivid and specific.
2. "story" — sensory and narrative. What does it FEEL like to use? Drop the reader into a moment with the product.
3. "social_proof" — lead with traction, scarcity, or what other buyers say. Numbers, ratings, or implied FOMO without being sleazy.

Each variant needs:
- "angle": exactly one of "benefit" | "story" | "social_proof"
- "headline": a punchy product page H1, max 10 words. Specific, not generic ("Sleep Cool All Night" not "The Best Pillow").
- "body": the description copy at the requested length and tone. No corporate-speak, no "introducing", no "elevate your".
- "bullets": 3-5 highlight bullets. Each starts with a benefit verb, ends with a concrete detail. Max 12 words each.

Return JSON:
{ "variants": [ { angle, headline, body, bullets[] }, {...}, {...} ] }

Quality bar:
- Every sentence earns its place. Cut filler.
- Concrete > abstract. Numbers > adjectives. Sensory > generic.
- The reader should be able to picture using the product after reading.`;

  const raw = await generate(prompt, tier);
  const parsed = JSON.parse(raw);
  const variants = Array.isArray(parsed.variants) ? parsed.variants : [];
  const allowedAngles = new Set(["benefit", "story", "social_proof"]);
  return {
    variants: variants.slice(0, 3).map((v: Record<string, unknown>) => ({
      angle:    (allowedAngles.has(String(v.angle)) ? String(v.angle) : "benefit") as ProductDescVariant["angle"],
      headline: String(v.headline ?? "").slice(0, 120),
      body:     String(v.body     ?? "").slice(0, 1500),
      bullets:  Array.isArray(v.bullets) ? (v.bullets as unknown[]).slice(0, 5).map(b => String(b).slice(0, 120)) : [],
    })),
  };
}

// ── Email Subject Line Tester ─────────────────────────────────

export type SubjectLineVariant = {
  subject:        string;
  framework:      string;       // "Curiosity" | "Urgency" | "Numbers" | "Personalized" | "Question" | "Pattern Interrupt" | "Benefit" | "Social Proof"
  preheader:      string;       // optional preheader / preview text
  mobile_truncated: boolean;    // true if subject > 40 chars (gets cut on iPhone Mail)
  predicted_open: "Low" | "Medium" | "High";
  why:            string;       // 1-sentence reasoning
};

export type SubjectLineInput = {
  email_purpose: "welcome" | "promo" | "cart_abandon" | "re_engage" | "newsletter" | "re_launch";
  topic:         string;        // product or topic the email is about
  audience:      string;
};

const PURPOSE_GUIDES: Record<SubjectLineInput["email_purpose"], string> = {
  welcome:      "first email after signup. Aim for warmth + curiosity. They just gave you their email — earn it.",
  promo:        "promotion or offer. Avoid spammy tropes (FREE, $$$, !!!). Lead with the actual win.",
  cart_abandon: "they almost bought, then didn't. Re-engage without nagging. Soft FOMO or curiosity beats discounts.",
  re_engage:    "a dormant subscriber. Acknowledge the gap or pattern-interrupt. They'll skim — make it stop them.",
  newsletter:   "regular content email. Compete against personal mail in the inbox. Personality + curiosity > corporate.",
  re_launch:    "announcing a comeback or restock. Lead with the timing or the scarcity, not the product name.",
};

export async function generateSubjectLines(input: SubjectLineInput, tier: Tier = "pro"): Promise<{ variants: SubjectLineVariant[] }> {
  const prompt = `You are an email marketer who has run thousands of subject line A/B tests for Shopify and DTC brands. Generate 10 subject line variants for the following email. Each must use a DIFFERENT framework — diversity matters more than one "perfect" one.

Email purpose: ${input.email_purpose} — ${PURPOSE_GUIDES[input.email_purpose]}
Topic / product: ${input.topic}
Audience: ${input.audience}

Use these 8 frameworks. Pick the most relevant ones for this email purpose. Repeat a framework only if you've used all 8 once:
- "Curiosity" — incomplete information that demands resolution
- "Urgency" — time-bound, real reason behind it
- "Numbers" — specific number that earns the open ("3 things", "47% off", "in 8 minutes")
- "Personalized" — second-person specific ("you", a behaviour, a state)
- "Question" — a question the audience would actually ask themselves
- "Pattern Interrupt" — unexpected phrasing, lowercase, or odd punctuation
- "Benefit" — the win, stated plainly, no fluff
- "Social Proof" — others are doing it, by quantity or quality

For EACH variant return:
- "subject": the subject line itself. ${`Aim for under 40 chars when possible (iPhone Mail truncates) but don't sacrifice quality.`}
- "framework": one of the 8 above
- "preheader": 1-2 sentence preview text that complements (not echoes) the subject. ~70 chars max.
- "mobile_truncated": true if the subject is over 40 characters
- "predicted_open": "Low" | "Medium" | "High" — your honest read of how this would perform vs. an industry-average baseline
- "why": one short sentence explaining the mechanic (e.g. "Numbers bypass skepticism because they imply specificity.")

Return JSON:
{ "variants": [ { subject, framework, preheader, mobile_truncated, predicted_open, why }, ... 10 total ] }

Quality rules:
- No spam triggers (FREE, !!!, $$$, ALL CAPS subjects).
- No corporate clichés ("Don't miss out", "Limited time only").
- "High" predictions must be earned — most variants should be Medium. If you assign more than 4 Highs, you're being lazy.`;

  const raw = await generate(prompt, tier);
  const parsed = JSON.parse(raw);
  const variants = Array.isArray(parsed.variants) ? parsed.variants : [];
  const allowedOpen = new Set(["Low", "Medium", "High"]);
  return {
    variants: variants.slice(0, 10).map((v: Record<string, unknown>) => {
      const subject = String(v.subject ?? "").slice(0, 200);
      return {
        subject,
        framework:        String(v.framework ?? "").slice(0, 40),
        preheader:        String(v.preheader ?? "").slice(0, 200),
        mobile_truncated: subject.length > 40,
        predicted_open:   (allowedOpen.has(String(v.predicted_open)) ? String(v.predicted_open) : "Medium") as SubjectLineVariant["predicted_open"],
        why:              String(v.why ?? "").slice(0, 240),
      };
    }),
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

export async function analyzeStore(input: { url: string; description?: string; niche?: string }): Promise<StoreAutopsy> {
  const hasNotes = !!(input.description && input.description.trim().length > 0);

  const prompt = `You are an expert ecommerce competitive analyst. The user wants a teardown of a competitor store so they can either out-compete them or find gaps in the market.

Competitor URL: ${input.url}
${input.niche ? `Their niche: ${input.niche}\n` : ""}${hasNotes ? `User's notes from the store / their ads:
${input.description}

` : ""}IMPORTANT: When you have access to fetch the URL above, base your analysis on what's actually on the page (offer, pricing, hero image, social proof count, guarantees, copy, etc.). If you also have user notes, treat them as supplementary context (e.g. ads they've seen off-site).

If you cannot fetch the URL${hasNotes ? " and only have the user's notes" : ""}, base your analysis on ${hasNotes ? "the notes plus" : ""} what's plausible for a typical store in this niche. Don't fabricate specifics you can't confirm — frame uncertain observations as "likely" or "appears to".

For every section, ground your bullets in concrete observations. Frame your analysis as:
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

  // Store Autopsy is Growth/Scale Lab exclusive — route through "growth" tier chain.
  // Pass the URL so Gemini's url_context tool fetches the page directly.
  // If Gemini fails (URL blocked, JS-only SPA, etc.) the chain falls through to
  // Groq, which will see only the prompt + notes (graceful degradation).
  const raw = await callAI(
    {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt:   prompt,
      json:         true,
      temperature:  0.4,
      urls:         [input.url],
    },
    "growth",
  );
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

// ── Grand Slam Offer Builder (Growth-only — Module 17 fit) ─────────
//
// Builds an irresistible offer using the Hormozi value equation:
//   value = (dream outcome × likelihood of achievement)
//         / (time delay × effort & sacrifice)
// The output is structured so the user can paste each piece directly
// into a Shopify product page or landing page.

export type OfferBuilder = {
  headline:           string;        // the offer in one sentence — "I will help you ___ in ___ without ___"
  dream_outcome:      string;        // 1-2 sentences. Specific, vivid, sensory.
  likelihood_levers:  string[];      // 3-5 things to ADD to make achievement feel inevitable (proof, frameworks, credentials)
  time_compression:   string[];      // 3-5 things that compress time-to-result (templates, swipe files, quick-wins)
  effort_removers:    string[];      // 3-5 things that remove friction (done-for-you components, automation)
  bonus_stack:        { name: string; value: string; why_it_matters: string }[]; // 4-6 bonuses with $ value + reasoning
  guarantee:          string;        // risk-reversal phrasing (conditional/unconditional/100% specific)
  scarcity_hook:      string;        // a REAL reason to act now (capacity / cohort / seasonal / cost-of-delay)
  total_value:        string;        // e.g. "$1,847"
  price_anchor:       string;        // how to position the actual price relative to the value stack
  cta_line:           string;        // the closing CTA copy
};

export type OfferBuilderInput = {
  product_name:    string;
  current_price:   string;       // e.g. "$49" or "$49/mo"
  target_customer: string;
  dream_outcome:   string;       // what the customer says they want
  current_obstacles: string;     // what's stopping them from achieving it today
};

export async function buildOffer(input: OfferBuilderInput): Promise<OfferBuilder> {
  const prompt = `You are a direct-response marketer trained on Alex Hormozi's "Grand Slam Offer" framework from "$100M Offers". A Scale Lab user wants to engineer an irresistible offer for the following product.

Product: ${input.product_name}
Current price: ${input.current_price}
Target customer: ${input.target_customer}
Dream outcome (what they really want): ${input.dream_outcome}
Current obstacles (what's stopping them): ${input.current_obstacles}

Apply the Hormozi value equation: VALUE = (dream outcome × perceived likelihood of achievement) ÷ (time delay × effort & sacrifice). Your job is to maximise the numerator and minimise the denominator.

Return a JSON object with these exact fields:
{
  "headline": "The offer in one sentence using the format 'I will help you [dream outcome] in [time] without [effort/risk]'. No corporate-speak. Specific.",
  "dream_outcome": "1-2 sentences. Restate the dream outcome with vivid sensory detail. The customer should picture it.",
  "likelihood_levers": ["3-5 specific things to ADD to the offer that make achieving the dream feel inevitable. Examples: a named framework, a case study quote, a credential, a step-by-step roadmap, a trust signal."],
  "time_compression": ["3-5 specific elements that compress time-to-result. Examples: a templated component, a swipe file, a 7-day quick-win, automation that does X for them."],
  "effort_removers": ["3-5 specific friction-removers. Examples: done-for-you setup, plug-and-play templates, the only-thing-they-need-to-do is X."],
  "bonus_stack": [
    { "name": "Specific bonus name (not generic — e.g. 'The 47-Hook Swipe File' not 'Marketing Templates')", "value": "$XXX", "why_it_matters": "1 sentence on why this bonus collapses the equation." },
    { ... 3-5 more bonuses, each clearly distinct and aimed at different friction points ... }
  ],
  "guarantee": "A specific risk-reversal phrasing. Avoid 'money-back guarantee' generic. Better: 'If you don't get X by day 30, we refund AND let you keep all the bonuses.' Conditional or unconditional, but make the condition concrete and verifiable.",
  "scarcity_hook": "A REAL reason to act now — capacity, cohort start date, seasonal relevance, cost-of-waiting calculation. Never fabricate fake countdowns.",
  "total_value": "Sum the bonus_stack + base offer value as one number string, e.g. '$2,340'.",
  "price_anchor": "1-2 sentences positioning the actual price (${input.current_price}) against the total_value. Example: 'Total value: $2,340. Price: ${input.current_price}. The one-time price is less than the cost of one botched ad campaign.'",
  "cta_line": "Closing CTA copy. Specific verb. No 'Learn more'. Examples: 'Lock in your offer →' / 'Start the 30-day plan →'."
}

Quality bar:
- Every bonus has a specific NAME. No "Bonus #1" or "Marketing Pack."
- Each bonus has a clear, separate purpose — never duplicate themes.
- The likelihood/time/effort sections must reference concrete, deliverable elements, not vague promises.
- Total value should be 5-10× the price (Hormozi's "irresistible" threshold), but earned through real bonuses — don't inflate.
- Tone matches the customer (${input.target_customer}). Avoid B2B jargon if they're a beginner; avoid hype if they're skeptical.`;

  const raw = await generate(prompt, "growth");
  const parsed = JSON.parse(raw);
  return {
    headline:           String(parsed.headline ?? "").slice(0, 300),
    dream_outcome:      String(parsed.dream_outcome ?? "").slice(0, 500),
    likelihood_levers:  Array.isArray(parsed.likelihood_levers)  ? parsed.likelihood_levers.slice(0, 6).map(String)  : [],
    time_compression:   Array.isArray(parsed.time_compression)   ? parsed.time_compression.slice(0, 6).map(String)   : [],
    effort_removers:    Array.isArray(parsed.effort_removers)    ? parsed.effort_removers.slice(0, 6).map(String)    : [],
    bonus_stack:        Array.isArray(parsed.bonus_stack)
      ? parsed.bonus_stack.slice(0, 6).map((b: Record<string, unknown>) => ({
          name:           String(b.name ?? "").slice(0, 200),
          value:          String(b.value ?? "").slice(0, 30),
          why_it_matters: String(b.why_it_matters ?? "").slice(0, 300),
        }))
      : [],
    guarantee:          String(parsed.guarantee ?? "").slice(0, 500),
    scarcity_hook:      String(parsed.scarcity_hook ?? "").slice(0, 400),
    total_value:        String(parsed.total_value ?? "").slice(0, 30),
    price_anchor:       String(parsed.price_anchor ?? "").slice(0, 500),
    cta_line:           String(parsed.cta_line ?? "").slice(0, 100),
  };
}

// ── Cialdini Page Audit (Growth-only — Module 19 fit) ──────────────
//
// Uses Gemini's url_context tool to FETCH the user's product/landing page
// and score it against Cialdini's 6 principles of influence. For each
// principle: 0-10 score, what's present, what's missing, the highest-impact
// fix to apply next.

export type CialdiniPrincipleScore = {
  principle: string;        // "Reciprocity" | "Commitment & Consistency" | "Social Proof" | "Authority" | "Liking" | "Scarcity"
  score:     number;        // 0-10
  whats_working:  string;   // 1-2 sentences
  whats_missing:  string;   // 1-2 sentences
  fix:            string;   // 1 concrete improvement
};

export type CialdiniAudit = {
  summary:     string;                       // 2-3 sentence read of the page's overall persuasion strength
  overall_score: number;                     // 0-100 (weighted average across the 6 principles)
  scores:      CialdiniPrincipleScore[];     // one per principle, in standard order
  highest_impact_fix: string;                // 1-2 sentence next-action: which principle to fix first and why
};

const CIALDINI_PRINCIPLE_NAMES = [
  "Reciprocity",
  "Commitment & Consistency",
  "Social Proof",
  "Authority",
  "Liking",
  "Scarcity",
] as const;

export async function auditCialdini(input: { url: string }): Promise<CialdiniAudit> {
  const prompt = `You are a direct-response copywriter trained on Cialdini's "Influence". A Scale Lab user wants their product page or landing page audited against Cialdini's 6 principles. The URL is below — fetch it and score it.

URL: ${input.url}

Score each principle 0-10 based on what's actually on the page. Be honest — most pages score 3-5 on most principles. A 9 or 10 is rare and must be earned.

Return a JSON object:
{
  "summary": "2-3 sentences. What's the page's overall persuasion posture? Does it lean on any principle? What's the dominant impression?",
  "overall_score": 0-100, "weighted average — Social Proof and Authority count double for ecom.",
  "scores": [
    { "principle": "Reciprocity",              "score": 0-10, "whats_working": "what's actually there", "whats_missing": "what's not", "fix": "specific concrete improvement" },
    { "principle": "Commitment & Consistency", "score": 0-10, ... },
    { "principle": "Social Proof",             "score": 0-10, ... },
    { "principle": "Authority",                "score": 0-10, ... },
    { "principle": "Liking",                   "score": 0-10, ... },
    { "principle": "Scarcity",                 "score": 0-10, ... }
  ],
  "highest_impact_fix": "1-2 sentences naming the lowest-scoring principle that has the highest expected ROI to fix, plus the concrete next action."
}

Quality rules:
- For "whats_working" — name SPECIFIC elements you saw on the page, not generic categories. "Trust badges (Stripe, Shopify Secure) above the buy button" not "Trust signals present".
- For "whats_missing" — be specific too. "No founder photo or named author on the about section" not "Missing personality".
- For "fix" — exact action. "Add a 30-second founder video at the top of the product page explaining why you built this." not "Add personality".
- If the URL fetch fails (page is JS-only or blocked), do your best from any available context, and note it transparently in the summary.
- For ecom product pages, weight Social Proof and Authority higher than Liking and Reciprocity in the overall_score calculation.`;

  // Pass the URL to Gemini's url_context tool. If Gemini fails, the chain
  // falls through to Groq which will reason from the URL string + heuristics.
  const raw = await callAI(
    {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt:   prompt,
      json:         true,
      temperature:  0.4,
      urls:         [input.url],
    },
    "growth",
  );
  const parsed = JSON.parse(raw);

  // Defensive normalisation — make sure scores array is exactly 6 items in
  // the expected order, even if the model skipped or duplicated one
  const scoresMap = new Map<string, Record<string, unknown>>();
  if (Array.isArray(parsed.scores)) {
    for (const s of parsed.scores) {
      const name = String(s?.principle ?? "").trim();
      if (name) scoresMap.set(name, s);
    }
  }
  const scores: CialdiniPrincipleScore[] = CIALDINI_PRINCIPLE_NAMES.map(name => {
    const s = scoresMap.get(name) ?? {};
    return {
      principle:     name,
      score:         Math.max(0, Math.min(10, Math.round(Number(s.score) || 0))),
      whats_working: String(s.whats_working ?? "").slice(0, 400),
      whats_missing: String(s.whats_missing ?? "").slice(0, 400),
      fix:           String(s.fix           ?? "").slice(0, 400),
    };
  });

  return {
    summary:            String(parsed.summary ?? "").slice(0, 800),
    overall_score:      Math.max(0, Math.min(100, Math.round(Number(parsed.overall_score) || 0))),
    scores,
    highest_impact_fix: String(parsed.highest_impact_fix ?? "").slice(0, 600),
  };
}

// ── AOV Optimization Audit (Growth-only — Module 18 fit) ──────────
//
// Uses Gemini's url_context tool to FETCH the user's store / product page
// and identify which AOV mechanisms are missing. For each mechanism:
// is it present? if missing, the expected lift, the exact app/feature to
// install, and a copy-template the user can paste in.

export type AOVMechanism = {
  mechanism:        "Order bump" | "Quantity break" | "Bundle" | "Post-purchase upsell" | "Free shipping threshold" | "Cross-sell" | "Subscription discount";
  present:          boolean;
  expected_lift:    string;        // e.g. "+15-25% AOV"
  what_we_saw:      string;        // 1-sentence: what's actually on the page (or what's missing)
  how_to_add:       string;        // exact app / Shopify feature / setting
  copy_template:    string;        // a ready-to-paste copy block the user can use
};

export type AOVAudit = {
  summary:           string;                // 2-3 sentences. Current AOV maturity + biggest opportunity.
  estimated_aov_lift: string;               // e.g. "+30-45%" — combined potential if all missing items added
  current_strengths: string[];              // 0-3 things they're already doing right
  mechanisms:        AOVMechanism[];        // ranked: most missing-and-impactful first
  recommended_priority: { rank: 1 | 2 | 3; mechanism: string; reason: string }[]; // top-3 to install in order
};

const AOV_MECHANISM_NAMES = [
  "Order bump",
  "Quantity break",
  "Bundle",
  "Post-purchase upsell",
  "Free shipping threshold",
  "Cross-sell",
  "Subscription discount",
] as const;

export async function auditAOV(input: { url: string }): Promise<AOVAudit> {
  const prompt = `You are a Shopify CRO consultant focused on AOV (Average Order Value). A Scale Lab user wants their store / product page audited for missing AOV mechanisms. The URL is below — fetch it and identify what's there vs what's missing.

URL: ${input.url}

Audit these 7 standard AOV mechanisms — for each, mark present:true ONLY if you can verify it on the page:
1. **Order bump** — a small add-on offer on the checkout/cart page
2. **Quantity break** — "Buy 2, save X%" or tiered pricing
3. **Bundle** — curated multi-product offer at a discount
4. **Post-purchase upsell** — a one-click offer after checkout (e.g. ReConvert)
5. **Free shipping threshold** — "$X free shipping" anchor (ideally at AOV × 1.3)
6. **Cross-sell** — "Customers also bought" / related-products module
7. **Subscription discount** — recurring "subscribe & save 10%" option

Return JSON:
{
  "summary": "2-3 sentences. What's their AOV maturity? What's the biggest single opportunity?",
  "estimated_aov_lift": "Combined potential if all currently-missing mechanisms were added. Honest range. Example: '+30-45%'.",
  "current_strengths": ["0-3 specific things they're already doing well — only include real ones"],
  "mechanisms": [
    {
      "mechanism": "Order bump",
      "present": true|false,
      "expected_lift": "Realistic range like '+8-15% AOV' if missing, or 'Already capturing this' if present",
      "what_we_saw": "Specific observation. 'Saw a "Add Gift Wrap +$5" checkbox on cart page' OR 'No order bump on cart or checkout pages.'",
      "how_to_add": "If missing: exact Shopify app or feature. Example: 'CartHook (cart bump app, $9/mo) — set up a "Add the matching X for $Y" offer below the buy button.' If present: leave empty string.",
      "copy_template": "If missing: a ready-to-paste copy block, written in the user's voice. If present: leave empty string."
    },
    ... ALL 7 mechanisms in the order listed above ...
  ],
  "recommended_priority": [
    { "rank": 1, "mechanism": "Mechanism name", "reason": "Why this one first — biggest impact / easiest to install / fits their existing setup" },
    { "rank": 2, "mechanism": "...", "reason": "..." },
    { "rank": 3, "mechanism": "...", "reason": "..." }
  ]
}

Quality bar:
- "what_we_saw" must reference SPECIFIC observable elements. If you can't see the page (fetch failed), say so transparently in the summary and base "present" judgements on what's plausible for the URL.
- "how_to_add" should name a real Shopify app or built-in feature. Common picks: ReConvert (post-purchase), Vitals (bundles+quantity), Bold Upsell, ZipCheckout, Honeycomb. Don't invent app names.
- "copy_template" should be 1-3 short sentences max — actual copy, not a description of copy.
- "expected_lift" ranges should be honest. Order bumps typically +8-15%. Bundles +10-25%. Post-purchase upsells +5-15%. Free-shipping-threshold +10-20%. Don't claim 50%+ for any single mechanism.
- "recommended_priority" must only include MISSING mechanisms. Order them by impact × ease.`;

  const raw = await callAI(
    {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt:   prompt,
      json:         true,
      temperature:  0.4,
      urls:         [input.url],
    },
    "growth",
  );
  const parsed = JSON.parse(raw);

  // Defensive: ensure we return all 7 mechanisms in canonical order
  const mechanismsMap = new Map<string, Record<string, unknown>>();
  if (Array.isArray(parsed.mechanisms)) {
    for (const m of parsed.mechanisms) {
      const name = String(m?.mechanism ?? "").trim();
      if (name) mechanismsMap.set(name, m);
    }
  }
  const mechanisms: AOVMechanism[] = AOV_MECHANISM_NAMES.map(name => {
    const m = mechanismsMap.get(name) ?? {};
    return {
      mechanism:     name,
      present:       Boolean(m.present),
      expected_lift: String(m.expected_lift ?? "").slice(0, 80),
      what_we_saw:   String(m.what_we_saw ?? "").slice(0, 400),
      how_to_add:    String(m.how_to_add ?? "").slice(0, 400),
      copy_template: String(m.copy_template ?? "").slice(0, 400),
    };
  });

  return {
    summary:            String(parsed.summary ?? "").slice(0, 800),
    estimated_aov_lift: String(parsed.estimated_aov_lift ?? "").slice(0, 30),
    current_strengths:  Array.isArray(parsed.current_strengths) ? parsed.current_strengths.slice(0, 4).map(String) : [],
    mechanisms,
    recommended_priority: Array.isArray(parsed.recommended_priority)
      ? parsed.recommended_priority.slice(0, 3).map((r: Record<string, unknown>, i: number) => ({
          rank:      ((Number(r.rank) || (i + 1)) as 1 | 2 | 3),
          mechanism: String(r.mechanism ?? "").slice(0, 80),
          reason:    String(r.reason    ?? "").slice(0, 300),
        }))
      : [],
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

  const raw = await generate(prompt);
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

  const raw = await generate(prompt);
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

  const raw = await generate(prompt);
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

  const raw = await generate(prompt);
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

  const raw = await generate(prompt);
  const parsed = JSON.parse(raw);
  return parsed.briefing ?? parsed;
}
