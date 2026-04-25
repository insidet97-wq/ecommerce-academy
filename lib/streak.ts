import { supabase } from "./supabase";

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function updateStreak(userId: string): Promise<number> {
  try {
    const today = toDateStr(new Date());

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("last_active, streak_days")
      .eq("id", userId)
      .single();

    const lastActive: string | null = profile?.last_active ?? null;
    const currentStreak: number = profile?.streak_days ?? 0;

    // Already updated today — no change needed
    if (lastActive === today) return currentStreak;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toDateStr(yesterday);

    const newStreak = lastActive === yesterdayStr ? currentStreak + 1 : 1;

    await supabase
      .from("user_profiles")
      .update({ last_active: today, streak_days: newStreak })
      .eq("id", userId);

    return newStreak;
  } catch {
    return 0;
  }
}
