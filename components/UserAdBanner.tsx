"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import AdBanner from "./AdBanner";

/**
 * UserAdBanner — convenience wrapper around <AdBanner /> for public pages
 * where we don't already know the user's Pro status.
 *
 * Fetches the auth + Pro state on mount, then renders AdBanner with the
 * correct isPro value:
 *   - Anonymous → ad shown
 *   - Free logged-in → ad shown
 *   - Pro / admin → ad hidden
 *
 * On the dashboard and module pages we already have isPro in state, so
 * we use the raw AdBanner directly there.
 */
interface Props {
  slot: string;
  format?: string;
  style?: React.CSSProperties;
}

export default function UserAdBanner({ slot, format, style }: Props) {
  const [isPro, setIsPro] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) { setLoaded(true); return; } // anonymous = free
      if (isAdmin(user.email)) { setIsPro(true); setLoaded(true); return; }
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_pro")
        .eq("id", user.id)
        .single();
      if (!active) return;
      setIsPro(profile?.is_pro ?? false);
      setLoaded(true);
    })();
    return () => { active = false; };
  }, []);

  // Wait for the auth check before rendering — prevents Pro users from
  // briefly seeing an ad that would then disappear.
  if (!loaded) return null;
  return <AdBanner isPro={isPro} slot={slot} format={format} style={style} />;
}
