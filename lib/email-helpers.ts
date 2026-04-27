import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import type { Product, BriefingContent } from "./perplexity";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://firstsalelab.com";

// ── Get all Pro users with emails ─────────────────────────────

export async function getProUsers(supabase: SupabaseClient) {
  const { data: proProfiles } = await supabase
    .from("user_profiles")
    .select("id, first_name")
    .eq("is_pro", true);

  if (!proProfiles?.length) return [];

  const proIdSet = new Set(proProfiles.map((p: { id: string }) => p.id));
  const nameMap: Record<string, string> = {};
  proProfiles.forEach((p: { id: string; first_name: string | null }) => {
    nameMap[p.id] = p.first_name ?? "";
  });

  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  return users
    .filter(u => proIdSet.has(u.id) && u.email)
    .map(u => ({
      id: u.id,
      email: u.email!,
      firstName: nameMap[u.id] || u.email!.split("@")[0],
    }));
}

// ── Send emails in batches via Resend ─────────────────────────

export async function sendBatch(emails: { to: string; subject: string; html: string }[]) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const BATCH_SIZE = 50;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE).map(e => ({
      from: "First Sale Lab <hello@firstsalelab.com>",
      to: e.to,
      subject: e.subject,
      html: e.html,
    }));
    await resend.batch.send(batch);
  }
}

// ── Email: Saturday admin reminder ────────────────────────────

export function reminderEmailHTML(hasDraft: boolean): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td style="background:#312e81;border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
          <div style="font-size:44px;margin-bottom:12px;">⏰</div>
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Review this week's product drop</h1>
        </td></tr>
        <tr><td style="background:#fff;padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.7;">
            ${hasDraft
              ? "Your weekly product drop draft is ready. <strong style=\"color:#09090b;\">5 AI-researched products</strong> are waiting for your review — swap any you don't like, then publish before Monday."
              : "Heads up — no product drop draft found for this week. Head to the content page to generate one manually before Monday."}
          </p>
          <p style="margin:0 0 24px;font-size:13px;color:#a1a1aa;line-height:1.6;">
            Once published, Pro members will receive their picks by email Monday morning.
          </p>
          <div style="text-align:center;">
            <a href="${SITE_URL}/admin/content"
              style="display:inline-block;background:#6366f1;color:#fff;font-weight:800;font-size:15px;padding:14px 36px;border-radius:14px;text-decoration:none;letter-spacing:-0.2px;">
              Review &amp; Publish →
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f8f8fb;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;">First Sale Lab · Admin reminder</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Email: Weekly product picks newsletter ────────────────────

export function productNewsletterHTML(firstName: string, products: Product[], weekDate: string): string {
  const productRows = products.map((p, i) => `
    <tr><td style="padding-bottom:14px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8fb;border-radius:14px;border:1px solid #e4e4e7;overflow:hidden;">
        <tr><td style="padding:16px 18px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:32px;vertical-align:top;">
                <div style="width:28px;height:28px;background:#6366f1;border-radius:8px;text-align:center;line-height:28px;font-size:13px;font-weight:900;color:#fff;">${i + 1}</div>
              </td>
              <td style="padding-left:12px;vertical-align:top;">
                <p style="margin:0 0 2px;font-size:14px;font-weight:800;color:#09090b;">${p.name}</p>
                <p style="margin:0 0 8px;font-size:11px;color:#7c3aed;font-weight:600;">${p.category}</p>
                <p style="margin:0 0 10px;font-size:12px;color:#71717a;line-height:1.5;">${p.why_trending}</p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:8px;"><span style="background:#f0fdf4;color:#16a34a;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;">Cost ${p.aliexpress_cost}</span></td>
                    <td style="padding-right:8px;"><span style="background:#eff6ff;color:#2563eb;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;">Sell ${p.sell_price}</span></td>
                    <td><span style="background:#fffbeb;color:#d97706;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;">~${p.margin_pct}% margin</span></td>
                  </tr>
                </table>
                <p style="margin:10px 0 0;font-size:12px;color:#52525b;font-style:italic;">"${p.ad_hook}"</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>`).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="background:#1e1b4b;border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Pro Feature · Week of ${weekDate}</p>
          <div style="font-size:36px;margin-bottom:10px;">📦</div>
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">This week's 5 product picks</h1>
          <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">Hey ${firstName} — 5 AI-researched products with margin math and ad hooks, ready to go.</p>
        </td></tr>
        <tr><td style="background:#fff;padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${productRows}
          </table>
          <div style="text-align:center;margin-top:8px;">
            <a href="${SITE_URL}/pro/products"
              style="display:inline-block;background:#6366f1;color:#fff;font-weight:800;font-size:14px;padding:13px 32px;border-radius:13px;text-decoration:none;">
              View full picks &amp; AliExpress links →
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f8f8fb;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#09090b;">First Sale Lab Pro</p>
          <p style="margin:0;font-size:12px;color:#a1a1aa;">You're receiving this because you're a Pro member.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Email: Monthly briefing newsletter ────────────────────────

export function briefingNewsletterHTML(firstName: string, content: BriefingContent, month: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <tr><td style="background:#0c4a6e;border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Pro Feature · ${month}</p>
          <div style="font-size:36px;margin-bottom:10px;">📋</div>
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Your monthly ecom briefing</h1>
          <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">Hey ${firstName} — here's what's working this month and what to drop.</p>
        </td></tr>

        <tr><td style="background:#fff;padding:28px 32px;">

          ${content.summary ? `
          <div style="background:#f0f4ff;border-radius:12px;padding:14px 16px;margin-bottom:20px;border-left:3px solid #6366f1;">
            <p style="margin:0;font-size:13px;color:#1e1b4b;font-style:italic;line-height:1.6;">${content.summary}</p>
          </div>` : ""}

          <table width="100%" cellpadding="0" cellspacing="6" style="margin-bottom:16px;">
            <tr>
              <td width="50%" style="vertical-align:top;">
                <div style="background:#f8f8fb;border-radius:12px;padding:14px 16px;">
                  <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6366f1;">👥 Meta Ads</p>
                  <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">${content.meta_ads}</p>
                </div>
              </td>
              <td width="50%" style="vertical-align:top;padding-left:6px;">
                <div style="background:#f8f8fb;border-radius:12px;padding:14px 16px;">
                  <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#be185d;">🎵 TikTok Ads</p>
                  <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">${content.tiktok_ads}</p>
                </div>
              </td>
            </tr>
          </table>

          ${content.trending_niche ? `
          <div style="background:#f0fdf4;border-radius:12px;padding:14px 16px;margin-bottom:16px;border:1px solid #bbf7d0;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#16a34a;">🌱 Trending Niche</p>
            <p style="margin:0 0 4px;font-size:14px;font-weight:800;color:#09090b;">${content.trending_niche.name}</p>
            <p style="margin:0 0 4px;font-size:12px;color:#374151;line-height:1.5;">${content.trending_niche.why}</p>
            <p style="margin:0;font-size:11px;color:#6b7280;">📊 ${content.trending_niche.signals}</p>
          </div>` : ""}

          <table width="100%" cellpadding="0" cellspacing="6" style="margin-bottom:16px;">
            <tr>
              <td width="50%" style="vertical-align:top;">
                <div style="background:#f0fdf4;border-radius:12px;padding:14px 16px;border:1px solid #a7f3d0;">
                  <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#059669;">✅ Add This Month</p>
                  <p style="margin:0;font-size:12px;color:#374141;line-height:1.6;">${content.add_tactic}</p>
                </div>
              </td>
              <td width="50%" style="vertical-align:top;padding-left:6px;">
                <div style="background:#fff1f2;border-radius:12px;padding:14px 16px;border:1px solid #fecdd3;">
                  <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#dc2626;">❌ Drop This Month</p>
                  <p style="margin:0;font-size:12px;color:#374141;line-height:1.6;">${content.drop_tactic}</p>
                </div>
              </td>
            </tr>
          </table>

          ${content.platform_changes ? `
          <div style="background:#fffbeb;border-radius:12px;padding:14px 16px;margin-bottom:24px;border:1px solid #fde68a;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#b45309;">⚠️ Platform Changes</p>
            <p style="margin:0;font-size:12px;color:#374141;line-height:1.6;">${content.platform_changes}</p>
          </div>` : ""}

          <div style="text-align:center;">
            <a href="${SITE_URL}/pro/briefings"
              style="display:inline-block;background:#0c4a6e;color:#fff;font-weight:800;font-size:14px;padding:13px 32px;border-radius:13px;text-decoration:none;">
              Read full briefing →
            </a>
          </div>
        </td></tr>

        <tr><td style="background:#f8f8fb;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#09090b;">First Sale Lab Pro</p>
          <p style="margin:0;font-size:12px;color:#a1a1aa;">You're receiving this because you're a Pro member.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Email: Pro upgrade welcome ────────────────────────────────

export function proWelcomeEmailHTML(firstName: string): string {
  const month = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://firstsalelab.com";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

        <!-- Header -->
        <tr><td style="background:#1e1b4b;border-radius:20px 20px 0 0;padding:40px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">🎉</div>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">You're now Pro, ${firstName}!</h1>
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.5);">Welcome to First Sale Lab Pro</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:36px 40px;">
          <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;line-height:1.7;">
            Your subscription is active. Here's everything you now have access to:
          </p>

          <!-- Unlocked modules -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tr><td style="background:#f5f3ff;border-radius:14px;padding:18px 20px;border:1px solid #ede9fe;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7c3aed;">🔓 Modules Unlocked</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align:top;padding-right:8px;">
                    <p style="margin:0 0 6px;font-size:12px;color:#4c1d95;">📱 Module 7 — TikTok Organic</p>
                    <p style="margin:0 0 6px;font-size:12px;color:#4c1d95;">📣 Module 8 — Run Your First Ad</p>
                    <p style="margin:0 0 6px;font-size:12px;color:#4c1d95;">📈 Module 9 — Conversion Optimisation</p>
                  </td>
                  <td width="50%" style="vertical-align:top;">
                    <p style="margin:0 0 6px;font-size:12px;color:#4c1d95;">📧 Module 10 — Build Email List</p>
                    <p style="margin:0 0 6px;font-size:12px;color:#4c1d95;">💰 Module 11 — Make Your First Sale</p>
                    <p style="margin:0 0 6px;font-size:12px;color:#4c1d95;">🚀 Module 12 — Scale and Grow</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Weekly picks -->
          <table width="100%" cellpadding="0" cellspacing="6" style="margin-bottom:16px;">
            <tr>
              <td width="50%" style="vertical-align:top;">
                <div style="background:#f0fdf4;border-radius:14px;padding:16px 18px;border:1px solid #bbf7d0;">
                  <p style="margin:0 0 6px;font-size:22px;">📦</p>
                  <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:#09090b;">Weekly Product Picks</p>
                  <p style="margin:0;font-size:12px;color:#52525b;line-height:1.5;">5 trending products with margins &amp; ad hooks — every Monday in your inbox.</p>
                </div>
              </td>
              <td width="50%" style="vertical-align:top;padding-left:6px;">
                <div style="background:#eff6ff;border-radius:14px;padding:16px 18px;border:1px solid #bfdbfe;">
                  <p style="margin:0 0 6px;font-size:22px;">📋</p>
                  <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:#09090b;">${month} Ad Strategy</p>
                  <p style="margin:0;font-size:12px;color:#52525b;line-height:1.5;">What's working on Meta &amp; TikTok right now — updated every month.</p>
                </div>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 28px;font-size:13px;color:#71717a;line-height:1.6;">
            No ads. No limits. Just the full system — from your first store to your first sale and beyond.
          </p>

          <div style="text-align:center;">
            <a href="${SITE_URL}/dashboard"
              style="display:inline-block;background:#6366f1;color:#fff;font-weight:800;font-size:15px;padding:14px 40px;border-radius:14px;text-decoration:none;letter-spacing:-0.2px;">
              Go to Dashboard →
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f8fb;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#09090b;">First Sale Lab Pro</p>
          <p style="margin:0;font-size:12px;color:#a1a1aa;">Questions? Reply to this email — we read every one.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Email: Weekly progress digest (free users, Sunday) ──

export function weeklyDigestEmailHTML(firstName: string, opts: {
  totalDone: number;
  doneThisWeek: number;
  streak: number;
  nextModuleId: number | null;
  nextModuleTitle: string | null;
}): string {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://firstsalelab.com";
  const { totalDone, doneThisWeek, streak, nextModuleId, nextModuleTitle } = opts;
  const progressPct = Math.round((totalDone / 12) * 100);

  const headlinePraise =
    doneThisWeek >= 3 ? "🚀 You crushed it this week!" :
    doneThisWeek === 2 ? "💪 Strong week." :
    doneThisWeek === 1 ? "✓ One module down. Keep momentum." :
                          "👋 Check in time.";

  const headlineCopy =
    doneThisWeek >= 3 ? "Three or more modules in a single week is the top 5% of learners. Don't slow down." :
    doneThisWeek === 2 ? "Two modules this week — solid pace. One more next week and you're flying." :
    doneThisWeek === 1 ? "Quality over speed. One module done is one module more than 90% of people who 'want to start a business.'" :
                          "You didn't complete a module this week — that's fine, life happens. Pick up where you left off below.";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

        <tr><td style="background:#312e81;border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.45);">Your week</p>
          <h1 style="margin:0;font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">${headlinePraise}</h1>
        </td></tr>

        <tr><td style="background:#fff;padding:32px 40px;">
          <p style="margin:0 0 22px;font-size:14px;color:#52525b;line-height:1.7;">
            Hey ${firstName} — ${headlineCopy}
          </p>

          <!-- Stats grid -->
          <table width="100%" cellpadding="0" cellspacing="6" style="margin-bottom:24px;">
            <tr>
              <td width="33%" style="vertical-align:top;">
                <div style="background:#eef2ff;border-radius:12px;padding:14px 12px;text-align:center;">
                  <p style="margin:0 0 4px;font-size:24px;font-weight:900;color:#4338ca;letter-spacing:-0.6px;">${doneThisWeek}</p>
                  <p style="margin:0;font-size:10px;color:#6366f1;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">This week</p>
                </div>
              </td>
              <td width="33%" style="vertical-align:top;">
                <div style="background:#f0fdf4;border-radius:12px;padding:14px 12px;text-align:center;">
                  <p style="margin:0 0 4px;font-size:24px;font-weight:900;color:#15803d;letter-spacing:-0.6px;">${totalDone}/12</p>
                  <p style="margin:0;font-size:10px;color:#16a34a;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Total · ${progressPct}%</p>
                </div>
              </td>
              <td width="33%" style="vertical-align:top;">
                <div style="background:#fff7ed;border-radius:12px;padding:14px 12px;text-align:center;">
                  <p style="margin:0 0 4px;font-size:24px;font-weight:900;color:#c2410c;letter-spacing:-0.6px;">${streak > 0 ? "🔥 " + streak : "—"}</p>
                  <p style="margin:0;font-size:10px;color:#ea580c;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Day streak</p>
                </div>
              </td>
            </tr>
          </table>

          ${nextModuleId && nextModuleTitle ? `
          <div style="background:#f8f8fb;border-radius:14px;padding:18px 20px;margin-bottom:24px;border:1px solid #e4e4e7;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6366f1;">Up next</p>
            <p style="margin:0 0 4px;font-size:15px;font-weight:800;color:#09090b;">Module ${nextModuleId} — ${nextModuleTitle}</p>
            <p style="margin:0;font-size:12px;color:#71717a;">Pick up where you left off — your progress is saved.</p>
          </div>
          <div style="text-align:center;">
            <a href="${SITE_URL}/modules/${nextModuleId}"
              style="display:inline-block;background:#6366f1;color:#fff;font-weight:800;font-size:14px;padding:13px 32px;border-radius:13px;text-decoration:none;letter-spacing:-0.2px;">
              Continue Module ${nextModuleId} →
            </a>
          </div>
          ` : `
          <div style="background:#ecfdf5;border-radius:14px;padding:18px 20px;margin-bottom:24px;border:1px solid #a7f3d0;text-align:center;">
            <p style="margin:0 0 6px;font-size:24px;">🏆</p>
            <p style="margin:0 0 4px;font-size:14px;font-weight:800;color:#065f46;">All 12 modules done!</p>
            <p style="margin:0;font-size:12px;color:#16a34a;">Time to focus on growing your store. View your certificate from the dashboard.</p>
          </div>
          <div style="text-align:center;">
            <a href="${SITE_URL}/dashboard"
              style="display:inline-block;background:#059669;color:#fff;font-weight:800;font-size:14px;padding:13px 32px;border-radius:13px;text-decoration:none;letter-spacing:-0.2px;">
              View Dashboard →
            </a>
          </div>
          `}
        </td></tr>

        <tr><td style="background:#f8f8fb;border-radius:0 0 20px 20px;padding:18px 40px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#09090b;">First Sale Lab</p>
          <p style="margin:0;font-size:11px;color:#a1a1aa;">Sent every Sunday — keeps you on track without spamming you.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Niche Picker drip sequence (4 emails over 7 days) ────────────────────

export type NicheLead = {
  email: string;
  niches: { name: string; why_fits_you: string; ideal_customer: string; example_products: string[]; starter_budget: string; difficulty: string; growth_signal: string }[];
};

/* Email 1 — sent immediately when they fill out the form */
export function nichePickerDay0HTML(firstName: string, niches: NicheLead["niches"]): string {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://firstsalelab.com";

  const nicheRows = niches.map((n, i) => `
    <tr><td style="padding-bottom:14px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8fb;border-radius:14px;border:1px solid #e4e4e7;">
        <tr><td style="padding:18px 20px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7c3aed;">Niche ${i + 1}</p>
          <p style="margin:0 0 10px;font-size:16px;font-weight:800;color:#09090b;letter-spacing:-0.3px;">${n.name}</p>
          <p style="margin:0 0 12px;font-size:13px;color:#52525b;line-height:1.65;">${n.why_fits_you}</p>
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Ideal customer</p>
          <p style="margin:0 0 12px;font-size:12px;color:#3f3f46;line-height:1.5;">${n.ideal_customer}</p>
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Example products</p>
          <p style="margin:0 0 12px;font-size:12px;color:#3f3f46;line-height:1.6;">${n.example_products.map(p => `&middot; ${p}`).join("<br>")}</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding-right:4px;vertical-align:top;">
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 10px;">
                  <p style="margin:0 0 2px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#16a34a;">💰 Starter budget</p>
                  <p style="margin:0;font-size:12px;font-weight:700;color:#065f46;">${n.starter_budget}</p>
                </div>
              </td>
              <td width="50%" style="padding-left:4px;vertical-align:top;">
                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:8px 10px;">
                  <p style="margin:0 0 2px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#2563eb;">🎯 Level</p>
                  <p style="margin:0;font-size:12px;font-weight:700;color:#1e40af;">${n.difficulty}</p>
                </div>
              </td>
            </tr>
          </table>
          <p style="margin:10px 0 0;font-size:11px;color:#71717a;line-height:1.5;">📈 ${n.growth_signal}</p>
        </td></tr>
      </table>
    </td></tr>`).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="background:#1e1b4b;border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
          <div style="font-size:44px;margin-bottom:10px;">🎯</div>
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(253,224,71,0.85);">Your niches</p>
          <h1 style="margin:0;font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">3 ecommerce niches just for you</h1>
        </td></tr>
        <tr><td style="background:#fff;padding:30px 32px;">
          <p style="margin:0 0 22px;font-size:14px;color:#52525b;line-height:1.7;">
            Hey ${firstName} — here are the 3 niches our AI picked based on your inputs. Save this email; you&apos;ll want to come back to it.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">${nicheRows}</table>
          <div style="margin-top:14px;background:#f5f3ff;border-radius:14px;padding:18px 20px;border:1px solid #ede9fe;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:800;color:#4c1d95;">Picked one? Now build the store.</p>
            <p style="margin:0 0 14px;font-size:12px;color:#6b21a8;line-height:1.6;">Our free 12-module course takes you from a niche idea to your first Shopify sale. Modules 1–6 are free, no credit card.</p>
            <a href="${SITE_URL}/quiz" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:800;font-size:13px;padding:11px 22px;border-radius:10px;text-decoration:none;">Build my free roadmap →</a>
          </div>
        </td></tr>
        <tr><td style="background:#f8f8fb;border-radius:0 0 20px 20px;padding:18px 32px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#09090b;">First Sale Lab</p>
          <p style="margin:0;font-size:11px;color:#a1a1aa;">You requested these niches at firstsalelab.com/niche-picker. We&apos;ll send 3 more short emails over the next week with tips on validating your niche.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* Email 2 — Day 2: validate in 48 hours */
export function nichePickerDay2HTML(firstName: string, topNicheName: string): string {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://firstsalelab.com";
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
        <tr><td style="background:#312e81;border-radius:20px 20px 0 0;padding:32px 36px 28px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.45);">Day 2 of 7</p>
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;line-height:1.25;">Validate your niche in 48 hours (no money required)</h1>
        </td></tr>
        <tr><td style="background:#fff;padding:30px 36px;">
          <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.7;">Hey ${firstName},</p>
          <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.7;">A few days ago you got 3 niche suggestions from us. The most common reaction is: <em>cool, but how do I know which one is actually viable?</em></p>
          <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.7;">Here&apos;s a simple weekend test that costs $0 and tells you 80% of what you need to know:</p>
          <ol style="margin:0 0 22px;padding-left:22px;color:#3f3f46;font-size:14px;line-height:1.8;">
            <li><strong>Search TikTok</strong> for hashtags related to the niche. Are people posting? Is engagement strong?</li>
            <li><strong>Check Meta Ad Library</strong>. Are competitors running ads? Have any been running for 30+ days? (Long-running ads = profitable.)</li>
            <li><strong>Search the niche on AliExpress</strong>. Can you find products that pass the 3X markup rule (sell price ≥ 3× cost)?</li>
            <li><strong>Look for a Reddit community</strong>. If there&apos;s an active subreddit, your audience is real and reachable.</li>
          </ol>
          <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.7;">Try it on <strong style="color:#09090b;">${topNicheName}</strong> first. If 3 of those 4 boxes are green, you have a real niche.</p>
          <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.7;">If you want the full system — including the exact 7-question framework we use to score every niche idea — that&apos;s Module 2 of our free course.</p>
          <div style="text-align:center;margin-top:8px;">
            <a href="${SITE_URL}/quiz" style="display:inline-block;background:#6366f1;color:#fff;font-weight:800;font-size:14px;padding:13px 30px;border-radius:12px;text-decoration:none;">Get my free roadmap →</a>
          </div>
        </td></tr>
        <tr><td style="background:#f8f8fb;border-radius:0 0 20px 20px;padding:16px 36px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0;font-size:11px;color:#a1a1aa;">Reply to this email if you have questions — we read every one.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/* Email 3 — Day 5: the niche mistake */
export function nichePickerDay5HTML(firstName: string): string {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://firstsalelab.com";
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
        <tr><td style="background:#9a3412;border-radius:20px 20px 0 0;padding:32px 36px 28px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Day 5 of 7</p>
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;line-height:1.25;">The niche mistake that kills 90% of new stores</h1>
        </td></tr>
        <tr><td style="background:#fff;padding:30px 36px;">
          <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.7;">${firstName},</p>
          <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.7;">Most new ecommerce stores fail for the same reason: <strong style="color:#09090b;">they pick a niche that&apos;s too broad.</strong></p>
          <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.7;">&ldquo;Fitness&rdquo; is not a niche. &ldquo;Pets&rdquo; is not a niche. &ldquo;Home&rdquo; is not a niche.</p>
          <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.7;">A niche needs to be specific enough that:</p>
          <ul style="margin:0 0 18px;padding-left:22px;color:#3f3f46;font-size:14px;line-height:1.8;">
            <li>You can name the customer in one sentence (&ldquo;desk workers with chronic neck pain&rdquo;)</li>
            <li>Your ad creative writes itself (you know exactly what hook will land)</li>
            <li>Big competitors can&apos;t bother — too small for them, too profitable for you</li>
          </ul>
          <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.7;">The niches you got from our picker are written this way on purpose. If they feel &ldquo;too narrow,&rdquo; that&apos;s good — it means there&apos;s real product-market fit potential.</p>
          <div style="background:#f5f3ff;border-left:3px solid #7c3aed;padding:14px 18px;border-radius:0 12px 12px 0;margin:20px 0;">
            <p style="margin:0;font-size:13px;color:#4c1d95;font-style:italic;line-height:1.7;">&ldquo;The riches are in the niches&rdquo; sounds cliché until you watch a generic store burn $500 in ads with zero sales while a hyper-niched store hits $10k/month.</p>
          </div>
          <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.7;">Module 2 of our course walks you through the exact framework we use to find these specific, profitable angles. Free.</p>
          <div style="text-align:center;">
            <a href="${SITE_URL}/quiz" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:800;font-size:14px;padding:13px 30px;border-radius:12px;text-decoration:none;">Build my roadmap →</a>
          </div>
        </td></tr>
        <tr><td style="background:#f8f8fb;border-radius:0 0 20px 20px;padding:16px 36px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0;font-size:11px;color:#a1a1aa;">2 emails left in this series.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/* Email 4 — Day 7: take the quiz */
export function nichePickerDay7HTML(firstName: string): string {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://firstsalelab.com";
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td style="background:#1e1b4b;border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
          <div style="font-size:42px;margin-bottom:10px;">🚀</div>
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(253,224,71,0.85);">Final email</p>
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;line-height:1.25;">Your roadmap is one quiz away.</h1>
        </td></tr>
        <tr><td style="background:#fff;padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.7;">${firstName},</p>
          <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.7;">A week ago you took the first step — you got a niche. That puts you ahead of 95% of people who say they want to start an ecommerce business.</p>
          <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.7;">But picking a niche is step 1 of 12. The other 11 steps are what actually turn an idea into a store with sales:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;">
            <tr>
              <td width="50%" style="padding:6px;vertical-align:top;font-size:13px;color:#52525b;">⚡ Validate your product</td>
              <td width="50%" style="padding:6px;vertical-align:top;font-size:13px;color:#52525b;">🛒 Build your Shopify store</td>
            </tr>
            <tr>
              <td width="50%" style="padding:6px;vertical-align:top;font-size:13px;color:#52525b;">📣 Run your first ad</td>
              <td width="50%" style="padding:6px;vertical-align:top;font-size:13px;color:#52525b;">📧 Build an email list</td>
            </tr>
            <tr>
              <td width="50%" style="padding:6px;vertical-align:top;font-size:13px;color:#52525b;">📈 Optimise conversions</td>
              <td width="50%" style="padding:6px;vertical-align:top;font-size:13px;color:#52525b;">💰 Land your first sale</td>
            </tr>
          </table>
          <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.7;">All of that is mapped out in our free course. Take the 5-minute quiz and we&apos;ll personalise the path to your situation:</p>
          <div style="text-align:center;">
            <a href="${SITE_URL}/quiz" style="display:inline-block;background:linear-gradient(135deg,#facc15 0%,#f59e0b 100%);color:#1c1917;font-weight:800;font-size:15px;padding:14px 32px;border-radius:14px;text-decoration:none;">🚀 Start the free quiz →</a>
            <p style="margin:14px 0 0;font-size:12px;color:#a1a1aa;">Takes 2 minutes. No credit card.</p>
          </div>
        </td></tr>
        <tr><td style="background:#f8f8fb;border-radius:0 0 20px 20px;padding:16px 40px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0;font-size:11px;color:#a1a1aa;">This is the last email in this series. We won&apos;t email you again unless you sign up.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ── Email: Streak loss recovery (sent when a user's streak is at risk) ──

export function streakSaveEmailHTML(firstName: string, streakDays: number, nextModuleId: number, nextModuleTitle: string): string {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://firstsalelab.com";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <tr><td style="background:#9a3412;border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
          <div style="font-size:54px;margin-bottom:10px;">🔥</div>
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Don&apos;t break it now</p>
          <h1 style="margin:0;font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Your ${streakDays}-day streak is on the line</h1>
        </td></tr>

        <tr><td style="background:#fff;padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.7;">
            Hey ${firstName},
          </p>
          <p style="margin:0 0 20px;font-size:14px;color:#52525b;line-height:1.7;">
            You&apos;ve completed a module every day for <strong style="color:#09090b;">${streakDays} ${streakDays === 1 ? "day" : "days"} in a row</strong>. Don&apos;t lose that today — finish one more module before midnight and your streak rolls forward.
          </p>

          <div style="background:#fff7ed;border-left:3px solid #f97316;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9a3412;">⚡ Up next</p>
            <p style="margin:0 0 4px;font-size:14px;font-weight:800;color:#09090b;">Module ${nextModuleId} — ${nextModuleTitle}</p>
            <p style="margin:0;font-size:12px;color:#9a3412;">Most modules take 20–45 minutes. You&apos;ve got time.</p>
          </div>

          <div style="text-align:center;">
            <a href="${SITE_URL}/modules/${nextModuleId}"
              style="display:inline-block;background:#ea580c;color:#fff;font-weight:800;font-size:15px;padding:14px 36px;border-radius:14px;text-decoration:none;letter-spacing:-0.2px;">
              Save my streak →
            </a>
            <p style="margin:14px 0 0;font-size:12px;color:#a1a1aa;">Complete one module and you&apos;re back to ${streakDays + 1} 🔥</p>
          </div>
        </td></tr>

        <tr><td style="background:#f8f8fb;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#09090b;">First Sale Lab</p>
          <p style="margin:0;font-size:11px;color:#a1a1aa;">You&apos;re receiving this because your streak is about to break. We send these at most once per day.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Email: Re-engagement nudge (3 days inactive, 0 completions) ──

export function reengagementEmailHTML(firstName: string): string {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://firstsalelab.com";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <tr><td style="background:#1e1b4b;border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
          <div style="font-size:44px;margin-bottom:12px;">🧭</div>
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Your roadmap is waiting, ${firstName}.</h1>
        </td></tr>

        <tr><td style="background:#fff;padding:32px 40px;">
          <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;line-height:1.7;">
            You signed up to build your first ecommerce store — and the first module takes <strong style="color:#09090b;">just 20 minutes</strong>.
          </p>
          <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.7;">
            Module 1 — &ldquo;The Rules of the Game&rdquo; — covers everything you need to understand before spending a single dollar. No fluff. One clear task at the end.
          </p>

          <div style="background:#f5f3ff;border-radius:14px;padding:18px 20px;margin-bottom:24px;border-left:3px solid #6366f1;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7c3aed;">⚡ Module 1 covers:</p>
            <p style="margin:0;font-size:13px;color:#4c1d95;line-height:1.7;">
              How ecommerce actually works · The 3 levers that drive every sale · The math behind a profitable store · Why most beginners fail
            </p>
          </div>

          <div style="text-align:center;">
            <a href="${SITE_URL}/modules/1"
              style="display:inline-block;background:#6366f1;color:#fff;font-weight:800;font-size:15px;padding:14px 36px;border-radius:14px;text-decoration:none;letter-spacing:-0.2px;">
              Start Module 1 →
            </a>
            <p style="margin:14px 0 0;font-size:12px;color:#a1a1aa;">Takes about 20 minutes</p>
          </div>
        </td></tr>

        <tr><td style="background:#f8f8fb;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#09090b;">First Sale Lab</p>
          <p style="margin:0;font-size:11px;color:#a1a1aa;">No longer interested? Just ignore this email — we won&apos;t send another reminder.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Shared Supabase admin client factory ──────────────────────

export function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
