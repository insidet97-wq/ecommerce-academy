import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/metrics
 *
 * Business / MRR metrics for the admin dashboard.
 * Owner-facing analytics: tier breakdown, MRR, conversion funnel,
 * recent signups, churn-risk users.
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
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Pull everything in parallel
  const [authRes, profilesRes, progressRes] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from("user_profiles").select("id, is_pro, is_growth, stripe_customer_id, stripe_subscription_id, last_active, created_at"),
    supabase.from("user_progress").select("user_id, module_id, completed_at"),
  ]);

  const users = authRes.data?.users ?? [];
  const profiles = profilesRes.data ?? [];
  const progress = progressRes.data ?? [];

  const totalUsers   = users.length;
  const profilesById = new Map(profiles.map(p => [p.id, p]));

  // Tier counts
  let proCount    = 0;
  let growthCount = 0;
  let freeCount   = 0;
  let activeStripeSubs = 0;

  profiles.forEach(p => {
    if (p.is_growth) growthCount++;
    else if (p.is_pro) proCount++;
    else freeCount++;
    if (p.stripe_subscription_id) activeStripeSubs++;
  });

  // Anonymous auth users without profiles count as free
  const profileIds = new Set(profiles.map(p => p.id));
  const usersWithoutProfile = users.filter(u => !profileIds.has(u.id)).length;
  const totalFree = freeCount + usersWithoutProfile;

  // MRR (monthly run rate, USD)
  const proMRR    = proCount    * 19;
  const growthMRR = growthCount * 49;
  const totalMRR  = proMRR + growthMRR;

  // Recent windows
  const now      = Date.now();
  const dayMs    = 24 * 60 * 60 * 1000;
  const day7Ago  = new Date(now - 7  * dayMs).toISOString();
  const day30Ago = new Date(now - 30 * dayMs).toISOString();
  const today    = new Date().toISOString().split("T")[0];

  const signups7d  = users.filter(u => u.created_at >= day7Ago).length;
  const signups30d = users.filter(u => u.created_at >= day30Ago).length;

  // Active 7d (last_active within 7 days)
  const day7AgoDate = new Date(now - 7 * dayMs).toISOString().split("T")[0];
  const active7d = profiles.filter(p => p.last_active && p.last_active >= day7AgoDate).length;
  const activeToday = profiles.filter(p => p.last_active === today).length;

  // Conversion funnel (signups → completed M1 → completed M6 → completed M12 → completed M24)
  const completionsByUser = new Map<string, Set<number>>();
  progress.forEach(r => {
    const set = completionsByUser.get(r.user_id) ?? new Set<number>();
    set.add(r.module_id);
    completionsByUser.set(r.user_id, set);
  });

  let completedM1  = 0;
  let completedM6  = 0;
  let completedM12 = 0;
  let completedM24 = 0;
  completionsByUser.forEach(set => {
    if (set.has(1))  completedM1++;
    if (set.has(6))  completedM6++;
    if (set.has(12)) completedM12++;
    if (set.has(24)) completedM24++;
  });

  // Churn risk: Pro/Growth users whose last_active is > 14 days ago
  const day14AgoDate = new Date(now - 14 * dayMs).toISOString().split("T")[0];
  const churnRiskCount = profiles.filter(p =>
    (p.is_pro || p.is_growth) && p.last_active && p.last_active < day14AgoDate
  ).length;

  // Recent signups (last 10) — denormalized for quick admin glance
  const recentSignups = users
    .slice()
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 10)
    .map(u => {
      const p = profilesById.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        created_at: u.created_at,
        tier: p?.is_growth ? "growth" : p?.is_pro ? "pro" : "free",
      };
    });

  return NextResponse.json({
    totalUsers,
    tierCounts: { free: totalFree, pro: proCount, growth: growthCount },
    mrr:        { pro: proMRR, growth: growthMRR, total: totalMRR },
    activeStripeSubs,
    signups: { last7Days: signups7d, last30Days: signups30d },
    activity: { activeToday, active7d },
    funnel: {
      signups:           totalUsers,
      completedModule1:  completedM1,
      completedModule6:  completedM6,
      completedModule12: completedM12,
      completedModule24: completedM24,
    },
    churnRiskCount,
    recentSignups,
  });
}
