import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/stripe/checkout
 * Body: { userId, email, tier?: "pro" | "growth" }
 *
 * Creates a Stripe Checkout session for either tier:
 *   - tier="pro"     → STRIPE_PRICE_ID         ($19/mo)  [default; backwards-compatible]
 *   - tier="growth"  → STRIPE_PRICE_ID_GROWTH  ($49/mo)
 *
 * Stripe metadata.tier flows through to the webhook so it can set
 * the correct flag (is_pro vs is_growth) on user_profiles.
 */
export async function POST(req: Request) {
  try {
    const { userId, email, tier } = await req.json();
    if (!userId || !email) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const requestedTier: "pro" | "growth" = tier === "growth" ? "growth" : "pro";

    const priceId = requestedTier === "growth"
      ? process.env.STRIPE_PRICE_ID_GROWTH
      : process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: `Missing Stripe price ID for tier "${requestedTier}". Set STRIPE_PRICE_ID${requestedTier === "growth" ? "_GROWTH" : ""} in env.` },
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
      metadata: { userId, tier: requestedTier },
      subscription_data: { metadata: { userId, tier: requestedTier } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
