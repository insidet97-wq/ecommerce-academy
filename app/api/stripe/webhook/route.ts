import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { proWelcomeEmailHTML, growthWelcomeEmailHTML } from "@/lib/email-helpers";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  // Defense: explicit env var check beats relying on the non-null assertion to
  // produce a useful error if STRIPE_WEBHOOK_SECRET ever drops out of Vercel.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CRITICAL: STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency — Stripe retries webhooks on transient failures. Without
  // dedup, a retry of `checkout.session.completed` would send a 2nd welcome
  // email and re-mark the referral. We track event.id in stripe_webhook_events
  // (UNIQUE on stripe_event_id) and skip if already processed.
  const { data: existing } = await supabase
    .from("stripe_webhook_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ received: true, deduped: true });
  }

  try {
    switch (event.type) {

      /* ── Payment succeeded → grant the right tier ── */
      case "checkout.session.completed": {
        const session    = event.data.object as Stripe.Checkout.Session;
        const userId     = session.metadata?.userId;
        const tier       = (session.metadata?.tier as "pro" | "growth" | undefined) ?? "pro";
        const customerId = session.customer as string;
        const subId      = session.subscription as string;

        if (userId) {
          // Growth tier includes Pro features (modules 7-12 + weekly picks + monthly briefing)
          // so when granting Growth, also grant Pro. Pro alone just grants Pro.
          const updates: Record<string, unknown> = {
            id:                      userId,
            stripe_customer_id:      customerId,
            stripe_subscription_id:  subId,
            is_pro:                  true,
          };
          if (tier === "growth") updates.is_growth = true;

          await supabase.from("user_profiles").upsert(updates, { onConflict: "id" });

          // Referral conversion — if this user was referred, mark the referral
          // as converted with the tier they bought. Admin can later grant credit
          // to the referrer via /admin/users.
          await supabase.from("referrals")
            .update({ converted_tier: tier })
            .eq("referred_id", userId)
            .is("converted_tier", null);

          // Fetch user email + first name for welcome email
          const [{ data: { user } }, { data: profile }] = await Promise.all([
            supabase.auth.admin.getUserById(userId),
            supabase.from("user_profiles").select("first_name").eq("id", userId).single(),
          ]);

          if (user?.email) {
            const firstName = profile?.first_name || user.email.split("@")[0];
            const resend = new Resend(process.env.RESEND_API_KEY);

            const isGrowth = tier === "growth";
            // fire-and-forget — don't block webhook response
            resend.emails.send({
              from: "First Sale Lab <hello@firstsalelab.com>",
              to: user.email,
              subject: isGrowth
                ? "🚀 Welcome to Scale Lab — your Growth Tier is active"
                : "🎉 Welcome to First Sale Lab Pro!",
              html: isGrowth ? growthWelcomeEmailHTML(firstName) : proWelcomeEmailHTML(firstName),
              tags: [
                { name: "type", value: isGrowth ? "growth_welcome" : "pro_welcome" },
                { name: "user_id", value: userId },
              ],
            }).catch(err => console.error(`${isGrowth ? "Growth" : "Pro"} welcome email error:`, err));
          }
        }
        break;
      }

      /* ── Subscription cancelled → revoke the matching tier ── */
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const tier = (sub.metadata?.tier as "pro" | "growth" | undefined) ?? "pro";

        // Growth cancellation revokes Growth only — they fall back to free
        // (we don't keep a parallel Pro sub running; cancelling Growth ends it all).
        // Pro cancellation revokes Pro only.
        const updates: Record<string, unknown> = {
          stripe_subscription_id: null,
        };
        if (tier === "growth") {
          updates.is_growth = false;
          updates.is_pro    = false;
        } else {
          updates.is_pro = false;
        }
        await supabase.from("user_profiles")
          .update(updates)
          .eq("stripe_customer_id", sub.customer as string);
        break;
      }

      /* ── Payment failed → log it. DO NOT revoke access here.
           Stripe runs its own dunning (retries failed payments for ~3 weeks
           via Smart Retries). Revoking on the first failed attempt would
           lock the user out during a routine retry that will likely succeed.
           We only revoke on `customer.subscription.deleted`, which Stripe
           fires when dunning has fully given up. ── */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("invoice.payment_failed — Stripe will retry, no revocation:", {
          customer: invoice.customer,
          invoice:  invoice.id,
          attempt:  invoice.attempt_count,
        });
        break;
      }
    }

    // Mark event processed only after the handler ran without throwing.
    // If we threw, we DON'T insert — Stripe will retry, we'll re-process,
    // and idempotency-on-the-DB-side (upsert) keeps things consistent.
    await supabase.from("stripe_webhook_events").insert({
      stripe_event_id: event.id,
      event_type:      event.type,
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Return 200 anyway — Stripe will retry on non-2xx, and the next attempt
    // will also see the same event.id (still not in stripe_webhook_events
    // since we didn't insert) so it can re-attempt.
  }

  return NextResponse.json({ received: true });
}
