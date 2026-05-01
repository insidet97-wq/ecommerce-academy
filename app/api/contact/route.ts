import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

const SUBJECT_LABELS: Record<string, string> = {
  general: "General question",
  billing: "Billing or subscription",
  bug:     "Bug report",
  feature: "Feature request or feedback",
  press:   "Press / partnerships",
  other:   "Other",
};

/**
 * POST /api/contact
 * Body: { name, email, subject, message, website (honeypot) }
 *
 * Public endpoint — no auth (anyone can send a contact-form message).
 *
 * Spam defense:
 *   1. Honeypot field "website" — if non-empty, silently 200 without sending.
 *      Real users never see/fill it (off-screen). Bots fill all fields.
 *   2. Length / format validation on every field.
 *   3. Crude per-IP rate limit via x-forwarded-for header (3 per hour).
 *      Not bullet-proof but kills the lazy spam.
 *
 * Forwards to support@firstsalelab.com via Resend with reply-to set to the
 * sender's email so we can hit Reply directly.
 */

// Simple in-memory rate limit store. Survives across requests in a single
// serverless function instance — won't catch a determined attacker but does
// rate-limit naive bot floods. For real DoS protection we'd use a KV store.
const ipHits = new Map<string, number[]>();
const RATE_LIMIT_HOURS    = 1;
const RATE_LIMIT_MAX_HITS = 3;

function rateLimited(ip: string): boolean {
  const now    = Date.now();
  const cutoff = now - RATE_LIMIT_HOURS * 60 * 60 * 1000;
  const hits   = (ipHits.get(ip) ?? []).filter(t => t > cutoff);
  if (hits.length >= RATE_LIMIT_MAX_HITS) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // Honeypot — bots fill the hidden "website" field. Silently 200 without
  // sending so the bot thinks it succeeded and stops retrying.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return NextResponse.json({ success: true });
  }

  const name    = String(body.name    ?? "").trim();
  const email   = String(body.email   ?? "").trim();
  const subject = String(body.subject ?? "general").trim();
  const message = String(body.message ?? "").trim();

  // Validation
  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Please enter your name (2–120 chars)." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (message.length < 20 || message.length > 3000) {
    return NextResponse.json({ error: "Message must be between 20 and 3000 characters." }, { status: 400 });
  }
  const subjectLabel = SUBJECT_LABELS[subject] ?? "General question";

  // Per-IP rate limit
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "You've sent too many messages recently. Please wait an hour and try again." }, { status: 429 });
  }

  // Send via Resend to support@firstsalelab.com with reply-to set to the
  // sender's email — so when the team hits Reply in their inbox, the reply
  // goes to the person who filled the form.
  try {
    await resend.emails.send({
      from:     "First Sale Lab Contact <hello@firstsalelab.com>",
      to:       ["support@firstsalelab.com"],
      replyTo:  email,
      subject:  `[Contact · ${subjectLabel}] from ${name}`,
      tags: [
        { name: "type",            value: "contact_form" },
        { name: "contact_subject", value: subject },
      ],
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;border:1px solid #e5e7eb;">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #f4f4f5;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7c3aed;">New contact form submission</p>
          <h1 style="margin:0;font-size:18px;font-weight:800;color:#09090b;letter-spacing:-0.3px;">${escapeHtml(subjectLabel)}</h1>
        </td></tr>
        <tr><td style="padding:24px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:6px 0;font-size:12px;color:#71717a;width:90px;">From</td><td style="padding:6px 0;font-size:13px;color:#09090b;font-weight:600;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:6px 0;font-size:12px;color:#71717a;">Email</td><td style="padding:6px 0;font-size:13px;color:#09090b;"><a href="mailto:${escapeHtml(email)}" style="color:#6366f1;text-decoration:none;">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:6px 0;font-size:12px;color:#71717a;">IP</td><td style="padding:6px 0;font-size:12px;color:#a1a1aa;font-family:monospace;">${escapeHtml(ip)}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 28px 24px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#71717a;letter-spacing:0.06em;text-transform:uppercase;">Message</p>
          <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:10px;padding:16px 18px;font-size:14px;color:#27272a;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</div>
          <p style="margin:14px 0 0;font-size:11px;color:#a1a1aa;">Hit Reply to respond directly — the reply will go to ${escapeHtml(email)}.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Couldn't send message. Try again in a moment." }, { status: 500 });
  }
}

// Minimal HTML escaper for the email template — guards against an attacker
// injecting HTML via the form fields. We never render this on a public page,
// only in the email to support@, but better safe.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
