# First Sale Lab

> A free, 12-module ecommerce course that takes complete beginners from zero to their first online sale.
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
8. [Environment Variables](#environment-variables)
9. [Running Locally](#running-locally)
10. [Deployment](#deployment)
11. [Branding & Logo](#branding--logo)
12. [Admin Access](#admin-access)
13. [How Key Things Work](#how-key-things-work)
14. [Changelog](#changelog)

---

## What This Project Is

First Sale Lab is a free self-paced ecommerce course built as a Next.js web app. Users:

1. Take a **quiz** that profiles their experience level and goals
2. Get a **personalised roadmap** (which module to start from)
3. Work through **12 sequential modules** (each with content, a checklist, and action steps)
4. Receive **emails** after signup and after completing each module
5. Build a **daily streak** by completing modules on consecutive days
6. Earn a **certificate** upon completing all 12 modules

The owner (admin) has an **analytics dashboard** showing user counts, drop-off per module, streaks, and more.

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
| Analytics    | Vercel Analytics (passive page tracking) |
| Hosting      | Vercel (auto-deploys from GitHub `main` branch) |
| Domain       | Namecheap → `firstsalelab.com` |
| Repository   | GitHub: `insidet97-wq/ecommerce-academy` |

---

## Third-Party Services

### Supabase
- **URL:** `https://gkoobuzqmtupftkvkomo.supabase.co`
- **Purpose:** Database, authentication, row-level security
- **Custom SMTP:** Configured to send auth emails (confirm signup, reset password, change email) via Resend using `hello@firstsalelab.com`
- **Auth templates:** All Supabase email templates have been replaced with custom branded HTML — solid colours only (no CSS gradients, which email clients don't support)
- **Email confirmation is OFF** — users are redirected straight after signup, no confirm-your-email step

### Resend
- **Purpose:** Sends the welcome email and module completion emails
- **From address:** `hello@firstsalelab.com`
- **Domain verified:** `firstsalelab.com` is verified in Resend so emails can be sent to any recipient
- **API routes that send emails:**
  - `POST /api/send-welcome` — fires after signup
  - `POST /api/send-completion` — fires after each module is marked complete

### Vercel
- **Auto-deploy:** Every push to `main` on GitHub triggers a Vercel deploy (~60 seconds)
- **Environment variables** are set in Vercel dashboard (not just `.env.local`)
- **Analytics:** `<Analytics />` component from `@vercel/analytics/react` is in `app/layout.tsx`

### Namecheap
- **Domain:** `firstsalelab.com` registered here
- **Professional email:** `hello@firstsalelab.com` inbox through Namecheap Pro Email (3 inboxes available)
- **DNS records:** Configured to point to Vercel (website) and Resend (email sending/verification)

---

## Project Structure

```
ecommerce-academy/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, favicon, Vercel Analytics
│   ├── page.tsx                # Landing page (dark hero, comparison, timeline, CTA)
│   ├── not-found.tsx           # 404 page
│   ├── globals.css             # Global styles, Tailwind, custom keyframes
│   │
│   ├── quiz/
│   │   └── page.tsx            # Multi-step quiz → builds personalised roadmap
│   │
│   ├── login/
│   │   └── page.tsx            # Login page (email + password)
│   │
│   ├── signup/
│   │   └── page.tsx            # Signup → fires welcome email → redirects to first module
│   │
│   ├── forgot-password/
│   │   └── page.tsx            # Sends password reset email via Supabase
│   │
│   ├── reset-password/
│   │   └── page.tsx            # Handles the reset link from email
│   │
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard: progress, streak, all 12 modules
│   │
│   ├── modules/[id]/
│   │   └── page.tsx            # Individual module (intro screen → lesson → complete)
│   │
│   ├── tools/
│   │   └── page.tsx            # Curated tools page (Shopify, Canva, etc.)
│   │
│   ├── resources/
│   │   └── page.tsx            # Curated resources page (books, communities, etc.)
│   │
│   ├── admin/
│   │   └── page.tsx            # Admin-only analytics dashboard
│   │
│   └── api/
│       ├── send-welcome/
│       │   └── route.ts        # POST: sends welcome email via Resend
│       ├── send-completion/
│       │   └── route.ts        # POST: sends module completion email via Resend
│       └── analytics/
│           └── route.ts        # GET: aggregate stats (uses service role key to bypass RLS)
│
├── lib/
│   ├── supabase.ts             # Supabase client (anon key, browser-safe)
│   ├── admin.ts                # isAdmin(email) — hardcoded admin email list
│   ├── streak.ts               # updateStreak(userId) — daily streak logic
│   ├── modules.ts              # All 12 module definitions (content, checklist, steps)
│   └── resources.ts            # Resources page data
│
├── public/
│   ├── logo.png                # Main logo — FSL monogram, transparent background
│   ├── logo.svg                # SVG version of the logo mark (backup/export use)
│   ├── icon.svg                # Square favicon (dark purple bg + FSL mark)
│   └── export-logo.html        # Open in browser → download 2400px PNG logo
│
├── .env.local                  # Local environment variables (NOT committed to GitHub)
├── README.md                   # This file — updated after every session
└── CLAUDE.md / AGENTS.md       # Instructions for the AI coding assistant
```

---

## Pages & Features

### Landing Page (`/`)
- Dark hero with gradient background
- Conditionally shows different content based on login state:
  - **Logged out:** "Build my free plan →" + "Log in" buttons, trust badges
  - **Logged in:** "Continue learning →" button only, no trust badges
- Comparison section, step-by-step timeline, FAQ, footer

### Quiz (`/quiz`)
- Multi-step questionnaire: experience level, time available, goal, budget
- Saves results to `localStorage` as `quiz_results`
- If logged in → goes to dashboard; if not → goes to signup

### Signup (`/signup`)
- Creates Supabase account
- Reads quiz results from `localStorage` and writes to `user_profiles`
- Fires welcome email (fire-and-forget, doesn't block redirect)
- Redirects to the module the quiz recommended

### Login (`/login`)
- Standard email/password login
- Redirects to `/dashboard` or a stored `ea_next` path from localStorage

### Dashboard (`/dashboard`)
- Protected (redirects to `/login` if not authenticated)
- Shows: greeting with time of day, personalised track name, goal, streak badge, progress bar (% complete)
- Lists all 12 modules with locked/unlocked/complete states
- Admin users see an "Admin" badge and an "Analytics" link in the nav
- Certificate modal appears when all 12 modules are complete (with shareable text)

### Module Pages (`/modules/1` through `/modules/12`)
- Protected + sequential unlock (must complete N-1 to access N)
- Admins bypass the unlock requirement
- **Intro screen** (first visit only): module overview, what you'll learn, action steps preview, "Start Module →" button. Already-completed modules skip the intro.
- **Lesson screen:** full module content, interactive checklist
- **On complete:** updates `user_progress`, calls `updateStreak()`, fires completion email, shows 5-second countdown then auto-navigates to the next module

### Tools (`/tools`)
Curated list of recommended tools with descriptions and external links.

### Resources (`/resources`)
Curated list of books, communities, and learning resources.

### Admin Analytics (`/admin`)
- Redirects non-admins to `/dashboard`
- Shows: total users, active today, active this week, new signups this week, total completions, longest streak
- Module funnel: horizontal bars showing completions per module 1–12, drop-off % in red

---

## Database (Supabase)

### Tables

#### `user_profiles`
Created during signup from quiz results. Also stores streak data.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Matches `auth.users.id` (primary key) |
| `first_name` | text | From signup form |
| `track` | text | e.g. `"Beginner Fast-Start"` |
| `goal` | text | e.g. `"first_sale"` |
| `start_module` | int | Module the quiz recommended |
| `streak_days` | int | Current consecutive-day streak |
| `last_active` | date | Date (YYYY-MM-DD) of last module completion |

#### `user_progress`
One row per completed module per user.

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | uuid | FK → `auth.users.id` |
| `module_id` | int | 1–12 |
| `completed_at` | timestamp | Auto-set on insert |

### Row Level Security (RLS)
RLS is enabled on both tables. Users can only read/write their own rows.
The `/api/analytics` route uses the **service role key** (server-side only) to bypass RLS for aggregate queries.

---

## Email System (Resend)

### Welcome Email
- **Trigger:** After successful signup in `app/signup/page.tsx`
- **Route:** `POST /api/send-welcome`
- **Payload:** `{ firstName, email, startModule }`
- **Shows:** Personalised greeting, starting module, what to expect list, CTA button

### Module Completion Email
- **Trigger:** User clicks "Mark as Complete" on a module
- **Route:** `POST /api/send-completion`
- **Payload:** `{ firstName, email, completedModuleId }`
- **Shows:**
  - Module N complete confirmation + motivational milestone quote
  - Progress bar showing % complete
  - Preview card of the next module with a direct link
  - Special "Course complete!" version for module 12 with a certificate link

### Critical Email HTML Rules
Always follow these when editing email templates — email clients like Gmail are very limited:
- ✅ Use **solid background colours** only (e.g. `background:#6366f1`)
- ❌ No CSS `linear-gradient` — Gmail strips it, leaving white/invisible backgrounds
- ❌ No `box-shadow` on buttons — not supported
- ✅ Use table-based layouts for maximum compatibility
- ✅ All styles must be **inline** (`style=""`) — no external CSS

Emails are sent **fire-and-forget** (`fetch()` without `await`) so they never block the user's experience if Resend is slow.

---

## Environment Variables

Set in **both** `.env.local` (local development) and the **Vercel dashboard** (production).

```env
NEXT_PUBLIC_SUPABASE_URL=https://gkoobuzqmtupftkvkomo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   # Supabase → Project Settings → API → anon key
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...            # Supabase → Project Settings → API → service_role key
NEXT_PUBLIC_SITE_URL=https://firstsalelab.com
RESEND_API_KEY=re_...                              # Resend → API Keys page
```

> ⚠️ `RESEND_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are **server-side secrets**. Never expose them in client-side code or commit them to GitHub.

---

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/insidet97-wq/ecommerce-academy.git
cd ecommerce-academy

# 2. Install dependencies
npm install

# 3. Create .env.local and fill in the variables above

# 4. Start the dev server
npm run dev

# 5. Open http://localhost:3000
```

---

## Deployment

Every push to the `main` branch on GitHub automatically triggers a Vercel deploy.

```bash
# Standard deploy workflow
git add -A
git commit -m "Description of what changed"
git push
# Vercel picks it up automatically — live in ~60 seconds
```

- **Vercel project:** Connected to `insidet97-wq/ecommerce-academy` on GitHub
- **Production domain:** `firstsalelab.com` (and `www.firstsalelab.com`)
- **TypeScript check before pushing:** Run `npx tsc --noEmit` to catch errors before they fail the Vercel build

---

## Branding & Logo

### Colour Palette
| Use | Hex |
|-----|-----|
| Primary indigo | `#6366f1` |
| Deep indigo (darker) | `#4f46e5` |
| Purple | `#7c3aed` |
| Violet | `#9333ea` |
| Near-black text | `#09090b` |
| Light grey text | `#a1a1aa` |
| Off-white background | `#f4f4f8` |

### Logo Files
| File | Purpose |
|------|---------|
| `public/logo.png` | Main logo — FSL monogram PNG, transparent background, used in all navs at 40px height |
| `public/logo.svg` | SVG version of the mark (backup / used in export page) |
| `public/icon.svg` | Square favicon — dark purple rounded square with FSL mark in light purple |
| `public/export-logo.html` | Navigate to `/export-logo.html` to download the logo as a 2400px PNG in 3 variants |

### Fonts
- **UI font:** Geist Sans (via `next/font/google`)
- **Mono font:** Geist Mono (via `next/font/google`)

---

## Admin Access

Controlled by a hardcoded list in `lib/admin.ts`:

```ts
const ADMIN_EMAILS = ["insidet97@gmail.com"];
```

To add another admin: add their email to the array and push to GitHub (Vercel auto-deploys).

Admin privileges:
- "Admin" badge visible in dashboard nav
- "Analytics" link appears in nav
- Full access to `/admin` analytics page
- Can open any module regardless of progress/unlock state

---

## How Key Things Work

### Module Unlock Logic
A module unlocks when **any** of these are true:
- It's module 1 (always open)
- The previous module ID exists in the user's `user_progress` table
- The current user is an admin

### Streak Logic (`lib/streak.ts`)
Called automatically on every module completion:
1. Fetch `last_active` and `streak_days` from `user_profiles`
2. If `last_active` equals today → return existing streak (already counted today)
3. If `last_active` equals yesterday → increment streak by 1
4. Any other date → reset streak to 1
5. Save updated `last_active` and `streak_days`

The streak badge in the dashboard shows **orange** if the streak was maintained today, **grey** if not yet active today.

### Quiz → Roadmap Flow
1. User answers 4 questions in the quiz
2. Results saved to `localStorage` as `quiz_results`
3. Quiz determines a `startModule` (1–12) and a `track` name
4. On signup, the app reads `localStorage` and writes everything to `user_profiles`
5. The dashboard reads `start_module` to determine which module to highlight

### Analytics API (`/api/analytics`)
- Uses the **Supabase service role key** to bypass RLS (can read all users' data)
- Returns: `totalUsers`, `activeToday`, `activeThisWeek`, `signupsThisWeek`, `maxStreak`, `totalCompletions`, `perModule` (array of completion counts for modules 1–12)
- Only called from the admin page — there's no auth check in the route itself, just keep the URL private

### localStorage Keys Used
| Key | Purpose |
|-----|---------|
| `quiz_results` | Stores quiz answers during the quiz → read on signup |
| `ea_next` | Stores a redirect path after login (e.g. deep link to a specific module) |

---

## Changelog

| Date | What changed |
|------|-------------|
| 2026-04-26 | **Logo:** PNG logo added to all navs (40px); square favicon updated to dark purple with FSL mark; logo export page at `/export-logo.html` |
| 2026-04-25 | **Rebrand:** "Ecommerce Academy" → "First Sale Lab" everywhere; all `€` → `$`; domain moved to `firstsalelab.com` |
| 2026-04-25 | **Email system:** Resend integrated; welcome email on signup; completion email after each module; `firstsalelab.com` domain verified in Resend |
| 2026-04-25 | **Supabase auth emails:** Custom SMTP via Resend; branded HTML templates for confirm signup, reset password, change email |
| 2026-04-25 | **Streaks:** `streak_days` + `last_active` columns added; `updateStreak()` called on module completion; streak badge in dashboard |
| 2026-04-25 | **Admin analytics:** `/admin` page + `/api/analytics` route; module funnel with drop-off %, user stats cards |
| 2026-04-25 | **Vercel Analytics:** `<Analytics />` added to root layout |
| 2026-04-25 | **Nav redesign:** Tools, Resources, Analytics as direct links; removed `···` dropdown |
| 2026-04-25 | **Module intro screen:** First-time visitors see a cover page before lesson content; returning users skip straight to review |
| 2026-04-25 | **Dashboard:** Module list always visible (no dropdown); card-style progress bar with streak badge |
| 2026-04-25 | **Landing page:** Hero buttons adapt to login state (quiz/login when logged out; continue learning when logged in) |

---

*This README is maintained by the AI coding assistant and updated at the end of every working session. If you need a change made to the site, share this file at the start of a new session so the assistant has full context.*
