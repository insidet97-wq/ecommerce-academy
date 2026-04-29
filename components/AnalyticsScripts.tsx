"use client";

/**
 * AnalyticsScripts — gates GA4 + AdSense behind cookie consent.
 *
 * Reads `fsl_cookie_consent` from localStorage:
 *   - "all"        → render both GA4 and AdSense scripts
 *   - "essential"  → render neither (banner accepted essential-only)
 *   - undefined    → render neither (no choice yet, treat as no consent)
 *
 * Listens for the `fsl-cookie-consent-changed` CustomEvent so the scripts
 * load (or stay unloaded) the moment the user clicks an option in the
 * banner — no full reload required.
 *
 * Vercel Analytics is loaded directly in layout.tsx because it's
 * cookieless and GDPR-compliant by default (no consent required).
 */

import { useEffect, useState } from "react";
import Script from "next/script";

type Consent = "all" | "essential" | null;

export default function AnalyticsScripts() {
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    // Initial read
    setConsent(readConsent());

    // Re-check whenever the banner dispatches a change event
    const handler = () => setConsent(readConsent());
    window.addEventListener("fsl-cookie-consent-changed", handler);
    return () => window.removeEventListener("fsl-cookie-consent-changed", handler);
  }, []);

  if (consent !== "all") return null;

  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-VT4RZ3JB6L"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-VT4RZ3JB6L');
        `}
      </Script>

      {/* Google AdSense */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1382028135058819"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}

function readConsent(): Consent {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem("fsl_cookie_consent");
  return v === "all" || v === "essential" ? v : null;
}
