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
- **Logged out:** Dark hero, "Stop learning. Start selling." copy, freemium badge ("Modules 1–6 free · Pro from $19/mo"), why-different comparison, curriculum grid, how-it-works timeline, what you'll build, testimonials, **Free vs Pro comparison section** (dynamic monthly briefing label, weekly picks feature cards), stats, FAQ, CTA banner
- **Logged in:** Personalised hero ("Hey {name} 👋"), progress bar (X/12), quick-access cards, motivational quote based on progress

### Quiz (`/quiz`)
- Multi-step: experience level, time available, goal, budget
- Results saved to `localStorage` as `quiz_results`
- Determines `startModule` and `track` name
- Auto-advances on selection; back button; keyboard shortcuts (1–4 / Backspace)

### Dashboard (`/dashboard`)
- Protected (redirects to `/login` if not authenticated)
- **Onboarding card** for brand-new users (no quiz taken yet, 0 completions): replaces the greeting/progress bar with a dark welcome hero showing 3 steps + quiz CTA + "Skip to Module 1" fallback
- Progress card, streak badge, "Up next" dominant card (shown after first action or quiz completion)
- Module list: modules 7–12 show "✨ Pro" badge and "Unlock →" button if free user
- Upgrade CTA banner at bottom for free users
- Pro users see "📦 Picks" and "📋 Briefings" in nav; secondary nav links (`hidden sm:block`) collapse on mobile
- Admin users see "Analytics" and "Content" in nav
- `?upgraded=true` param triggers green "Welcome to Pro!" banner

### Upgrade Page (`/upgrade`)
- Dark hero, $19/month pricing card
- Free vs Pro comparison table
- Pro module previews (7–12)
- Redirects to `/dashboard` if user is already Pro
- Checkout button → calls `/api/stripe/checkout` → redirects to Stripe

### Module Pages (`/modules/1–12`)
- Modules 1–6: free (sequential unlock)
- Modules 7–12: redirect to `/upgrade` if not Pro
- Intro screen (first visit) → lesson + checklist → complete
- AdBanner shown between action steps and mistakes (free users only)
- **Module 6 → Pro pitch:** when a free user completes Module 6, the completion overlay shows a celebration + Pro upgrade pitch instead of the standard "next module" preview; auto-redirect is disabled so the user reads the pitch; CTAs are "Upgrade to Pro $19/mo →" (primary) and "Maybe later · back to dashboard" (secondary)

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
- Lists all users with email, name, signup date, completion count, streak, Pro status, last active
- Search by email/name; filter by All/Pro/Free/Active 7d/Inactive 7d+
- "Grant Pro" / "Revoke Pro" toggle — useful for comping friends, influencers, refunds outside Stripe
- ⚠️ Does NOT touch Stripe — if user has active Stripe sub, the next webhook will overwrite a manual revoke. Cancel the subscription in Stripe dashboard for permanent revoke.

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
| `is_pro` | boolean | Set by Stripe webhook; revoked on cancellation/payment failure |
| `stripe_customer_id` | text | Stripe customer ID (set on first checkout) |
| `stripe_subscription_id` | text | Active Stripe subscription ID |
| `reengagement_sent_at` | timestamptz | When the 3-day-inactive re-engagement email was sent (NULL = never). Cron uses this to send at most once per user. |
| `streak_save_email_date` | date | Date when the most recent streak-save email was sent. Cron skips if already sent today. |

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

## Stripe Pro Subscription

### Flow
1. Free user clicks "Upgrade" → lands on `/upgrade`
2. Clicks "Get Pro" → `POST /api/stripe/checkout` creates a Checkout session with `metadata.userId`
3. User completes payment on Stripe's hosted page
4. Stripe redirects to `firstsalelab.com/dashboard?upgraded=true`
5. Simultaneously, Stripe fires `checkout.session.completed` webhook → `/api/stripe/webhook`
6. Webhook upserts `user_profiles`: sets `is_pro = true`, `stripe_customer_id`, `stripe_subscription_id`
7. Dashboard detects `?upgraded=true`, shows green banner, forces Pro UI optimistically (race condition handled)

### Webhook
- **URL:** `https://www.firstsalelab.com/api/stripe/webhook` (must use `www` subdomain — the apex redirects and Stripe won't follow 307s)
- **Verified with:** `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`
- **Events handled:**
  - `checkout.session.completed` → grant Pro
  - `customer.subscription.deleted` → revoke Pro
  - `invoice.payment_failed` → revoke Pro
- Uses **upsert** (not update) so it works even if the user has no profile row yet

### Billing Portal
- Pro users with a `stripe_customer_id` see a "Billing" button in the dashboard nav
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

| Tool | Module | Link |
|------|--------|------|
| Shopify | 5 | `https://shopify.pxf.io/3k9Wjr` |
| ReConvert | 6 | `https://apps.shopify.com/reconvert-upsell-cross-sell?mref=bfgeliiu` |
| AutoDS | 3 | `https://platform.autods.com/register?ref=NTI2MjAyMQ==` |
| Privy | 10 | `https://go.privy.com/NYUtfS6` |

Pending (application submitted or program unavailable): Klaviyo, Jungle Scout, Triple Whale, Canva, Loox, Zipify Pages, AdSpy.

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

# Groq (AI content generation — free tier, no credit card)
GROQ_API_KEY=gsk_...

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
