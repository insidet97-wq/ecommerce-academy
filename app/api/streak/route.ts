import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Service-role client — bypasses RLS + the protect_user_profile_columns
// trigger so we can write streak_days / last_active. The bearer token below
// is what authenticates the *user*; the service role just gives us the write.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const today = toDateStr(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toDateStr(yesterday);

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("last_active, streak_days")
      .eq("id", user.id)
      .maybeSingle();

    const lastActive: string | null = profile?.last_active ?? null;
    const currentStreak: number = profile?.streak_days ?? 0;

    if (lastActive === today) {
      return NextResponse.json({ streak: currentStreak });
    }

    const newStreak = lastActive === yesterdayStr ? currentStreak + 1 : 1;

    await supabase
      .from("user_profiles")
      .update({ last_active: today, streak_days: newStreak })
      .eq("id", user.id);

    return NextResponse.json({ streak: newStreak });
  } catch {
    return NextResponse.json({ streak: 0 });
  }
}
