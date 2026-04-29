"use client";

/**
 * AdAuditor — paste an ad's copy/script, AI scores it on Cialdini's 6
 * + identifies hook framework + provides concrete rewrites.
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthTier } from "@/lib/useAuthTier";
import { useAIToolUsage } from "@/lib/useAIToolUsage";
import AIToolLockCard from "./AIToolLockCard";
import { Icon } from "./Icon";

type Audit = {
  hook_framework: string;
  hook_strength: "Strong" | "OK" | "Weak";
  cialdini_scores: { reciprocity: number; commitment: number; social_proof: number; authority: number; liking: number; scarcity: number };
  body_assessment: string;
  cta_assessment: string;
  overall_score: number;
  rewrites: { hook_rewrite: string; body_rewrite: string; cta_rewrite: string };
  improvements: string[];
};

const STRENGTH_COLORS: Record<Audit["hook_strength"], { color: string; bg: string }> = {
  Strong: { color: "#16a34a", bg: "#ecfdf5" },
  OK:     { color: "#d97706", bg: "#fffbeb" },
  Weak:   { color: "#dc2626", bg: "#fff1f2" },
};

const PRINCIPLE_LABELS: Record<keyof Audit["cialdini_scores"], string> = {
  reciprocity:  "Reciprocity",
  commitment:   "Commitment",
  social_proof: "Social Proof",
  authority:    "Authority",
  liking:       "Liking",
  scarcity:     "Scarcity",
};

export default function AdAuditor() {
  const tier = useAuthTier();

  const [adText,   setAdText]   = useState("");
  const [context,  setContext]  = useState("");

  const [loading,  setLoading]  = useState(false);
  const [audit,    setAudit]    = useState<Audit | null>(null);
  const [error,    setError]    = useState("");
  const { usage, refresh: refreshUsage, bump: bumpUsage } = useAIToolUsage("ad_audit");

  if (tier === "unknown" || tier === "anon" || tier === "free") {
    return (
      <AIToolLockCard
        authState={tier}
        icon="eye"
        label="AI Ad Auditor"
        tagline="Paste your ad. Get scored on Cialdini's 6 + concrete rewrites."
        bullets={[
          { i: "bar-chart", t: "Score 0-100" },
          { i: "anchor",    t: "Hook framework" },
          { i: "brain",     t: "Cialdini's 6" },
          { i: "edit",      t: "Rewrites" },
        ]}
      />
    );
  }

  async function run() {
    if (adText.trim().length < 20) return;
    setLoading(true);
    setError("");
    setAudit(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError("Log in required."); return; }

      const res = await fetch("/api/ai-tools/ad-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          ad_text:         adText.trim(),
          product_context: context.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to audit.");
        if (data.rateLimited) refreshUsage();
        return;
      }
      setAudit(data.audit);
      bumpUsage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to audit.");
    } finally {
      setLoading(false);
    }
  }

  function reset() { setAudit(null); setError(""); }

  const scoreColor = audit
    ? audit.overall_score >= 75 ? "#16a34a"
      : audit.overall_score >= 50 ? "#d97706"
      : "#dc2626"
    : "#6366f1";

  return (
    <div>
      <div style={{ background: tier === "growth" ? "#0c0a09" : "#5b21b6", color: tier === "growth" ? "#fde68a" : "#ddd6fe", border: `1px solid ${tier === "growth" ? "rgba(250,204,21,0.3)" : "rgba(196,181,253,0.4)"}`, borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>
          <Icon name={tier === "growth" ? "rocket" : "sparkles"} size={12} strokeWidth={2.5} style={{ display: "inline", marginRight: 6, verticalAlign: "-1px" }} />
          <strong>{tier === "growth" ? "Scale Lab" : "Pro"} · AI Ad Auditor.</strong> Paste your ad copy, get scored against Cialdini + hook frameworks with concrete rewrites.
        </p>
        {usage && <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>{usage.used} / {usage.limit} runs today</p>}
      </div>

      {!audit ? (
        <>
          <Field label="Paste your ad copy / script" hint="Hook + body + CTA. Or describe the UGC video word-for-word.">
            <textarea value={adText} onChange={e => setAdText(e.target.value)} rows={8} maxLength={4000} placeholder="e.g.&#10;&quot;Tired of waking up with neck pain? This pillow uses memory foam shaped like the curve of your spine. 50,000+ people sleep better thanks to it. Order today, free shipping over $50.&quot;" style={{ ...inputStyle, fontSize: 13, resize: "vertical", fontFamily: "inherit", lineHeight: 1.55 }} onFocus={focusBorder} onBlur={blurBorder} />
            <p style={{ fontSize: 10, color: "#a1a1aa", marginTop: 4, textAlign: "right" }}>{adText.length}/4000</p>
          </Field>

          <Field label="Product context (optional)" hint="What's the product, who's it for? Helps the audit be more specific.">
            <input type="text" value={context} onChange={e => setContext(e.target.value)} maxLength={600} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <button
            onClick={run}
            disabled={loading || adText.trim().length < 20}
            style={{
              width: "100%", marginTop: 8,
              background: loading || adText.trim().length < 20 ? "#e4e4e7" : "linear-gradient(135deg, #6366f1, #7c3aed)",
              color:      loading || adText.trim().length < 20 ? "#a1a1aa" : "#fff",
              fontWeight: 800, fontSize: 14, padding: "13px 24px", borderRadius: 14, border: "none",
              cursor: loading || adText.trim().length < 20 ? "not-allowed" : "pointer",
              letterSpacing: "-0.2px",
            }}
          >
            {loading ? "🧐 Auditing…" : "🧐 Audit my ad →"}
          </button>

          {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 12, textAlign: "center" }}>⚠ {error}</p>}
        </>
      ) : (
        <div>
          {/* Score header */}
          <div style={{ background: scoreColor, borderRadius: 14, padding: "20px 24px", marginBottom: 14, color: "#fff", textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.85, marginBottom: 6 }}>Overall score</p>
            <p style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1 }}>{audit.overall_score}<span style={{ fontSize: 22, opacity: 0.6 }}>/100</span></p>
          </div>

          {/* Hook */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", marginBottom: 8, border: "1px solid #e4e4e7" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: 6 }}>🪝 Hook</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#09090b" }}>{audit.hook_framework}</span>
              <span style={{ background: STRENGTH_COLORS[audit.hook_strength].bg, color: STRENGTH_COLORS[audit.hook_strength].color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99 }}>
                {audit.hook_strength}
              </span>
            </div>
          </div>

          {/* Cialdini scores */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 8, border: "1px solid #e4e4e7" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: 12 }}>🧠 Cialdini scores (each /2)</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
              {(Object.keys(audit.cialdini_scores) as (keyof Audit["cialdini_scores"])[]).map(key => {
                const score = audit.cialdini_scores[key];
                const color = score === 2 ? "#16a34a" : score === 1 ? "#d97706" : "#dc2626";
                return (
                  <div key={key} style={{ background: "#f8f8fb", padding: "10px 12px", borderRadius: 8 }}>
                    <p style={{ fontSize: 11, color: "#71717a", marginBottom: 4 }}>{PRINCIPLE_LABELS[key]}</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color }}>{score}<span style={{ fontSize: 11, opacity: 0.5 }}>/2</span></p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body + CTA assessment */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", marginBottom: 8, border: "1px solid #e4e4e7" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: 6 }}>📝 Body</p>
            <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.65 }}>{audit.body_assessment}</p>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", marginBottom: 8, border: "1px solid #e4e4e7" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: 6 }}>⚡ CTA</p>
            <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.65 }}>{audit.cta_assessment}</p>
          </div>

          {/* Rewrites */}
          {(audit.rewrites.hook_rewrite || audit.rewrites.body_rewrite || audit.rewrites.cta_rewrite) && (
            <div style={{ background: "#f5f3ff", borderRadius: 12, padding: "16px 20px", marginBottom: 8, border: "1px solid #ede9fe" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 12 }}>✏️ Rewrites</p>
              {audit.rewrites.hook_rewrite && <RewriteBlock label="Hook" text={audit.rewrites.hook_rewrite} />}
              {audit.rewrites.body_rewrite && <RewriteBlock label="Body" text={audit.rewrites.body_rewrite} />}
              {audit.rewrites.cta_rewrite  && <RewriteBlock label="CTA"  text={audit.rewrites.cta_rewrite} />}
            </div>
          )}

          {/* Improvements */}
          {audit.improvements.length > 0 && (
            <div style={{ background: "#ecfdf5", borderRadius: 12, padding: "14px 18px", marginBottom: 8, border: "1px solid #a7f3d0" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#16a34a", marginBottom: 8 }}>✅ Specific improvements</p>
              <ul style={{ paddingLeft: 20, margin: 0, color: "#065f46" }}>
                {audit.improvements.map((it, i) => <li key={i} style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 4 }}>{it}</li>)}
              </ul>
            </div>
          )}

          <button onClick={reset} style={{ marginTop: 14, width: "100%", background: "transparent", border: "1.5px solid #e4e4e7", color: "#52525b", fontWeight: 600, fontSize: 13, padding: "11px 20px", borderRadius: 10, cursor: "pointer" }}>
            ↺ Audit another ad
          </button>
        </div>
      )}
    </div>
  );
}

function RewriteBlock({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "10px 14px", marginBottom: 6, border: "1px solid #ede9fe" }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.65 }}>{text}</p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7",
  fontSize: 14, color: "#09090b", outline: "none", boxSizing: "border-box",
};
function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) { e.currentTarget.style.borderColor = "#6366f1"; }
function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) { e.currentTarget.style.borderColor = "#e4e4e7"; }
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>{hint}</p>}
      {children}
    </div>
  );
}
