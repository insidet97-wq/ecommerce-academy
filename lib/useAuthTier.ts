"use client";

/**
 * Lightweight client-side hook that returns the current user's tier:
 *   "unknown" → loading
 *   "anon"    → not logged in
 *   "free"    → logged in, no Pro/Growth
 *   "pro"     → has is_pro
 *   "growth"  → has is_growth (or admin email)
 *
 * Used by AI tool components (Ad Copywriter, UGC Brief, Ad Auditor)
 * to render either the locked upgrade card or the actual tool.
 */

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { isAdmin } from "./admin";

export type AuthTier = "unknown" | "anon" | "free" | "pro" | "growth";

export function useAuthTier(): AuthTier {
  const [tier, setTier] = useState<AuthTier>("unknown");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) { setTier("anon"); return; }
      if (isAdmin(user.email)) { setTier("growth"); return; }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_pro, is_growth")
        .eq("id", user.id)
        .single();
      if (!active) return;

      if (profile?.is_growth)   setTier("growth");
      else if (profile?.is_pro) setTier("pro");
      else                      setTier("free");
    })();
    return () => { active = false; };
  }, []);

  return tier;
}
