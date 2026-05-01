import { supabase } from "./supabase";

// Streak updates go through /api/streak (service role) because RLS + the
// protect_user_profile_columns trigger now block direct client writes to
// streak_days / last_active. The route uses the user's bearer token to
// confirm identity, then writes via service role.
export async function updateStreak(_userId: string): Promise<number> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return 0;

    const res = await fetch("/api/streak", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return 0;
    const json = await res.json();
    return typeof json.streak === "number" ? json.streak : 0;
  } catch {
    return 0;
  }
}
