import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/**
 * POST /api/stripe/checkout
 * Body: { tier?: "pro" | "growth", billing?: "monthly" | "annual" }
 *
 * Creates a Stripe Checkout session for the AUTHENTICATED user. The userId
 * and email are taken from the bearer token, NOT the body — this prevents
 * an attacker from creating checkout sessions on behalf of someone else
 * (which they could then social-engineer into a phishing flow).
 *
 * Tier × billing combinations:
 *   tier=pro,    billing=monthly → STRIPE_PRICE_ID                  ($19/mo)
 *   tier=pro,    billing=annual  → STRIPE_PRICE_ID_ANNUAL           ($190/yr)
 *   tier=growth, billing=monthly → STRIPE_PRICE_ID_GROWTH           ($49/mo)
 *   tier=growth, billing=annual  → STRIPE_PRICE_ID_GROWTH_ANNUAL    ($490/yr)
 *
 * Stripe metadata.userId / metadata.tier flow through to the webhook.
 */
export async function POST(req: Request) {
  try {
    // Auth — bearer token is the only source of truth for who's checking out
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Log in required" }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user?.email) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const requestedTier:    "pro" | "growth"      = body.tier    === "growth" ? "growth" : "pro";
    const requestedBilling: "monthly" | "annual"  = body.billing === "annual" ? "annual" : "monthly";

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
      // customer_email is forced from the bearer token so an attacker can't
      // pre-fill someone else's email
      customer_email: user.email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=${requestedTier}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade`,
      // userId in metadata is forced from the bearer token so the webhook
      // grants Pro/Growth to the actual paying user, never to a body-supplied id
      metadata: { userId: user.id, tier: requestedTier, billing: requestedBilling },
      subscription_data: { metadata: { userId: user.id, tier: requestedTier, billing: requestedBilling } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
