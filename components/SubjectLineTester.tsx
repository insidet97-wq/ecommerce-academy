"use client";

/**
 * SubjectLineTester — pick email purpose + topic + audience, get 10 subject
 * line variants with framework attribution + predicted open + preheader.
 *
 * Pro: 5/day. Growth: 20/day. Free: locked card.
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthTier } from "@/lib/useAuthTier";
import { useAIToolUsage } from "@/lib/useAIToolUsage";
import AIToolLockCard from "./AIToolLockCard";
import { Icon } from "./Icon";

type Purpose = "welcome" | "promo" | "cart_abandon" | "re_engage" | "newsletter" | "re_launch";

const PURPOSE_OPTIONS: { value: Purpose; label: string }[] = [
  { value: "welcome",      label: "Welcome email (after signup)" },
  { value: "promo",        label: "Promo / offer" },
  { value: "cart_abandon", label: "Cart abandonment" },
  { value: "re_engage",    label: "Re-engagement (dormant subs)" },
  { value: "newsletter",   label: "Newsletter / content email" },
  { value: "re_launch",    label: "Re-launch / restock" },
];

type Variant = {
  subject:          string;
  framework:        string;
  preheader:        string;
  mobile_truncated: boolean;
  predicted_open:   "Low" | "Medium" | "High";
  why:              string;
};

const OPEN_META: Record<Variant["predicted_open"], { color: string; bg: string; border: string }> = {
  Low:    { color: "#dc2626", bg: "#fff1f2", border: "#fecaca" },
  Medium: { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  High:   { color: "#16a34a", bg: "#ecfdf5", border: "#a7f3d0" },
};

export default function SubjectLineTester() {
  const tier = useAuthTier();

  const [purpose,  setPurpose]  = useState<Purpose>("newsletter");
  const [topic,    setTopic]    = useState("");
  const [audience, setAudience] = useState("");

  const [loading,  setLoading]  = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [error,    setError]    = useState("");
  const { usage, refresh: refreshUsage, bump: bumpUsage } = useAIToolUsage("subject_lines");

  if (tier === "unknown" || tier === "anon" || tier === "free") {
    return (
      <AIToolLockCard
        authState={tier}
        icon="send"
        label="Email Subject Line Tester"
        tagline="Get 10 subject line variants with predicted open rates."
        bullets={[
          { i: "anchor",     t: "10 variants" },
          { i: "brain",      t: "8 frameworks" },
          { i: "smartphone", t: "Mobile preview" },
          { i: "bar-chart",  t: "Predicted opens" },
        ]}
      />
    );
  }

  async function generate() {
    if (!topic.trim() || !audience.trim()) return;
    setLoading(true);
    setError("");
    setVariants([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError("Log in required."); return; }

      const res = await fetch("/api/ai-tools/subject-lines", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          email_purpose: purpose,
          topic:         topic.trim(),
          audience:      audience.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate.");
        if (data.rateLimited) refreshUsage();
        return;
      }
      setVariants(data.variants ?? []);
      bumpUsage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate.");
    } finally {
      setLoading(false);
    }
  }

  function reset() { setVariants([]); setError(""); }
  function copy(text: string) { navigator.clipboard.writeText(text).catch(() => {}); }

  return (
    <div>
      {/* Tier badge */}
      <div style={{ background: tier === "growth" ? "#0c0a09" : "#5b21b6", color: tier === "growth" ? "#fde68a" : "#ddd6fe", border: `1px solid ${tier === "growth" ? "rgba(250,204,21,0.3)" : "rgba(196,181,253,0.4)"}`, borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>
          <Icon name={tier === "growth" ? "rocket" : "sparkles"} size={12} strokeWidth={2.5} style={{ display: "inline", marginRight: 6, verticalAlign: "-1px" }} />
          <strong>{tier === "growth" ? "Scale Lab" : "Pro"} · Subject Line Tester.</strong> 10 variants with predicted opens + preheaders.
        </p>
        {usage && (
          <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>{usage.used} / {usage.limit} runs today</p>
        )}
      </div>

      {variants.length === 0 ? (
        <>
          <Field label="Email purpose">
            <select value={purpose} onChange={e => setPurpose(e.target.value as Purpose)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder}>
              {PURPOSE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          <Field label="Topic / product" hint="What's the email actually about?">
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Our new Sleepy Tea launch · Black Friday 30% off · Why I quit my niche" maxLength={300} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <Field label="Audience" hint="Who's reading this?">
            <input type="text" value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. New subs interested in sleep wellness · Past buyers we haven't heard from in 60 days" maxLength={300} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <button
            onClick={generate}
            disabled={loading || !topic.trim() || !audience.trim()}
            style={{
              width: "100%", marginTop: 4,
              background: loading || !topic.trim() || !audience.trim() ? "#e4e4e7" : "linear-gradient(135deg, #6366f1, #7c3aed)",
              color:      loading || !topic.trim() || !audience.trim() ? "#a1a1aa" : "#fff",
              fontWeight: 800, fontSize: 14, padding: "13px 24px", borderRadius: 14, border: "none",
              cursor: loading || !topic.trim() || !audience.trim() ? "not-allowed" : "pointer",
              letterSpacing: "-0.2px",
            }}
          >
            {loading ? "✉️ Writing 10 variants…" : "✉️ Generate 10 subject lines →"}
          </button>

          {error && (
            <p style={{ fontSize: 12, color: "#dc2626", marginTop: 12, textAlign: "center" }}>⚠ {error}</p>
          )}
        </>
      ) : (
        <div>
          <p style={{ fontSize: 12, color: "#71717a", marginBottom: 14 }}>
            10 variants — different frameworks. Pick 2 that contrast, send as A/B test, keep the winner.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {variants.map((v, i) => {
              const meta = OPEN_META[v.predicted_open] ?? OPEN_META.Medium;
              return (
                <div key={i} style={{ background: "#fff", border: "1.5px solid #e4e4e7", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ background: "#7c3aed", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, letterSpacing: "0.04em" }}>
                        #{i + 1} · {v.framework}
                      </span>
                      <span style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>
                        {v.predicted_open} open
                      </span>
                      {v.mobile_truncated && (
                        <span title="Over 40 chars — will truncate on iPhone Mail" style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>
                          📱 truncates
                        </span>
                      )}
                    </div>
                    <button onClick={() => copy(v.subject)} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8, border: "1.5px solid #e4e4e7", background: "#fff", color: "#52525b", cursor: "pointer" }}>
                      Copy
                    </button>
                  </div>

                  <p style={{ fontSize: 15, fontWeight: 700, color: "#09090b", marginBottom: 4, lineHeight: 1.4, letterSpacing: "-0.2px" }}>{v.subject}</p>

                  {v.preheader && (
                    <p style={{ fontSize: 11, color: "#71717a", marginBottom: 8, lineHeight: 1.5 }}>
                      <strong style={{ color: "#52525b" }}>Preheader:</strong> {v.preheader}
                    </p>
                  )}

                  {v.why && (
                    <p style={{ fontSize: 11, color: "#71717a", fontStyle: "italic", paddingTop: 6, borderTop: "1px solid #f4f4f5" }}>
                      💡 {v.why}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={reset} style={{ marginTop: 14, width: "100%", background: "transparent", border: "1.5px solid #e4e4e7", color: "#52525b", fontWeight: 600, fontSize: 13, padding: "11px 20px", borderRadius: 10, cursor: "pointer" }}>
            ↺ Generate another set
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Shared field helpers ── */

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7",
  fontSize: 14, color: "#09090b", outline: "none", boxSizing: "border-box", background: "#fff",
};
function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) { e.currentTarget.style.borderColor = "#6366f1"; }
function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) { e.currentTarget.style.borderColor = "#e4e4e7"; }

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>{hint}</p>}
      {children}
    </div>
  );
}
