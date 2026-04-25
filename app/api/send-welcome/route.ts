import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const MODULE_TITLES: Record<number, string> = {
  1: "The Rules of the Game",
  2: "Find Your Niche",
  3: "Find Your Winning Product",
  4: "Know Your Customer",
  5: "Build Your Shopify Store",
  6: "Build Your First Sales Funnel",
  7: "Drive Traffic: TikTok Organic",
  8: "Run Your First Paid Ad",
  9: "Conversion Optimisation",
  10: "Build Your Email List",
  11: "Make Your First Sale",
  12: "Scale and Grow",
};

const MODULE_EMOJIS: Record<number, string> = {
  1: "🎮", 2: "🎯", 3: "🏆", 4: "🧠", 5: "🛒",
  6: "⚡", 7: "📱", 8: "📣", 9: "📈", 10: "📧",
  11: "💰", 12: "🚀",
};

export async function POST(req: Request) {
  try {
    const { firstName, email, startModule } = await req.json();
    const moduleNum = startModule ?? 1;
    const moduleTitle = MODULE_TITLES[moduleNum] ?? "The Rules of the Game";
    const moduleEmoji = MODULE_EMOJIS[moduleNum] ?? "🎮";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://firstsalelab.com";

    await resend.emails.send({
      from: "First Sale Lab <hello@firstsalelab.com>",
      to: email,
      subject: `Your roadmap is ready, ${firstName} 🚀`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to First Sale Lab</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:#312e81;border-radius:20px 20px 0 0;padding:40px 40px 36px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Welcome to</p>
          <p style="margin:0 0 20px;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">First Sale Lab</p>
          <div style="font-size:52px;line-height:1;margin-bottom:16px;">🎉</div>
          <h1 style="margin:0;font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.6px;line-height:1.2;">
            Hey ${firstName}, your<br>roadmap is ready.
          </h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:36px 40px;">
          <p style="margin:0 0 20px;font-size:15px;color:#52525b;line-height:1.7;">
            Based on your quiz answers, we've built you a personalized path from zero to your first sale. No fluff — just the steps that matter for <strong style="color:#09090b;">your specific situation.</strong>
          </p>

          <!-- Starting module card -->
          <div style="background:#f8f8fb;border:1.5px solid #e4e4e7;border-radius:16px;padding:20px 24px;margin-bottom:28px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6366f1;">Your first module</p>
            <div style="display:flex;align-items:center;gap:12px;margin-top:10px;">
              <span style="font-size:28px;">${moduleEmoji}</span>
              <div>
                <p style="margin:0;font-size:16px;font-weight:800;color:#09090b;letter-spacing:-0.3px;">Module ${moduleNum}: ${moduleTitle}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#a1a1aa;">This is where your journey starts.</p>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${siteUrl}/modules/${moduleNum}"
              style="display:inline-block;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;font-weight:800;font-size:15px;padding:15px 40px;border-radius:14px;text-decoration:none;letter-spacing:-0.2px;box-shadow:0 4px 20px rgba(99,102,241,0.35);">
              Start Module ${moduleNum} →
            </a>
          </div>

          <!-- What to expect -->
          <div style="border-top:1px solid #f4f4f5;padding-top:24px;">
            <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#09090b;">What to expect:</p>
            ${[
              "12 focused modules — 20 to 45 minutes each",
              "Real tasks at the end of every module",
              "Unlock the next module only when you've done the work",
              "By Module 11, your store is live and your first sale is within reach",
            ].map(item => `
            <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
              <span style="color:#6366f1;font-weight:700;font-size:13px;flex-shrink:0;margin-top:1px;">✓</span>
              <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">${item}</p>
            </div>`).join("")}
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f8fb;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#09090b;">First Sale Lab</p>
          <p style="margin:0;font-size:12px;color:#a1a1aa;">Free forever · Built for complete beginners</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Welcome email error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
