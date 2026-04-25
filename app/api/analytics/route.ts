import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [
    { count: totalUsers },
    { data: completions },
    { data: profiles },
  ] = await Promise.all([
    admin.from("user_profiles").select("*", { count: "exact", head: true }),
    admin.from("user_progress").select("module_id"),
    admin.from("user_profiles").select("streak_days, last_active, created_at"),
  ]);

  // Completions per module
  const perModule: Record<number, number> = {};
  for (let i = 1; i <= 12; i++) perModule[i] = 0;
  (completions ?? []).forEach((r: { module_id: number }) => {
    perModule[r.module_id] = (perModule[r.module_id] ?? 0) + 1;
  });

  // Active today
  const today = new Date().toISOString().split("T")[0];
  const activeToday = (profiles ?? []).filter(
    (p: { last_active: string | null }) => p.last_active === today
  ).length;

  // Active this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];
  const activeThisWeek = (profiles ?? []).filter(
    (p: { last_active: string | null }) => p.last_active && p.last_active >= weekAgoStr
  ).length;

  // Signups last 7 days
  const signupsThisWeek = (profiles ?? []).filter(
    (p: { created_at: string | null }) => p.created_at && p.created_at >= weekAgo.toISOString()
  ).length;

  // Highest streak
  const maxStreak = Math.max(
    0,
    ...(profiles ?? []).map((p: { streak_days: number | null }) => p.streak_days ?? 0)
  );

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    activeToday,
    activeThisWeek,
    signupsThisWeek,
    maxStreak,
    perModule,
    totalCompletions: (completions ?? []).length,
  });
}
