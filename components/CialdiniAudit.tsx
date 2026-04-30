"use client";

/**
 * CialdiniAudit — Scale Lab exclusive (Module 19 fit).
 *
 * User pastes their product page or landing page URL. Gemini fetches the
 * page (via url_context) and scores it against Cialdini's 6 principles of
 * influence: Reciprocity, Commitment & Consistency, Social Proof, Authority,
 * Liking, Scarcity.
 *
 * Returns: overall 0-100 score, per-principle 0-10 with what's working /
 * missing / the concrete fix, and the highest-impact next action.
 *
 * Free / Pro users see an upgrade card. Anonymous users see a sign-up CTA.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { useAIToolUsage } from "@/lib/useAIToolUsage";
import { Icon, type IconName } from "./Icon";

type PrincipleScore = {
  principle: string;
  score: number;
  whats_working: string;
  whats_missing: string;
  fix: string;
};
type Audit = {
  summary: string;
  overall_score: number;
  scores: PrincipleScore[];
  highest_impact_fix: string;
};

// Map each principle to a Lucide icon for visual scanability
const PRINCIPLE_ICON: Record<string, IconName> = {
  "Reciprocity":              "gift",
  "Commitment & Consistency": "check-circle",
  "Social Proof":             "users",
  "Authority":                "award",
  "Liking":                   "user",
  "Scarcity":                 "flame",
};

// Color the score chip based on the value
function scoreColor(score: number): { bg: string; color: string; border: string; label: string } {
  if (score >= 8) return { bg: "#ecfdf5", color: "#15803d", border: "#a7f3d0", label: "Strong" };
  if (score >= 5) return { bg: "#fffbeb", color: "#a16207", border: "#fde68a", label: "OK" };
  return                  { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca", label: "Weak" };
}

export default function CialdiniAudit() {
  const [authState, setAuthState] = useState<"unknown" | "anon" | "free" | "pro" | "growth">("unknown");

  const [url,       setUrl]       = useState("");
  const [auditing,  setAuditing]  = useState(false);
  const [audit,     setAudit]     = useState<Audit | null>(null);
  const [error,     setError]     = useState("");
  const { usage, refresh: refreshUsage, bump: bumpUsage } = useAIToolUsage("cialdini_audit");

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
      if (!session?.access_token) { setError("Log in to use Cialdini Audit."); return; }

      const res = await fetch("/api/ai-tools/cialdini-audit", {
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
              Cialdini Audit — score your page on the 6 principles of influence
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: 22, maxWidth: 480, margin: "0 auto 22px" }}>
              Paste your product or landing page URL. AI fetches the page and scores it 0-10 on Reciprocity, Commitment, Social Proof, Authority, Liking, and Scarcity. For each: what&apos;s working, what&apos;s missing, the concrete fix.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 22, maxWidth: 480, margin: "0 auto 22px" }}>
              {([
                { i: "gift",         t: "Reciprocity" },
                { i: "check-circle", t: "Consistency" },
                { i: "users",        t: "Social Proof" },
                { i: "award",        t: "Authority" },
                { i: "user",         t: "Liking" },
                { i: "flame",        t: "Scarcity" },
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
          <span><strong>Scale Lab · Cialdini Audit.</strong> Paste your page URL — AI fetches it and scores all 6 principles.</span>
        </p>
        {usage && <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>{usage.used} / {usage.limit} runs today</p>}
      </div>

      {!audit ? (
        <>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Page URL</label>
            <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>Your own product page, landing page, or sales page. Public URLs only.</p>
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
            {auditing ? "Fetching the page + scoring 6 principles…" : "Run Cialdini Audit →"}
          </button>

          {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 12, textAlign: "center" }}>⚠ {error}</p>}
        </>
      ) : (
        // ── Result ──
        <div>
          {/* Overall score banner */}
          <div style={{ background: "#0c0a09", color: "#fff", borderRadius: 14, padding: "20px 22px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fde68a", marginBottom: 8 }}>Overall persuasion score</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{audit.summary}</p>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <p style={{ fontSize: 40, fontWeight: 900, color: "#facc15", letterSpacing: "-1px", lineHeight: 1 }}>{audit.overall_score}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>out of 100</p>
            </div>
          </div>

          {/* Per-principle scores */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {audit.scores.map((s, i) => {
              const meta = scoreColor(s.score);
              return (
                <div key={i} style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)", borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f5f3ff", color: "#7c3aed", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name={PRINCIPLE_ICON[s.principle] ?? "shield"} size={18} strokeWidth={1.75} />
                    </div>
                    <p style={{ flex: 1, fontSize: 14, fontWeight: 800, color: "#09090b", letterSpacing: "-0.2px" }}>{s.principle}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, whiteSpace: "nowrap" }}>
                      {s.score}/10 · {meta.label}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8, fontSize: 12, lineHeight: 1.6 }}>
                    {s.whats_working && (
                      <div>
                        <span style={{ fontWeight: 700, color: "#15803d" }}>Working: </span>
                        <span style={{ color: "#3f3f46" }}>{s.whats_working}</span>
                      </div>
                    )}
                    {s.whats_missing && (
                      <div>
                        <span style={{ fontWeight: 700, color: "#b91c1c" }}>Missing: </span>
                        <span style={{ color: "#3f3f46" }}>{s.whats_missing}</span>
                      </div>
                    )}
                    {s.fix && (
                      <div style={{ background: "#f5f3ff", borderLeft: "3px solid #7c3aed", padding: "8px 12px", borderRadius: 6, marginTop: 4 }}>
                        <span style={{ fontWeight: 700, color: "#5b21b6" }}>Fix: </span>
                        <span style={{ color: "#3b0764" }}>{s.fix}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Highest-impact fix */}
          {audit.highest_impact_fix && (
            <div style={{ background: "linear-gradient(135deg, #0c0a09 0%, #1c1917 100%)", color: "#fde68a", borderRadius: 14, padding: "18px 22px", marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fde68a", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="target" size={12} strokeWidth={2.5} /> Fix this first
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.65 }}>{audit.highest_impact_fix}</p>
            </div>
          )}

          <button onClick={reset}
            style={{ width: "100%", background: "#fff", border: "1.5px solid #e4e4e7", color: "#52525b", fontWeight: 700, fontSize: 13, padding: "11px 20px", borderRadius: 10, cursor: "pointer" }}>
            ↺ Audit another page
          </button>
        </div>
      )}
    </div>
  );
}
