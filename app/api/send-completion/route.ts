import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const MODULES: Record<number, { emoji: string; title: string; duration: string; description: string }> = {
  1:  { emoji: "🎮", title: "The Rules of the Game",         duration: "~20 min", description: "Understand how ecommerce works before spending $1." },
  2:  { emoji: "🎯", title: "Find Your Niche",               duration: "~25 min", description: "Choose a specific, passionate, profitable niche." },
  3:  { emoji: "🏆", title: "Find Your Winning Product",     duration: "~30 min", description: "Validate one product with the 3X margin rule." },
  4:  { emoji: "🧠", title: "Know Your Customer",            duration: "~25 min", description: "Build a detailed customer avatar." },
  5:  { emoji: "🛒", title: "Build Your Shopify Store",      duration: "~45 min", description: "Launch a clean, professional store with trust signals." },
  6:  { emoji: "⚡", title: "Build Your First Sales Funnel", duration: "~35 min", description: "A focused landing page + upsell for your hero product." },
  7:  { emoji: "📱", title: "Drive Traffic: TikTok Organic", duration: "~30 min", description: "Get eyes on your product for free using TikTok." },
  8:  { emoji: "📣", title: "Run Your First Paid Ad",        duration: "~40 min", description: "Launch a small Meta or TikTok ad campaign." },
  9:  { emoji: "📈", title: "Conversion Optimisation",       duration: "~30 min", description: "Squeeze more sales out of the traffic you have." },
  10: { emoji: "📧", title: "Build Your Email List",         duration: "~35 min", description: "Own a direct line to your audience — forever." },
  11: { emoji: "💰", title: "Make Your First Sale",          duration: "~20 min", description: "Get everything in place and land your first transaction." },
  12: { emoji: "🚀", title: "Scale and Grow",                duration: "~25 min", description: "Add recurring income, a second product, a second channel." },
};

const MILESTONE_COPY: Record<number, string> = {
  1:  "Strong start. Most people never even begin.",
  2:  "Two down. You already know more than most beginners.",
  3:  "You're a quarter of the way there.",
  4:  "Solid foundations. The real building starts now.",
  5:  "Your store is taking shape. Keep going.",
  6:  "Halfway. You're ahead of 90% of people who try this.",
  7:  "Traffic is coming. Now we convert it.",
  8:  "Ads are live. This is where businesses are built.",
  9:  "Three modules from the finish line. Don't stop.",
  10: "You own a direct line to your audience now.",
  11: "One module left. Your first sale is this close.",
};

export async function POST(req: Request) {
  try {
    const { firstName, email, completedModuleId } = await req.json();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://firstsalelab.com";
    const done = MODULES[completedModuleId];
    const isLast = completedModuleId === 12;
    const next = !isLast ? MODULES[completedModuleId + 1] : null;
    const milestone = MILESTONE_COPY[completedModuleId] ?? "Keep the momentum going.";

    await resend.emails.send({
      from: "First Sale Lab <hello@firstsalelab.com>",
      to: email,
      subject: isLast
        ? `🏆 You've completed First Sale Lab, ${firstName}!`
        : `✅ Module ${completedModuleId} complete — here's what's next`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:${isLast ? "#065f46" : "#312e81"};border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
          <div style="font-size:48px;line-height:1;margin-bottom:14px;">${isLast ? "🏆" : "✅"}</div>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">
            ${isLast ? "Course complete!" : `Module ${completedModuleId} complete!`}
          </h1>
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.6);">
            ${isLast ? `You've finished all 12 modules, ${firstName}.` : `${done?.emoji ?? ""} ${done?.title ?? ""}`}
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:32px 40px;">

          <!-- Milestone message -->
          <div style="background:#f8f8fb;border-left:3px solid #6366f1;border-radius:0 12px 12px 0;padding:14px 18px;margin-bottom:28px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#3f3f46;line-height:1.6;font-style:italic;">"${milestone}"</p>
          </div>

          ${isLast ? `
          <!-- Course complete -->
          <p style="margin:0 0 20px;font-size:15px;color:#52525b;line-height:1.7;">
            You've done something most people never do — you finished. You now have everything you need to launch a real ecommerce business.
          </p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${siteUrl}/dashboard"
              style="display:inline-block;background:#059669;color:#fff;font-weight:800;font-size:15px;padding:15px 40px;border-radius:14px;text-decoration:none;letter-spacing:-0.2px;">
              View Your Certificate 🏆
            </a>
          </div>
          ` : `
          <!-- Progress -->
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#09090b;">Your progress</p>
          <div style="background:#f4f4f5;border-radius:99px;height:8px;margin-bottom:6px;">
            <div style="background:linear-gradient(90deg,#6366f1,#7c3aed);height:8px;border-radius:99px;width:${Math.round((completedModuleId / 12) * 100)}%;"></div>
          </div>
          <p style="margin:0 0 28px;font-size:12px;color:#a1a1aa;">${completedModuleId} of 12 modules complete · ${Math.round((completedModuleId / 12) * 100)}%</p>

          <!-- Next module -->
          ${next ? `
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#09090b;">Up next</p>
          <div style="background:#f8f8fb;border:1.5px solid #e4e4e7;border-radius:16px;padding:20px 24px;margin-bottom:28px;">
            <div style="margin-bottom:12px;">
              <span style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6366f1;">Module ${completedModuleId + 1} · ${next.duration}</span>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:28px;">${next.emoji}</span>
              <div>
                <p style="margin:0 0 4px;font-size:16px;font-weight:800;color:#09090b;letter-spacing:-0.3px;">${next.title}</p>
                <p style="margin:0;font-size:13px;color:#a1a1aa;">${next.description}</p>
              </div>
            </div>
          </div>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${siteUrl}/modules/${completedModuleId + 1}"
              style="display:inline-block;background:#6366f1;color:#fff;font-weight:800;font-size:15px;padding:15px 40px;border-radius:14px;text-decoration:none;letter-spacing:-0.2px;">
              Start Module ${completedModuleId + 1} →
            </a>
          </div>
          ` : ""}
          `}

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
    console.error("Completion email error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
