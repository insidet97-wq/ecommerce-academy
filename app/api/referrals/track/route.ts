import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * POST /api/referrals/track
 * Body: { referralCode: string }
 *
 * Called from the signup page when a user just signed up via a ?ref=CODE link.
 * Looks up the referrer (user with that code) and creates a `referrals` row
 * linking the just-signed-up user (taken from the bearer token, NOT the body)
 * to the referrer.
 *
 * Auth: bearer token required. The referredUserId is taken from the token,
 * which prevents an attacker from creating false referral attributions
 * (e.g. crediting their code with someone else's signup).
 */
export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const referralCode = String(body?.referralCode ?? "").toLowerCase().trim();

  if (!/^[a-z0-9]{4,12}$/.test(referralCode)) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
  }

  // Find the referrer
  const { data: referrer } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("referral_code", referralCode)
    .maybeSingle();

  if (!referrer) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  }
  if (referrer.id === user.id) {
    return NextResponse.json({ error: "Can't refer yourself" }, { status: 400 });
  }

  // Insert (UNIQUE on referred_id will reject duplicates silently)
  const { error } = await supabase.from("referrals").insert({
    referrer_id:   referrer.id,
    referred_id:   user.id,
    referral_code: referralCode,
  });

  if (error && !error.message.includes("duplicate")) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
