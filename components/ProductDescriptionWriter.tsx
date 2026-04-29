"use client";

/**
 * ProductDescriptionWriter — paste product info, get 3 description variants
 * across different psychological angles (benefit / story / social_proof).
 *
 * Pro: 5/day. Growth: 20/day. Free: locked card.
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthTier } from "@/lib/useAuthTier";
import { useAIToolUsage } from "@/lib/useAIToolUsage";
import AIToolLockCard from "./AIToolLockCard";

type Tone   = "professional" | "conversational" | "playful" | "luxury";
type Length = "short" | "medium" | "long";

type Variant = {
  angle:    "benefit" | "story" | "social_proof";
  headline: string;
  body:     string;
  bullets:  string[];
};

const ANGLE_META: Record<Variant["angle"], { emoji: string; label: string; color: string; bg: string }> = {
  benefit:      { emoji: "🎯", label: "Benefit-focused",  color: "#7c3aed", bg: "#f5f3ff" },
  story:        { emoji: "📖", label: "Story / sensory",  color: "#0891b2", bg: "#ecfeff" },
  social_proof: { emoji: "⭐", label: "Social proof / FOMO", color: "#d97706", bg: "#fffbeb" },
};

export default function ProductDescriptionWriter() {
  const tier = useAuthTier();

  const [productName,    setProductName]    = useState("");
  const [benefits,       setBenefits]       = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [tone,           setTone]           = useState<Tone>("conversational");
  const [length,         setLength]         = useState<Length>("medium");

  const [loading,  setLoading]  = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [error,    setError]    = useState("");
  const { usage, refresh: refreshUsage, bump: bumpUsage } = useAIToolUsage("product_description");

  if (tier === "unknown" || tier === "anon" || tier === "free") {
    return (
      <AIToolLockCard
        authState={tier}
        emoji="📝"
        label="Product Description Writer"
        tagline="Paste your product. Get 3 description variants for your product page."
        bullets={[
          { e: "🎯", t: "3 angles" },
          { e: "🎨", t: "4 tone options" },
          { e: "📏", t: "Short / medium / long" },
          { e: "⚡", t: "10 seconds" },
        ]}
      />
    );
  }

  async function generate() {
    if (!productName.trim() || !benefits.trim() || !targetCustomer.trim()) return;
    setLoading(true);
    setError("");
    setVariants([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError("Log in required."); return; }

      const res = await fetch("/api/ai-tools/product-description", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          product_name:    productName.trim(),
          benefits:        benefits.trim(),
          target_customer: targetCustomer.trim(),
          tone, length,
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

  function fullCopy(v: Variant) {
    return `${v.headline}\n\n${v.body}\n\n${v.bullets.map(b => `• ${b}`).join("\n")}`;
  }

  return (
    <div>
      {/* Tier badge */}
      <div style={{ background: tier === "growth" ? "#0c0a09" : "#5b21b6", color: tier === "growth" ? "#fde68a" : "#ddd6fe", border: `1px solid ${tier === "growth" ? "rgba(250,204,21,0.3)" : "rgba(196,181,253,0.4)"}`, borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>
          {tier === "growth" ? "🚀 " : "✨ "}<strong>{tier === "growth" ? "Scale Lab" : "Pro"} · Product Description Writer.</strong> 3 variants — benefit, story, social proof.
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

          <Field label="Benefits, features, materials" hint="Everything the buyer should know. The more concrete, the better.">
            <textarea value={benefits} onChange={e => setBenefits(e.target.value)} placeholder="e.g. 100% organic chamomile + valerian root. 0.4mg melatonin per cup. Sleep onset in <15 min. No grogginess. Ships from Iceland." rows={5} maxLength={1500} style={textareaStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <Field label="Who is this for?" hint="Be specific — 'desk workers with neck pain', not 'people'">
            <input type="text" value={targetCustomer} onChange={e => setTargetCustomer(e.target.value)} placeholder="Specific target customer" maxLength={300} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <Field label="Tone">
              <select value={tone} onChange={e => setTone(e.target.value as Tone)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="professional">Professional</option>
                <option value="conversational">Conversational</option>
                <option value="playful">Playful</option>
                <option value="luxury">Luxury</option>
              </select>
            </Field>
            <Field label="Length">
              <select value={length} onChange={e => setLength(e.target.value as Length)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="short">Short (~50w)</option>
                <option value="medium">Medium (~120w)</option>
                <option value="long">Long (~250w)</option>
              </select>
            </Field>
          </div>

          <button
            onClick={generate}
            disabled={loading || !productName.trim() || !benefits.trim() || !targetCustomer.trim()}
            style={{
              width: "100%", marginTop: 4,
              background: loading || !productName.trim() || !benefits.trim() || !targetCustomer.trim() ? "#e4e4e7" : "linear-gradient(135deg, #6366f1, #7c3aed)",
              color:      loading || !productName.trim() || !benefits.trim() || !targetCustomer.trim() ? "#a1a1aa" : "#fff",
              fontWeight: 800, fontSize: 14, padding: "13px 24px", borderRadius: 14, border: "none",
              cursor: loading || !productName.trim() || !benefits.trim() || !targetCustomer.trim() ? "not-allowed" : "pointer",
              letterSpacing: "-0.2px",
            }}
          >
            {loading ? "📝 Writing 3 variants…" : "📝 Generate 3 descriptions →"}
          </button>

          {error && (
            <p style={{ fontSize: 12, color: "#dc2626", marginTop: 12, textAlign: "center" }}>⚠ {error}</p>
          )}
        </>
      ) : (
        <div>
          <p style={{ fontSize: 12, color: "#71717a", marginBottom: 14 }}>
            3 variants for <strong style={{ color: "#09090b" }}>{productName}</strong> — different psychological angles. Test them as separate product page versions.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {variants.map((v, i) => {
              const meta = ANGLE_META[v.angle] ?? ANGLE_META.benefit;
              return (
                <div key={i} style={{ background: "#fff", border: "1.5px solid #e4e4e7", borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 6 }}>
                    <span style={{ background: meta.color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, letterSpacing: "0.04em" }}>
                      {meta.emoji} {meta.label}
                    </span>
                    <button onClick={() => copy(fullCopy(v))} style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, border: "1.5px solid #e4e4e7", background: "#fff", color: "#52525b", cursor: "pointer" }}>
                      Copy all
                    </button>
                  </div>

                  <p style={{ fontSize: 18, fontWeight: 800, color: "#09090b", marginBottom: 10, lineHeight: 1.3, letterSpacing: "-0.3px" }}>{v.headline}</p>

                  <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.7, marginBottom: 12, whiteSpace: "pre-wrap" }}>{v.body}</p>

                  {v.bullets.length > 0 && (
                    <div style={{ background: meta.bg, border: `1px solid ${meta.color}33`, borderRadius: 10, padding: "10px 14px" }}>
                      <ul style={{ margin: 0, paddingLeft: 18, color: meta.color }}>
                        {v.bullets.map((b, j) => (
                          <li key={j} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 4, fontWeight: 600 }}>{b}</li>
                        ))}
                      </ul>
                    </div>
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
const textareaStyle: React.CSSProperties = {
  ...inputStyle, fontSize: 13, resize: "vertical", fontFamily: "inherit", lineHeight: 1.55,
};
function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) { e.currentTarget.style.borderColor = "#6366f1"; }
function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) { e.currentTarget.style.borderColor = "#e4e4e7"; }

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>{hint}</p>}
      {children}
    </div>
  );
}
