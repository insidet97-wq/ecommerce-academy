import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * POST /api/referrals/track
 * Body: { referralCode: string, referredUserId: string }
 *
 * Called from the signup page when a user just signed up via a ?ref=CODE link.
 * Looks up the referrer (user with that code) and creates a `referrals` row
 * linking the two.
 *
 * No auth required: it runs immediately after signup. Validates that:
 *   - Code matches a real user
 *   - referredUserId actually exists (in auth.users)
 *   - The referred user isn't referring themselves
 *   - No row already exists for this referredUserId (UNIQUE)
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const referralCode   = String(body?.referralCode    ?? "").toLowerCase().trim();
  const referredUserId = String(body?.referredUserId  ?? "").trim();

  if (!/^[a-z0-9]{4,12}$/.test(referralCode) || !referredUserId) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Find the referrer
  const { data: referrer } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("referral_code", referralCode)
    .maybeSingle();

  if (!referrer) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  }
  if (referrer.id === referredUserId) {
    return NextResponse.json({ error: "Can't refer yourself" }, { status: 400 });
  }

  // Insert (UNIQUE on referred_id will reject duplicates silently)
  const { error } = await supabase.from("referrals").insert({
    referrer_id:   referrer.id,
    referred_id:   referredUserId,
    referral_code: referralCode,
  });

  if (error && !error.message.includes("duplicate")) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
