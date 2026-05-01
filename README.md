# First Sale Lab

> A freemium 12-module ecommerce course — modules 1–6 free, modules 7–12 behind a Pro subscription ($19/month).
> Live at: **[firstsalelab.com](https://firstsalelab.com)**

---

## Table of Contents

1. [What This Project Is](#what-this-project-is)
2. [Tech Stack](#tech-stack)
3. [Third-Party Services](#third-party-services)
4. [Project Structure](#project-structure)
5. [Pages & Features](#pages--features)
6. [Database (Supabase)](#database-supabase)
7. [Email System (Resend)](#email-system-resend)
8. [Stripe Pro Subscription](#stripe-pro-subscription)
9. [Google AdSense](#google-adsense)
10. [Automated Pro Content](#automated-pro-content)
11. [Affiliate Links](#affiliate-links)
12. [Environment Variables](#environment-variables)
13. [Running Locally](#running-locally)
14. [Deployment](#deployment)
15. [Branding & Logo](#branding--logo)
16. [Admin Access](#admin-access)
17. [How Key Things Work](#how-key-things-work)
18. [Changelog](#changelog)

---

## What This Project Is

First Sale Lab is a freemium self-paced ecommerce course built as a Next.js web app. Users:

1. Take a **quiz** that profiles their experience level and goals
2. Get a **personalised roadmap** (which module to start from)
3. Work through **12 sequential modules** — modules 1–6 are free, 7–12 require a Pro subscription
4. Receive **emails** after signup and after completing each module
5. Build a **daily streak** by completing modules on consecutive days
6. Earn a **certificate** upon completing all 12 modules

**Pro members** additionally get:
- Ad-free experience (Google AdSense ads hidden for Pro users)
- **Weekly Product Picks** — 5 AI-researched trending products with margin math and ad hooks
- **Monthly Ecom Briefing** — what's working on Meta/TikTok, trending niche, tactics to add/drop

The owner (admin) has an **analytics dashboard** and a **content dashboard** for reviewing and publishing AI-generated drafts.

---

## Tech Stack

| Layer        | Technology |
|--------------|-----------|
| Framework    | Next.js 16 (App Router) |
| Language     | TypeScript |
| Styling      | Tailwind CSS v4 + inline `style={{}}` for dynamic values |
| Database     | Supabase (PostgreSQL) |
| Auth         | Supabase Auth (email/password, no email confirmation) |
| Email        | Resend (transactional emails) |
| Payments     | Stripe (subscriptions, webhooks, billing portal) |
| AI Content   | Groq (`llama-3.3-70b-versatile`, free tier) |
| Ads          | Google AdSense (free users only) |
| Analytics    | Vercel Analytics + Google Analytics 4 (GA4) |
| Scheduling   | Vercel Cron (products, briefing, reminder, newsletter) |
| Hosting      | Vercel (auto-deploys from GitHub `main` branch) |
| Domain       | Namecheap → `firstsalelab.com` |
| Repository   | GitHub: `insidet97-wq/ecommerce-academy` |

---

## Third-Party Services

### Supabase
- **URL:** `https://gkoobuzqmtupftkvkomo.supabase.co`
- **Purpose:** Database, authentication, row-level security
- **Custom SMTP:** Configured to send auth emails via Resend using `hello@firstsalelab.com`
- **Auth templates:** All Supabase email templates replaced with custom branded HTML — solid colours only (no CSS gradients)
- **Email confirmation is OFF** — users redirect straight after signup

### Resend
- **Purpose:** Sends welcome email and module completion emails
- **From address:** `hello@firstsalelab.com`
- **Domain verified:** `firstsalelab.com` verified in Resend
- **API routes:**
  - `POST /api/send-welcome` — fires after signup
  - `POST /api/send-completion` — fires after each module is marked complete

### Stripe
- **Purpose:** Pro subscription ($19/month), webhooks, billing portal
- **Webhook URL:** `https://www.firstsalelab.com/api/stripe/webhook`
- **Events handled:** `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
- See [Stripe Pro Subscription](#stripe-pro-subscription) section for full details

### Groq
- **Purpose:** Generates weekly product picks and monthly briefings automatically
- **Model:** `llama-3.3-70b-versatile` (free tier — 14,400 requests/day)
- **Cost:** Free — get API key at [console.groq.com](https://console.groq.com)
- See [Automated Pro Content](#automated-pro-content) section

### Google AdSense
- **Publisher ID:** `ca-pub-1382028135058819`
- **Verified via:** Meta tag method (`metadata.other["google-adsense-account"]`)
- **ads.txt:** `public/ads.txt` contains the authorized sellers line
- **GDPR:** Google's built-in CMP selected
- See [Google AdSense](#google-adsense) section

### Google Analytics
- **Measurement ID:** `G-VT4RZ3JB6L`
- **Loaded via:** Two `<Script>` tags in `app/layout.tsx` with `strategy="afterInteractive"`
- **Tracks:** All page views across the site automatically

### Vercel
- **Auto-deploy:** Every push to `main` triggers a Vercel deploy (~60 seconds)
- **Crons:** Defined in `vercel.json` — weekly products Monday 6am UTC, monthly briefing 1st of month 7am UTC
- **Environment variables:** Set in Vercel dashboard

### Namecheap
- **Domain:** `firstsalelab.com`
- **Professional email:** `hello@firstsalelab.com` via Namecheap Pro Email

---

## Project Structure

```
ecommerce-academy/
├── app/
│   ├── layout.tsx                    # Root layout: fonts, metadata, AdSense script, Vercel Analytics
│   ├── page.tsx                      # Landing page (logged-out: freemium copy; logged-in: personalised)
│   ├── not-found.tsx                 # 404 page
│   ├── globals.css                   # Global styles, Tailwind, custom keyframes
│   │
│   ├── quiz/page.tsx                 # Multi-step quiz → builds personalised roadmap
│   ├── login/page.tsx                # Login page
│   ├── signup/page.tsx               # Signup → fires welcome email → redirects to first module
│   ├── forgot-password/page.tsx      # Sends password reset email
│   ├── reset-password/page.tsx       # Handles reset link from email
│   ├── dashboard/page.tsx            # Main dashboard: progress, streak, modules, Pro/upgrade CTAs
│   ├── upgrade/page.tsx              # Paywall page (dark hero, pricing, Pro vs Free comparison)
│   ├── modules/[id]/page.tsx         # Individual module (intro → lesson → complete), Pro-gated 7-12
│   ├── tools/page.tsx                # Curated tools page
│   ├── resources/page.tsx            # Curated resources page
│   │
│   ├── pro/
│   │   ├── products/page.tsx         # Weekly Product Picks (Pro-gated)
│   │   └── briefings/page.tsx        # Monthly Ecom Briefings (Pro-gated)
│   │
│   ├── certificate/[userId]/
│   │   ├── page.tsx                  # Public shareable certificate (server component, no auth)
│   │   └── CopyButton.tsx            # Client island — copy link with "Copied!" feedback
│   │
│   ├── privacy/page.tsx              # Privacy Policy page
│   └── terms/page.tsx                # Terms of Service page
│   │
│   ├── admin/
│   │   ├── page.tsx                  # Admin analytics dashboard
│   │   └── content/page.tsx          # Admin content review: generate, swap, publish drops/briefings
│   │
│   └── api/
│       ├── send-welcome/route.ts
│       ├── send-completion/route.ts
│       ├── analytics/route.ts
│       │
│       ├── stripe/
│       │   ├── checkout/route.ts     # POST: creates Stripe Checkout session
│       │   ├── portal/route.ts       # POST: creates Stripe Billing Portal session
│       │   └── webhook/route.ts      # POST: handles Stripe events (grant/revoke Pro)
│       │
│       ├── cron/
│       │   ├── products/route.ts     # GET: Vercel cron — generates weekly product drop draft (Mon 6am)
│       │   ├── briefing/route.ts     # GET: Vercel cron — auto-publishes monthly briefing + emails Pro users (1st 7am)
│       │   ├── reminder/route.ts     # GET: Vercel cron — Saturday reminder email to admin (Sat 9am)
│       │   └── newsletter/route.ts   # GET: Vercel cron — sends weekly picks email to Pro users (Mon 8am)
│       │
│       └── admin/
│           ├── content/route.ts      # GET: fetch all drops + briefings (admin only)
│           ├── generate/
│           │   ├── products/route.ts # POST: manual trigger — generate products draft
│           │   └── briefing/route.ts # POST: manual trigger — generate briefing draft
│           ├── products/[id]/
│           │   ├── regenerate/route.ts # POST: swap one product in a draft
│           │   └── publish/route.ts    # POST: publish a product drop
│           └── briefing/[id]/
│               └── publish/route.ts    # POST: publish a briefing
│
├── lib/
│   ├── supabase.ts             # Supabase client (anon key, browser-safe)
│   ├── admin.ts                # isAdmin(email) — hardcoded admin email list
│   ├── streak.ts               # updateStreak(userId) — daily streak logic
│   ├── modules.ts              # All 12 module definitions (content, checklist, steps, resources)
│   ├── resources.ts            # Resources page data
│   ├── perplexity.ts           # Groq API helper + types (Product, ProductDrop, Briefing) — file named perplexity for import compatibility
│   └── email-helpers.ts        # getProUsers, sendBatch, email HTML generators, getAdminSupabase
│
├── components/
│   └── AdBanner.tsx            # Google AdSense banner — renders null if isPro === true
│
├── public/
│   ├── logo.png
│   ├── logo.svg
│   ├── icon.svg
│   ├── export-logo.html
│   └── ads.txt                 # AdSense authorized sellers file
│
├── app/sitemap.ts              # Dynamic sitemap — 6 public URLs, auto-submitted to Google
├── app/robots.ts               # Robots rules — blocks gated pages, points to sitemap
├── vercel.json                 # Vercel Cron schedule (4 jobs: see Automated Pro Content section)
├── .env.local                  # Local env vars (NOT committed)
├── README.md                   # This file — updated after every session
└── CLAUDE.md / AGENTS.md       # Instructions for the AI coding assistant
```

---

## Pages & Features

### Landing Page (`/`)
- **Logged out:** Dark hero, "Stop learning. Start selling." copy, freemium badge (`Modules 1–6 free · Pro $19/mo · Scale Lab $49/mo`), why-different comparison, **curriculum section** (12-module foundation grid + black/gold Scale Lab teaser card with 5-phase breakdown), how-it-works timeline, what you'll build, testimonials, **3-tier pricing comparison** (Free / Pro $19 / Scale Lab $49 — full-feature columns with "Most popular" / "Most powerful" badges, mobile stacks to 1 col under 800px), stats (24 modules · 3 tiers), FAQ (answers cover all 3 tiers + Scale Lab time-to-complete), CTA banner. JSON-LD structured data has 3 Offer entries (Free/Pro/Growth) and an expanded `teaches` field
- **Logged in:** Personalised hero ("Hey {name} 👋"), progress bar (X/24), quick-access cards, motivational quote based on progress

### Quiz (`/quiz`)
- Multi-step: experience level, time available, goal, budget
- Results saved to `localStorage` as `quiz_results`
- Determines `startModule` and `track` name
- Auto-advances on selection; back button; keyboard shortcuts (1–4 / Backspace)

### Dashboard (`/dashboard`)
- Protected (redirects to `/login` if not authenticated)
- **Onboarding card** for brand-new users (no quiz taken yet, 0 completions): replaces the greeting/progress bar with a dark welcome hero showing 3 steps + quiz CTA + "Skip to Module 1" fallback
- Progress card, streak badge, "Up next" dominant card (shown after first action or quiz completion)
- **Module list grouped visually by tier** with section headers: "Free Modules" / "✨ Pro Modules · $19/mo" / "🚀 Scale Lab · $49/mo"
- Modules 7–12 show "✨ Pro" badge and "Unlock →" button if free user
- Modules 13–24 show "🚀 Scale Lab" badge in black/gold and "Unlock →" button if not Growth
- **Tier-aware upgrade CTA banner** at bottom: free users see Pro pitch ($19), Pro-without-Growth users see Scale Lab pitch ($49)
- Pro users see "📦 Picks" and "📋 Briefings" in nav; secondary nav links (`hidden sm:block`) collapse on mobile
- Admin users see "Analytics", "Content", "Users", "Blog" in nav
- `?upgraded=pro` triggers purple "Welcome to Pro!" banner; `?upgraded=growth` triggers black/gold "Welcome to Scale Lab!" banner

### Upgrade Page (`/upgrade?tier=pro|growth`)
- Dark hero, **3-tier comparison grid**: Free / Pro $19/mo / Scale Lab $49/mo
- Click-to-toggle cards; deep-linkable via `?tier=pro` or `?tier=growth`
- Pro users landing here see Scale Lab pre-selected (their natural next step)
- Growth users redirect to `/dashboard` (already on top tier)
- Checkout button passes `{ tier }` to `/api/stripe/checkout`; server routes to the right Stripe Price ID
- Mobile: 3-column grid stacks to 1 column under 800px

### Module Pages (`/modules/1–24`)
- Modules 1–6: free (sequential unlock)
- Modules 7–12: redirect to `/upgrade` if not Pro
- Modules 13–24 (Scale Lab): redirect to `/upgrade?tier=growth` if not Growth
- Intro screen (first visit) → lesson + checklist → complete
- AdBanner shown between action steps and mistakes (free users only)
- **Module 6 → Pro pitch:** when a free user completes Module 6, the completion overlay shows a celebration + Pro upgrade pitch instead of the standard "next module" preview; auto-redirect is disabled so the user reads the pitch; CTAs are "Upgrade to Pro $19/mo →" (primary) and "Maybe later · back to dashboard" (secondary)
- **Module 12 → Scale Lab pitch:** when a Pro user (without Growth) completes Module 12, the completion overlay shows a black/gold celebration + Scale Lab upgrade pitch listing all 12 advanced modules; CTAs are "Upgrade to Scale Lab $49/mo →" and "Maybe later"

### Scale Lab Modules (`/modules/13–24`)
The Growth tier curriculum — advanced ecommerce education for users who already got their first sale and want consistent revenue. 5 phases:
- **Phase 1 — Diagnose** (M13–15): Why first sales don't repeat, the 8 metrics that matter, the profit audit
- **Phase 2 — Validate** (M16–18): Real winners vs fake signals, engineering the offer (Hormozi value equation), AOV mechanics
- **Phase 3 — Persuade** (M19–21): Cialdini's 6 principles, hook library + STEPPS, UGC at scale
- **Phase 4 — Test** (M22–23): ICE prioritization (Sean Ellis), kill / iterate / scale matrix
- **Phase 5 — Scale** (M24): 30-day scaling plan with kill triggers, retention layer, LTV multipliers

Source attributions throughout: Cialdini *Influence*, Hormozi *$100M Offers*, Sean Ellis *Hacking Growth*, Stefan Thomke *Experimentation Works*, Berger *Contagious*, Hopkins *Scientific Advertising*, Allan Dib *1-Page Marketing Plan*, Tanner Larsson *Ecommerce Evolved*. Full draft document at `docs/growth-tier-curriculum.md`.

### Pro: Weekly Products (`/pro/products`)
- Pro-gated (redirects to `/upgrade` if not Pro)
- Shows latest published product drop + archive (collapsed)
- Each product: name, category, why trending, cost/sell/margin stats, ad hook, target audience, AliExpress search link

### Pro: Monthly Briefings (`/pro/briefings`)
- Pro-gated
- Shows latest published briefing + archive
- Sections: summary, Meta Ads, TikTok Ads, Trending Niche, Add This Month, Drop This Month, Platform Changes

### Settings (`/settings`)
- Protected — redirects to `/login` if not authenticated
- Change first name (pre-filled, button disabled when unchanged)
- Change password (min 8 chars, confirm match, `supabase.auth.updateUser`)
- Danger zone: contact email for account deletion requests
- Linked from dashboard nav

### Admin: Analytics (`/admin`)
- Redirects non-admins to `/dashboard`
- Total users, active today/this week, new signups, max streak, total completions
- Module funnel: bar chart with drop-off % per module

### Admin: Users (`/admin/users`)
- Lists all users with email, name, signup date, completion count, streak, **tier (Free / ✨ Pro / 🚀 Scale Lab)**, last active
- Search by email/name; filter by All / 🚀 Scale Lab / ✨ Pro / Free / Active 7d / Inactive 7d+
- **Two action buttons per row:** Grant/Revoke **Pro** + Grant/Revoke **Growth**
- Granting Growth automatically grants Pro (Growth includes Pro) — confirmation dialog warns the admin
- Useful for comping friends, influencers, refunds outside Stripe, paid course bundles
- ⚠️ Does NOT touch Stripe — if user has active Stripe sub, the next webhook will overwrite a manual revoke. Cancel the subscription in Stripe dashboard for permanent revoke.

API endpoints:
- `GET /api/admin/users` — list all users with tier flags
- `POST /api/admin/users/[userId]/pro` — body `{ is_pro: boolean }`
- `POST /api/admin/users/[userId]/growth` — body `{ is_growth: boolean }` (granting also sets `is_pro=true`)

### Privacy Policy (`/privacy`) and Terms of Service (`/terms`)
- Static server-rendered pages matching the site design
- Privacy covers: data collected, Supabase/Stripe/Resend/Groq/AdSense/Vercel usage, cookies, retention, user rights
- Terms covers: subscription terms, no-refund policy, AI content disclaimer, IP, acceptable use
- Linked from the footer on all pages

### Certificate (`/certificate/[userId]`)
- **Public** — no login required, anyone can view the link
- Server component fetches first name + module 12 completion date via service role key (bypasses RLS)
- Shows "not found" if user doesn't exist, "not yet earned" if not all 12 modules are complete
- Dynamic OG meta tags — looks great when shared on LinkedIn/X/Twitter
- Share buttons: Copy link (with "Copied!" feedback), LinkedIn, X
- Certificate ID = first 8 chars of userId (uppercase)
- Accessible from dashboard completion card via "Share certificate 🔗" button

### Admin: Content (`/admin/content`)
- Tabs: Products | Briefings (with pending draft counts)
- "⚡ Generate Now" button for manual on-demand generation
- Product drafts: review 5 products, click "↺ Swap" to regenerate any individual product via AI
- "Publish →" button makes the drop live for Pro members
- Same flow for briefings (no per-item swap — publish whole briefing)
- Published history shown below drafts

---

## Database (Supabase)

### Tables

#### `user_profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Matches `auth.users.id` |
| `first_name` | text | From signup form |
| `track` | text | e.g. `"Beginner Fast-Start"` |
| `goal` | text | e.g. `"first_sale"` |
| `start_module` | int | Module the quiz recommended |
| `streak_days` | int | Current consecutive-day streak |
| `last_active` | date | Date of last module completion |
| `is_pro` | boolean | Pro tier flag — set by Stripe webhook on checkout; revoked on cancellation/payment failure. Granting Growth also sets this to true. |
| `is_growth` | boolean | Scale Lab (Growth) tier flag — set by Stripe webhook when `metadata.tier="growth"`. Implies `is_pro=true` (Growth includes Pro features). |
| `stripe_customer_id` | text | Stripe customer ID (set on first checkout) |
| `stripe_subscription_id` | text | Active Stripe subscription ID |
| `reengagement_sent_at` | timestamptz | When the 3-day-inactive re-engagement email was sent (NULL = never). Cron uses this to send at most once per user. |
| `streak_save_email_date` | date | Date when the most recent streak-save email was sent. Cron skips if already sent today. |
| `referral_code` | text | Auto-generated 6-char unique code; appended to share link (`/quiz?ref=CODE`). UNIQUE indexed. |

#### `user_progress`
| Column | Type | Notes |
|--------|------|-------|
| `user_id` | uuid | FK → `auth.users.id` |
| `module_id` | int | 1–12 |
| `completed_at` | timestamp | Auto-set on insert |

#### `product_drops`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `week_start` | date | Monday of the relevant week |
| `products` | jsonb | Array of 5 product objects |
| `status` | text | `'draft'` or `'published'` |
| `created_at` | timestamptz | Auto-set |

Product object shape:
```json
{
  "name": "string",
  "category": "string",
  "why_trending": "string",
  "aliexpress_cost": "$X–Y",
  "sell_price": "$XX.XX",
  "margin_pct": 75,
  "target_audience": "string",
  "ad_hook": "string",
  "aliexpress_search": "string"
}
```

#### `briefings`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `month` | date | First day of the relevant month |
| `content` | jsonb | Briefing content object |
| `status` | text | `'draft'` or `'published'` |
| `created_at` | timestamptz | Auto-set |

Briefing content shape:
```json
{
  "meta_ads": "string",
  "tiktok_ads": "string",
  "trending_niche": { "name": "string", "why": "string", "signals": "string" },
  "add_tactic": "string",
  "drop_tactic": "string",
  "platform_changes": "string",
  "summary": "string"
}
```

#### `email_events`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `event_type` | text | `email.delivered` / `email.opened` / `email.clicked` / `email.bounced` / `email.complained` |
| `resend_id` | text | Resend's email ID — useful for grouping events to a single send |
| `to_email` | text | Recipient email |
| `user_id` | uuid | From the `user_id` tag we set when sending (nullable for emails without user context) |
| `email_type` | text | From the `type` tag — e.g. `welcome`, `completion`, `pro_welcome`, `streak_save`, `weekly_digest`, `reengagement` |
| `subject` | text | Email subject line |
| `click_url` | text | URL clicked (only set on `email.clicked` events) |
| `created_at` | timestamptz | Auto-set |

#### `niche_leads`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `email` | text | Captured from the Niche Picker form |
| `interests` / `budget` / `experience` / `audience` | text | The 4 inputs the user submitted |
| `niches` | jsonb | The 3 niches Groq generated for them |
| `drip_stage` | int | 0 = nothing, 1 = day-0 sent, 2 = day-2 sent, 3 = day-5 sent, 4 = day-7 sent (drip complete). Used by `/api/cron/niche-drip` to advance the sequence |
| `created_at` | timestamptz | Auto-set; the drip cron uses this to determine which email is due next |

#### `blog_posts`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `slug` | text | Unique URL slug, lowercase-hyphenated |
| `title` | text | Headline |
| `excerpt` | text | Meta description (under 160 chars) |
| `content` | jsonb | `{ intro, sections[], conclusion, cta }` |
| `status` | text | `'draft'` or `'published'` |
| `published_at` | timestamptz | When admin clicked publish |
| `created_at` | timestamptz | Auto-set |

#### `referrals`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `referrer_id` | uuid | The user who shared the link |
| `referred_id` | uuid | The user who signed up via the link (UNIQUE — one referral per signup) |
| `referral_code` | text | The code used at signup time (denormalized for audit) |
| `converted_tier` | text | NULL until they upgrade; then `'pro'` or `'growth'` (set by Stripe webhook) |
| `credit_granted` | boolean | Admin sets to true after manually granting the free month via `/admin/users` |
| `created_at` | timestamptz | Auto-set |

#### `module_qa_log`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | The user who asked |
| `module_id` | int | Which module (1–24) |
| `question` | text | What they asked |
| `answer` | text | What Groq answered |
| `created_at` | timestamptz | Used for rate-limiting (3/10/50 per tier per module per 24h) |

#### `ai_tool_log`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | The user who ran the tool |
| `tool` | text | `'ad_copywriter'` / `'ugc_brief'` / `'ad_audit'` |
| `input` | jsonb | Raw form input |
| `output` | jsonb | The Groq response |
| `created_at` | timestamptz | Used for tier rate-limiting (Pro 5/day, Growth 20/day per tool) and the future Vault feature |

#### `supplier_validations`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → `auth.users.id`, CASCADE on delete |
| `supplier_name` | text | What the user calls the supplier |
| `supplier_url` | text | Optional URL for reference |
| `inputs` | jsonb | Raw form inputs (rating, count, days, etc.) |
| `scores` | jsonb | `{ reviews, shipping, communication, quality, price }` |
| `total_score` | int | 0–100 |
| `verdict` | text | `'good'` / `'risky'` / `'avoid'` |
| `notes` | text | Optional user notes |
| `created_at` | timestamptz | Auto-set |

### RLS Policies
- `user_profiles` and `user_progress`: users can only read/write their own rows
- `product_drops` and `briefings`: authenticated users can read rows where `status = 'published'`; service role key used for all writes
- `email_events`, `niche_leads`, `blog_posts`: service role key only — never accessed from client code directly. `blog_posts` published rows are fetched server-side in `/blog` and `/blog/[slug]` server components.

---

## Email System (Resend)

### Welcome Email
- **Trigger:** After successful signup
- **Route:** `POST /api/send-welcome`
- **Payload:** `{ firstName, email, startModule }`

### Module Completion Email
- **Trigger:** User clicks "Mark as Complete"
- **Route:** `POST /api/send-completion`
- **Payload:** `{ firstName, email, completedModuleId }`
- Special "Course complete!" version for module 12

### Critical Email HTML Rules
- ✅ **Solid background colours only** (e.g. `background:#6366f1`)
- ❌ No CSS `linear-gradient` — Gmail strips it
- ❌ No `box-shadow` on buttons
- ✅ All styles must be **inline**
- ✅ Table-based layouts for compatibility

Emails are sent **fire-and-forget** (no `await`) so they never block the user.

---

## Stripe Subscriptions (Pro & Scale Lab)

### Two Stripe Products
| Tier | Price ID env var | Price | What it grants |
|---|---|---|---|
| Pro | `STRIPE_PRICE_ID` | $19/mo | Modules 7-12, weekly product picks, monthly briefing, ad-free |
| Scale Lab (Growth) | `STRIPE_PRICE_ID_GROWTH` | $49/mo | Everything in Pro + Modules 13-24 |

Both are recurring monthly subscriptions. Owner creates the Products + Prices in Stripe; the price IDs go into Vercel env vars.

**Current state (2026-04-28):** Pro is in **test mode**. Scale Lab Stripe product not created yet — both will be set up together when going live. Until then:
- Pro test-mode checkout works with `STRIPE_PRICE_ID` (test price ID)
- Scale Lab checkout button returns 500 ("Missing Stripe price ID for tier growth"). Owner can grant Growth manually via `/admin/users` for testing the unlock + content + UX without going through Stripe.

When ready to flip to live mode, do all in one batch: Pro live keys + Pro live price + Scale Lab live product/price + Vercel env vars + webhook endpoint update.

### Flow
1. User clicks "Upgrade" on dashboard or hits `/upgrade?tier=pro|growth`
2. `/upgrade` shows 3-tier comparison; user picks tier
3. Click → `POST /api/stripe/checkout` with `{ userId, email, tier }`
4. Server reads `tier` and uses `STRIPE_PRICE_ID` (Pro) or `STRIPE_PRICE_ID_GROWTH` (Growth)
5. Checkout session created with `metadata: { userId, tier }`
6. User completes payment on Stripe's hosted page
7. Stripe redirects to `firstsalelab.com/dashboard?upgraded=pro` or `?upgraded=growth`
8. Simultaneously, Stripe fires `checkout.session.completed` webhook
9. Webhook reads `metadata.tier`:
   - Pro → `is_pro = true`
   - Growth → `is_pro = true` AND `is_growth = true` (Growth includes Pro)
10. Webhook fires the matching welcome email (`proWelcomeEmailHTML` or `growthWelcomeEmailHTML`)
11. Dashboard detects `?upgraded=...` and shows the matching banner with optimistic state

### Webhook
- **URL:** `https://www.firstsalelab.com/api/stripe/webhook` (must use `www` subdomain — the apex redirects and Stripe won't follow 307s)
- **Verified with:** `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`
- **Events handled:**
  - `checkout.session.completed` → grants the tier in `metadata.tier` (defaults to Pro)
  - `customer.subscription.deleted` → reads `sub.metadata.tier`; revokes the matching tier (Growth cancellation revokes both `is_pro` and `is_growth`)
  - `invoice.payment_failed` → revokes both `is_pro` and `is_growth` for safety
- Uses **upsert** (not update) so it works even if the user has no profile row yet

### Billing Portal
- Pro/Growth users with a `stripe_customer_id` see a "Billing" button in the dashboard nav
- Calls `POST /api/stripe/portal` → creates a Stripe Billing Portal session → redirects user

### TypeScript Note
The correct Stripe SDK type is `Stripe.Checkout.Session` (not `Stripe.CheckoutSession` — that was renamed in a breaking change).

---

## Google AdSense

- **Publisher ID:** `ca-pub-1382028135058819`
- **Verified via:** `metadata.other["google-adsense-account"]` meta tag in `app/layout.tsx` (visible to Google's crawler)
- **Script:** Loaded in `app/layout.tsx` with `strategy="beforeInteractive"`
- **ads.txt:** `public/ads.txt` → `google.com, pub-1382028135058819, DIRECT, f08c47fec0942fa0`
- **GDPR:** Google's built-in Consent Management Platform (CMP) selected in AdSense settings

### AdBanner Component (`components/AdBanner.tsx`)
- Client component — renders `null` if `isPro === true` (Pro members are ad-free)
- Takes `isPro`, `slot`, `format`, `style` props
- Calls `window.adsbygoogle.push({})` on mount
- `data-ad-client="ca-pub-1382028135058819"`
- Currently used in: dashboard (`slot="YOUR_SLOT_ID_1"`) and module pages (`slot="YOUR_SLOT_ID_2"`)

> **When approved:** Create 2 ad units in AdSense dashboard, then add `NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD` and `NEXT_PUBLIC_ADSENSE_SLOT_MODULE` to Vercel environment variables. No code changes needed — AdBanner will activate automatically.

---

## Automated Pro Content

Two types of AI-generated content are created automatically and go through an admin review + publish flow before reaching Pro members.

### How It Works

#### Weekly Product Picks
1. **Monday 6am UTC** — `GET /api/cron/products` generates 5 products via Groq AI, saved as `status: 'draft'`
2. **Saturday 9am UTC** — `GET /api/cron/reminder` checks for a pending draft and emails the admin reminder
3. Admin reviews draft at `/admin/content` (swap any product, then publish)
4. **Monday 8am UTC** — `GET /api/cron/newsletter` sends the latest published drop to all Pro users via email

#### Monthly Briefing
1. **1st of each month 7am UTC** — `GET /api/cron/briefing` generates and **auto-publishes** the briefing (no manual review)
2. Immediately emails all Pro users the new briefing newsletter

### Schedule
| Content | Cron Route | Schedule | Notes |
|---------|-----------|----------|-------|
| Weekly products | `GET /api/cron/products` | Every Monday at 06:00 UTC | Saves as draft |
| Saturday reminder | `GET /api/cron/reminder` | Every Saturday at 09:00 UTC | Emails admin to review/publish |
| Products newsletter | `GET /api/cron/newsletter` | Every Monday at 08:00 UTC | Emails Pro users |
| Monthly briefing | `GET /api/cron/briefing` | 1st of each month at 07:00 UTC | Auto-publishes + emails Pro users |
| Re-engagement | `GET /api/cron/reengagement` | Daily at 10:00 UTC | Nudges users 3–14 days post-signup with 0 completions; once per user via `reengagement_sent_at` |
| Streak-save | `GET /api/cron/streak-save` | Daily at 19:00 UTC | Saves at-risk streaks — users with `streak_days >= 1` whose `last_active = yesterday`; once per day via `streak_save_email_date` |
| Weekly digest | `GET /api/cron/digest` | Sundays at 17:00 UTC | Recap email to ALL users — modules this week, total progress, streak, next module suggestion |
| Blog draft | `GET /api/cron/blog` | Wednesdays at 07:00 UTC | Drafts a new SEO blog post via Groq from a random topic in `lib/perplexity.ts` BLOG_TOPIC_POOL; admin reviews + publishes at `/admin/blog` |
| Niche Picker drip | `GET /api/cron/niche-drip` | Daily at 14:00 UTC | Processes the 4-stage drip for `niche_leads`: day-0 sent immediately, day-2/5/7 sent by this cron based on `created_at` + `drip_stage`. Stops after stage 4 (drip complete). Each lead gets at most 4 emails in 7 days |

Cron routes are secured with `Authorization: Bearer <CRON_SECRET>` (Vercel sends this automatically).

### Manual Generation
Admin can also click "⚡ Generate Now" on `/admin/content` at any time — this calls:
- `POST /api/admin/generate/products`
- `POST /api/admin/generate/briefing`

These use the admin's Supabase JWT for auth (not the cron secret).

### Groq Prompts
Both prompts use `response_format: { type: "json_object" }` which enforces valid JSON output from Groq. Prompts wrap responses in a root object (`{ "products": [...] }`) because the JSON object mode requires a root object (not a bare array). Parsers handle both wrapped and unwrapped formats via `parsed.products ?? parsed`.

---

## Affiliate Links

Affiliate/referral links are used in `lib/modules.ts` resource arrays. Current active links:

| Tool | Module(s) | Link |
|------|-----------|------|
| Shopify | 5 | `https://shopify.pxf.io/3k9Wjr` |
| ReConvert | 6, 18 | `https://apps.shopify.com/reconvert-upsell-cross-sell?mref=bfgeliiu` |
| AutoDS | 3 | `https://platform.autods.com/register?ref=NTI2MjAyMQ==` |
| Privy | 10 | `https://go.privy.com/NYUtfS6` |
| Loox | 5, 19, 21 | `https://loox.io/app/FSL30` |

Pending (application submitted or program unavailable): Klaviyo, Jungle Scout, Triple Whale, Canva, Zipify Pages, AdSpy.

When a new affiliate link is received, update the matching resource URL in `lib/modules.ts` AND add it to `lib/resources.ts` so it appears on `/resources` too.

---

## Environment Variables

Set in **both** `.env.local` (local) and the **Vercel dashboard** (production).

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gkoobuzqmtupftkvkomo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# App
NEXT_PUBLIC_SITE_URL=https://firstsalelab.com

# Resend (email)
RESEND_API_KEY=re_...
RESEND_WEBHOOK_SECRET=whsec_...   # signing secret from Resend webhooks dashboard (optional but recommended)

# Stripe (payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...                # Pro $19/mo
STRIPE_PRICE_ID_GROWTH=price_...         # Scale Lab $49/mo
STRIPE_PRICE_ID_ANNUAL=price_...         # Pro $190/yr (optional — annual plan)
STRIPE_PRICE_ID_GROWTH_ANNUAL=price_...  # Scale Lab $490/yr (optional — annual plan)

# AI providers (multi-provider abstraction in lib/ai/)
GROQ_API_KEY=gsk_...                  # required — primary for Free + Pro + most cron flows (free tier)
GEMINI_API_KEY=...                    # required for Growth-tier AI tools (paid tier 1 — Store Autopsy uses url_context which is paid-only)
OPENAI_API_KEY=sk-...                 # optional fallback (slot in chain if set)
ANTHROPIC_API_KEY=sk-ant-...          # optional — set later to upgrade Scale Lab to Claude Sonnet (single-line edit in lib/ai/config.ts)

# Admin (receives Saturday reminder email)
ADMIN_EMAIL=hello@firstsalelab.com

# Google AdSense slot IDs (add these once AdSense account is approved)
NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD=   # 10-digit slot ID for the dashboard ad unit
NEXT_PUBLIC_ADSENSE_SLOT_MODULE=      # 10-digit slot ID for the module pages ad unit
NEXT_PUBLIC_ADSENSE_SLOT_CONTENT=     # 10-digit slot ID used on /tools, /blog, /blog/[slug], /resources

# Vercel Cron security
CRON_SECRET=<random hex string>
```

> ⚠️ All keys without `NEXT_PUBLIC_` prefix are **server-side secrets**. Never expose them in client code or commit them to GitHub.

---

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/insidet97-wq/ecommerce-academy.git
cd ecommerce-academy

# 2. Install dependencies
npm install

# 3. Create .env.local with the variables above

# 4. Start the dev server
npm run dev

# 5. Open http://localhost:3000
```

---

## Deployment

Every push to `main` auto-deploys to Vercel.

```bash
git add -A
git commit -m "Description of what changed"
git push
```

- **TypeScript check before pushing:** `npx tsc --noEmit`
- **Production domain:** `firstsalelab.com` and `www.firstsalelab.com`
- **Stripe webhook:** must point to `www.firstsalelab.com/api/stripe/webhook` (not apex — it 307 redirects)

---

## Branding & Logo

### Colour Palette
| Use | Hex |
|-----|-----|
| Primary indigo | `#6366f1` |
| Deep indigo | `#4f46e5` |
| Purple | `#7c3aed` |
| Violet | `#9333ea` |
| Near-black text | `#09090b` |
| Light grey text | `#a1a1aa` |
| Off-white background | `#f4f4f8` |

### Logo Files
| File | Purpose |
|------|---------|
| `public/logo.png` | Main logo — FSL monogram PNG, used in navs at 40px height |
| `public/logo.svg` | SVG version |
| `public/icon.svg` | Square favicon — dark purple with FSL mark |
| `public/export-logo.html` | Navigate to `/export-logo.html` to download logo as 2400px PNG |

### Fonts
- **UI:** Geist Sans (`next/font/google`)
- **Mono:** Geist Mono (`next/font/google`)

---

## Admin Access

Controlled by `lib/admin.ts`:

```ts
const ADMIN_EMAILS = ["insidet97@gmail.com"];
```

Admin privileges:
- "Admin" badge in nav
- "Analytics" + "Content" links in nav
- Bypasses all Pro gating (can access modules 7–12 for free)
- Access to `/admin` (analytics) and `/admin/content` (content management)

---

## How Key Things Work

### Freemium Gating
- `isProGated = (id: number) => id > 6 && !isPro`
- Module pages: if `moduleId > 6 && !userPro && !admin` → redirect to `/upgrade`
- `isPro = profile.is_pro || admin` (admins always bypass)

### Stripe Race Condition Fix
Stripe redirects the user back before the webhook fires. To avoid the dashboard showing locked modules on the success redirect:
1. Dashboard detects `?upgraded=true` in URL
2. Sets `upgradedBanner = true` and forces `is_pro: true` in local state immediately
3. A `useEffect` watching `upgradedBanner` calls `setProfile(prev => ({ ...prev, is_pro: true }))`
4. Webhook updates the DB in the background — next page load reads the real value

### Module Unlock Logic
A module unlocks when **any** of these are true:
- `id <= startModule` (quiz pre-unlocked this module)
- `completed.includes(id - 1)` (previous module completed)
- `admin === true`

### Streak Logic (`lib/streak.ts`)
1. Fetch `last_active` and `streak_days`
2. If `last_active` = today → no change (already counted)
3. If `last_active` = yesterday → increment streak
4. Otherwise → reset to 1
5. Save updated values

### AI Content Pipeline (Groq)
1. Cron fires (or admin clicks Generate)
2. `lib/perplexity.ts` calls Groq API (`llama-3.3-70b-versatile`) with structured JSON prompt
3. `response_format: { type: "json_object" }` forces valid JSON output
4. Parsed and inserted into Supabase as `draft` (products) or `published` (briefings — auto-publish)
5. Admin reviews products at `/admin/content`
6. "↺ Swap" on a product → `POST /api/admin/products/[id]/regenerate` with `{ index }` → generates one replacement, excluding existing names
7. "Publish →" → `POST /api/admin/products/[id]/publish` → sets `status: 'published'`
8. Monday 8am cron sends published drop to all Pro users via Resend batch email
9. Pro members also see content at `/pro/products` or `/pro/briefings`

### Analytics API (`/api/analytics`)
Uses the Supabase service role key to bypass RLS. No auth check in the route — keep URL private.

### localStorage Keys
| Key | Purpose |
|-----|---------|
| `quiz_results` | Stores quiz answers → read on signup |
| `ea_next` | Stores redirect path after login |

---

## Changelog

| Date | What changed |
|------|-------------|
| 2026-05-01 | **Blog generator: stop producing duplicates by passing existing titles to the LLM.** Owner spotted the admin "Generate" button (and the weekly cron) kept producing similar-titled posts — Find Your Goldmine Niche / Find Your Profitable Niche / Uncover Profitable Products Now / Avoid Ad Waste: Spot Saturated Products / Dropshipping Disaster: Pricing Pitfalls (which 11 published posts but several near-duplicates of each other). **Root cause:** `generateBlogPost()` picked at random from a static 12-topic `BLOG_TOPIC_POOL` and the prompt never showed the LLM what was already published. Slug-collision detection (timestamp suffix) made hard-duplicate slugs impossible but did nothing for semantic duplication. **Fix in three pieces:** (1) `generateBlogPost(suggestedTopic?, existingTitles?)` signature extended — the second param is a list of recent titles fed into the prompt as a numbered "do NOT repeat — pick something genuinely different" list. (2) Pool expanded from 12 → 50+ topics covering the full curriculum (24 modules of source material + the 10 AI tools' subject matter) so the LLM has real range. (3) The pool is now framed as INSPIRATION, not a strict pick-one — when no `suggestedTopic` is provided, the LLM is told to "reframe, narrow, or attack from a fresh angle" if a pool topic overlaps with anything already published. Both call sites (`app/api/cron/blog/route.ts` weekly cron + `app/api/admin/generate/blog/route.ts` admin manual trigger) now fetch the most recent 30 titles via Supabase before calling the generator and pass them in. Admin-override path preserved: if a `topic` is provided in the admin POST body, the generator uses it verbatim and skips pool selection. Slug-collision suffix retained as a final defense for the rare case where the LLM still produces a colliding slug |
| 2026-05-01 | **🚀 Stripe LIVE — site now takes real money.** End-to-end live flip done in one session: switched Stripe Dashboard from test mode → live mode, created live Pro $19/mo and Scale Lab $49/mo products + copied their `price_...` IDs, created live webhook endpoint at `https://www.firstsalelab.com/api/stripe/webhook` listening for `checkout.session.completed` + `customer.subscription.deleted` + `invoice.payment_failed`, copied the `whsec_...` signing secret and `sk_live_...` / `pk_live_...` API keys, updated 5 Vercel Production env vars (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `STRIPE_PRICE_ID_GROWTH`), let Vercel auto-redeploy. **Verified end-to-end with a real card** on a non-admin test account: live checkout loaded with the right $19 price → real card payment processed → `checkout.session.completed` webhook fired → `is_pro=true` in `user_profiles` → dashboard showed Pro badge → welcome email arrived in real inbox. Owner self-refunded the test charge (no Stripe fees on refunds). **Annual plan products** (`STRIPE_PRICE_ID_ANNUAL` + `STRIPE_PRICE_ID_GROWTH_ANNUAL`) still deferred — code path already supports them, just need products created in live mode and env vars added. **Important nuance** the team learned during the live test: refunding an invoice does NOT cancel the subscription — they're separate operations. Our webhook revokes access only on `customer.subscription.deleted` (the correct point — a refunded customer shouldn't lose access for a one-off bad month). To fully clean up a test account, the user (or admin via Stripe Dashboard) must explicitly Cancel the subscription, which fires the deletion event and flips `is_pro/is_growth` to false |
| 2026-05-01 | **OAuth resilience: self-heal missing user_profiles + maybeSingle migration + greeting template fix.** Two issues from the first end-to-end Google OAuth tests: (a) owner got authenticated by Google but `/auth/callback` failed mid-flight with Supabase's `Session as retrieved from URL was issued over 120s ago` stale-token security check — they ended up logged in WITHOUT a `user_profiles` row, then subsequent page loads 406'd on `.single()` calls because the row didn't exist; (b) the logged-in homepage greeting rendered `Hey, . 👋` (literal comma + period + emoji) when `firstName` was empty, because the template was hardcoded `Hey, {firstName}. 👋`. **Three fixes:** (1) every client-side `user_profiles` fetch now uses `.maybeSingle()` instead of `.single()` so a missing row returns null cleanly rather than 406'ing — affects `app/page.tsx`, `app/dashboard/page.tsx`, `app/modules/[id]/page.tsx`; (2) `app/dashboard/page.tsx` now **self-heals** when the profile row is missing on load — extracts the best name from `user.user_metadata` + `user.identities[0].identity_data` (chain: given_name → full_name first-word → name first-word, with both keys checked in both objects), upserts a fresh `user_profiles` row, re-fetches, and uses that for the rest of the load; runs once per user since the next visit finds the row; (3) homepage greeting template now `Hey{firstName ? ", " + firstName : ""} 👋` so empty names render cleanly. Net effect: even when OAuth fails (stale token, network hiccup, callback page reload), the user never gets stuck in a broken state — dashboard heals the missing profile and pages render correctly. Diagnostic `console.warn` from the prior debug round removed |
| 2026-05-01 | **Sign in / Sign up with Google OAuth (Supabase-brokered).** Owner enabled Google as a Supabase auth provider after configuring the OAuth Client ID in Google Cloud Console (consent screen with non-sensitive scopes only — no Google verification round trip needed). Code-side, three pieces: **(1) `components/GoogleSignInButton.tsx`** — reusable button that triggers `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: ${origin}/auth/callback } })`. White-on-gray styling matches Google's brand guidelines. The official multi-colour Google G logo is inlined as SVG so the button renders without a CDN request and never breaks if Google moves their assets. Disabled state shows "Redirecting…" while the OAuth redirect kicks off. **(2) `app/auth/callback/page.tsx`** — the landing page after Google bounces back to us with auth tokens in the URL hash. Supabase JS auto-parses the hash and stores the session in localStorage; we poll `supabase.auth.getSession()` up to 25 times at 200ms intervals (~5s budget) until the session surfaces. Then: query `user_profiles` for the user's id; if no row, run first-time-user setup — extract `first_name` from Google's `user_metadata` (tries `given_name` first, then splits `full_name`, then `name`, falls back to empty string); pull `quiz_results` from localStorage if the user took the quiz before signing in (then `removeItem` so we don't double-apply); upsert `user_profiles` with first_name + the quiz fields (experience, goal, time_per_week, budget, product_idea, track, start_module); fire `/api/referrals/track` if `ea_referral_code` was stashed; fire `/api/send-welcome` (both fire-and-forget so the redirect isn't blocked). Then `router.replace` to `/dashboard` (or to `ea_next` for deep-link returns). On any failure the page shows a "Sign-in didn't complete" message with a Try Again link instead of spinning forever — user always has a way out. **(3) `/login` and `/signup` pages** show the Google button above the email/password form, with an "or" divider in between. Both paths coexist — existing password flow untouched. **Privacy policy** updated: added Google as a sub-processor with the disclosure that they see auth events (email + name + profile picture) for users who choose the OAuth path. Why this matters for conversion: industry data suggests "sign in with Google" lifts signup conversion 15-25% on freemium products vs password-only — for a course where signup is the entire game, this is one of the highest-ROI changes we can ship |
| 2026-05-01 | **About page + Contact form (for AdSense resubmission credibility).** Google AdSense rejected the site with the generic "Programme policies" reason. The most common silent reason for that on indie sites is missing publisher-information pages (About + Contact). Built both. **`/about`** is a substantial ~700-word page with the team's real story — small group of engineers who tried ecommerce while holding day jobs, struggled with the bullshit information landscape, decided to build the curriculum they wished existed when they started. Sections: the problem we ran into, what we built (24 modules + 10 AI tools + 3-tier pricing breakdown), how we're different (no fluff / real numbers / honest scope / no coaching upsells), who FSL is for and isn't for, why we stay anonymous (FSL is the brand, work speaks for itself, no personality cult). **`/contact`** is a feedback form rather than a "support@" mailto link — owner explicitly preferred a form so the email isn't scrapeable. Fields: name (2-120 chars), email (regex-validated), subject (dropdown of 6 categories: General / Billing / Bug / Feature / Press / Other), message (20-3000 chars). Off-screen honeypot field for bot defense. New **`POST /api/contact`** route: validates everything server-side, applies a per-IP rate limit (3 requests / hour, naive in-memory Map — survives within a single Vercel function instance, kills lazy bot floods), then forwards to support@firstsalelab.com via Resend with the styled HTML and `replyTo` set to the sender's email so hitting Reply in the team inbox goes straight back to them. Both pages: linked from the footer (logged-in + logged-out views), added to `sitemap.ts` (priority 0.6 for About, 0.5 for Contact), added to `robots.ts` allow list, and have proper `metadataBase` canonical URLs. **Owner action after deploy:** hit Resubmit in the AdSense dashboard |
| 2026-04-30 | **Hard-refresh access-drop bug fixed + 3 missing `user_profiles` columns added + $19/$49 payment flows fully verified end-to-end.** During $19 Pro test the user paid, saw Pro on dashboard, but on hard refresh got booted back to Free state. DB confirmed `is_pro=true` so it was a frontend read bug. Diagnostic logging revealed the dashboard's `user_profiles` fetch was returning **400 Bad Request** because it enumerated 9 specific columns and one of them (`streak_days`) didn't exist in production. The optimistic `?upgraded=pro` URL param was forcing `is_pro=true` on first load (masking the failure); hard refresh stripped the param, fetch 400'd, profile defaulted to `is_pro=false`, dashboard rendered Free. **Two-part fix:** (1) `app/dashboard/page.tsx` switched from listing columns to `select("*")` so a single missing column can no longer 400 the whole fetch — defense against schema drift in general; the TS Profile type stays the contract for what we actually consume. (2) **Master SQL block in CLAUDE.md updated** with 3 ALTER TABLE statements for columns that were referenced in code but never made it into the production schema: `streak_days int NOT NULL DEFAULT 0`, `last_active date`, `start_module int NOT NULL DEFAULT 1`. Owner ran the migration. Verified column list against `information_schema.columns` shows everything aligned now. **Side discovery:** the streak feature had silently never worked since the day it was added — `updateStreak()` was failing in a try/catch and `last_active` was never written. Now that the columns exist, streak counter actually increments. **Other fixes shipped in same window:** Billing button now opens Stripe portal in a NEW TAB (`window.open(url, "_blank", "noopener,noreferrer")`) instead of replacing the current tab — owner's UX request, also keeps the dashboard context. Diagnostic `console.warn` removed from dashboard now that the bug is identified. **Payment flow status — fully verified:** $19 Pro AND $49 Scale Lab — checkout → webhook → DB → optimistic UI → persists across hard refresh + logout/login → Billing button → Stripe portal → cancel-at-period-end keeps access through grace period → cancel-immediately fires `customer.subscription.deleted` → tier flags drop to false → dashboard reverts to Free. Welcome emails read well after rewrite. **Cleared for Stripe live-mode flip when owner is ready** |
| 2026-04-30 | **Stripe webhook fix: stop revoking on `invoice.payment_failed`. Plus landing tier cards now name every AI tool.** Found during $49 payment-flow testing: a paid Growth user logged out and back in, and the dashboard showed them as Free. Root cause hypothesis (high confidence): the webhook's `invoice.payment_failed` handler was nuking `is_pro` and `is_growth` to false on the FIRST failed-payment retry, even though Stripe runs Smart Retries / dunning for ~3 weeks before declaring a subscription dead. In test mode, spurious or out-of-order events can fire that handler. The correct revocation point is `customer.subscription.deleted` (fires after dunning gives up), which we already handle. New `invoice.payment_failed` behaviour: log the event with attempt_count, do nothing to the user's tier flags. Stripe handles the retry; we only revoke on the genuine deletion event. Defense-in-depth — it also means a flaky bank/card retry no longer locks out a user mid-month. **Plus** landing-page tier cards on `/` updated to actually name the AI tools. Pro card adds an indented sub-list of all 5 Pro AI tools (Ad Copywriter, UGC Brief, Ad Auditor, Product Description Writer, Subject Line Tester); Scale Lab card adds an indented sub-list of all 5 Scale-Lab-only AI tools (Store Autopsy, Grand Slam Offer Builder, Cialdini Page Audit, AOV Audit, Scale or Kill). Sub-bullets render slightly faded so the parent feature line stays primary |
| 2026-04-30 | **Dashboard fixes from the $49 payment test: Scale Lab badge, 3-column nav, paid-user welcome card.** A paid Growth user landed on the dashboard and saw orange Pro badge (instead of black/gold Scale Lab), the free-user "12 modules · Start Module 1" welcome card, and email prefix where their name should be. The DB confirmed `is_growth=true` so all three were frontend bugs. Fixes: (a) **Nav badge logic** now handles 3 tiers correctly — admin → Admin badge, else `isGrowth` → Scale Lab dark/gold with rocket icon, else `isPro` → Pro orange with sparkles icon, else null. (b) **Welcome card hidden for paid users** — added `&& !isPro` to the existing `completedCount === 0 && !track` condition. Paid users skip the free-tier orientation and see the standard returning-user view plus the post-upgrade banner. (c) **Nav redesigned as 3-column layout** (max-width bumped 680 → 1140) — LEFT: logo + tier badge; CENTRE: Tools / Resources / Picks / Briefings + admin links if admin; RIGHT: Upgrade or Billing · Settings · Log out. Mobile (`< sm` breakpoint) collapses the centre, keeps Settings/Log out as icons. (d) **All cartoon emojis on the nav swapped for Lucide** — Picks `📦` → package, Briefings `📋` → file-text, `✨ Upgrade` → sparkles, Settings → gear, Log out → door icon. The welcome card itself: `Welcome 🎉` → sparkles label, `🚀 Start Module 1` → rocket icon. (e) **firstName fallback no longer shows email prefix as a name** — if `profile.first_name` is empty or implausibly long (>30 chars), templates omit the name entirely (`"You're all set. Here's how this works."` instead of `"You're all set, growthtest123."`) |
| 2026-04-30 | **Welcome emails rewritten — premium typography + AI tools section.** Owner reviewing the live Scale Lab welcome email noted the heavy emoji styling felt off-brand for a $49/mo product, and the email never mentioned the AI tools that are a major part of the value. Both Scale Lab and Pro welcome emails got the same treatment: (a) **Text-only headers** — removed rocket/party emoji at top, replaced with restrained "SCALE LAB · ACTIVE" or "PRO · ACTIVE" labels in tier-appropriate colour. (b) **Typography-only module roadmap** — bold module name + grey duration/range, no decorative emojis between bullets (the previous 🔬 🎯 🧠 🧪 🚀 phase emojis are gone). (c) **NEW dedicated AI tools section** — Scale Lab email features a black/gold panel listing all 5 Scale-Lab-only tools with one-line descriptions; Pro email features a purple panel listing all 5 Pro tools. Each tool listed with its name + one-sentence capability. (d) **Pro perks cards** (Picks + Briefing) kept but with cleaner styling, no decorative emojis. (e) **Graceful name fallback** — both templates drop the name entirely when `first_name` is empty/oversized (`"You're in."` instead of forcing an awkward fallback). (f) **Secondary CTA** added to both: "Or jump straight to a tool — browse the X AI tools →" link to /tools. No SQL changes — webhook calls these functions unchanged |
| 2026-04-30 | **4 new Growth-tier AI tools — the Scale Lab quartet.** Built and shipped the 4 Growth-exclusive AI tools planned yesterday, each tied to a specific Scale Lab module. All 4 follow the existing pattern: `gateAITool` 20/day rate limit, Growth-only `tier === "growth"` check, logging to `ai_tool_log`, locked card for free/pro/anon, no new SQL needed (the `AI_TOOLS` array auto-picks them up for the usage endpoint). **(1) Grand Slam Offer Builder (Module 17, icon `gift`).** Text input form: product name, current price, target customer, dream outcome, current obstacles. Routes through `TIER_CHAINS.growth` → Gemini → Groq fallback. Output: headline offer in the "I will help you X in Y without Z" format, dream-outcome restatement with sensory detail, 3-5 likelihood levers, 3-5 time-compression elements, 3-5 effort/sacrifice removers, 4-6 named bonuses with $ values + reasoning, conditional/unconditional risk-reversal guarantee, real scarcity hook (no fake countdowns), total perceived value vs price anchor (Hormozi 5-10× rule), paste-ready CTA copy. Component renders structured value-stack UI with copy buttons. **(2) Cialdini Page Audit (Module 19, icon `shield`, uses Gemini `url_context`).** User pastes their product / landing / sales page URL → Gemini fetches it and scores it against Cialdini's 6 principles (Reciprocity / Commitment & Consistency / Social Proof / Authority / Liking / Scarcity). For each: 0-10 score, what's working (specific elements seen), what's missing, the concrete fix to apply. Plus overall 0-100 score (Social Proof and Authority weighted 2× for ecom) and a "fix this first" highest-impact recommendation. Defensive normalisation ensures all 6 principles always returned in canonical order even if the model skips/duplicates one. SSRF defense mirrors `/api/store-autopsy`. UI: per-principle expandable cards with color-coded score chips (green 8+, amber 5-7, red <5). **(3) AOV Optimization Audit (Module 18, icon `layers`, uses Gemini `url_context`).** User pastes store / product / cart page URL → Gemini fetches and audits 7 standard AOV mechanisms (Order bump / Quantity break / Bundle / Post-purchase upsell / Free-shipping threshold / Cross-sell / Subscription discount). Each is marked present:true|false based on what's actually on the page. For missing mechanisms: expected lift % (honest range — order bumps +8-15%, bundles +10-25%, etc., never claims 50%+ for one mechanism), exact Shopify app to install (real apps only — ReConvert, Vitals, Bold Upsell, etc.), paste-ready copy template. Plus combined-lift estimate, current-strengths list, top-3 install priority order with reasoning. UI: priority-ordered top-3 banner, present-or-missing card per mechanism with copy-template buttons. **(4) Scale or Kill Decision Helper (Module 23, icon `compass`).** 11-field form for last-7-day ad performance (target CPA, spend, revenue, ROAS, CTR, CPC, CPA, AOV, frequency, days running, optional notes). Applies the Module 23 decision matrix: SCALE if CPA < target AND ROAS > 1.7 AND frequency < 2.0 AND ≥5 days (then 20% budget increase max — the "20% rule"); ITERATE if CPA close-but-not-profitable, picking the SINGLE most likely variable (creative / hook / audience / offer / landing_page); KILL if CPA > 1.5× target after 5 days, freq > 3.0, or spend > 3× target_cpa with zero conversions. Output: verdict with Low/Medium/High confidence (Low if days_running < 5 or spend < 3× target_cpa regardless of other signals), reasoning that references specific user numbers, next action with $ and timeline, single variable to change (if iterate), 3-5 numeric kill triggers to watch over the next 5 days, per-metric Healthy/Borderline/Concerning verdict for ROAS/CTR/CPC/CPA/AOV/Frequency. UI: green/amber/red verdict banner, kill-trigger watchlist, color-coded metric grid. **Files added:** 4 new generators in `lib/perplexity.ts`, 4 new API routes under `app/api/ai-tools/{offer-builder,cialdini-audit,aov-audit,decision-helper}/route.ts`, 4 new components in `components/`, 4 new tabs on `/tools` (all with `tier: "growth"` so they get the dark/gold tier theme). Type union and `AI_TOOLS` array updated in `lib/ai-tool-gate.ts`. Usage endpoint extended for all 4 |
| 2026-04-29 | **SEO fix: canonicalise to www.firstsalelab.com everywhere.** Google Search Console flagged "Page with redirect" because sitemap URLs pointed at the apex which our middleware 308's to www. Fixed all SEO-relevant URL references — sitemap, robots, layout metadataBase + OG url, blog canonical + JSON-LD (3 spots), landing page JSON-LD (Organization + Course + 3 Offers). The middleware redirect itself is unchanged (correct for canonical hosts); we just stopped putting apex URLs into Google's mouth |
| 2026-04-29 | **Tools tab tier coloring + finishing the Lucide migration (landing + resources).** Owner spotted the tools tab layout looking unbalanced (icon top-left, label below-left) and asked for a tier-based color system that matches the landing-page pricing tiers. **Layout:** redesigned `/tools` tabs as column-aligned (`flex-direction: column`, centered alignment), 110px min-height so all cards line up evenly. Icon, label, and tagline now stack centered. **Tier coloring:** new `TIER_THEME` map keyed on `"free" \| "pro" \| "growth"` drives bg / border / icon / active state. Free = white with indigo accent on active. Pro = soft purple (`#faf5ff` → `#f5f3ff` on active, deeper purple icon). Scale Lab = dark (`#1c1917` → `#0c0a09` on active, gold icon `#fde68a`/`#facc15`). Active state amplifies the tier's own hue rather than switching to a generic indigo, so the active tool's tier is always visually clear. Mirrors the 3-tier pricing card system on landing. **Landing page surfaces caught this round:** the 12-module curriculum grid (modules now have `icon: IconName` field), the "Real skills. Real assets." 6 feature cards, the Scale Lab teaser phase chips (Diagnose / Validate / Persuade / Test / Scale), the "How it works" 3-step section, and the floating ProductMockup hero preview's checklist items (uses `check-circle` for done, the module icon otherwise). **Resources page:** all 31 entries in `lib/resources.ts` migrated from `emoji: string` to `icon: IconName`; `ResourceCard` renders `<Icon>` on a soft-purple background, replacing the gray emoji-cell. Type chain stays clean: `IconName` flows from `components/Icon.tsx` → `lib/resources.ts` Resource type → page component |
| 2026-04-29 | **Lucide icon migration (high-visibility surfaces) + stale "free forever" / "12 modules" messaging fixes.** **Icons:** installed `lucide-react@0.469.0` and built `<Icon name="..." />` at `components/Icon.tsx` mapping ~60 semantic names (`target`, `rocket`, `sparkles`, `eye`, `pen`, `wallet`, `trending-up`, etc.) to Lucide components. Default size 20, strokeWidth 2 — tweak there to affect every site-wide icon. **Migrated:** `/tools` tab grid (11 tools), Launch Checklist sections, the dashboard's 24-module list (data now uses `icon: IconName`, the "done" state renders a check mark), the dashboard's "Up next" hero card, the dashboard 3-step welcome card, the Module page's "Up next" mini card, all tier badges (Pro = `sparkles`, Scale Lab = `rocket`) on landing nav / landing pricing / upgrade page / dashboard / 5 AI tool components / Store Autopsy lock card, the entire AIToolLockCard component (props changed from `emoji`/`bullets[].e` → `icon`/`bullets[].i` of type `IconName`; all 5 callers updated), GettingStartedChecklist header, landing hero trust strip (`star`/`globe`/`lock-open`/`zap`), and Store Autopsy's bullet grid + header. **NOT migrated** (deliberate): admin dashboards (internal-only), email templates (emojis render better than SVG in mail clients), opengraph-image (rasterised social previews), per-option emojis in the quiz (functional decision-aids — small inline icons would lose info density). **Messaging:** dropped "free forever" claims that implied the whole site is free (all 5 occurrences in `app/quiz`, `app/upgrade`, both email-footer routes, and `lib/email-helpers`). Updated stale "12-module" total counts to "24-module" in 4 meta descriptions / drip CTAs. Kept "all 12 modules" wording on certificate-flow text since the certificate is awarded at Module 12 (still accurate). |
| 2026-04-29 | **Pre-launch security pass 2 — payment-flow + auth hardening.** Second-pass deep audit on top of the first. **(1) CRITICAL — `/api/stripe/checkout` accepted `userId` and `email` from the request body with NO bearer-token verification.** An attacker could call it with any victim's id + email and get back a real Stripe Checkout URL — perfect phishing payload ("Update your payment method", click link, victim pays, attacker now knows their card). Fixed by requiring bearer-token auth and forcing `customer_email` + `metadata.userId` from `user.email` / `user.id` (token-derived). The body now only carries `tier` and `billing`. Updated the `/upgrade` page caller to pass the access token. **(2) CRITICAL — Stripe webhook had no idempotency.** Stripe retries failed webhooks, and a retry of `checkout.session.completed` would send a 2nd welcome email + re-mark the referral. Added new `stripe_webhook_events` table with `stripe_event_id` UNIQUE — handler does `select(...).eq(stripe_event_id, event.id)` before processing and returns early if found, then inserts after successful processing (only). On thrown errors no insert — Stripe retries get re-processed correctly. Also added a defensive presence-check on `STRIPE_WEBHOOK_SECRET` at the top of the handler. **(3) HIGH — `/api/referrals/track` accepted `referredUserId` from body with no auth.** Attacker could create false attributions. Fixed by requiring bearer token and reading `referred_id` from `user.id`. Body now only carries `referralCode`. Updated signup flow to pass `data.session.access_token` as the bearer. **(4) HIGH — `/api/store-autopsy` SSRF defense.** The actual fetch happens inside Gemini's url_context tool (Google's servers, not ours), so a "real" SSRF wasn't possible. But we now reject `localhost`, `127.0.0.1`, IPv6 loopback `::1`, AWS/Azure/GCP metadata addresses, and private IPv4 ranges (10/8, 172.16/12, 192.168/16, 127/8, 224+/multicast) at the API layer. Defense-in-depth that signals intent — anyone passing those is probing, not analysing a competitor; future-proofs us if we ever switch from Gemini to a server-side fetcher. **SQL migration owner must run before deploy:** `CREATE TABLE IF NOT EXISTS stripe_webhook_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), stripe_event_id text NOT NULL UNIQUE, event_type text NOT NULL, processed_at timestamptz NOT NULL DEFAULT now());` plus the index. Findings deliberately dropped: account-deletion rate limit (Supabase `deleteUser` is naturally idempotent and Stripe sub cancellation is idempotent — spam attempts cost basically nothing), niche-picker IP throttling (free-tier Groq abuse acceptable for a public lead magnet pre-launch), RLS verification (codebase uses service-role for all DB writes, anon key is only used for `auth.getUser()` which doesn't read user data) |
| 2026-04-29 | **Getting Started checklist — fix admin / power-user edge cases.** Two bugs surfaced when the owner viewed the checklist as admin: (1) it kept nagging "take the quiz" even with 12 modules complete, because admin bypassed the signup→quiz flow so `profile.track` is `null` for them; (2) the checklist was showing at all to a user with 12 modules done, because the auto-hide trigger (5/6 milestones) didn't fire for their unusual milestone pattern (e.g. no streak, no logged tool use). Two fixes: **(a)** quiz milestone now counts as done if `hasQuiz || hasModule1` — you can't be on Module 1 without the quiz nudge being irrelevant. **(b)** Two new props on `<GettingStartedChecklist>` — `isAdmin` (always hide for admins) and `completedCount` (auto-hide once `>= 3` modules are done, since the dashboard's own "Up next" card is doing that job at that point). Net result: the checklist is now strictly a first-week-new-user tool. Power users and admins never see it |
| 2026-04-29 | **Pre-launch data protection pass — cookie consent + self-serve deletion + privacy policy refresh.** Three GDPR / ePrivacy gaps closed before live Stripe so we can take EU money cleanly. **(1) Cookie consent banner.** New `<CookieBanner>` (sticky bottom strip, two buttons: "Essential only" / "Accept all") shows on first visit. Choice persists in `localStorage` as `fsl_cookie_consent` and dispatches a `fsl-cookie-consent-changed` event. New `<AnalyticsScripts>` client component reads that flag + listens for the event, and only loads GA4 (`G-VT4RZ3JB6L`) + AdSense (`pagead2.googlesyndication.com/...`) scripts when consent is `"all"`. Both scripts moved out of `app/layout.tsx`. Vercel Analytics stays always-on because it's cookieless and GDPR-compliant out of the box (no consent required). The AdSense site-verification `meta` tag stays in `metadata.other` — it's plain text, no script, no cookies. **(2) Self-serve account deletion.** New `POST /api/account/delete` (bearer-token auth, no body — token is the only source of truth for who's deleted, prevents IDOR). Flow: cancel any active Stripe subscriptions for the user's `stripe_customer_id`, then call `supabase.auth.admin.deleteUser(user.id)`. Schema cascades via `ON DELETE CASCADE` on `user_id` cleanup `user_profiles`, `user_progress`, `ai_tool_log`, `module_qa_log`, `supplier_validations`, `referrals`. Settings page replaces the old "email us" message with a real "Delete my account" button + confirmation modal (must type `DELETE` to enable). Modal copy is explicit about what's removed (everything personal) and what's retained (Stripe invoice records held by Stripe for tax-law reasons; aggregated analytics that don't identify the user). On success: sign out + redirect to `/?deleted=1`. **(3) Privacy policy refresh.** `app/privacy/page.tsx` updated end-to-end: added **Gemini** (Google AI) to the third-party processors table (was undisclosed — used for Growth-tier features); split **GA4** out from Vercel Analytics (they're separate Google products with separate cookies); added a new bullet to "What data we collect" disclosing that **AI tool inputs and outputs** are logged against the user's account (for rate limiting + future Vault feature); rewrote the **Cookies** section with explicit Essential-only vs Accept-all behaviour; rewrote **Data retention** to mention immediate deletion via Settings + the two narrow retention exceptions (Stripe billing records, aggregated analytics); rewrote **Your rights** to point at the new self-serve delete + clarify our 30-day-on-request export commitment. `Last updated` bumped to 29 April 2026. **No SQL changes** — everything works against the existing schema |
| 2026-04-29 | **Pre-launch security pass — 4 real issues fixed before Stripe live mode.** Ran an Explore-agent audit covering API auth, IDOR, secret exposure, RLS, webhook signatures, input validation, XSS, CSRF, headers, SSRF, rate-limiting. Triaged findings, verified by reading the actual code, then fixed the verified ones. **(1) CRITICAL — `/api/stripe/portal` IDOR:** the route accepted a `userId` from the request body and returned a Stripe billing portal URL for that user, with NO ownership check. Any authenticated user could pass any UUID and gain access to another user's billing portal (cancel sub, change card, see history). Fixed by adding bearer-token auth + `body.userId === user.id` check. Updated the dashboard's `handleManageBilling()` caller to pass the access token. **(2) CRITICAL — `/api/analytics` was unauthenticated:** anyone with the URL could `curl` it and get total user count, signups-per-week, max streak, completion counts per module — full business metrics. Fixed by adding bearer-token + `isAdmin()` email gate. Updated `app/admin/page.tsx` caller to pass the token. **(3) HIGH — `/api/send-welcome` and `/api/send-completion` no auth:** these accepted any `email` and would send a Resend email to that address with our `from: hello@firstsalelab.com` reputation behind it. Combined with the Resend webhook logging events to `email_events`, an abuser could pollute analytics + spam any inbox. Fixed by requiring bearer token + `email === user.email` and `userId === user.id`. Updated callers in `app/signup/page.tsx` (uses `data.session.access_token` from supabase signup response) and `app/modules/[id]/page.tsx`. **(4) Defense-in-depth — security headers:** populated `next.config.ts` with X-Content-Type-Options nosniff, X-Frame-Options SAMEORIGIN (not DENY — would break Stripe billing portal embed), Referrer-Policy strict-origin-when-cross-origin, Strict-Transport-Security with preload, Permissions-Policy locking down camera/mic/geo/FLoC. CSP intentionally NOT added yet — inline styles + AdSense + GA4 + Stripe.js need a thoughtful policy; flagged as a follow-up. False positives I dropped: the audit flagged missing `STRIPE_WEBHOOK_SECRET` / `CRON_SECRET` / `RESEND_WEBHOOK_SECRET` in `.env.local`, but those are local-dev-only — they're set in Vercel for production (the fact that crons and webhooks have been working proves it). Webhook idempotency for Stripe (duplicate retries → duplicate welcome emails) was flagged Medium — left as a known issue, will address if it surfaces in practice |
| 2026-04-29 | **Getting Started checklist on the dashboard.** New `<GettingStartedChecklist>` component renders right under the progress card for returning users. Walks them through 6 milestones with contextual CTAs and a progress bar: ① Create account (done) → ② Take the quiz → ③ Complete Module 1 → ④ Reach a 3-day streak → ⑤ Try a tool → ⑥ Finish Module 6 (free tier graduation). Each undone item shows an inline link to the right page ("Start →" for the quiz, "Open →" for Module 1, "Browse →" for tools, etc.); done items are greyed out with a strikethrough and green check. The header swaps in real-time to "Next up: take the quiz" / "Next up: complete module 1" etc. so users always know the single most important action. **No new DB columns** — every milestone reads from existing data: `track` for quiz, `user_progress` for modules, `streak_days` for streak. The "Try a tool" check is a union of `ai_tool_log` count + `supplier_validations` count (two HEAD-only count queries added to the dashboard fetch — basically free). The whole card **auto-hides** once 5/6 items are done so it doesn't linger past the early-momentum phase. Coexists with the existing big "Welcome 🎉" card (which still shows for absolute newbies with 0 completions and no quiz track) — the checklist takes over once they've started moving. Drives free → paid conversion by making the path concrete |
| 2026-04-29 | **Two new AI tools: Product Description Writer + Email Subject Line Tester.** Both ship as new tabs on `/tools` (📝 Product Desc, ✉️ Subject Lines) using the existing tier-gating + rate-limit + logging infrastructure (Free locked → upgrade card; Pro 5/day on Groq; Growth 20/day on Gemini). **(1) Product Description Writer** — paste product info + benefits + target customer, pick a tone (professional/conversational/playful/luxury) and length (short ~50w / medium ~120w / long ~250w), get 3 variants across `benefit` / `story` / `social_proof` angles. Each variant has a punchy headline, body copy at the requested length and tone, and 3-5 highlight bullets. Per-variant "Copy all" button copies headline + body + bullets in one shot. **(2) Email Subject Line Tester** — pick an email purpose (welcome / promo / cart abandon / re-engage / newsletter / re-launch), describe topic + audience, get 10 subject line variants across 8 frameworks (Curiosity, Urgency, Numbers, Personalized, Question, Pattern Interrupt, Benefit, Social Proof). For each variant: the subject line, framework name, optional preheader text, mobile-truncation flag (>40 chars warning since iPhone Mail truncates), and a Low/Medium/High predicted open rate with one-sentence reasoning. The prompt enforces no spam triggers and limits the model to ≤4 "High" predictions to keep them honest. **Plumbing:** new generators `generateProductDescription` + `generateSubjectLines` in `lib/perplexity.ts`; new API routes `/api/ai-tools/product-description` and `/api/ai-tools/subject-lines`; `AITool` union expanded with `product_description` + `subject_lines` so the existing usage endpoint + `useAIToolUsage` hook + `ai_tool_log` table cover them automatically (no migration needed) |
| 2026-04-29 | **AdSense ads.txt finally findable — moved apex→www redirect from Vercel edge into Next.js middleware with a carve-out for `/ads.txt`.** AdSense had been showing "Ads.txt status: Not found" since 26 Apr because Vercel's project-level domain redirect was 307'ing `firstsalelab.com/ads.txt` → `www.firstsalelab.com/ads.txt`, and AdSense's crawler doesn't reliably follow redirects for this specific file (despite Google's own docs saying it does). Rather than swap the canonical from www to apex (would churn SEO + bookmarks), we ported the redirect into code: new `middleware.ts` at repo root does the same apex→www redirect (now 308 permanent instead of 307), but explicitly skips `/ads.txt` so the file is served directly from both hosts. **Paired owner action:** disable the project-level apex→www redirect in Vercel Settings → Domains (without that, Vercel's edge redirect fires before any Next.js middleware can run, and the carve-out has no effect). After deploy + Vercel domain change: `firstsalelab.com/ads.txt` returns 200 OK, AdSense crawler should re-check within 24-72h and flip "Ads.txt status" to OK. No SQL, no env vars, no other behaviour changes |
| 2026-04-28 | **Gemini paid tier provisioned + cost caps configured (operational, no code changes).** Diagnosed via the improved error surfacing landed earlier in the session: `RESOURCE_EXHAUSTED limit:0` on `generate_content_free_tier_requests` was not "you exceeded the free tier" — it was "URL Context tool is paid-tier-only" (undocumented Google gating that other devs have hit too). Free tier covers basic Gemini calls but excludes the `url_context` tool that Store Autopsy uses for URL fetching. Owner action taken: (1) created fresh Google Cloud project "First Sale Lab" via aistudio.google.com/apikey (the previous AI Studio default project had `limit:0` baked in), (2) attached billing to enable `url_context`, (3) set $5/month budget alert in Cloud Billing with email thresholds at 50/90/100%, (4) hard-capped `GenerateContent request limit per minute for a region` at 30 across all 43 regions in the Generative Language API quotas dashboard, (5) rotated the new `GEMINI_API_KEY` into Vercel (Production + Preview, skipped Development since `vercel dev` isn't used). Token-count cap deemed unnecessary since the request rate cap + budget alert covers the worst case. Realistic cost at current scale: pennies/month. Worst case if every cap somehow failed simultaneously: capped at ~$5 by the budget alert. The fallback chain still hands 429s off to Groq, so user-facing reliability is unaffected. **No code changed in this step** — purely Google Cloud configuration. The `[ai] gemini/...failed` warnings should now disappear from Vercel logs entirely on Store Autopsy runs |
| 2026-04-28 | **Better Gemini error logs + Resend webhook tags fix.** Two production-log fixes spotted in Vercel: (1) Gemini provider was throwing `Gemini API error 429: { "error": { "code": 42...` (truncated) on every URL-context call, making it impossible to tell if the 429 was quota-tier-not-set, billing-not-attached, daily-cap-hit, or url_context-not-allowed. Now the provider parses Google's `{error: {code, message, status}}` envelope and the chain's warn log shows e.g. `RESOURCE_EXHAUSTED Quota tier not configured (code 429) [url_context=on]` — actionable. The chain still falls through to Groq exactly as before, so behaviour is unchanged for users; this is purely diagnostic. (2) `/api/webhooks/resend` was throwing `TypeError: tags.forEach is not a function` on every recent Resend event because Resend migrated their payload from `tags: [{name, value}, ...]` (array) to `tags: {key: value}` (object map). Handler now accepts both shapes via `Array.isArray(data.tags)` check, so existing tagged emails (welcome, pro-welcome, growth-welcome, weekly-digest, etc.) still attribute to user_id + email_type correctly in `email_events` |
| 2026-04-28 | **AI tool usage counter pills + Store Autopsy rate-limited.** Each AI tool's header now pre-fetches the user's current 24h usage and shows "X / Y runs today" the moment the page loads (previously the pill only appeared after the first run because `usage` was filled from the response payload). New endpoint `GET /api/ai-tools/usage` returns `{ tier, usage: { ad_copywriter, ugc_brief, ad_audit, store_autopsy } }` — one COUNT-only Supabase query per tool against `ai_tool_log` over the last 24h. New hook `lib/useAIToolUsage.ts` exposes `usage`, `refresh()` (re-fetch after a 429) and `bump()` (optimistic +1 after a successful run, no second round-trip). Wired into all 4 tool components. Store Autopsy was previously the only AI tool with no rate-limit — now routed through the same `gateAITool` (20/day for Growth) and logged to `ai_tool_log`, so it shows up in admin metrics and in the user's pill. Added `AITool` union type + `AI_TOOLS` array to `lib/ai-tool-gate.ts` so any future tool added there is automatically picked up by the usage endpoint and the hook |
| 2026-04-28 | **Store Autopsy now fetches the URL directly via Gemini URL Context.** Previously the tool required users to type a 50+ char description of what they observed because Groq/llama can't browse the web. Now the analyse path passes the URL into Gemini 2.0 Flash's `url_context` tool, which fetches the competitor page server-side and reasons over the actual content — offer copy, hero image, pricing, social proof, guarantees, all of it. Notes textarea is now optional and re-framed as "things AI can't see" (off-site ads, founder TikTok presence, off-site reviews). If Gemini's fetch fails (Cloudflare-blocked, JS-only SPA, or key missing), the chain falls through to Groq with whatever notes the user wrote — graceful degradation, no errors. Touch points: new `urls?: string[]` on `AIRequest` (`lib/ai/types.ts`); Gemini provider attaches `tools: [{ url_context: {} }]` when URLs are present + switches to prompt-based JSON since native JSON mime type doesn't combine cleanly with the URL tool (`lib/ai/providers/gemini.ts`); `analyzeStore()` passes the URL through (`lib/perplexity.ts`); description is now optional in the API route + URL is validated as http/https (`app/api/store-autopsy/route.ts`); UI relaxed validation, updated copy, smaller default textarea (`components/StoreAutopsy.tsx`). Other providers silently ignore the `urls` field, so nothing else changes |
| 2026-04-28 | **Growth tier routed to Gemini + Growth daily limits tightened 50 → 20.** Edited `TIER_CHAINS.growth` in `lib/ai/config.ts` to `[gemini-2.0-flash, groq-llama-3.3-70b]` — Scale Lab users now get a different model "voice" than Pro/Free (Groq), with Groq as the automatic fallback if Gemini errors or hits its 1,500/day free-tier daily cap. Pro stays on Groq. Per-tool daily limit for Growth dropped 50 → 20 in `lib/ai-tool-gate.ts` — feels unlimited to legit users (nobody legitimately needs 20 ad audits per day per tool), kills runaway abuse, and keeps total Gemini spend safely under the free-tier cap even with multiple active Growth users. Updated all the inline doc comments in the 3 AI tool API routes + AdCopywriter component. **Action needed:** add `GEMINI_API_KEY` to Vercel (Production + Preview) — get one free at aistudio.google.com → "Create API key". Important note: a Google AI Pro **consumer subscription** does NOT include API access; the Gemini API has its own separate free tier (1,500 req/day on 2.0 Flash) regardless of consumer plan. No SQL changes |
| 2026-04-28 | **AI provider abstraction layer (`lib/ai/`).** Refactored the single `callGroq()` helper in `lib/perplexity.ts` into a pluggable multi-provider system. New `lib/ai/index.ts` exports `callAI(request, tier)` which routes through `TIER_CHAINS` defined in `lib/ai/config.ts`. Provider implementations: `lib/ai/providers/groq.ts` / `openai.ts` / `anthropic.ts` / `gemini.ts`. Each respects the chosen model's JSON-output mechanism (json_object on OpenAI/Groq, prompt-engineering+fence-stripping on Anthropic, responseMimeType on Gemini). Auto-fallback chain: if the primary provider for a tier fails, the orchestrator tries other providers that have API keys configured. Existing generators in `lib/perplexity.ts` are now tier-aware: `analyzeSupplier` runs through "pro", `analyzeStore` through "growth", AI tools (ad copywriter / UGC brief / ad audit) get the user's actual tier passed through from the API route. To upgrade Scale Lab tools to Claude Sonnet later: edit `TIER_CHAINS.growth` in `lib/ai/config.ts` and add `ANTHROPIC_API_KEY` to Vercel — that's the entire migration. New optional env vars: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` (Groq remains required as primary) |
| 2026-04-28 | **3 new AI tools added to /tools (Pro + Scale Lab tier).** All 3 use Groq, gated server-side via shared `lib/ai-tool-gate.ts` helper (free locked, Pro 5/day per tool, Growth 50/day per tool, admin treated as Growth). All runs logged to new `ai_tool_log` table for rate limiting + future Vault feature. (1) **✍️ Ad Copywriter** — paste product info, get 5 ad variants across different psychological angles (Curiosity Gap, Problem Agitation, Transformation Reveal, Social Proof Opener, Contrarian). Each has hook + body + CTA + framework attribution. (2) **🎬 UGC Brief Generator** — paste product + pick a hook framework, get a complete ready-to-send creator brief with word-for-word hook, pain to dramatize, transformation, CTA, format specs, shot list, reference styles, and "do not" list. (3) **🧐 AI Ad Auditor** — paste your ad copy, get a 0-100 overall score, hook framework identification + strength rating, Cialdini-6 scores (each 0-2), body & CTA assessment, concrete hook/body/CTA rewrites, and a list of specific improvements. Shared infrastructure: new `useAuthTier` hook for client-side tier detection, new `<AIToolLockCard>` for the locked-state UI, expanded `lib/perplexity.ts` with `generateAdCopy`/`generateUGCBrief`/`auditAd`. /tools max-width bumped to 960/880px and grid switched to `auto-fill minmax(140px, 1fr)` so 9 tabs flow naturally. **SQL migration:** new `ai_tool_log` table |
| 2026-04-28 | **Big batch — admin dashboards, Store Autopsy, Module Q&A, referral program, annual prep.** (1) `/admin` expanded with MRR/tier/funnel/churn-risk/recent-signups dashboards. (2) New `/admin/email` page shows open/click/bounce rates per email type + top-clicked URLs. (3) New `/admin/leads` page browses Niche Picker leads with drip-stage filter. (4) **Store Autopsy** — Growth-only `/tools` 6th tab; user describes competitor store, Groq returns structured teardown (offer, hooks, social proof, conversion gaps, exploit angles, threat level). Server-side `is_growth` gate on `/api/store-autopsy`. (5) **AI Module Q&A** — embedded widget on every module page. Asks Groq using ONLY that module's content. Rate-limited per tier (Free 3 / Pro 10 / Growth 50 per module per 24h). Logged to `module_qa_log` table. (6) **Annual plan code prep** — `/api/stripe/checkout` accepts `billing: monthly\|annual`, routes to 4 env vars (`STRIPE_PRICE_ID`, `_ANNUAL`, `_GROWTH`, `_GROWTH_ANNUAL`). Annual Stripe products deferred with live-mode flip. (7) **Referral program** — each user gets 6-char base36 code on first dashboard load. `/quiz?ref=CODE` captures leads via localStorage → `/api/referrals/track` after signup. Stripe webhook marks `converted_tier` when they upgrade. Dashboard `<ReferralCard>` shows link + total/converted/pending counts. Admin manually grants free month via existing Grant Pro/Growth toggle. (8) **Bug fix:** module completion auto-redirect hardcoded `< 12` → fixed to `< 24` (Growth users completing M12 now advance to M13 properly). (9) Mobile pass: admin funnel grid now `auto-fit` instead of fixed 5 columns. **SQL migrations needed:** `referral_code` column + `referrals` + `module_qa_log` tables (see CLAUDE.md). New env vars `STRIPE_PRICE_ID_ANNUAL` + `STRIPE_PRICE_ID_GROWTH_ANNUAL` (deferred) |
| 2026-04-28 | **Landing page updated for 3-tier ladder:** Hero badge now shows all 3 tiers ($19 + $49). The old 2-column "Free vs Pro" pricing section is now a 3-column comparison (Free / Pro / Scale Lab) — Scale Lab styled black/gold with "Most powerful" badge; mobile stacks to 1 column under 800px. New Scale Lab teaser card added below the 12-module curriculum grid showing the 5-phase breakdown (Diagnose/Validate/Persuade/Test/Scale). FAQ rewritten to explain all 3 tiers + course completion time per tier. JSON-LD structured data adds the $49 Scale Lab Offer and expands `teaches` with advanced topics (CPA/ROAS/AOV, persuasion copy, A/B testing, UGC creative, scaling). Stats updated to "24 modules · 3 tiers". The dashboard, upgrade page, and signup → quiz flow remain unchanged — they were already 3-tier-aware from the prior commit |
| 2026-04-28 | **Loox affiliate link wired in:** `https://loox.io/app/FSL30`. Replaced the non-affiliate `loox.app` URL in `lib/resources.ts` (Store Building card on `/resources`) and 3 places in `lib/modules.ts` (Module 5 store building, Module 19 persuasion principles, Module 21 UGC at scale). README affiliate table updated — Loox moved from "pending" to active |
| 2026-04-28 | **🚀 Scale Lab tier launched (12 new modules, 3-tier ladder).** New Growth tier at $49/mo gates modules 13-24 (covering diagnose/validate/persuade/test/scale phases — based on Cialdini, Hormozi, Sean Ellis, Hopkins, Berger). Tier ladder is now Free → Pro $19/mo → Scale Lab $49/mo. Code changes: added `Tier` type to `lib/modules.ts` and `tier` field to existing modules + 12 new module objects (1500+ lines added); new `is_growth` column on `user_profiles`; `/api/stripe/checkout` accepts `tier` param routing to `STRIPE_PRICE_ID` or `STRIPE_PRICE_ID_GROWTH` (new env var); webhook reads `metadata.tier` to set the right flag and dispatch the right welcome email; new `growthWelcomeEmailHTML` template; new `POST /api/admin/users/[userId]/growth` endpoint mirroring the Pro one; `/upgrade` page rewritten as a 3-tier comparison with `?tier=pro\|growth` deep-linking and a toggle; Module 12 completion now shows a Scale Lab pitch overlay (mirrors Module 6 → Pro pattern); Dashboard module list grouped visually by tier with section headers; Admin `/admin/users` shows Free/Pro/Scale Lab status + Grant/Revoke buttons for both tiers + filter for Scale Lab. **Required SQL migration (only step needed now):** `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_growth boolean NOT NULL DEFAULT false;`. Stripe Scale Lab product setup is **deferred** — paired with the future flip to Stripe live mode (Pro is also still in test mode). Until Stripe is live, owner can grant Growth manually via `/admin/users` for testing |
| 2026-04-27 | **AdSense slots configured (all 3):** Owner created 3 separate ad units in AdSense (`Content`, `Dashboard`, `Modules`) and added their slot IDs to Vercel env vars `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT`, `_DASHBOARD`, `_MODULE`. Site itself is still in "Getting ready" approval status — once it flips to "Ready", ads fill automatically. Per-placement reporting now possible in AdSense dashboard. **`ads.txt`** is correctly served at `www.firstsalelab.com/ads.txt` (200 OK) but apex redirects to www so AdSense's "Ads.txt status" check may lag — monitor; re-register as `www.firstsalelab.com` if still "Not found" after 48h |
| 2026-04-27 | **Tools / Blog / Resources promoted to landing + ads added:** `/tools` link added to marketing nav and footer (anonymous accessible — already was, just wasn't linked). New `components/UserAdBanner.tsx` wraps `AdBanner` and handles Pro detection on public pages where we don't already have it in state. AdSense banners now render on `/tools` (after the panel), `/resources` (after the list), `/blog` (after the post list), and `/blog/[slug]` (between article body and CTA card) — all controlled by new `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT` env var. `sitemap.ts` and `robots.ts` updated to include `/tools` and `/resources`. Supplier Validator also got a new top-of-form Pro tease banner so the upsell appears even before users calculate |
| 2026-04-27 | **Supplier Validator + Pro AI Analysis:** Free 5-category scoring calculator (reviews 25 / shipping 20 / communication 15 / quality 20 / price 20) → 0–100 trust score with Good/Risky/Avoid verdict. Embedded at `/tools` (5th tab, deep-linkable via `?tool=supplier`) and inline in Module 3. Logged-in users can save via `POST /api/supplier-validations`. **NEW Pro tier:** `POST /api/supplier-ai-analysis` (Pro-gated server-side) calls Groq with the supplier's inputs and returns AI-tailored red flags, verification questions, likely issues, and an 8–10 step pre-order checklist. Free users see a "🔒 Pro · Unlock AI analysis" upgrade card linking to `/upgrade`; anonymous users see one linking to `/signup`. Pro/admin users get the "🤖 Run AI analysis" button. `fetchSupplierData(url)` stub ready for future API integration |
| 2026-04-27 | **Niche Picker drip + rate-limit:** Email input on the dark CTA card now has visible white background + gold focus ring. Day-0 email sends the 3 niches via Resend immediately on form submit. New daily cron at 14:00 UTC (`/api/cron/niche-drip`) runs the 4-stage sequence: day-0 ("Your 3 niches") → day-2 ("Validate in 48h") → day-5 ("The niche mistake") → day-7 ("Take the quiz"). Rate-limited to 1 generation per email per 24h (returns 429 with friendly message). New column: `niche_leads.drip_stage` |
| 2026-04-27 | **Admin blog RLS fix:** `/admin/blog` page was using anon key client which RLS blocked on the new `blog_posts` table → moved to service-role-backed `GET /api/admin/blog` endpoint. Drafts now visible to admins |
| 2026-04-27 | **Blog system:** Public `/blog` index + `/blog/[slug]` post pages with JSON-LD BlogPosting schema; weekly Wednesday 7am UTC cron (`/api/cron/blog`) drafts via Groq; admin `/admin/blog` page to preview/publish/discard with optional manual topic input. **SQL migration:** new `blog_posts` table |
| 2026-04-27 | **Niche Picker lead magnet:** Public `/niche-picker` — 4 inputs (interests/budget/experience/audience), Groq returns 3 niches via `/api/niche-picker`; email captured to new `niche_leads` table for future drip campaigns. Linked from landing footer + sitemap + robots allow |
| 2026-04-27 | **Dynamic OG images:** Site-wide default at `app/opengraph-image.tsx` + per-certificate at `app/certificate/[userId]/opengraph-image.tsx` (personalised name + completion date) — better social share previews on LinkedIn/X/Slack |
| 2026-04-27 | **Resend webhook:** `/api/webhooks/resend` logs every email event (delivered/opened/clicked/bounced/complained) to new `email_events` table; existing email sends tagged with `type` + `user_id`. Webhook setup needed in Resend dashboard. New env var: `RESEND_WEBHOOK_SECRET` |
| 2026-04-27 | **Streak-save email cron:** Daily 19:00 UTC — finds users with active streak whose last_active = yesterday and sends a nudge to save the streak before midnight; tracked via new `streak_save_email_date` column |
| 2026-04-27 | **Weekly digest email cron:** Sunday 17:00 UTC — sends every user a recap email (modules done this week, total progress, streak, next module CTA); no DB tracking column needed |
| 2026-04-27 | **Performance audit:** Google AdSense script moved from `strategy="beforeInteractive"` to `"afterInteractive"` — major fix, page is no longer blocked from becoming interactive while AdSense loads. AdSense verification still works via the meta tag in `metadata.other`. Added `decoding="async"` to all logo images |
| 2026-04-27 | **Privy affiliate link:** `https://go.privy.com/NYUtfS6` wired into `lib/modules.ts` (Module 10 resource) and added as a new entry in `lib/resources.ts` under Email Marketing so it also appears on `/resources` |
| 2026-04-27 | **Re-engagement email cron:** New daily cron at 10:00 UTC (`/api/cron/reengagement`); finds users who signed up 3–14 days ago with 0 module completions and sends them one nudge email; tracked via new `user_profiles.reengagement_sent_at` column to ensure at most one email per user. **Run SQL migration:** `ALTER TABLE user_profiles ADD COLUMN reengagement_sent_at timestamptz;` |
| 2026-04-27 | **Admin user management (`/admin/users`):** Browse all users, search by email/name, filter by Pro/free/active/inactive; grant or revoke Pro manually with a single click. Backed by `GET /api/admin/users` and `POST /api/admin/users/[userId]/pro`. Note: doesn't touch Stripe — webhook will overwrite if user has active sub |
| 2026-04-27 | **Module 6 → Pro pitch:** When a free user completes Module 6, the slide-up completion overlay now shows a celebration + Pro upgrade pitch (Modules 7–12 preview, weekly picks/briefing, social proof quote, $19/mo CTA) instead of redirecting them to the locked Module 7. Auto-redirect disabled for this case so they have time to read |
| 2026-04-27 | **Onboarding card fix:** Removed quiz CTA (quiz is already required for signup); card now says "You're all set" with 3 orientation steps (do module → unlock next → first sale) and a single "Start Module 1 →" CTA |
| 2026-04-27 | **Support email:** `hello@firstsalelab.com` → `support@firstsalelab.com` in settings danger zone, terms of service, and privacy policy (user-facing contact only; transactional from-address stays `hello@`) |
| 2026-04-27 | **CLAUDE.md index file:** Replaced single-line CLAUDE.md with a compact session brief — tech stack, all pages, business rules, env vars, feature checklist, recent changes, pending work; updated every session |
| 2026-04-26 | **Onboarding experience:** First-time users (no quiz taken, 0 completions) see a dark welcome hero card with 3-step orientation and "Start Module 1 →" CTA instead of blank 0% progress bar; returning users see normal greeting + progress bar |
| 2026-04-26 | **Mobile audit:** `px-8` → `px-4 sm:px-8` across all landing page sections; hero h1 `text-4xl sm:text-5xl`; CTA banner `p-7 sm:p-12`; dashboard nav secondary links `hidden sm:block`; upgrade page Free vs Pro grid `grid-cols-1 sm:grid-cols-2`; module complete button full-width with shortened label; upgrade hero CTA `maxWidth: 340` + full-width |
| 2026-04-26 | **Settings page (`/settings`):** Change name + change password + danger zone; "Settings" link in dashboard nav |
| 2026-04-27 | **Certificate page:** Public shareable `/certificate/[userId]` — server component, dynamic OG meta, not-yet-earned state, Copy/LinkedIn/X share buttons; dashboard completion card updated with "Share certificate" link |
| 2026-04-27 | **SEO:** `app/sitemap.ts` (6 public URLs, priority-weighted), `app/robots.ts` (blocks /dashboard /admin /pro /modules /api), JSON-LD structured data on landing page (Organization + Course + FAQPage schemas) |
| 2026-04-27 | **Google Analytics 4:** Measurement ID `G-VT4RZ3JB6L` added to `app/layout.tsx` via `afterInteractive` scripts |
| 2026-04-27 | **Privacy Policy + Terms of Service:** `/privacy` and `/terms` pages with real content covering all third-party services; 7-day refund policy in Terms; Privacy/Terms links added to all footers |
| 2026-04-27 | **Pro welcome email:** Fires from Stripe webhook on `checkout.session.completed`; includes unlocked modules list, weekly picks and monthly briefing highlights |
| 2026-04-26 | **Landing page Free vs Pro section:** New comparison section after testimonials — dark purple Pro card with dynamic "April 2026 Ad Strategy Update" label (auto-updates monthly), weekly winning products feature card, Free column with locked greyed-out Pro items; FAQ updated to mention weekly picks + briefing |
| 2026-04-26 | **Email newsletters:** Saturday admin reminder cron (supports multiple addresses via `ADMIN_EMAILS` env var); Monday product picks newsletter to Pro users; monthly briefing auto-published + emailed to Pro users; `lib/email-helpers.ts` with `getProUsers`, `sendBatch`, 3 HTML email generators; upgrade page PRO_INCLUDES updated with Weekly Picks + Monthly Briefing perks |
| 2026-04-26 | **AI provider:** Switched from Perplexity (paid) → Gemini (quota issues) → Groq (free, working); `GROQ_API_KEY` env var; `llama-3.3-70b-versatile` model with `json_object` response format |
| 2026-04-26 | **Automated Pro Content:** Groq API integration; weekly product drops + monthly briefings via Vercel Cron; admin content review page (`/admin/content`) with generate, swap, publish flow; Pro-gated display pages (`/pro/products`, `/pro/briefings`); `vercel.json` cron schedule |
| 2026-04-26 | **Affiliate links:** Shopify (`shopify.pxf.io/3k9Wjr`), ReConvert (`?mref=bfgeliiu`), AutoDS (`?ref=NTI2MjAyMQ==`) wired into `lib/modules.ts` resource arrays |
| 2026-04-26 | **Module content upgrade:** All 12 modules rewritten with specific tools, exact metrics (CPM < $15, CTR > 1.5%, ROAS > 2.0), frameworks (Pain→Dream→Fear, 3X Rule, 1000-visitor funnel), and 3-month milestone map |
| 2026-04-26 | **Google AdSense:** Verified via meta tag; `strategy="beforeInteractive"` script in layout; `public/ads.txt`; `AdBanner` component (Pro = no ads); GDPR CMP enabled |
| 2026-04-26 | **Stripe Pro subscription:** Checkout, webhook (upsert fix, correct `Stripe.Checkout.Session` type), billing portal; `is_pro` / `stripe_customer_id` / `stripe_subscription_id` columns in `user_profiles`; race condition fix with `upgradedBanner` + `useEffect` |
| 2026-04-26 | **Upgrade page (`/upgrade`):** Dark hero, $19/month pricing, Free vs Pro comparison table, Pro module previews |
| 2026-04-26 | **Dashboard Pro UI:** Pro/Upgrade badge in nav, Pro module lock badges, upgrade CTA banner, billing button, welcome banner on `?upgraded=true` |
| 2026-04-26 | **Personalised landing page (logged-in):** Different hero for logged-in users with name, progress bar, quick-access cards |
| 2026-04-26 | **Landing page freemium copy:** Removed "free forever" claims; freemium badge; updated FAQ, comparison, CTAs |
| 2026-04-26 | **Quiz redesign:** Auto-advance, back button, keyboard shortcuts, slide animations, linear progress bar |
| 2026-04-26 | **Landing page v2:** Social proof bar, full curriculum grid, outcome cards, testimonials, FAQ accordion, improved footer |
| 2026-04-26 | **Logo:** PNG logo in all navs; square favicon; logo export page |
| 2026-04-25 | **Rebrand:** "Ecommerce Academy" → "First Sale Lab"; `€` → `$`; domain to `firstsalelab.com` |
| 2026-04-25 | **Email system:** Resend; welcome + completion emails; domain verified |
| 2026-04-25 | **Supabase auth emails:** Custom SMTP via Resend; branded HTML templates |
| 2026-04-25 | **Streaks:** `streak_days` + `last_active`; `updateStreak()`; streak badge |
| 2026-04-25 | **Admin analytics:** `/admin` page + `/api/analytics`; module funnel; user stats |
| 2026-04-25 | **Vercel Analytics:** `<Analytics />` in root layout |

---

*This README is maintained by the AI coding assistant and updated after every working session. If starting a new session, share this file for full context.*
