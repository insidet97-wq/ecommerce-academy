"use client";

/**
 * AdCopywriter — paste product info, get 5 ad variants across different
 * psychological angles (Cialdini + hook frameworks).
 *
 * Pro: 5/day. Growth: 20/day. Free: locked card.
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthTier } from "@/lib/useAuthTier";
import { useAIToolUsage } from "@/lib/useAIToolUsage";
import AIToolLockCard from "./AIToolLockCard";
import { Icon } from "./Icon";

type Variant = {
  angle:        string;
  hook:         string;
  body:         string;
  cta:          string;
  why_it_works: string;
};

export default function AdCopywriter() {
  const tier = useAuthTier();

  // Form state
  const [productName,  setProductName]  = useState("");
  const [whoItsFor,    setWhoItsFor]    = useState("");
  const [mainBenefit,  setMainBenefit]  = useState("");
  const [unique,       setUnique]       = useState("");
  const [niche,        setNiche]        = useState("");

  // Result state
  const [loading,  setLoading]  = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [error,    setError]    = useState("");
  const { usage, refresh: refreshUsage, bump: bumpUsage } = useAIToolUsage("ad_copywriter");

  if (tier === "unknown" || tier === "anon" || tier === "free") {
    return (
      <AIToolLockCard
        authState={tier}
        icon="pen"
        label="AI Ad Copywriter"
        tagline="Paste your product. Get 5 ad variants across different psychological angles."
        bullets={[
          { i: "anchor", t: "5 hook variants" },
          { i: "brain",  t: "Cialdini-backed" },
          { i: "edit",   t: "Hook + body + CTA" },
          { i: "zap",    t: "10 seconds" },
        ]}
      />
    );
  }

  async function generate() {
    if (!productName.trim() || !whoItsFor.trim() || !mainBenefit.trim()) return;
    setLoading(true);
    setError("");
    setVariants([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError("Log in required."); return; }

      const res = await fetch("/api/ai-tools/ad-copywriter", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          product_name:         productName.trim(),
          who_its_for:          whoItsFor.trim(),
          main_benefit:         mainBenefit.trim(),
          what_makes_it_unique: unique.trim() || undefined,
          niche:                niche.trim() || undefined,
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

  function reset() {
    setVariants([]);
    setError("");
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div>
      {/* Tier badge */}
      <div style={{ background: tier === "growth" ? "#0c0a09" : "#5b21b6", color: tier === "growth" ? "#fde68a" : "#ddd6fe", border: `1px solid ${tier === "growth" ? "rgba(250,204,21,0.3)" : "rgba(196,181,253,0.4)"}`, borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>
          <Icon name={tier === "growth" ? "rocket" : "sparkles"} size={12} strokeWidth={2.5} style={{ display: "inline", marginRight: 6, verticalAlign: "-1px" }} />
          <strong>{tier === "growth" ? "Scale Lab" : "Pro"} · AI Ad Copywriter.</strong> Paste product info, get 5 variants across different psychological angles.
        </p>
        {usage && (
          <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>{usage.used} / {usage.limit} runs today</p>
        )}
      </div>

      {variants.length === 0 ? (
        <>
          <Field label="Product name" hint="e.g. The Sleepy Tea, FlexFit Resistance Bands">
            <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="What you call the product" maxLength={200} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <Field label="Who is this for?" hint="Be specific — 'desk workers with neck pain', not 'people'">
            <input type="text" value={whoItsFor} onChange={e => setWhoItsFor(e.target.value)} placeholder="Specific target customer" maxLength={300} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <Field label="Main benefit / transformation" hint="What changes for them after they buy?">
            <textarea value={mainBenefit} onChange={e => setMainBenefit(e.target.value)} placeholder="The real outcome — not features. e.g. 'Falls asleep in under 15 min without grogginess the next morning.'" rows={3} maxLength={400} style={textareaStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <Field label="What makes it unique? (optional)" hint="Ingredient, mechanism, story — what's different">
            <input type="text" value={unique} onChange={e => setUnique(e.target.value)} placeholder="e.g. Made with rare valerian root from Iceland" maxLength={400} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <Field label="Niche (optional)">
            <input type="text" value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. sleep & wellness" maxLength={100} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <button
            onClick={generate}
            disabled={loading || !productName.trim() || !whoItsFor.trim() || !mainBenefit.trim()}
            style={{
              width: "100%", marginTop: 8,
              background: loading || !productName.trim() || !whoItsFor.trim() || !mainBenefit.trim() ? "#e4e4e7" : "linear-gradient(135deg, #6366f1, #7c3aed)",
              color:      loading || !productName.trim() || !whoItsFor.trim() || !mainBenefit.trim() ? "#a1a1aa" : "#fff",
              fontWeight: 800, fontSize: 14, padding: "13px 24px", borderRadius: 14, border: "none",
              cursor: loading || !productName.trim() || !whoItsFor.trim() || !mainBenefit.trim() ? "not-allowed" : "pointer",
              letterSpacing: "-0.2px",
            }}
          >
            {loading ? "Writing 5 variants…" : "Generate 5 ad variants →"}
          </button>

          {error && (
            <p style={{ fontSize: 12, color: "#dc2626", marginTop: 12, textAlign: "center" }}>⚠ {error}</p>
          )}
        </>
      ) : (
        <div>
          <p style={{ fontSize: 12, color: "#71717a", marginBottom: 14 }}>
            5 variants for <strong style={{ color: "#09090b" }}>{productName}</strong> — each uses a different psychological angle. Test them as separate ad creatives.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {variants.map((v, i) => (
              <div key={i} style={{ background: "#fff", border: "1.5px solid #e4e4e7", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                  <span style={{ background: "#7c3aed", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, letterSpacing: "0.04em" }}>
                    Variant {i + 1} · {v.angle}
                  </span>
                  <button onClick={() => copy(`${v.hook}\n\n${v.body}\n\n${v.cta}`)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, border: "1.5px solid #e4e4e7", background: "#fff", color: "#52525b", cursor: "pointer" }}>
                    Copy all
                  </button>
                </div>

                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 4 }}>🪝 Hook</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#09090b", marginBottom: 12, lineHeight: 1.4 }}>{v.hook}</p>

                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 4 }}>📝 Body</p>
                <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.65, marginBottom: 12 }}>{v.body}</p>

                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 4 }}>⚡ CTA</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#09090b", marginBottom: 10 }}>{v.cta}</p>

                {v.why_it_works && (
                  <p style={{ fontSize: 11, color: "#71717a", fontStyle: "italic", paddingTop: 8, borderTop: "1px solid #f4f4f5" }}>
                    💡 {v.why_it_works}
                  </p>
                )}
              </div>
            ))}
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
