import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/users/[userId]/growth
 * Body: { is_growth: boolean }
 *
 * Manually grants or revokes Scale Lab (Growth) for a user. Used by admin
 * to comp friends/influencers, or to revoke after refunds outside Stripe.
 *
 * When granting Growth, also sets is_pro = true (Growth includes Pro).
 *
 * Note: this does NOT touch Stripe. If the user has an active subscription,
 * setting is_growth=false here will be overwritten the next time the webhook
 * fires. Cancel the subscription in the Stripe dashboard for permanent revoke.
 *
 * Auth: requires Bearer token of an admin user.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user } } = await admin.auth.getUser(token);
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const body = await request.json().catch(() => ({}));
  const isGrowth = body.is_growth === true;

  // Granting Growth implies Pro. Revoking Growth leaves is_pro untouched
  // (admin can revoke Pro separately via /pro endpoint if they want).
  const updates: Record<string, unknown> = { id: userId, is_growth: isGrowth };
  if (isGrowth) updates.is_pro = true;

  const { error } = await admin
    .from("user_profiles")
    .upsert(updates, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, is_growth: isGrowth });
}
