import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * POST /api/referrals/get-or-create
 *
 * Returns the user's referral code, generating one if none exists.
 * Code format: 6-char base36 (lowercase letters + digits, ~2 billion combos).
 *
 * Idempotent: subsequent calls return the existing code.
 *
 * SQL migration required:
 *   ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS referral_code text;
 *   CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_referral_code_idx
 *     ON user_profiles (referral_code);
 *
 *   CREATE TABLE IF NOT EXISTS referrals (
 *     id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     referrer_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *     referred_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *     referral_code   text NOT NULL,
 *     converted_tier  text,
 *     credit_granted  boolean NOT NULL DEFAULT false,
 *     created_at      timestamptz NOT NULL DEFAULT now(),
 *     UNIQUE (referred_id)
 *   );
 *   CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON referrals (referrer_id);
 */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  // Check existing
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("referral_code")
    .eq("id", user.id)
    .single();

  if (profile?.referral_code) {
    return NextResponse.json({ code: profile.referral_code });
  }

  // Generate a unique 6-char code with up to 5 retries (collision is essentially zero at this scale).
  let code = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = Math.random().toString(36).slice(2, 8); // 6 chars
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("referral_code", candidate)
      .maybeSingle();
    if (!existing) { code = candidate; break; }
  }
  if (!code) return NextResponse.json({ error: "Couldn't generate a unique code, try again" }, { status: 500 });

  const { error } = await supabase
    .from("user_profiles")
    .upsert({ id: user.id, referral_code: code }, { onConflict: "id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ code });
}
