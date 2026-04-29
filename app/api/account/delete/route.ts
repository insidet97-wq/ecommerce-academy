import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/account/delete
 *
 * Self-serve account deletion (GDPR Article 17 — right to erasure).
 *
 * Steps:
 *   1. Verify bearer token → identify the user
 *   2. Cancel any active Stripe subscription so we don't keep charging
 *   3. Delete the auth.users row via the admin API
 *      → Supabase cascades delete to user_profiles, user_progress,
 *        ai_tool_log, module_qa_log, supplier_validations, referrals (via FK
 *        ON DELETE CASCADE on user_id)
 *   4. Return success — client signs out and redirects to /
 *
 * Things we intentionally retain (legal/operational reasons):
 *   - email_events: anonymised (user_id reference is broken when auth.users
 *     row is gone — the rows still exist for aggregate metrics but no longer
 *     point to a person)
 *   - Stripe customer record: legally required to retain invoice/billing
 *     records for tax purposes (years, depending on jurisdiction). Stripe
 *     keeps these; we keep the customer ID nowhere after deletion.
 */
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Auth gate — get the user from the bearer token. We do not accept a
  // userId in the body; the token is the only source of truth for who's
  // being deleted. (Prevents IDOR — User A can't delete User B's account.)
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  // 2. Cancel any active Stripe subscription so we don't keep billing them
  // after their data is gone. This is best-effort — if Stripe is down or
  // the customer has no subscription, we still proceed with deletion.
  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_customer_id) {
      const subs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "active",
        limit: 10,
      });
      await Promise.all(subs.data.map(s => stripe.subscriptions.cancel(s.id)));
    }
  } catch (err) {
    // Log but don't block deletion — user wants out, we get them out
    console.error("Stripe cleanup during account deletion failed (non-fatal):", err);
  }

  // 3. Delete the auth.users row → Supabase cascades to all tables with
  // ON DELETE CASCADE on user_id (the standard pattern in our schema).
  const { error: deleteErr } = await supabase.auth.admin.deleteUser(user.id);
  if (deleteErr) {
    console.error("Account deletion failed:", deleteErr);
    return NextResponse.json({ error: "Couldn't delete account. Please email support@firstsalelab.com." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
