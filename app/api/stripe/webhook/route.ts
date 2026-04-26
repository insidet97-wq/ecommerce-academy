import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

      /* ── Payment succeeded → grant Pro ── */
      case "checkout.session.completed": {
        const session    = event.data.object as Stripe.CheckoutSession;
        const userId     = session.metadata?.userId;
        const customerId = session.customer as string;
        const subId      = session.subscription as string;
        if (userId) {
          await supabase.from("user_profiles").update({
            is_pro: true,
            stripe_customer_id:      customerId,
            stripe_subscription_id:  subId,
          }).eq("id", userId);
        }
        break;
      }

      /* ── Subscription cancelled → revoke Pro ── */
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase.from("user_profiles").update({
          is_pro: false,
          stripe_subscription_id: null,
        }).eq("stripe_customer_id", sub.customer as string);
        break;
      }

      /* ── Payment failed → revoke Pro ── */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await supabase.from("user_profiles").update({
          is_pro: false,
        }).eq("stripe_customer_id", invoice.customer as string);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
  }

  return NextResponse.json({ received: true });
}
