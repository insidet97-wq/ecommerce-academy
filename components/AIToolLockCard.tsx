"use client";

/**
 * Shared lock card for AI tools (Ad Copywriter, UGC Brief, Ad Audit, etc.).
 *
 * Renders for free / anonymous users. Shows the tool's value prop and a
 * single CTA that goes to /signup or /upgrade.
 *
 * Pro and Growth users skip this entirely (the tool itself renders).
 */

import Link from "next/link";
import { Icon, type IconName } from "./Icon";

export type AuthState = "unknown" | "anon" | "free" | "pro" | "growth";

export default function AIToolLockCard({
  authState,
  icon,
  label,
  tagline,
  bullets,
}: {
  authState: AuthState;
  icon:      IconName;
  label:     string;
  tagline:   string;
  bullets:   { i: IconName; t: string }[];
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
        <div style={{ display: "inline-flex", padding: 14, borderRadius: 14, background: "rgba(250,204,21,0.1)", color: "#fde68a", marginBottom: 14 }}>
          <Icon name="lock" size={24} strokeWidth={1.75} />
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#fde68a", marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
          <Icon name="sparkles" size={12} strokeWidth={2} /> Pro · <Icon name={icon} size={12} strokeWidth={2} /> {label}
        </p>
        <h3 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 10, lineHeight: 1.2 }}>
          {tagline}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 22, maxWidth: 480, margin: "16px auto 22px" }}>
          {bullets.map((b, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(253,224,71,0.15)", borderRadius: 10, padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#fde68a", display: "inline-flex" }}><Icon name={b.i} size={18} strokeWidth={1.75} /></span>
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
          Pro members: 5 runs/day · Scale Lab members: 20 runs/day
        </p>
      </div>
    </div>
  );
}
