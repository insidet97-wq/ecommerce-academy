"use client";

import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────
   AdBanner — shows Google AdSense ads to FREE users only.
   Pro users (isPro = true) see nothing.

   HOW TO USE:
   1. Create an ad unit in your AdSense dashboard
   2. Copy the data-ad-slot value (10-digit number)
   3. Replace the slot prop value where AdBanner is used
   ───────────────────────────────────────────────────────────── */

declare global {
  interface Window { adsbygoogle: unknown[]; }
}

interface AdBannerProps {
  isPro: boolean;
  slot: string;           // AdSense data-ad-slot value
  format?: string;        // "auto" | "horizontal" | "rectangle"
  style?: React.CSSProperties;
}

export default function AdBanner({ isPro, slot, format = "auto", style }: AdBannerProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (isPro || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [isPro]);

  // Pro users see nothing — ad-free is a Pro benefit
  if (isPro) return null;

  return (
    <div style={{
      margin: "20px 0",
      borderRadius: 12,
      overflow: "hidden",
      background: "#f8f8fb",
      border: "1px solid rgba(0,0,0,0.05)",
      minHeight: 90,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-1382028135058819"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
