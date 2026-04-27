import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt    = "First Sale Lab — Stop learning. Start selling.";
export const size   = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph image for the entire site.
 * Used by Twitter/X, LinkedIn, Facebook, iMessage, Slack etc. when the
 * landing page is shared.
 *
 * Generated via Next.js ImageResponse (Edge runtime, runs at build/request time).
 * No external font loaded — relies on the system sans default which is fine for
 * a strong dark hero image.
 */
export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #08080f 0%, #1e1b4b 45%, #4c1d95 100%)",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: 300,
            width: 800,
            height: 800,
            background: "radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(167,139,250,0.9)",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(99,102,241,0.18)",
              border: "1.5px solid rgba(99,102,241,0.4)",
              marginBottom: 36,
              display: "flex",
            }}
          >
            ✨ First Sale Lab
          </div>

          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              textAlign: "center",
              marginBottom: 32,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex" }}>Stop learning.</div>
            <div style={{ display: "flex", color: "#c4b5fd" }}>Start selling.</div>
          </div>

          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.65)",
              textAlign: "center",
              maxWidth: 900,
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            12 focused modules · Real tasks · Modules 1–6 free
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.45)", display: "flex" }}>
            firstsalelab.com
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#facc15", display: "flex" }}>
            From zero to first sale →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
