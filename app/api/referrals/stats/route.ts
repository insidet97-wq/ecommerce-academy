import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * GET /api/referrals/stats
 *
 * Returns the user's referral counts:
 *   - total: how many people signed up via their link
 *   - converted: how many became Pro/Growth
 *   - credit_pending: converted but credit not yet granted by admin
 */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const { data, error } = await supabase
    .from("referrals")
    .select("converted_tier, credit_granted")
    .eq("referrer_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = data ?? [];
  const total          = list.length;
  const converted      = list.filter(r => r.converted_tier).length;
  const creditPending  = list.filter(r => r.converted_tier && !r.credit_granted).length;

  return NextResponse.json({ total, converted, creditPending });
}
