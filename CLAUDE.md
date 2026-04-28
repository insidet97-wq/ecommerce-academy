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
- **AI content:** Groq `llama-3.3-70b-versatile` (free tier)
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
| `/admin` | Analytics dashboard (admin-only) | Yes (admin) |
| `/admin/content` | Generate/review/publish AI content drafts | Yes (admin) |
| `/admin/users` | Browse/search users, grant or revoke Pro manually | Yes (admin) |
| `/admin/blog` | Manage blog drafts (generate, preview, publish/discard) | Yes (admin) |
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
GROQ_API_KEY
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
- [x] Affiliate links: Shopify, ReConvert, AutoDS, Privy, Loox

---

## Recent changes (last session)

| What | Detail |
|------|--------|
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

### 🔄 Scale Lab tier — only SQL needed now; Stripe deferred
**Required now (1 step):**
1. **SQL migration in Supabase** — `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_growth boolean NOT NULL DEFAULT false;` (also in the SQL block below)

After that single migration, EVERYTHING in the Scale Lab tier works **except** the live Stripe checkout button:
- ✅ All 12 modules (13-24) are accessible to Growth users
- ✅ Gating, pitch overlays, admin tools all work
- ✅ Owner can manually grant/revoke Growth from `/admin/users` for testing or comping
- ❌ The `/upgrade` "Upgrade to Scale Lab" button will return 500 "Missing Stripe price ID for tier growth" until the Stripe steps below are done

**Deferred (do alongside Stripe live mode flip — see below):**
2. Stripe → create a new Product "Scale Lab" with a $49/mo recurring Price → copy `price_xxxx...`
3. Vercel env var → add `STRIPE_PRICE_ID_GROWTH` with that price ID → redeploy

These are paired with the broader "go live with Stripe" work — no point creating a live Scale Lab product while still in test mode. When the owner is ready to flip to live keys, do Pro live + Scale Lab product + env var in one batch.

### ⏳ External waiting (no action needed)
- **Google AdSense site approval:** "Getting ready" as of last check. All three slot IDs configured in Vercel (`NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD`, `_MODULE`, `_CONTENT`). Once Google approves, ads fill automatically. Verify in incognito (admins are ad-free).
- **AdSense `ads.txt`:** showed "Not found" despite file being correct at `https://www.firstsalelab.com/ads.txt`. The apex returns 307 → www; AdSense crawlers usually follow but status can lag 24–72h. Register `www.firstsalelab.com` as a separate site only if still "Not found" after 48h.
- **Sitemap** submitted to Google Search Console — indexing takes days.

### 🛠 Owner-action operational items
- **Stripe is in test mode.** When ready for real payments, do all of the following in one batch:
  1. Switch Pro to live keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
  2. Re-point Stripe webhook to the live mode endpoint
  3. Create the Scale Lab live Product (Stripe → Products → "Scale Lab" → $49/mo recurring Price) → copy live `price_...`
  4. Add `STRIPE_PRICE_ID_GROWTH` to Vercel with the live price ID
  5. Verify `STRIPE_PRICE_ID` (Pro live price) is updated to live as well
  6. Redeploy — both Pro $19 and Scale Lab $49 checkouts now process real money
- **`support@firstsalelab.com`** mailbox needs to be set up in Namecheap Pro Email (already referenced in settings, terms, privacy).
- **Resend webhook** — endpoint configured, `RESEND_WEBHOOK_SECRET` set in Vercel ✅

### 📜 Full SQL migrations (run all once in the Supabase SQL editor — `IF NOT EXISTS` makes them safe to re-run)
  ```sql
  -- 🔄 NEW (Scale Lab tier — owner is running this 2026-04-28)
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_growth boolean NOT NULL DEFAULT false;

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
