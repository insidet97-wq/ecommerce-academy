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

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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

      /* ── Payment failed → revoke (treat like cancelled) ── */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // We don't know which tier from invoice alone; revoke both for safety.
        await supabase.from("user_profiles").update({
          is_pro:    false,
          is_growth: false,
        }).eq("stripe_customer_id", invoice.customer as string);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
  }

  return NextResponse.json({ received: true });
}
