import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 *
 * Returns the full user list (admin-only). Each row combines:
 *   - auth.users (email)
 *   - user_profiles (first_name, is_pro, streak, last_active, stripe_customer_id)
 *   - user_progress (completion count)
 *
 * Auth: requires Bearer token of an admin user.
 */
export async function GET(request: Request) {
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

  // Pull auth users (email + created_at), profiles, and progress in parallel
  const [authRes, profilesRes, progressRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("user_profiles").select("id, first_name, is_pro, streak_days, last_active, stripe_customer_id, track, goal"),
    admin.from("user_progress").select("user_id, module_id"),
  ]);

  const profilesById = new Map<string, {
    first_name: string | null;
    is_pro: boolean | null;
    streak_days: number | null;
    last_active: string | null;
    stripe_customer_id: string | null;
    track: string | null;
    goal: string | null;
  }>();
  (profilesRes.data ?? []).forEach(p => profilesById.set(p.id, p));

  const completionsByUser = new Map<string, number>();
  (progressRes.data ?? []).forEach((r: { user_id: string }) => {
    completionsByUser.set(r.user_id, (completionsByUser.get(r.user_id) ?? 0) + 1);
  });

  const users = (authRes.data?.users ?? []).map(u => {
    const p = profilesById.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      first_name: p?.first_name ?? null,
      is_pro: p?.is_pro ?? false,
      streak_days: p?.streak_days ?? 0,
      last_active: p?.last_active ?? null,
      track: p?.track ?? null,
      goal: p?.goal ?? null,
      stripe_customer_id: p?.stripe_customer_id ?? null,
      completions: completionsByUser.get(u.id) ?? 0,
    };
  })
  // Newest signups first
  .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  return NextResponse.json({ users });
}
