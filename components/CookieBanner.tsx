"use client";

/**
 * CookieBanner — GDPR / ePrivacy consent banner.
 *
 * Shows a sticky bottom banner on first visit (no `fsl_cookie_consent` in
 * localStorage). Two buttons:
 *   - "Accept all"     → GA4 + AdSense load
 *   - "Essential only" → only Supabase auth + Stripe checkout cookies
 *
 * Persists the choice to localStorage and dispatches a `fsl-cookie-consent-changed`
 * event so AnalyticsScripts can react without a full page reload.
 *
 * Users can change their choice later from /settings (a "Cookie preferences"
 * row will be added there in a follow-up).
 */

import { useEffect, useState } from "react";
import Link from "next/link";

type Consent = "all" | "essential" | null;

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem("fsl_cookie_consent");
    if (existing !== "all" && existing !== "essential") {
      // No choice recorded yet — show the banner
      setShow(true);
    }
  }, []);

  function choose(value: Exclude<Consent, null>) {
    try {
      window.localStorage.setItem("fsl_cookie_consent", value);
    } catch {/* private mode etc — silent */}
    window.dispatchEvent(new CustomEvent("fsl-cookie-consent-changed"));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#1c1917",
        color: "#fff",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 20px",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "space-between",
      }}>
        <div style={{ flex: "1 1 320px", minWidth: 280 }}>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.85)" }}>
            🍪 We use cookies to keep you logged in and process payments. With your permission, we&apos;d also use Google Analytics
            (to understand how the site is used) and Google AdSense (to show ads to free users). You can change this any time
            in <Link href="/privacy" style={{ color: "#a78bfa", textDecoration: "underline", textUnderlineOffset: 2 }}>your privacy settings</Link>.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
          <button
            onClick={() => choose("essential")}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: "1.5px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
              letterSpacing: "-0.1px",
            }}
          >
            Essential only
          </button>
          <button
            onClick={() => choose("all")}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #7c3aed)",
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
              letterSpacing: "-0.1px",
            }}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
