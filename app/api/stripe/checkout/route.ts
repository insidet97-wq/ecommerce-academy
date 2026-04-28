import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/stripe/checkout
 * Body: { userId, email, tier?: "pro" | "growth", billing?: "monthly" | "annual" }
 *
 * Creates a Stripe Checkout session for any tier × billing cycle combination:
 *   tier=pro,    billing=monthly → STRIPE_PRICE_ID                  ($19/mo)
 *   tier=pro,    billing=annual  → STRIPE_PRICE_ID_ANNUAL           ($190/yr — save 17%)
 *   tier=growth, billing=monthly → STRIPE_PRICE_ID_GROWTH           ($49/mo)
 *   tier=growth, billing=annual  → STRIPE_PRICE_ID_GROWTH_ANNUAL    ($490/yr — save 17%)
 *
 * Annual env vars are optional. If unset, the request returns 500 with a
 * clear message — flip them on once you've created the annual prices in Stripe.
 *
 * Stripe metadata.tier and metadata.billing flow through to the webhook.
 */
export async function POST(req: Request) {
  try {
    const { userId, email, tier, billing } = await req.json();
    if (!userId || !email) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const requestedTier:    "pro" | "growth"      = tier    === "growth" ? "growth" : "pro";
    const requestedBilling: "monthly" | "annual"  = billing === "annual" ? "annual" : "monthly";

    const priceId =
      requestedTier === "growth" && requestedBilling === "annual"  ? process.env.STRIPE_PRICE_ID_GROWTH_ANNUAL :
      requestedTier === "growth" && requestedBilling === "monthly" ? process.env.STRIPE_PRICE_ID_GROWTH        :
      requestedTier === "pro"    && requestedBilling === "annual"  ? process.env.STRIPE_PRICE_ID_ANNUAL        :
                                                                     process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      const envName =
        requestedTier === "growth" && requestedBilling === "annual"  ? "STRIPE_PRICE_ID_GROWTH_ANNUAL" :
        requestedTier === "growth" && requestedBilling === "monthly" ? "STRIPE_PRICE_ID_GROWTH"        :
        requestedTier === "pro"    && requestedBilling === "annual"  ? "STRIPE_PRICE_ID_ANNUAL"        :
                                                                       "STRIPE_PRICE_ID";
      return NextResponse.json(
        { error: `Missing Stripe price ID for "${requestedTier}" / "${requestedBilling}". Set ${envName} in env.` },
        { status: 500 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=${requestedTier}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade`,
      metadata: { userId, tier: requestedTier, billing: requestedBilling },
      subscription_data: { metadata: { userId, tier: requestedTier, billing: requestedBilling } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
