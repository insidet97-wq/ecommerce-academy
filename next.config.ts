import type { NextConfig } from "next";

/**
 * Defense-in-depth security headers applied to every response.
 *
 * Vercel adds some of these by default but explicit declaration here:
 *  - keeps them under version control
 *  - ensures parity across Vercel + any future host
 *  - makes the security posture auditable from one place
 *
 * Notes:
 *  - X-Frame-Options DENY would break Stripe billing portal embeds; SAMEORIGIN is fine.
 *  - We don't ship a CSP yet because of the inline-style-heavy components and the
 *    AdSense + GA4 + Stripe.js scripts. Adding one is a Medium severity follow-up.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options",   value: "nosniff" },
  { key: "X-Frame-Options",          value: "SAMEORIGIN" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
