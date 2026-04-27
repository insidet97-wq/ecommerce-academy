import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/email-helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/resend
 *
 * Handles email lifecycle events from Resend (email.sent, email.delivered,
 * email.opened, email.clicked, email.bounced, email.complained).
 *
 * Each event is logged to `email_events` so we can answer questions like:
 *   - what % of welcome emails get opened?
 *   - which CTA links get clicked most?
 *   - which user_ids hard-bounced and need cleanup?
 *
 * SQL migration required (run once in Supabase SQL editor):
 *   CREATE TABLE email_events (
 *     id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     event_type   text NOT NULL,
 *     resend_id    text,
 *     to_email     text,
 *     user_id      uuid,
 *     email_type   text,
 *     subject      text,
 *     click_url    text,
 *     created_at   timestamptz NOT NULL DEFAULT now()
 *   );
 *   CREATE INDEX email_events_user_id_idx    ON email_events (user_id);
 *   CREATE INDEX email_events_email_type_idx ON email_events (email_type);
 *   CREATE INDEX email_events_event_type_idx ON email_events (event_type);
 *
 * Webhook setup in Resend dashboard:
 *   1. Go to https://resend.com/webhooks → Add Endpoint
 *   2. URL: https://www.firstsalelab.com/api/webhooks/resend
 *   3. Subscribe to: email.delivered, email.opened, email.clicked,
 *      email.bounced, email.complained (skip email.sent — too noisy)
 *   4. Copy the signing secret → set as RESEND_WEBHOOK_SECRET env var
 *
 * Verification: Resend signs each request with HMAC SHA256 of the raw body
 * using the signing secret. We verify in constant time using svix-style
 * header `svix-signature` (Resend uses Svix under the hood).
 */
export async function POST(request: Request) {
  // Read body as text first so we can verify signature
  const rawBody = await request.text();

  // Optional signature verification — only if secret is configured
  const signingSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (signingSecret) {
    const svixId        = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    // Compute HMAC SHA256 — Svix signature format is "v1,<base64-hmac>"
    const signedPayload = `${svixId}.${svixTimestamp}.${rawBody}`;
    const secretBytes = signingSecret.startsWith("whsec_")
      ? Buffer.from(signingSecret.slice(6), "base64")
      : Buffer.from(signingSecret, "utf8");

    const crypto = await import("node:crypto");
    const expected = crypto.createHmac("sha256", secretBytes).update(signedPayload).digest("base64");

    // svix-signature can contain multiple comma-separated "v1,<sig>" pairs
    const signatures = svixSignature.split(" ").map(s => s.split(",")[1]);
    const valid = signatures.some(s => {
      try {
        const a = Buffer.from(s, "base64");
        const b = Buffer.from(expected, "base64");
        return a.length === b.length && crypto.timingSafeEqual(a, b);
      } catch {
        return false;
      }
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: { type: string; data?: { email_id?: string; to?: string[]; subject?: string; tags?: { name: string; value: string }[]; click?: { link?: string } } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const data = payload.data ?? {};

  // Pull user_id and type from tags (we set these when sending)
  const tagMap: Record<string, string> = {};
  (data.tags ?? []).forEach(t => { tagMap[t.name] = t.value; });

  const toEmail = data.to?.[0] ?? null;

  const { error } = await supabase.from("email_events").insert({
    event_type: payload.type,
    resend_id:  data.email_id  ?? null,
    to_email:   toEmail,
    user_id:    tagMap.user_id ?? null,
    email_type: tagMap.type    ?? null,
    subject:    data.subject   ?? null,
    click_url:  data.click?.link ?? null,
  });

  if (error) {
    console.error("Resend webhook insert error:", error);
    // Don't 500 — Resend retries indefinitely on non-2xx, and a one-off DB
    // hiccup shouldn't cause a flood. Log and acknowledge.
    return NextResponse.json({ ok: true, warning: error.message });
  }

  return NextResponse.json({ ok: true });
}
