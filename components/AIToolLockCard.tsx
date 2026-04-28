"use client";

/**
 * Shared lock card for AI tools (Ad Copywriter, UGC Brief, Ad Audit).
 *
 * Renders for free / anonymous users. Shows the tool's value prop and a
 * single CTA that goes to /signup or /upgrade.
 *
 * Pro and Growth users skip this entirely (the tool itself renders).
 */

import Link from "next/link";

export type AuthState = "unknown" | "anon" | "free" | "pro" | "growth";

export default function AIToolLockCard({
  authState,
  emoji,
  label,
  tagline,
  bullets,
}: {
  authState: AuthState;
  emoji:    string;
  label:    string;
  tagline:  string;
  bullets:  { e: string; t: string }[];
}) {
  if (authState === "unknown") {
    return <div className="spinner" style={{ margin: "40px auto" }} />;
  }
  if (authState === "pro" || authState === "growth") return null;

  // Anonymous OR free user
  return (
    <div style={{ background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)", border: "1.5px solid rgba(250,204,21,0.4)", borderRadius: 18, padding: "32px 28px", position: "relative", overflow: "hidden" }}>
      <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(250,204,21,0.18) 0%, transparent 70%)" }} />
      <div style={{ position: "relative", textAlign: "center" }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>🔒</p>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#fde68a", marginBottom: 10 }}>
          ✨ Pro · {emoji} {label}
        </p>
        <h3 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 10, lineHeight: 1.2 }}>
          {tagline}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 22, maxWidth: 480, margin: "16px auto 22px" }}>
          {bullets.map((b, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(253,224,71,0.15)", borderRadius: 10, padding: "10px 8px" }}>
              <p style={{ fontSize: 18, marginBottom: 4 }}>{b.e}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{b.t}</p>
            </div>
          ))}
        </div>

        <Link
          href={authState === "anon" ? "/signup" : "/upgrade"}
          style={{ display: "inline-block", background: "linear-gradient(135deg, #facc15, #f59e0b)", color: "#1c1917", fontWeight: 800, fontSize: 14, padding: "13px 28px", borderRadius: 12, textDecoration: "none", boxShadow: "0 4px 16px rgba(250,204,21,0.3)" }}
        >
          {authState === "anon" ? "Sign up free →" : "Upgrade to Pro — $19/mo →"}
        </Link>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 12 }}>
          Pro members: 5 runs/day · Scale Lab members: 50 runs/day
        </p>
      </div>
    </div>
  );
}
