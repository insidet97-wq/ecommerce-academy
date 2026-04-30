"use client";

/**
 * AOVAudit — Scale Lab exclusive (Module 18 fit).
 *
 * User pastes their store / product / cart page URL. Gemini fetches it via
 * url_context and identifies which AOV mechanisms are missing:
 *   1. Order bump
 *   2. Quantity break
 *   3. Bundle
 *   4. Post-purchase upsell
 *   5. Free-shipping threshold
 *   6. Cross-sell
 *   7. Subscription discount
 *
 * For each missing mechanism: expected lift, the exact app/feature to install,
 * and a paste-ready copy template. Plus a top-3 priority recommendation.
 *
 * Free / Pro users see an upgrade card. Anonymous users see a sign-up CTA.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { useAIToolUsage } from "@/lib/useAIToolUsage";
import { Icon, type IconName } from "./Icon";

type Mechanism = {
  mechanism: string;
  present: boolean;
  expected_lift: string;
  what_we_saw: string;
  how_to_add: string;
  copy_template: string;
};
type PriorityItem = { rank: 1 | 2 | 3; mechanism: string; reason: string };
type Audit = {
  summary: string;
  estimated_aov_lift: string;
  current_strengths: string[];
  mechanisms: Mechanism[];
  recommended_priority: PriorityItem[];
};

// Map each mechanism to a Lucide icon
const MECHANISM_ICON: Record<string, IconName> = {
  "Order bump":              "plus",
  "Quantity break":          "hash",
  "Bundle":                  "package",
  "Post-purchase upsell":    "arrow-up-right",
  "Free shipping threshold": "truck",
  "Cross-sell":              "layers",
  "Subscription discount":   "refresh",
};

export default function AOVAudit() {
  const [authState, setAuthState] = useState<"unknown" | "anon" | "free" | "pro" | "growth">("unknown");

  const [url,       setUrl]      = useState("");
  const [auditing,  setAuditing] = useState(false);
  const [audit,     setAudit]    = useState<Audit | null>(null);
  const [error,     setError]    = useState("");
  const { usage, refresh: refreshUsage, bump: bumpUsage } = useAIToolUsage("aov_audit");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) { setAuthState("anon"); return; }
      if (isAdmin(user.email)) { setAuthState("growth"); return; }
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_pro, is_growth")
        .eq("id", user.id)
        .single();
      if (!active) return;
      if (profile?.is_growth) setAuthState("growth");
      else if (profile?.is_pro) setAuthState("pro");
      else setAuthState("free");
    })();
    return () => { active = false; };
  }, []);

  async function handleAudit() {
    if (!url.trim()) return;
    setAuditing(true); setError(""); setAudit(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError("Log in to use AOV Audit."); return; }

      const res = await fetch("/api/ai-tools/aov-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.rateLimited) refreshUsage();
        throw new Error(data.error ?? "Audit failed");
      }
      setAudit(data.audit);
      bumpUsage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed");
    } finally {
      setAuditing(false);
    }
  }

  function reset() { setAudit(null); setError(""); }

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  // ── Locked state ──────────────────────
  if (authState !== "unknown" && authState !== "growth") {
    return (
      <div>
        <div style={{ background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)", border: "1.5px solid rgba(250,204,21,0.4)", borderRadius: 18, padding: "32px 28px", position: "relative", overflow: "hidden" }}>
          <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(250,204,21,0.18) 0%, transparent 70%)" }} />
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{ display: "inline-flex", padding: 14, borderRadius: 14, background: "rgba(250,204,21,0.1)", color: "#fde68a", marginBottom: 14 }}>
              <Icon name="lock" size={24} strokeWidth={1.75} />
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#fde68a", marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              <Icon name="rocket" size={12} strokeWidth={2.5} /> Scale Lab exclusive
            </p>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 10, lineHeight: 1.2 }}>
              AOV Audit — find every missing upsell, bundle, and order bump
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: 22, maxWidth: 480, margin: "0 auto 22px" }}>
              Paste your store URL. AI fetches it and identifies which of the 7 AOV mechanisms you&apos;re missing — with the expected lift, the exact app to install, and paste-ready copy.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 22, maxWidth: 480, margin: "0 auto 22px" }}>
              {([
                { i: "plus",           t: "Order bumps" },
                { i: "package",        t: "Bundles" },
                { i: "arrow-up-right", t: "Post-purchase" },
                { i: "truck",          t: "Free shipping" },
                { i: "layers",         t: "Cross-sells" },
                { i: "refresh",        t: "Subscriptions" },
              ] as const).map((c, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(253,224,71,0.15)", borderRadius: 10, padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#fde68a", display: "inline-flex" }}><Icon name={c.i} size={18} strokeWidth={1.75} /></span>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{c.t}</p>
                </div>
              ))}
            </div>

            <Link
              href={authState === "anon" ? "/signup" : "/upgrade?tier=growth"}
              style={{ display: "inline-block", background: "linear-gradient(135deg, #facc15, #f59e0b)", color: "#1c1917", fontWeight: 800, fontSize: 14, padding: "13px 28px", borderRadius: 12, textDecoration: "none", boxShadow: "0 4px 16px rgba(250,204,21,0.3)" }}
            >
              {authState === "anon" ? "Sign up free →" : "Upgrade to Scale Lab — $49/mo →"}
            </Link>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 12 }}>
              {authState === "anon" ? "Start with the free tier, upgrade when ready" : "Already Pro? Scale Lab unlocks this + more advanced tools"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (authState === "unknown") return <div className="spinner" style={{ margin: "40px auto" }} />;

  // ── Form / result ──────────────────────
  return (
    <div>
      <div style={{ background: "#0c0a09", color: "#fde68a", border: "1px solid rgba(250,204,21,0.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="rocket" size={14} strokeWidth={2} />
          <span><strong>Scale Lab · AOV Audit.</strong> Paste your store URL — AI checks which AOV mechanisms are missing.</span>
        </p>
        {usage && <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>{usage.used} / {usage.limit} runs today</p>}
      </div>

      {!audit ? (
        <>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Store URL</label>
            <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>Best to use a product page or your cart page (where AOV mechanisms live). Public URLs only.</p>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://yourstore.com/products/example"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7", fontSize: 14, color: "#09090b", outline: "none", boxSizing: "border-box" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#0c0a09")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e4e4e7")}
            />
          </div>

          <button
            onClick={handleAudit}
            disabled={auditing || !url.trim()}
            style={{
              width: "100%",
              background: auditing || !url.trim() ? "#e4e4e7" : "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
              color:      auditing || !url.trim() ? "#a1a1aa" : "#fde68a",
              fontWeight: 800, fontSize: 14, padding: "14px 28px", borderRadius: 14, border: "none",
              cursor: auditing || !url.trim() ? "not-allowed" : "pointer", letterSpacing: "-0.2px",
            }}
          >
            {auditing ? "Fetching the page + checking 7 AOV mechanisms…" : "Run AOV Audit →"}
          </button>

          {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 12, textAlign: "center" }}>⚠ {error}</p>}
        </>
      ) : (
        // ── Result ──
        <div>
          {/* Top banner — combined potential lift */}
          <div style={{ background: "#0c0a09", color: "#fff", borderRadius: 14, padding: "20px 22px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fde68a", marginBottom: 8 }}>Untapped AOV potential</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{audit.summary}</p>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: "#facc15", letterSpacing: "-0.5px", lineHeight: 1 }}>{audit.estimated_aov_lift || "—"}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>combined lift</p>
            </div>
          </div>

          {/* Top-3 priority */}
          {audit.recommended_priority.length > 0 && (
            <div style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)", border: "1px solid #ede9fe", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#5b21b6", marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="target" size={14} strokeWidth={2} /> Install in this order
              </p>
              <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {audit.recommended_priority.map((p, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderTop: i === 0 ? "none" : "1px solid #ede9fe" }}>
                    <div style={{ width: 24, height: 24, borderRadius: 99, background: "#7c3aed", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p.rank}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#3b0764", marginBottom: 2 }}>{p.mechanism}</p>
                      <p style={{ fontSize: 12, color: "#6b21a8", lineHeight: 1.55 }}>{p.reason}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Current strengths */}
          {audit.current_strengths.length > 0 && (
            <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#15803d", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="check-circle" size={14} strokeWidth={2} /> Already doing
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#065f46" }}>
                {audit.current_strengths.map((s, i) => <li key={i} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 4 }}>{s}</li>)}
              </ul>
            </div>
          )}

          {/* Per-mechanism breakdown */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>The 7 mechanisms</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {audit.mechanisms.map((m, i) => (
              <div key={i} style={{
                background: m.present ? "#f0fdf4" : "#fff",
                border: `1.5px solid ${m.present ? "#bbf7d0" : "#fde68a"}`,
                borderRadius: 12, padding: "14px 18px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: m.present ? "#dcfce7" : "#fef3c7", color: m.present ? "#15803d" : "#a16207", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={MECHANISM_ICON[m.mechanism] ?? "tag"} size={16} strokeWidth={1.75} />
                  </div>
                  <p style={{ flex: 1, fontSize: 14, fontWeight: 800, color: "#09090b", letterSpacing: "-0.2px", minWidth: 140 }}>{m.mechanism}</p>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, whiteSpace: "nowrap",
                    background: m.present ? "#dcfce7" : "#fef3c7",
                    color:      m.present ? "#15803d" : "#a16207",
                    border: `1px solid ${m.present ? "#86efac" : "#fcd34d"}`,
                  }}>
                    {m.present ? "Already there" : `Missing · ${m.expected_lift}`}
                  </span>
                </div>
                {m.what_we_saw && <p style={{ fontSize: 12, color: "#52525b", lineHeight: 1.55, marginBottom: m.present ? 0 : 8 }}>{m.what_we_saw}</p>}
                {!m.present && m.how_to_add && (
                  <div style={{ background: "#fffbeb", borderLeft: "3px solid #f59e0b", padding: "8px 12px", borderRadius: 6, marginBottom: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#a16207", marginBottom: 2 }}>How to add</p>
                    <p style={{ fontSize: 12, color: "#78350f", lineHeight: 1.55 }}>{m.how_to_add}</p>
                  </div>
                )}
                {!m.present && m.copy_template && (
                  <div style={{ background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 6, padding: "8px 12px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#5b21b6", marginBottom: 2 }}>Copy template</p>
                      <p style={{ fontSize: 12, color: "#3b0764", lineHeight: 1.55, fontStyle: "italic" }}>&ldquo;{m.copy_template}&rdquo;</p>
                    </div>
                    <button onClick={() => copy(m.copy_template)}
                      style={{ flexShrink: 0, background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <Icon name="copy" size={11} strokeWidth={2} /> Copy
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={reset}
            style={{ width: "100%", background: "#fff", border: "1.5px solid #e4e4e7", color: "#52525b", fontWeight: 700, fontSize: 13, padding: "11px 20px", borderRadius: 10, cursor: "pointer" }}>
            ↺ Audit another page
          </button>
        </div>
      )}
    </div>
  );
}
