@AGENTS.md

---

# First Sale Lab — AI Session Brief

> **Read this first every session.** Full technical docs are in `README.md`.
> **Rule #1: Update this file AND `README.md` (push to GitHub) after every working session.**

---

## What this project is

Freemium ecommerce course with **3 tiers**, live at **firstsalelab.com**:
- **Free** — Modules 1–6 (foundation: niche, product, store, funnel)
- **Pro** $19/mo — Modules 7–12 + weekly product picks + monthly briefing (launch + first sale)
- **Scale Lab** (Growth) $49/mo — Modules 13–24 — operator playbook for turning random sales into predictable revenue

---

## Tech stack (one line per layer)

- **Framework:** Next.js App Router (TypeScript)
- **Styling:** Tailwind CSS + inline `style={{}}` for dynamic values
- **Database + Auth:** Supabase (PostgreSQL, email/password, no email confirmation)
- **Email:** Resend — from address `hello@firstsalelab.com`
- **Payments:** Stripe subscriptions + webhooks + billing portal
- **AI content:** Multi-provider abstraction in `lib/ai/`. Currently routes everything to Groq `llama-3.3-70b-versatile` (free tier). Pluggable: OpenAI, Anthropic Claude, Gemini all wired in — flip per-tier provider in `lib/ai/config.ts` `TIER_CHAINS`. Auto-fallback if primary fails.
- **Ads:** Google AdSense (free users only; pending approval)
- **Analytics:** Vercel Analytics + GA4 (`G-VT4RZ3JB6L`)
- **Crons:** Vercel Cron (4 jobs — see README)
- **Hosting:** Vercel (auto-deploys from GitHub `main`)
- **Domain:** Namecheap → `firstsalelab.com`

---

## All pages at a glance

| Route | What it does | Auth? |
|-------|-------------|-------|
| `/` | Landing page (logged-out: marketing; logged-in: personalised dashboard preview) | No |
| `/quiz` | 4-step quiz → builds personalised roadmap | No |
| `/niche-picker` | Free lead magnet — AI generates 3 niches, captures email | No |
| `/blog` | Public blog index | No |
| `/blog/[slug]` | Public blog post page | No |
| `/login` | Login | No |
| `/signup` | Signup → welcome email → redirect to module | No |
| `/forgot-password` | Send reset email | No |
| `/reset-password` | Handle reset link | No |
| `/dashboard` | Main app: progress, streak, onboarding, module list (grouped by tier) | Yes |
| `/modules/[1-24]` | Individual module — modules 1-6 free, 7-12 Pro, 13-24 Growth | Yes |
| `/upgrade?tier=pro\|growth` | 3-tier comparison + Stripe checkout (auto-selects tier from query param) | Yes |
| `/settings` | Change name, change password, danger zone | Yes |
| `/tools` | Curated tools page | Yes |
| `/resources` | Curated resources page | Yes |
| `/pro/products` | Weekly product picks (Pro-gated) | Yes (Pro) |
| `/pro/briefings` | Monthly ecom briefings (Pro-gated) | Yes (Pro) |
| `/certificate/[userId]` | Public shareable completion certificate | No |
| `/admin` | Analytics dashboard — MRR, tier counts, conversion funnel, recent signups, course activity | Yes (admin) |
| `/admin/content` | Generate/review/publish AI content drafts | Yes (admin) |
| `/admin/users` | Browse/search users, grant or revoke Pro/Growth manually | Yes (admin) |
| `/admin/blog` | Manage blog drafts (generate, preview, publish/discard) | Yes (admin) |
| `/admin/email` | Email performance — open/click/bounce rates per email type, top-clicked URLs | Yes (admin) |
| `/admin/leads` | Browse Niche Picker leads, filter by drip stage, view AI-generated niches per lead | Yes (admin) |
| `/privacy` | Privacy policy | No |
| `/terms` | Terms of service (no-refund policy) | No |

---

## ❌ Never do this (owner instructions)

> Add rules here whenever I make a change you don't want repeated.
> Format: one line per rule, plain English. I check this before every change.

<!-- Example rules (remove this block and add real ones as needed):
- Never remove the streak feature from the dashboard
- Never change the module count from 12
- Never add a free trial to the Stripe checkout
-->

---

## AI provider state (current as of 2026-04-28)

| Provider | Status | Used by |
|---|---|---|
| **Groq** | Free tier, primary for most flows | Free crons (Niche Picker, blog, briefings), Pro tier AI tools, Supplier AI Analysis (all tiers), Module Q&A (all tiers) |
| **Gemini** | **Paid tier 1** (billing attached, $5/mo budget alert, 30 req/min cap per region) | Growth-tier AI tools: Ad Copywriter, UGC Brief, Ad Auditor, Store Autopsy (with `url_context` for URL fetching) |
| **OpenAI** | Not configured | — (slot in fallback chain if `OPENAI_API_KEY` is set later) |
| **Anthropic** | Not configured | — (slot reserved for future Scale Lab upgrade to Claude Sonnet) |

Cost ceiling: ~$5/month (budget alert kills it well before that). Realistic cost: pennies/month at current scale. Fallback: any Gemini 429 → silently uses Groq → user gets a result.

To upgrade Scale Lab to Claude later: add `ANTHROPIC_API_KEY` to Vercel + edit `TIER_CHAINS.growth` in `lib/ai/config.ts` to put Anthropic first. Single-line change.

---

## Key business rules (never change without asking)

- **No refunds** — explicitly requested by owner; terms say "all payments are non-refundable"
- **3 tiers:** Free (M1–6) → Pro $19/mo (M7–12) → Scale Lab/Growth $49/mo (M13–24). Gating: M7–12 require `is_pro`, M13–24 require `is_growth`. Growth implies Pro (when granted, both flags go true)
- **Admin email:** `insidet97@gmail.com` — bypass all Pro gating, extra nav links
- **Quiz is required** before signup (quiz → signup flow, not the other way round)
- **From email:** `hello@firstsalelab.com` (verified in Resend — do not change)
- **Support/contact email for users:** `support@firstsalelab.com` (settings, terms, privacy)
- **Stripe webhook must use `www`:** `https://www.firstsalelab.com/api/stripe/webhook` (apex 307-redirects, Stripe won't follow)

---

## Environment variables (Vercel + .env.local)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://firstsalelab.com
RESEND_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_ID                # Pro tier $19/mo (existing)
STRIPE_PRICE_ID_GROWTH         # Scale Lab tier $49/mo (NEW — must be created in Stripe before users can checkout Growth)
GROQ_API_KEY                          # primary AI provider (free tier — currently used for everything)
OPENAI_API_KEY                        # optional fallback / future Pro upgrade
ANTHROPIC_API_KEY                     # optional fallback / future Scale Lab upgrade (recommended for premium copy)
GEMINI_API_KEY                        # optional fallback (free tier exists)
ADMIN_EMAIL=hello@firstsalelab.com
NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD   # add when AdSense approved
NEXT_PUBLIC_ADSENSE_SLOT_MODULE      # add when AdSense approved
NEXT_PUBLIC_ADSENSE_SLOT_CONTENT     # used on /tools, /blog, /blog/[slug], /resources
CRON_SECRET
```

---

## What's been built (complete feature list)

- [x] **24 fully-written modules** across 3 tiers (Free 1-6, Pro 7-12, Scale Lab 13-24) — content, checklist, steps, common mistakes, resources
- [x] Sequential unlock logic + quiz pre-unlock (startModule)
- [x] Daily streak tracking (`streak_days`, `last_active`)
- [x] Pro gating (Stripe subscription, webhook, billing portal)
- [x] Stripe race-condition fix (`?upgraded=true` → optimistic Pro state)
- [x] Welcome email (after signup) + module completion email
- [x] Pro welcome email (fires from Stripe webhook)
- [x] Weekly product picks: Groq AI → admin draft → publish → email Pro users
- [x] Monthly ecom briefing: Groq AI → auto-publish → email Pro users
- [x] Admin content review page (generate, swap one product, publish)
- [x] Admin analytics dashboard (user stats, module funnel)
- [x] Public shareable certificate page (server component, dynamic OG meta)
- [x] Google AdSense (verified, slot guard, env-var-activated, Pro = no ads)
- [x] Google Analytics 4 (`G-VT4RZ3JB6L`, afterInteractive scripts)
- [x] SEO: sitemap.ts (6 URLs), robots.ts, JSON-LD (Organization + Course + FAQPage)
- [x] Privacy policy + Terms of service (no-refund policy)
- [x] Settings page (change name, change password, danger zone)
- [x] Onboarding card for first-time users (welcome + 3-step orientation + Module 1 CTA)
- [x] Getting Started checklist on dashboard — 6 milestones (quiz, Module 1, 3-day streak, tool use, Module 6) with contextual CTAs, auto-completes from existing data, auto-hides at 5/6 done
- [x] Mobile audit: responsive padding, nav collapse, grid fixes, button sizing
- [x] Module 6 → Pro upgrade pitch (celebration overlay, no auto-redirect for free users)
- [x] Admin user management page (`/admin/users`) — search, filter, grant/revoke Pro
- [x] Re-engagement email cron (daily, nudges users with 0 completions 3+ days post-signup)
- [x] Streak-loss recovery email cron (daily 19:00 UTC, saves at-risk streaks)
- [x] Weekly progress digest email cron (Sunday 17:00 UTC, all users)
- [x] Resend webhook for email open/click tracking (logs to email_events table)
- [x] Dynamic OG images: site-wide default + per-certificate (Next.js ImageResponse)
- [x] Free lead magnet: Niche Picker (`/niche-picker`) — Groq AI suggests 3 niches, captures email, day-0 email, 4-step drip sequence over 7 days, rate-limited 1/email/24h
- [x] Supplier Validator: 0–100 trust score with 5-category breakdown — embedded in `/tools` (5th tab) and inside Module 3; logged-in users can save validations to `supplier_validations` table; **Pro-only AI analysis** layer adds Groq-generated red flags, questions to ask, likely issues, and a pre-order checklist tailored to the supplier's inputs
- [x] Blog system: public `/blog` + `/blog/[slug]` with JSON-LD, weekly Groq-drafted posts, admin review/publish at `/admin/blog`
- [x] Performance: AdSense moved from beforeInteractive → afterInteractive (no longer blocks page interactivity); decoding="async" on logo images
- [x] Admin MRR + funnel + email + leads dashboards
- [x] Store Autopsy (Growth-tier exclusive AI tool — competitor teardown)
- [x] AI Q&A assistant per module (tier-rate-limited: 3 free / 10 Pro / 50 Growth per module per 24h)
- [x] AI Ad Copywriter (✨ Pro/🚀 Growth) — 5 ad variants across psychological angles, rate-limited 5/20 per day
- [x] UGC Brief Generator (✨ Pro/🚀 Growth) — complete creator brief with hook + shot list + reference styles
- [x] AI Ad Auditor (✨ Pro/🚀 Growth) — scores ad on Cialdini's 6 + identifies hook framework + provides rewrites
- [x] Product Description Writer (✨ Pro/🚀 Growth) — 3 description variants for product pages (benefit / story / social-proof angles), with 4 tones × 3 lengths
- [x] Email Subject Line Tester (✨ Pro/🚀 Growth) — 10 subject line variants across 8 frameworks, with predicted open rate, mobile-truncation flag, and preheader text
- [x] Annual plan code prep (`STRIPE_PRICE_ID_ANNUAL` + `_GROWTH_ANNUAL` env vars; Stripe products to be created with live mode)
- [x] Referral program: code generation + capture on signup + dashboard widget + Stripe webhook flags conversion
- [x] Affiliate links: Shopify, ReConvert, AutoDS, Privy, Loox

---

## Recent changes (last session)

| What | Detail |
|------|--------|
| **Pre-launch security pass 2 — payment-flow + auth hardening** | Second-pass deep audit found 4 more real issues (3 verified critical/high, 1 medium). All fixed. **(1) CRITICAL — `/api/stripe/checkout` no auth:** the route accepted `userId` and `email` from the request body with NO bearer-token verification. An attacker could call it with a victim's id + email, get a real Stripe checkout URL back, and use it as a phishing payload. Fixed by adding bearer-token auth and forcing `customer_email` + `metadata.userId` from `user.email` / `user.id` (token-derived), ignoring whatever the body claims. Updated the `/upgrade` page caller to pass the access token. **(2) CRITICAL — Stripe webhook had no idempotency:** Stripe retries failed webhooks. Without dedup, a retry of `checkout.session.completed` would send a 2nd welcome email and re-mark the referral. Added a new `stripe_webhook_events` table with `stripe_event_id` UNIQUE — handler checks before processing, inserts after successful processing (only). On thrown errors, no insert → next Stripe retry will see the event as new and re-attempt (correct behaviour). Also added a defensive `STRIPE_WEBHOOK_SECRET` env var presence check at the top of the handler. **(3) HIGH — `/api/referrals/track` no auth, accepted `referredUserId` from body:** attacker could create false referral attributions by calling with someone else's id. Fixed by requiring bearer token and taking `referred_id` from `user.id`. Body now only carries `referralCode`. Updated signup caller. **(4) HIGH — `/api/store-autopsy` SSRF defense:** even though Gemini's url_context tool fetches from Google's servers (not ours), we now reject URLs pointing at `localhost`, loopback, private IPv4 ranges (10/8, 172.16/12, 192.168/16), AWS/Azure/GCP metadata addresses, and IPv6 loopback at the API layer. Defense-in-depth signal-of-intent — anyone passing those is probing, not analysing a competitor. **SQL migration owner must run:** `CREATE TABLE IF NOT EXISTS stripe_webhook_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), stripe_event_id text NOT NULL UNIQUE, event_type text NOT NULL, processed_at timestamptz NOT NULL DEFAULT now()); CREATE INDEX IF NOT EXISTS stripe_webhook_events_event_id_idx ON stripe_webhook_events (stripe_event_id);`. Audit findings dropped: account-deletion rate limit (operations are naturally idempotent — supabase.auth.admin.deleteUser fails after the first, Stripe sub cancellation is idempotent), niche-picker IP throttling (free-tier abuse risk acceptable for a public lead magnet pre-launch), RLS verification (uses service-role exclusively, anon key is only used for `auth.getUser()` which doesn't need RLS) |
| **Getting Started checklist — admin/power-user fixes** | Two issues spotted from owner's admin account: (1) checklist was nagging admin to "take the quiz" even though admin had 12 modules complete — admins bypass the signup→quiz flow so `profile.track` is `null` for them. Fix: the quiz milestone now counts as done if `hasQuiz OR hasModule1` (you can't be on Module 1 without engaging with the system enough that the quiz nudge is irrelevant). (2) Checklist was visible at all to a user with 12 modules done because the auto-hide at 5/6 didn't trigger for their unusual milestone pattern. Fix: checklist now also hides entirely for admins (`isAdmin` prop) and for anyone with `completedCount >= 3` (clear signal they're past early-momentum phase). The checklist is now strictly an early-onboarding tool — first-week new users only |
| **Pre-launch data-protection pass — cookie consent + self-serve deletion + privacy policy refresh** | Three GDPR/ePrivacy gaps closed before Stripe live mode. **(1) Cookie consent banner:** new `<CookieBanner>` shows on first visit (sticky bottom, two buttons: "Essential only" / "Accept all"). Choice persists in `localStorage` as `fsl_cookie_consent` and dispatches a `fsl-cookie-consent-changed` event. New `<AnalyticsScripts>` client component loads GA4 + AdSense scripts ONLY when consent is "all" — they're now gated, not unconditional. Vercel Analytics stays always-on (cookieless / GDPR-compliant by default). The AdSense `meta` tag for site verification stays — it's text only, no script, no cookies. **(2) Self-serve account deletion:** new `POST /api/account/delete` endpoint (bearer-token auth, no body — token is the only source of truth for who's deleted, blocks IDOR). It cancels any active Stripe subscriptions first (so we don't keep billing them), then calls `supabase.auth.admin.deleteUser(user.id)` which cascades through the schema's `ON DELETE CASCADE` on `user_id` and removes everything (user_profiles, user_progress, ai_tool_log, module_qa_log, supplier_validations, referrals). Settings page now has a real "Delete my account" button + confirmation modal that requires typing "DELETE" to enable, with clear copy about what's removed and what's retained (Stripe invoice records by tax law, aggregated analytics). On success it signs out and redirects to `/?deleted=1`. **(3) Privacy policy refresh:** added Gemini and GA4 to the third-party processors table (were missing); split GA4 from Vercel Analytics; added a new bullet for AI tool input/output logging (was undisclosed); rewrote the cookies section to describe the new banner choices; rewrote the rights section to point at the new self-serve deletion + clarify what we retain. Last-updated date bumped |
| **Pre-launch security pass — 4 real issues fixed before Stripe live mode** | Ran a full audit (read-only agent), triaged the findings, fixed the verified ones. (1) **CRITICAL fixed:** `/api/stripe/portal` had IDOR — it accepted a `userId` from the body and returned a billing portal URL for that user with NO ownership check. Anyone authenticated could pass any UUID and get a portal link to that user's Stripe subscription (cancel it, change card, etc.). Now requires bearer token + checks `user.id === body.userId`. (2) **CRITICAL fixed:** `/api/analytics` was wide-open — anyone could `curl` the URL and get total user count, completions per module, signups, max streak. Now requires bearer token + `isAdmin()` email check. (3) **HIGH fixed:** `/api/send-welcome` and `/api/send-completion` accepted any `email` and would send a Resend email to that address. Anyone could spam any inbox with fake "welcome" / "module complete" emails (and pollute our `email_events` analytics). Now requires bearer token + `email === user.email` and `userId === user.id`. (4) **DEFENSE-IN-DEPTH:** Added security headers in `next.config.ts` — X-Content-Type-Options, X-Frame-Options SAMEORIGIN (not DENY — would break Stripe portal embed), Referrer-Policy, HSTS preload, Permissions-Policy locking out camera/mic/geo/FLoC. CSP not added yet (inline styles + AdSense/GA4/Stripe.js make it tricky — flagged as a Medium follow-up). False positives the audit raised but I dropped: missing `STRIPE_WEBHOOK_SECRET`/`CRON_SECRET`/`RESEND_WEBHOOK_SECRET` in `.env.local` — those are local-dev-only and are set in Vercel for production (cron jobs and webhooks have been working, which proves it) |
| **Getting Started checklist on the dashboard** | New `<GettingStartedChecklist>` component renders on the dashboard for returning users (under the progress card) and walks them through 6 milestones: ① Create account (always done) → ② Take the quiz → ③ Complete Module 1 → ④ Reach a 3-day streak → ⑤ Try a tool → ⑥ Finish Module 6 (end of free tier). Each item that isn't done shows a contextual CTA link (e.g. "Open →" for Module 1, "Browse →" for tools); done items are crossed out with a green check. Auto-completes from existing data — no new DB columns. The "Try a tool" milestone counts BOTH `ai_tool_log` rows AND `supplier_validations` rows (two HEAD-only count queries added to the dashboard fetch). The whole card auto-hides once the user reaches 5/6 done so it doesn't linger after the early-momentum phase. Doesn't replace the existing welcome card for absolute newbies (`completedCount === 0 && !track`) — that still shows; the checklist is for users who've started but haven't built up momentum yet |
| **2 new AI tools — Product Description Writer + Email Subject Line Tester** | Two new tabs on `/tools` (📝 Product Desc, ✉️ Subject Lines), both gated through `gateAITool` (Free locked, Pro 5/day, Growth 20/day, Growth gets Gemini, Pro gets Groq). **Product Description Writer:** 3 variants per run across `benefit` / `story` / `social_proof` angles, with 4 tones (professional / conversational / playful / luxury) × 3 lengths (short ~50w / medium ~120w / long ~250w). Each variant returns headline + body + 3-5 bullets, with copy-all per variant. **Email Subject Line Tester:** 10 variants per run across 8 frameworks (Curiosity, Urgency, Numbers, Personalized, Question, Pattern Interrupt, Benefit, Social Proof). For each: subject + framework attribution + preheader text + predicted open (Low/Medium/High with 1-line reasoning) + mobile truncation flag (>40 chars warning). 6 email purposes pre-configured (welcome, promo, cart abandon, re-engage, newsletter, re-launch) each with prompt-tailored guidance. New `AITool` union expanded to include `product_description` + `subject_lines`; `/api/ai-tools/usage` automatically picks them up via the `AI_TOOLS` array; usage pills work on both tools out of the box |
| **AdSense ads.txt fix — middleware-based apex→www redirect with /ads.txt carve-out** | AdSense was reporting "Ads.txt status: Not found" because the Vercel-level apex→www redirect was 307'ing `firstsalelab.com/ads.txt` to `www.firstsalelab.com/ads.txt` and Google's crawler doesn't reliably follow redirects for ads.txt. New `middleware.ts` at the repo root does the apex→www redirect in code (308 permanent), but skips `/ads.txt` so the file is served directly on both hosts. **Owner action paired with this code change:** disable the project-level apex→www redirect in Vercel Settings → Domains so middleware can take over (without that, Vercel's edge redirect fires before middleware runs). After both changes are live, AdSense should pick up ads.txt within 24-72h |
| **Gemini paid tier provisioned + cost caps locked in** | Owner-action work (no code changes; config only). After hitting `RESOURCE_EXHAUSTED limit:0` on the free tier (URL Context tool is paid-tier-only — undocumented Google gating), set up: (1) New Google Cloud project "First Sale Lab" via aistudio.google.com/apikey with billing attached. (2) `$5/month` budget alert in Cloud Billing with 50%/90%/100% email thresholds. (3) Hard quota cap: `GenerateContent request limit per minute for a region` set to **30** across all 43 regions. Token-count cap deemed unnecessary — request cap + budget alert is enough. (4) New `GEMINI_API_KEY` rotated into Vercel (Production + Preview). The fallback chain still routes 429s to Groq, so even if all caps hit at once the user gets a result. Worst-case monthly cost: single-digit dollars. Realistic: pennies. **Decision left as-is:** Growth users get Gemini on the 4 premium AI tools (Ad Copywriter, UGC Brief, Ad Auditor, Store Autopsy with url_context); Supplier AI Analysis stays on Groq via hardcoded `"pro"` tier (shared between Pro and Growth); Module Q&A + crons stay on Groq via `"default"`. Cleanest mental model: "Gemini powers the premium AI tools, Groq powers shared infrastructure" |
| **Better Gemini error surfacing + Resend webhook tags fix** | Two log-level fixes: (1) Gemini provider now parses Google's structured error envelope so `[ai] gemini/...failed` warnings show the actual `RESOURCE_EXHAUSTED (code 429)` / `INVALID_ARGUMENT` / etc. instead of a truncated 300-char string — makes it possible to diagnose whether a 429 is quota, billing-not-attached, or tool-not-allowed. Also tags the line with `[url_context=on]` when applicable. (2) Resend webhook was crashing on `(data.tags ?? []).forEach` because Resend now ships tags as a flat `{key: value}` object instead of the older `[{name, value}]` array — handler now accepts both shapes |
| **AI tool usage counter pills + Store Autopsy rate-limited** | Every AI tool now shows a pre-fetched "X / Y runs today" pill in its header (was previously only visible after the first run, since `usage` was filled from the response). New endpoint `GET /api/ai-tools/usage` returns `{ tier, usage: { ad_copywriter, ugc_brief, ad_audit, store_autopsy } }` for the authenticated user. New shared hook `lib/useAIToolUsage.ts` pre-fetches on mount + exposes `bump()` (optimistic +1 after a successful run) and `refresh()` (re-fetch after a 429). Store Autopsy was the only AI tool without rate limiting — now routed through `gateAITool` (20/day for Growth) + logged to `ai_tool_log`. New `AITool` type union + `AI_TOOLS` array in `lib/ai-tool-gate.ts` so future tools auto-appear in the usage endpoint |
| **Store Autopsy now reads the URL directly (Gemini URL Context)** | The Store Autopsy tool no longer asks users to describe what they observed — Gemini 2.0 Flash now fetches the competitor URL and analyses the actual page content. New `urls?: string[]` field on `AIRequest` (in `lib/ai/types.ts`); Gemini provider attaches the `url_context` tool when present (`lib/ai/providers/gemini.ts`); other providers ignore it. Notes textarea is now optional and reframed as "things AI can't see" (off-site ads, founder behaviour, Trustpilot vs on-site reviews, etc.). If Gemini fails (URL blocked, JS-only SPA, key missing), the chain falls through to Groq with whatever notes the user wrote — graceful degradation. URL validation added to the API route (rejects non-http(s)). When using `url_context`, Gemini's native JSON mime type isn't reliably combinable, so the provider switches to prompt-engineered JSON + fence stripping (mirrors the Anthropic provider) |
| **Growth tier routed to Gemini + tighter rate limits** | `TIER_CHAINS.growth` in `lib/ai/config.ts` now goes Gemini 2.0 Flash → Groq fallback (different "voice" than Pro's Groq, with Groq as safety net if Gemini hits its 1,500/day free-tier cap). Growth per-tool daily limit dropped 50 → 20 in `lib/ai-tool-gate.ts` (still feels unlimited to legit users, kills abuse vectors, stays well under Gemini's free-tier cap). Pro stays on Groq. Requires `GEMINI_API_KEY` in Vercel — get it free at aistudio.google.com (Google AI Pro consumer subscription is unrelated; the API has its own free tier) |
| **AI provider abstraction (`lib/ai/`)** | Refactored single `callGroq()` into a multi-provider system. New `lib/ai/index.ts` exports `callAI(req, tier)` that routes through `TIER_CHAINS` (in `lib/ai/config.ts`). Providers: Groq / OpenAI / Anthropic / Gemini. Fallback chain auto-tries other providers if primary fails (only those with API keys configured run). All existing generators in `lib/perplexity.ts` now go through this abstraction. Tier-aware: `analyzeSupplier` routes through "pro", `analyzeStore` through "growth", AI tools (ad copywriter / UGC brief / ad audit) get the user's actual tier from the API gate. To upgrade Scale Lab quality to Claude later: edit `TIER_CHAINS.growth` in `lib/ai/config.ts` — single line change. New optional env vars: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` |
| **3 new AI tools (Pro + Scale Lab)** | Added to `/tools` as tabs 6-8: ✍️ Ad Copywriter (5 variants per run, different psychological angles), 🎬 UGC Brief Generator (complete creator brief with hook/shot list/reference styles/do-not list), 🧐 Ad Auditor (scores against Cialdini's 6 + identifies hook framework + concrete rewrites). All gated: free locked, Pro 5/day per tool, Growth 50/day per tool. New shared `lib/ai-tool-gate.ts` helper handles tier check + rate limiting + logging. New shared `useAuthTier` hook for client tier detection. New shared `<AIToolLockCard>` for free/anon users. All runs logged to new `ai_tool_log` table. Tools page max-width bumped to 960px nav / 880px main; grid switched to `auto-fill minmax(140px,1fr)` so 9 tabs flow naturally |
| **Admin dashboards expanded** | `/admin` now shows MRR by tier, churn risk, signups (7d/30d), active 7d/today, full conversion funnel (signups → M1 → M6 → M12 → M24), recent 10 signups with tier badges. Module funnel covers all 24 modules. New `/admin/email` with open/click/bounce rates per email type + top-clicked URLs. New `/admin/leads` for Niche Picker leads with drip-stage filter |
| **Store Autopsy (Growth-exclusive)** | New `🔍 Store Autopsy` tool — 6th tab on `/tools`. User pastes a competitor URL + describes what they observed, Groq returns structured teardown: 2-3 sentence summary, offer analysis, hook strategy, social proof analysis, conversion gaps, exploitation angles, threat level (Low/Medium/High). Free/Pro users see locked card → upgrade CTA. Server-side gate on `is_growth` |
| **AI Q&A assistant per module** | Embedded `<ModuleQA>` widget on every module page. Student types a question, Groq answers using ONLY that module's content as context. Rate-limited per tier per module per 24h: Free 3, Pro 10, Growth/admin 50. Logged to new `module_qa_log` table for rate-limiting + future analysis |
| **Annual plan code prep** | `/api/stripe/checkout` accepts `billing: "monthly" \| "annual"`. Routes to STRIPE_PRICE_ID/_ANNUAL/_GROWTH/_GROWTH_ANNUAL env vars. Annual env vars unset by default — Stripe product creation deferred with live mode. Webhook captures billing in metadata for future use |
| **Referral program** | Each user gets a 6-char base36 code on first dashboard load. Sharing `/quiz?ref=CODE` captures the lead via localStorage → `/api/referrals/track` after signup. Stripe webhook marks the referral as converted when they upgrade. Dashboard `<ReferralCard>` shows the link + total/converted/pending counts. Admin grants the actual free month manually via existing `/admin/users` Grant Pro/Growth toggle |
| **Module 24 redirect bug fixed** | Auto-redirect after completion was hardcoded `< 12`; now `< 24` so Growth users completing M12 advance to M13 instead of being kicked to dashboard |
| **Landing page reflects 3-tier ladder** | Hero badge updated to "Modules 1–6 free · Pro $19/mo · Scale Lab $49/mo". Free vs Pro 2-column comparison rewritten as 3-tier grid (Free/Pro/Scale Lab) — Scale Lab styled black/gold with "Most powerful" badge. New black/gold Scale Lab teaser card added below the 12-module curriculum grid showing the 5-phase breakdown (Diagnose/Validate/Persuade/Test/Scale). FAQ "Is this actually free?" answer rewritten to explain all 3 tiers. FAQ "How long does the course take?" mentions Scale Lab takes 3-6 months due to 7-day test cycles. JSON-LD structured data adds 3rd Offer (Scale Lab $49 → `/upgrade?tier=growth`); Course `teaches` field expanded with advanced topics (CPA/ROAS/AOV, persuasion copy, A/B testing, UGC creative, profitable scaling). Stats section updated: "12 modules" → "24 modules", "Free to start" → "3 tiers". CTA banner footer text now mentions all 3 tiers |
| **Loox affiliate link** | `https://loox.io/app/FSL30` — replaces the placeholder `loox.app` URL across `lib/modules.ts` (3 module resource arrays) and `lib/resources.ts` (Store Building category card) |
| **🚀 Scale Lab tier launched (12 new modules + 3-tier ladder)** | New $49/mo Growth tier with 12 advanced modules (13-24) covering diagnose/validate/persuade/test/scale phases. Added `Tier` type + `tier` field to Module. New `is_growth` column on `user_profiles`. Stripe checkout accepts `tier` param (`pro`/`growth`); webhook dispatches matching welcome email and sets correct flags via `metadata.tier`. New env var `STRIPE_PRICE_ID_GROWTH`. New `/api/admin/users/[userId]/growth` endpoint. `/upgrade` rewritten as 3-tier comparison with toggle. Module 12 → Growth pitch overlay (mirrors Module 6 → Pro). Dashboard module list grouped by tier with Scale Lab styled in black/gold. New `growthWelcomeEmailHTML` template. Admin `/admin/users` shows tier (Free/Pro/Scale Lab) + Grant/Revoke buttons for both tiers, filter chips include "🚀 Scale Lab" |
| Tools/Blog/Resources promoted + ads | `/tools` now in marketing landing nav and footer (anonymous accessible). New `components/UserAdBanner.tsx` wrapper handles Pro detection on public pages. AdSense banners added to `/tools` (after panel), `/resources` (after list), `/blog` (after post list), `/blog/[slug]` (between article body and CTA). All gated by `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT` env var. Sitemap + robots updated to include `/tools` and `/resources` |
| Supplier Validator AI tease | Pro AI feature now also surfaced **before** the user calculates — banner at the top of the validator: Pro/admin users see a confirmation pill ("Pro · AI analysis enabled"); free/anonymous users see a clickable yellow upsell card linking to `/upgrade` or `/signup`. Plus the existing post-calculation Pro CTA stays |
| Supplier Validator + Pro AI Analysis | Free 0–100 scoring calculator (5 categories) at `/tools?tool=supplier` and embedded in Module 3. Pro-only AI layer at `POST /api/supplier-ai-analysis` calls Groq with the user's inputs and returns: 2–3 sentence summary, 3–5 red flags, 5–7 verification questions, 3–5 likely issues, 8–10 pre-order checklist items. UI shows "🤖 Run AI analysis" button for Pro/admin users; locked Pro CTA card for free/anonymous (links to `/upgrade` or `/signup`). Optional save to `supplier_validations` table |
| Niche Picker drip + rate-limit | Day-0 email sends 3 niches immediately; daily 14:00 UTC cron `/api/cron/niche-drip` sends day-2 ("Validate in 48h"), day-5 ("Niche mistake"), day-7 ("Take the quiz"); rate-limited 1 generation per email per 24h with friendly UI; visible white email input on the dark CTA card |
| Admin blog RLS fix | `/admin/blog` was using anon key which RLS blocks on the new `blog_posts` table → moved to service-role-backed `GET /api/admin/blog` endpoint, mirrors the `/api/admin/users` pattern |
| Blog system | Public `/blog` + `/blog/[slug]` with JSON-LD; weekly Wednesday 7am cron drafts via Groq; admin `/admin/blog` to preview/publish/discard; manual generate with optional topic |
| Niche Picker lead magnet | Public `/niche-picker` — 4 inputs (interests/budget/experience/audience), Groq returns 3 niches; email captured to `niche_leads` table |
| Dynamic OG images | Site default `app/opengraph-image.tsx` (dark hero) + per-certificate `app/certificate/[userId]/opengraph-image.tsx` (personalised) |
| Resend webhook | `/api/webhooks/resend` logs every email event (delivered/opened/clicked/bounced) to `email_events` table; existing emails tagged with `type` + `user_id` for attribution |
| Streak-save email | Daily 19:00 UTC cron — finds users with active streak whose last_active = yesterday, sends nudge email; tracked via `streak_save_email_date` |
| Weekly digest email | Sunday 17:00 UTC cron — sends a "your week" recap to all users (this week / total / streak / next module) |
| Performance | AdSense `beforeInteractive` → `afterInteractive` (no longer blocks page interactive); `decoding="async"` on logo images |
| Module 6 → Pro pitch | When a free user completes Module 6, the slide-up overlay shows a celebration + Pro upgrade pitch (no auto-redirect, lists Modules 7–12 + weekly picks/briefing); free users converting at peak intent moment |
| Admin user management | `/admin/users` — browse/search all users, filter (Pro/free/active/inactive), grant or revoke Pro manually (note: doesn't touch Stripe — webhook will overwrite if active sub) |
| Re-engagement email cron | Daily at 10am UTC, sends a single nudge to users 3–14 days post-signup with 0 completions; tracked via `user_profiles.reengagement_sent_at` to send at most once |
| Onboarding experience | First-time users (0 completions, no track) see a dark welcome card with 3-step orientation and "Start Module 1 →" CTA instead of blank 0% progress bar |
| Mobile audit | `px-8` → `px-4 sm:px-8` across all sections; hero `text-4xl sm:text-5xl`; CTA banner `p-7 sm:p-12`; dashboard nav secondary links `hidden sm:block`; upgrade grid `grid-cols-1 sm:grid-cols-2`; module complete button full-width |
| Settings page | `/settings` — change name, change password (min 8 chars, confirm match), danger zone; linked from dashboard nav |
| Support email | `hello@` → `support@firstsalelab.com` in settings, terms, and privacy (user-facing contact only; from-address stays `hello@`) |
| Certificate page | Public `/certificate/[userId]` — server component, dynamic OG, not-yet-earned state, Copy/LinkedIn/X share |
| SEO | sitemap.ts, robots.ts, JSON-LD structured data on landing page |
| GA4 | `G-VT4RZ3JB6L` in layout.tsx |
| Privacy + Terms | Static pages with real content, no-refund policy |
| Pro welcome email | Fires from Stripe webhook on checkout.session.completed |

---

## Pending / known issues

### ✅ Pre-launch hardening complete (2026-04-29)
All security + data-protection work for live-mode launch is shipped:
- 2 security audit passes complete (8 real issues fixed total — see Recent changes)
- Cookie consent banner + self-serve account deletion + privacy policy refresh
- AdSense ads.txt fix via middleware
- Getting Started checklist (with admin/power-user fixes)
- 2 new AI tools (Product Description Writer + Subject Line Tester)

### 🔄 SQL migration needed before next deploy fully takes effect
**ONE new table required** (Stripe webhook idempotency):
```sql
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type      text NOT NULL,
  processed_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stripe_webhook_events_event_id_idx
  ON stripe_webhook_events (stripe_event_id);
```
Without this the webhook will throw on every event (table doesn't exist) — duplicate-detection won't work, no events will be deduped or marked processed.

Other older migrations (referral codes, Q&A log, ai_tool_log, etc.) — already run in prior sessions ✅. Full schema reference is below.

### 🔄 Next session: Stripe live-mode flip (queued)
Owner stepping away briefly; will resume to flip Stripe to live mode. Steps in one batch:
1. Switch Pro to live keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
2. Re-point Stripe webhook to live endpoint (`https://www.firstsalelab.com/api/stripe/webhook`)
3. Create live Stripe Products: **Pro $19/mo**, **Scale Lab $49/mo**, optionally **Pro $190/yr** + **Scale Lab $490/yr** (annual plans)
4. Vercel env vars: `STRIPE_PRICE_ID`, `STRIPE_PRICE_ID_GROWTH`, optionally `STRIPE_PRICE_ID_ANNUAL` + `STRIPE_PRICE_ID_GROWTH_ANNUAL`
5. Redeploy
6. **Test the full flow with a real card on a non-admin account** before sharing the upgrade page widely (admin accounts bypass Stripe entirely so they can't be used for end-to-end testing)

### ⏳ External waiting (no action needed)
- **Google AdSense site approval:** "Getting ready" as of last check. All three slot IDs configured in Vercel (`NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD`, `_MODULE`, `_CONTENT`). Once Google approves, ads fill automatically. Verify in incognito (admins are ad-free).
- **AdSense `ads.txt`:** showed "Not found" despite file being correct at `https://www.firstsalelab.com/ads.txt`. The apex returns 307 → www; AdSense crawlers usually follow but status can lag 24–72h. Register `www.firstsalelab.com` as a separate site only if still "Not found" after 48h.
- **Sitemap** submitted to Google Search Console — indexing takes days.

### 🛠 Owner-action operational state
- **Stripe** is still in test mode — flip queued for next session (see above).
- **`support@firstsalelab.com`** mailbox is set up ✅
- **Resend webhook** — endpoint configured, `RESEND_WEBHOOK_SECRET` set in Vercel ✅
- **Gemini** paid tier 1 enabled with $5/mo budget alert + 30 req/min cap ✅
- **AdSense ads.txt** now serves directly from apex via middleware carve-out ✅ (waiting on Google's crawler to re-check)

### 📜 Full SQL migrations (run all once in the Supabase SQL editor — `IF NOT EXISTS` makes them safe to re-run)
  ```sql
  -- Scale Lab tier (already done 2026-04-28)
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_growth boolean NOT NULL DEFAULT false;

  -- 🔄 NEW (referral program — needed before /quiz?ref=CODE captures + dashboard widget works)
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS referral_code text;
  CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_referral_code_idx ON user_profiles (referral_code);

  CREATE TABLE IF NOT EXISTS referrals (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code   text NOT NULL,
    converted_tier  text,
    credit_granted  boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (referred_id)
  );
  CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON referrals (referrer_id);

  -- Module Q&A log — rate-limiting for the AI assistant (already done)
  CREATE TABLE IF NOT EXISTS module_qa_log (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id   int NOT NULL,
    question    text NOT NULL,
    answer      text,
    created_at  timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS module_qa_log_user_module_idx ON module_qa_log (user_id, module_id, created_at DESC);

  -- 🔄 NEW (AI tools log — rate-limiting + Vault feature later)
  CREATE TABLE IF NOT EXISTS ai_tool_log (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool        text NOT NULL,        -- 'ad_copywriter' | 'ugc_brief' | 'ad_audit'
    input       jsonb,
    output      jsonb,
    created_at  timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS ai_tool_log_user_tool_idx ON ai_tool_log (user_id, tool, created_at DESC);

  -- 🔄 NEW (Stripe webhook idempotency — prevents duplicate welcome emails on retries)
  CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id text NOT NULL UNIQUE,
    event_type      text NOT NULL,
    processed_at    timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS stripe_webhook_events_event_id_idx ON stripe_webhook_events (stripe_event_id);

  -- Re-engagement email tracking (used by /api/cron/reengagement)
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS reengagement_sent_at timestamptz;

  -- Streak-save email tracking (used by /api/cron/streak-save)
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS streak_save_email_date date;

  -- Email events log (used by /api/webhooks/resend)
  CREATE TABLE email_events (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type   text NOT NULL,
    resend_id    text,
    to_email     text,
    user_id      uuid,
    email_type   text,
    subject      text,
    click_url    text,
    created_at   timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX email_events_user_id_idx    ON email_events (user_id);
  CREATE INDEX email_events_email_type_idx ON email_events (email_type);
  CREATE INDEX email_events_event_type_idx ON email_events (event_type);

  -- Niche Picker lead capture (used by /api/niche-picker + drip cron)
  CREATE TABLE niche_leads (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email       text NOT NULL,
    interests   text,
    budget      text,
    experience  text,
    audience    text,
    niches      jsonb,
    drip_stage  int NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX niche_leads_email_idx      ON niche_leads (email);
  CREATE INDEX niche_leads_drip_stage_idx ON niche_leads (drip_stage);

  -- If niche_leads already exists from earlier migration, run this instead:
  -- ALTER TABLE niche_leads ADD COLUMN IF NOT EXISTS drip_stage int NOT NULL DEFAULT 0;

  -- Supplier Validator saved validations (used by /api/supplier-validations)
  CREATE TABLE IF NOT EXISTS supplier_validations (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_name text NOT NULL,
    supplier_url  text,
    inputs        jsonb NOT NULL,
    scores        jsonb NOT NULL,
    total_score   int NOT NULL,
    verdict       text NOT NULL,
    notes         text,
    created_at    timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS supplier_validations_user_id_idx ON supplier_validations (user_id);

  -- Blog posts (used by /api/cron/blog and admin /admin/blog)
  CREATE TABLE blog_posts (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         text NOT NULL UNIQUE,
    title        text NOT NULL,
    excerpt      text,
    content      jsonb NOT NULL,
    status       text NOT NULL DEFAULT 'draft',
    published_at timestamptz,
    created_at   timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX blog_posts_status_idx ON blog_posts (status);
  CREATE INDEX blog_posts_slug_idx   ON blog_posts (slug);
  ```
- **Resend webhook setup needed:** In Resend dashboard → Webhooks → Add Endpoint → URL `https://www.firstsalelab.com/api/webhooks/resend`, subscribe to `email.delivered/opened/clicked/bounced/complained`. Copy signing secret → set as `RESEND_WEBHOOK_SECRET` env var in Vercel.

---

## How to deploy

```bash
git add <files>
git commit -m "description"
git push   # Vercel auto-deploys in ~60 seconds
```

TypeScript check before pushing: `npx tsc --noEmit`
