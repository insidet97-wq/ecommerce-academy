"use client";

/**
 * UGCBriefGenerator — paste product info + pick a hook framework, get a
 * complete ready-to-send brief for a Billo/Insense creator.
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthTier } from "@/lib/useAuthTier";
import AIToolLockCard from "./AIToolLockCard";

const FRAMEWORKS = ["Pattern Interrupt", "Problem Agitation", "Curiosity Gap", "Transformation Reveal", "Social Proof", "Contrarian"] as const;
type Framework = typeof FRAMEWORKS[number];

type Brief = {
  hook_word_for_word: string;
  pain_to_dramatize: string;
  transformation: string;
  cta: string;
  format_specs: string;
  shot_list: string[];
  reference_styles: string[];
  do_not: string[];
};

export default function UGCBriefGenerator() {
  const tier = useAuthTier();

  const [productName,    setProductName]    = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [mainBenefit,    setMainBenefit]    = useState("");
  const [framework,      setFramework]      = useState<Framework>("Problem Agitation");

  const [loading,  setLoading]  = useState(false);
  const [brief,    setBrief]    = useState<Brief | null>(null);
  const [error,    setError]    = useState("");
  const [usage,    setUsage]    = useState<{ used: number; limit: number } | null>(null);

  if (tier === "unknown" || tier === "anon" || tier === "free") {
    return (
      <AIToolLockCard
        authState={tier}
        emoji="🎬"
        label="UGC Brief Generator"
        tagline="Generate a complete, ready-to-send creator brief in seconds."
        bullets={[
          { e: "🪝", t: "Hook word-for-word" },
          { e: "🎬", t: "Shot list" },
          { e: "📐", t: "Format specs" },
          { e: "🚫", t: "Do-not list" },
        ]}
      />
    );
  }

  async function generate() {
    if (!productName.trim() || !targetCustomer.trim() || !mainBenefit.trim()) return;
    setLoading(true);
    setError("");
    setBrief(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError("Log in required."); return; }

      const res = await fetch("/api/ai-tools/ugc-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          product_name:    productName.trim(),
          target_customer: targetCustomer.trim(),
          main_benefit:    mainBenefit.trim(),
          hook_framework:  framework,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate.");
        if (typeof data.limit === "number") setUsage({ used: data.limit, limit: data.limit });
        return;
      }
      setBrief(data.brief);
      setUsage({ used: data.used, limit: data.limit });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate.");
    } finally {
      setLoading(false);
    }
  }

  function reset() { setBrief(null); setError(""); }

  function copyAll() {
    if (!brief) return;
    const text = `🪝 HOOK (word-for-word):
${brief.hook_word_for_word}

😖 PAIN TO DRAMATIZE:
${brief.pain_to_dramatize}

✨ TRANSFORMATION TO SHOW:
${brief.transformation}

📢 CTA:
${brief.cta}

📐 FORMAT SPECS:
${brief.format_specs}

🎬 SHOT LIST:
${brief.shot_list.map((s, i) => `${i + 1}. ${s}`).join("\n")}

🎨 REFERENCE STYLES:
${brief.reference_styles.map(s => `- ${s}`).join("\n")}

🚫 DO NOT:
${brief.do_not.map(s => `- ${s}`).join("\n")}`;
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div>
      <div style={{ background: tier === "growth" ? "#0c0a09" : "#5b21b6", color: tier === "growth" ? "#fde68a" : "#ddd6fe", border: `1px solid ${tier === "growth" ? "rgba(250,204,21,0.3)" : "rgba(196,181,253,0.4)"}`, borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>
          {tier === "growth" ? "🚀 " : "✨ "}<strong>{tier === "growth" ? "Scale Lab" : "Pro"} · UGC Brief Generator.</strong> Paste the product, pick a hook framework, get a brief ready to send.
        </p>
        {usage && <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>{usage.used} / {usage.limit} runs today</p>}
      </div>

      {!brief ? (
        <>
          <Field label="Product name">
            <input type="text" value={productName} onChange={e => setProductName(e.target.value)} maxLength={200} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <Field label="Target customer">
            <input type="text" value={targetCustomer} onChange={e => setTargetCustomer(e.target.value)} placeholder="Be specific" maxLength={300} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <Field label="Main benefit / transformation">
            <textarea value={mainBenefit} onChange={e => setMainBenefit(e.target.value)} placeholder="What changes for them after they buy?" rows={3} maxLength={400} style={textareaStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <Field label="Hook framework" hint="Pick the angle the creator should use in the first 3 seconds">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {FRAMEWORKS.map(f => (
                <button key={f} type="button" onClick={() => setFramework(f)}
                  style={{
                    padding: "8px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                    border: `1.5px solid ${framework === f ? "#6366f1" : "#e5e7eb"}`,
                    background:    framework === f ? "#eef2ff" : "#fff",
                    color:         framework === f ? "#3730a3" : "#52525b",
                    cursor: "pointer",
                  }}
                >{f}</button>
              ))}
            </div>
          </Field>

          <button
            onClick={generate}
            disabled={loading || !productName.trim() || !targetCustomer.trim() || !mainBenefit.trim()}
            style={{
              width: "100%", marginTop: 8,
              background: loading || !productName.trim() || !targetCustomer.trim() || !mainBenefit.trim() ? "#e4e4e7" : "linear-gradient(135deg, #6366f1, #7c3aed)",
              color:      loading || !productName.trim() || !targetCustomer.trim() || !mainBenefit.trim() ? "#a1a1aa" : "#fff",
              fontWeight: 800, fontSize: 14, padding: "13px 24px", borderRadius: 14, border: "none",
              cursor: loading || !productName.trim() || !targetCustomer.trim() || !mainBenefit.trim() ? "not-allowed" : "pointer",
              letterSpacing: "-0.2px",
            }}
          >
            {loading ? "✨ Writing brief…" : "🎬 Generate brief →"}
          </button>

          {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 12, textAlign: "center" }}>⚠ {error}</p>}
        </>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={copyAll} style={{ background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 12, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer" }}>
              📋 Copy entire brief
            </button>
          </div>

          {[
            { e: "🪝", t: "Hook (word-for-word)",   v: brief.hook_word_for_word, c: "#7c3aed", bg: "#f5f3ff" },
            { e: "😖", t: "Pain to dramatize",      v: brief.pain_to_dramatize,  c: "#dc2626", bg: "#fff1f2" },
            { e: "✨", t: "Transformation to show", v: brief.transformation,     c: "#16a34a", bg: "#ecfdf5" },
            { e: "📢", t: "CTA (word-for-word)",    v: brief.cta,                c: "#d97706", bg: "#fffbeb" },
            { e: "📐", t: "Format specs",           v: brief.format_specs,       c: "#0891b2", bg: "#ecfeff" },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "12px 16px", marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: s.c, marginBottom: 6 }}>{s.e} {s.t}</p>
              <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{s.v}</p>
            </div>
          ))}

          {brief.shot_list.length > 0 && (
            <div style={{ background: "#f8f8fb", borderRadius: 12, padding: "14px 18px", marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>🎬 Shot list</p>
              <ol style={{ paddingLeft: 22, margin: 0, color: "#3f3f46" }}>
                {brief.shot_list.map((s, i) => <li key={i} style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 4 }}>{s}</li>)}
              </ol>
            </div>
          )}

          {brief.reference_styles.length > 0 && (
            <div style={{ background: "#f8f8fb", borderRadius: 12, padding: "14px 18px", marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>🎨 Reference styles</p>
              <ul style={{ paddingLeft: 20, margin: 0, color: "#3f3f46" }}>
                {brief.reference_styles.map((s, i) => <li key={i} style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 4 }}>{s}</li>)}
              </ul>
            </div>
          )}

          {brief.do_not.length > 0 && (
            <div style={{ background: "#fff1f2", borderRadius: 12, padding: "14px 18px", marginBottom: 8, border: "1px solid #fecaca" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#dc2626", marginBottom: 8 }}>🚫 Do NOT</p>
              <ul style={{ paddingLeft: 20, margin: 0, color: "#9f1239" }}>
                {brief.do_not.map((s, i) => <li key={i} style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 4 }}>{s}</li>)}
              </ul>
            </div>
          )}

          <button onClick={reset} style={{ marginTop: 14, width: "100%", background: "transparent", border: "1.5px solid #e4e4e7", color: "#52525b", fontWeight: 600, fontSize: 13, padding: "11px 20px", borderRadius: 10, cursor: "pointer" }}>
            ↺ Generate another brief
          </button>
        </div>
      )}
    </div>
  );
}

/* shared helpers */
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7",
  fontSize: 14, color: "#09090b", outline: "none", boxSizing: "border-box",
};
const textareaStyle: React.CSSProperties = {
  ...inputStyle, fontSize: 13, resize: "vertical", fontFamily: "inherit", lineHeight: 1.55,
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
