"use client";

/**
 * DecisionHelper — Scale Lab exclusive (Module 23 fit).
 *
 * User pastes their last 7-day ad performance numbers (spend, ROAS, CTR,
 * CPC, CPA, AOV, frequency, days running). AI applies the Module 23
 * decision matrix and returns scale | iterate | kill with:
 *   - Confidence (Low / Medium / High)
 *   - Headline verdict (one sentence)
 *   - Reasoning that references the user's actual numbers
 *   - Next action with specific budget/timeline
 *   - For "iterate": single variable to change (creative / hook / etc.)
 *   - 3-5 numeric kill triggers to watch over the next 5 days
 *   - Per-metric diagnosis (Healthy / Borderline / Concerning)
 *
 * Free / Pro users see an upgrade card. Anonymous users see a sign-up CTA.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { useAIToolUsage } from "@/lib/useAIToolUsage";
import { Icon, type IconName } from "./Icon";

type Decision = {
  decision: "scale" | "iterate" | "kill";
  confidence: "Low" | "Medium" | "High";
  headline: string;
  reasoning: string;
  next_action: string;
  variable_to_change: string;
  kill_triggers: string[];
  metrics_diagnosis: { metric: string; value: string; verdict: "Healthy" | "Borderline" | "Concerning" }[];
};

const DECISION_META: Record<Decision["decision"], { label: string; icon: IconName; color: string; bg: string; border: string }> = {
  scale:   { label: "Scale",   icon: "trending-up", color: "#15803d", bg: "#ecfdf5", border: "#86efac" },
  iterate: { label: "Iterate", icon: "refresh",      color: "#a16207", bg: "#fffbeb", border: "#fde68a" },
  kill:    { label: "Kill",    icon: "x-circle",     color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
};

const VERDICT_STYLE: Record<"Healthy" | "Borderline" | "Concerning", { bg: string; color: string }> = {
  Healthy:    { bg: "#ecfdf5", color: "#15803d" },
  Borderline: { bg: "#fffbeb", color: "#a16207" },
  Concerning: { bg: "#fef2f2", color: "#b91c1c" },
};

export default function DecisionHelper() {
  const [authState, setAuthState] = useState<"unknown" | "anon" | "free" | "pro" | "growth">("unknown");

  // Form state
  const [productName,  setProductName]  = useState("");
  const [targetCpa,    setTargetCpa]    = useState("");
  const [spend7d,      setSpend7d]      = useState("");
  const [revenue7d,    setRevenue7d]    = useState("");
  const [roas,         setRoas]         = useState("");
  const [ctr,          setCtr]          = useState("");
  const [cpc,          setCpc]          = useState("");
  const [cpa,          setCpa]          = useState("");
  const [aov,          setAov]          = useState("");
  const [frequency,    setFrequency]    = useState("");
  const [daysRunning,  setDaysRunning]  = useState("");
  const [notes,        setNotes]        = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [decision,  setDecision]  = useState<Decision | null>(null);
  const [error,     setError]     = useState("");
  const { usage, refresh: refreshUsage, bump: bumpUsage } = useAIToolUsage("decision_helper");

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

  const formValid = productName.trim() && targetCpa.trim() && spend7d.trim() && roas.trim() && cpa.trim();

  async function handleAnalyze() {
    if (!formValid) return;
    setAnalyzing(true); setError(""); setDecision(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError("Log in to use Scale or Kill."); return; }

      const res = await fetch("/api/ai-tools/decision-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          product_name:  productName.trim(),
          target_cpa:    targetCpa.trim(),
          spend_7d:      spend7d.trim(),
          revenue_7d:    revenue7d.trim(),
          roas:          roas.trim(),
          ctr:           ctr.trim(),
          cpc:           cpc.trim(),
          cpa:           cpa.trim(),
          aov:           aov.trim(),
          frequency:     frequency.trim(),
          days_running:  daysRunning.trim(),
          notes:         notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.rateLimited) refreshUsage();
        throw new Error(data.error ?? "Analysis failed");
      }
      setDecision(data.decision);
      bumpUsage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  function reset() { setDecision(null); setError(""); }

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
              Scale or Kill — get a clear verdict on your ad performance
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: 22, maxWidth: 480, margin: "0 auto 22px" }}>
              Paste your last-7-day ad numbers. AI applies the Scale Lab Module 23 framework and tells you to scale, iterate, or kill — with the exact next action and the kill triggers to watch.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 22, maxWidth: 480, margin: "0 auto 22px" }}>
              {([
                { i: "trending-up", t: "Scale verdict" },
                { i: "refresh",     t: "Iterate variable" },
                { i: "x-circle",    t: "Kill signals" },
                { i: "compass",     t: "Next action" },
                { i: "alert-triangle", t: "Kill triggers" },
                { i: "bar-chart",   t: "Metric diagnosis" },
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
          </div>
        </div>
      </div>
    );
  }

  if (authState === "unknown") return <div className="spinner" style={{ margin: "40px auto" }} />;

  // ── Form / result ──────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid #e4e4e7", fontSize: 14, color: "#09090b",
    outline: "none", boxSizing: "border-box",
  };
  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = "#0c0a09");
  const blurBorder  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = "#e4e4e7");

  return (
    <div>
      <div style={{ background: "#0c0a09", color: "#fde68a", border: "1px solid rgba(250,204,21,0.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="rocket" size={14} strokeWidth={2} />
          <span><strong>Scale Lab · Scale or Kill.</strong> Drop in your last 7 days of ad numbers — get a verdict.</span>
        </p>
        {usage && <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>{usage.used} / {usage.limit} runs today</p>}
      </div>

      {!decision ? (
        <>
          {/* Form — 2-column grid for the metrics */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Product or campaign name</label>
            <input value={productName} onChange={e => setProductName(e.target.value)} maxLength={200}
              placeholder="e.g. The Sleep Reset Course — broad audience"
              style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 14 }}>
            <Field label="Target CPA"  hint="e.g. $25"   value={targetCpa}    onChange={setTargetCpa}    inputStyle={inputStyle} focusBorder={focusBorder} blurBorder={blurBorder} />
            <Field label="7-day spend" hint="e.g. $840"  value={spend7d}      onChange={setSpend7d}      inputStyle={inputStyle} focusBorder={focusBorder} blurBorder={blurBorder} />
            <Field label="7-day revenue" hint="e.g. $1,920" value={revenue7d} onChange={setRevenue7d}    inputStyle={inputStyle} focusBorder={focusBorder} blurBorder={blurBorder} />
            <Field label="ROAS"         hint="e.g. 2.3"   value={roas}         onChange={setRoas}         inputStyle={inputStyle} focusBorder={focusBorder} blurBorder={blurBorder} />
            <Field label="CTR"          hint="e.g. 1.2%"  value={ctr}          onChange={setCtr}          inputStyle={inputStyle} focusBorder={focusBorder} blurBorder={blurBorder} />
            <Field label="CPC"          hint="e.g. $0.85" value={cpc}          onChange={setCpc}          inputStyle={inputStyle} focusBorder={focusBorder} blurBorder={blurBorder} />
            <Field label="CPA"          hint="e.g. $22"   value={cpa}          onChange={setCpa}          inputStyle={inputStyle} focusBorder={focusBorder} blurBorder={blurBorder} />
            <Field label="AOV"          hint="e.g. $48"   value={aov}          onChange={setAov}          inputStyle={inputStyle} focusBorder={focusBorder} blurBorder={blurBorder} />
            <Field label="Frequency"    hint="e.g. 1.4"   value={frequency}    onChange={setFrequency}    inputStyle={inputStyle} focusBorder={focusBorder} blurBorder={blurBorder} />
            <Field label="Days running" hint="e.g. 9"     value={daysRunning}  onChange={setDaysRunning}  inputStyle={inputStyle} focusBorder={focusBorder} blurBorder={blurBorder} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Notes (optional)</label>
            <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>Anything else worth knowing — recent creative changes, audience shifts, seasonality.</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} maxLength={800}
              placeholder="e.g. Swapped to a new hook on day 5. Audience is iOS-only."
              style={{ ...inputStyle, fontFamily: "inherit", lineHeight: 1.55, resize: "vertical" }} onFocus={focusBorder} onBlur={blurBorder} />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !formValid}
            style={{
              width: "100%",
              background: analyzing || !formValid ? "#e4e4e7" : "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
              color:      analyzing || !formValid ? "#a1a1aa" : "#fde68a",
              fontWeight: 800, fontSize: 14, padding: "14px 28px", borderRadius: 14, border: "none",
              cursor: analyzing || !formValid ? "not-allowed" : "pointer", letterSpacing: "-0.2px",
            }}
          >
            {analyzing ? "Running the Module 23 framework…" : "Get my verdict →"}
          </button>

          {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 12, textAlign: "center" }}>⚠ {error}</p>}
        </>
      ) : (
        // ── Result ──
        <div>
          {/* Verdict banner */}
          {(() => {
            const meta = DECISION_META[decision.decision];
            return (
              <div style={{ background: meta.bg, border: `2px solid ${meta.border}`, borderRadius: 16, padding: "20px 22px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", color: meta.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={meta.icon} size={22} strokeWidth={2} />
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 900, color: meta.color, letterSpacing: "-0.5px", flex: 1, minWidth: 100 }}>{meta.label.toUpperCase()}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: "#fff", color: meta.color, border: `1px solid ${meta.border}` }}>
                    {decision.confidence} confidence
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: meta.color, lineHeight: 1.5, marginBottom: 8 }}>{decision.headline}</p>
                <p style={{ fontSize: 13, color: meta.color, opacity: 0.85, lineHeight: 1.65 }}>{decision.reasoning}</p>
              </div>
            );
          })()}

          {/* Next action */}
          {decision.next_action && (
            <div style={{ background: "#0c0a09", color: "#fff", borderRadius: 14, padding: "18px 22px", marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fde68a", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="compass" size={12} strokeWidth={2.5} /> Next action
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.65 }}>{decision.next_action}</p>
              {decision.decision === "iterate" && decision.variable_to_change && (
                <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(250,204,21,0.1)", borderRadius: 8, border: "1px solid rgba(250,204,21,0.3)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#fde68a", marginBottom: 2 }}>Single variable to change</p>
                  <p style={{ fontSize: 13, color: "#fff", textTransform: "capitalize" }}>{decision.variable_to_change.replace(/_/g, " ")}</p>
                </div>
              )}
            </div>
          )}

          {/* Per-metric diagnosis */}
          {decision.metrics_diagnosis.length > 0 && (
            <div style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)", borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#09090b", marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="bar-chart" size={14} strokeWidth={2} /> Metric diagnosis
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                {decision.metrics_diagnosis.map((m, i) => {
                  const v = VERDICT_STYLE[m.verdict];
                  return (
                    <div key={i} style={{ background: v.bg, border: `1px solid ${v.color}33`, borderRadius: 10, padding: "10px 12px" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: v.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{m.metric}</p>
                      <p style={{ fontSize: 16, fontWeight: 900, color: v.color, lineHeight: 1, marginBottom: 4, letterSpacing: "-0.3px" }}>{m.value || "—"}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, color: v.color, opacity: 0.85 }}>{m.verdict}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kill triggers */}
          {decision.kill_triggers.length > 0 && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#b91c1c", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="alert-triangle" size={14} strokeWidth={2} /> Watch these — pull the plug if any trigger
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#991b1b" }}>
                {decision.kill_triggers.map((t, i) => <li key={i} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 4 }}>{t}</li>)}
              </ul>
            </div>
          )}

          <button onClick={reset}
            style={{ width: "100%", background: "#fff", border: "1.5px solid #e4e4e7", color: "#52525b", fontWeight: 700, fontSize: 13, padding: "11px 20px", borderRadius: 10, cursor: "pointer" }}>
            ↺ Run another verdict
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Sub-component for the metric grid inputs ── */
function Field({ label, hint, value, onChange, inputStyle, focusBorder, blurBorder }: {
  label: string; hint: string; value: string;
  onChange: (v: string) => void;
  inputStyle: React.CSSProperties;
  focusBorder: (e: React.FocusEvent<HTMLInputElement>) => void;
  blurBorder:  (e: React.FocusEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#09090b", marginBottom: 2 }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={hint}
        style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }}
        onFocus={focusBorder}
        onBlur={blurBorder}
      />
    </div>
  );
}
