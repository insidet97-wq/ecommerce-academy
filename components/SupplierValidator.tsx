"use client";

/**
 * SupplierValidator
 *
 * Reusable interactive tool that scores a supplier across 5 categories
 * (reviews / shipping / communication / quality / price) and outputs a
 * 0-100 trust score with a Good / Risky / Avoid verdict.
 *
 * MVP: pure manual inputs. URL field is captured but not auto-parsed —
 * `fetchSupplierData(url)` is a stub that can be replaced later with a
 * real API integration (Trustpilot, AliExpress, etc.) without changing
 * the rest of the component.
 *
 * Save: optional. Calls POST /api/supplier-validations if user is logged in.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

const INDIGO = "#6366f1";

type AIAnalysis = {
  summary:       string;
  red_flags:     string[];
  questions:     string[];
  likely_issues: string[];
  checklist:     string[];
};

// ── Stub for future URL-based auto-fill ──────────────────────
// When you wire up a real API later (Trustpilot, AliExpress, etc.),
// implement this function. It should return any fields it can detect
// from the URL. Anything it can't detect, the user fills in manually.
async function fetchSupplierData(_url: string): Promise<Partial<Inputs>> {
  // No-op for MVP — return empty so user fills everything in manually.
  return {};
}

type Inputs = {
  supplierName: string;
  supplierUrl:  string;
  reviewRating: number;   // 1–5
  reviewCount:  number;   // 0+
  shippingDays: number;   // days to deliver
  communication: number;  // 1–5
  quality:       number;  // 1–5
  marginPct:     number;  // 0–100
  notes:         string;
};

type Scores = {
  reviews:        number;
  shipping:       number;
  communication:  number;
  quality:        number;
  price:          number;
};

type Result = {
  scores:  Scores;
  total:   number;
  verdict: "good" | "risky" | "avoid";
};

// ── Pure scoring logic ──────────────────────────────────────
function scoreInputs(i: Inputs): Result {
  const reviews =
    Math.min(25, (i.reviewRating / 5) * 15 + Math.min(i.reviewCount / 100, 1) * 10);

  const shipping =
    i.shippingDays <= 7  ? 20 :
    i.shippingDays <= 14 ? 15 :
    i.shippingDays <= 21 ? 10 :
    i.shippingDays <= 30 ?  5 : 0;

  const communication = (i.communication / 5) * 15;
  const quality       = (i.quality       / 5) * 20;

  const price =
    i.marginPct >= 67 ? 20 :
    i.marginPct >= 50 ? 15 :
    i.marginPct >= 35 ? 10 :
    i.marginPct >= 20 ?  5 : 0;

  const scores: Scores = {
    reviews:       Math.round(reviews),
    shipping,
    communication: Math.round(communication),
    quality:       Math.round(quality),
    price,
  };
  const total = scores.reviews + scores.shipping + scores.communication + scores.quality + scores.price;

  const verdict: Result["verdict"] =
    total >= 75 ? "good" :
    total >= 50 ? "risky" : "avoid";

  return { scores, total, verdict };
}

// ── UI primitives ────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>{hint}</p>}
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, min, max, step = 1, suffix }: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; suffix?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center",
      border: `1.5px solid ${focused ? INDIGO : "#e4e4e7"}`,
      borderRadius: 10, overflow: "hidden", background: "#fff",
      transition: "border-color 0.15s",
      boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
    }}>
      <input
        type="number"
        value={value || ""}
        onChange={e => onChange(Number(e.target.value))}
        min={min} max={max} step={step}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ flex: 1, padding: "10px 14px", fontSize: 14, fontWeight: 500, border: "none", outline: "none", color: "#09090b", background: "transparent" }}
      />
      {suffix && (
        <span style={{ padding: "10px 14px", background: "#f8f8fb", fontSize: 13, color: "#71717a", borderLeft: "1px solid #e4e4e7", userSelect: "none", whiteSpace: "nowrap" }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

function StarRater({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} stars`}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 4,
            fontSize: 28, lineHeight: 1, color: n <= value ? "#facc15" : "#e4e4e7",
            transition: "transform 0.1s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.15)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >★</button>
      ))}
    </div>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#52525b" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#09090b" }}>{value}<span style={{ color: "#a1a1aa", fontWeight: 500 }}>/{max}</span></span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "#f4f4f5" }}>
        <div style={{
          height: 6, borderRadius: 99,
          background: color,
          width: `${(value / max) * 100}%`,
          transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function SupplierValidator() {
  const [inputs, setInputs] = useState<Inputs>({
    supplierName: "",
    supplierUrl:  "",
    reviewRating: 0,
    reviewCount:  0,
    shippingDays: 0,
    communication: 0,
    quality:       0,
    marginPct:     0,
    notes:         "",
  });
  const [result, setResult] = useState<Result | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);

  // Pro / auth state — drives whether the AI analysis CTA is the upgrade pitch or the real button
  const [authState, setAuthState] = useState<"unknown" | "anon" | "free" | "pro">("unknown");
  const [analysis,  setAnalysis]  = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisErr, setAnalysisErr] = useState<string>("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) { setAuthState("anon"); return; }
      if (isAdmin(user.email)) { setAuthState("pro"); return; } // admins always Pro
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_pro")
        .eq("id", user.id)
        .single();
      if (!active) return;
      setAuthState(profile?.is_pro ? "pro" : "free");
    })();
    return () => { active = false; };
  }, []);

  function update<K extends keyof Inputs>(key: K, value: Inputs[K]) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  async function handleUrlAutoFill() {
    if (!inputs.supplierUrl) return;
    setUrlLoading(true);
    try {
      const filled = await fetchSupplierData(inputs.supplierUrl);
      setInputs(prev => ({ ...prev, ...filled }));
    } finally {
      setUrlLoading(false);
    }
  }

  function calculate() {
    if (!inputs.supplierName.trim()) return;
    setResult(scoreInputs(inputs));
    setSaveMsg(null);
  }

  function reset() {
    setInputs({
      supplierName: "", supplierUrl: "",
      reviewRating: 0, reviewCount: 0, shippingDays: 0,
      communication: 0, quality: 0, marginPct: 0, notes: "",
    });
    setResult(null);
    setSaveMsg(null);
  }

  async function save() {
    if (!result) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setSaveMsg({ type: "error", text: "Log in to save your supplier validations." });
        return;
      }
      const res = await fetch("/api/supplier-validations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          supplier_name: inputs.supplierName,
          supplier_url:  inputs.supplierUrl || null,
          inputs,
          scores: result.scores,
          total_score: result.total,
          verdict: result.verdict,
          notes: inputs.notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Save failed");
      }
      setSaveMsg({ type: "success", text: "Saved. View your saved suppliers from your dashboard." });
    } catch (err) {
      setSaveMsg({ type: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function runAIAnalysis() {
    if (!result) return;
    setAnalyzing(true);
    setAnalysisErr("");
    setAnalysis(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setAnalysisErr("Log in as a Pro member."); return; }
      const res = await fetch("/api/supplier-ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          supplier_name: inputs.supplierName,
          supplier_url:  inputs.supplierUrl || null,
          review_rating: inputs.reviewRating,
          review_count:  inputs.reviewCount,
          shipping_days: inputs.shippingDays,
          communication: inputs.communication,
          quality:       inputs.quality,
          margin_pct:    inputs.marginPct,
          notes:         inputs.notes || null,
          total_score:   result.total,
          verdict:       result.verdict,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalysis(data.analysis);
    } catch (err) {
      setAnalysisErr(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  // Verdict colors
  const verdictMeta = result && {
    good:  { label: "✅ Good supplier",  color: "#16a34a", bg: "#ecfdf5", border: "#a7f3d0", barColor: "linear-gradient(90deg, #16a34a, #22c55e)" },
    risky: { label: "⚠️ Proceed with caution", color: "#d97706", bg: "#fffbeb", border: "#fde68a", barColor: "linear-gradient(90deg, #f59e0b, #fbbf24)" },
    avoid: { label: "🛑 Avoid this supplier", color: "#dc2626", bg: "#fff1f2", border: "#fecaca", barColor: "linear-gradient(90deg, #dc2626, #ef4444)" },
  }[result.verdict];

  const canCalculate = inputs.supplierName.trim().length > 0;

  return (
    <div>
      {/* ── Pro AI analysis preview banner (always visible) ── */}
      {authState !== "unknown" && (
        authState === "pro" ? (
          <div style={{ background: "#f5f3ff", border: "1.5px solid #c4b5fd", borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <p style={{ fontSize: 12, color: "#5b21b6", lineHeight: 1.5, margin: 0 }}>
              <strong>Pro · AI analysis enabled.</strong> After you calculate the score, you&apos;ll get red flags, verification questions, and a tailored pre-order checklist below.
            </p>
          </div>
        ) : (
          <Link
            href={authState === "anon" ? "/signup" : "/upgrade"}
            style={{ textDecoration: "none", display: "block", marginBottom: 18 }}
          >
            <div style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", border: "1.5px solid #fcd34d", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, transition: "transform 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <span style={{ fontSize: 22 }}>🤖</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#78350f", lineHeight: 1.45, margin: 0 }}>
                  Upgrade to Pro and the AI does the work for you
                </p>
                <p style={{ fontSize: 11, color: "#92400e", lineHeight: 1.5, margin: "2px 0 0" }}>
                  Pro members get red flags, verification questions, and a custom pre-order checklist for every supplier.
                </p>
              </div>
              <span style={{ background: "#1c1917", color: "#fde68a", fontSize: 11, fontWeight: 800, padding: "6px 11px", borderRadius: 8, whiteSpace: "nowrap" }}>
                {authState === "anon" ? "Sign up →" : "Upgrade →"}
              </span>
            </div>
          </Link>
        )
      )}

      {/* ── Form ── */}
      <Field label="Supplier name" hint="What you call them — e.g. AliExpress Seller XYZ, Spocket store ABC">
        <input
          type="text"
          value={inputs.supplierName}
          onChange={e => update("supplierName", e.target.value)}
          placeholder="e.g. ABC Trading Co."
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7", fontSize: 14, color: "#09090b", outline: "none", boxSizing: "border-box" }}
          onFocus={e => (e.currentTarget.style.borderColor = INDIGO)}
          onBlur={e => (e.currentTarget.style.borderColor = "#e4e4e7")}
        />
      </Field>

      <Field label="Supplier URL (optional)" hint="For your reference. Auto-fill from URL is coming in a future update.">
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="url"
            value={inputs.supplierUrl}
            onChange={e => update("supplierUrl", e.target.value)}
            placeholder="https://..."
            style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7", fontSize: 14, color: "#09090b", outline: "none", boxSizing: "border-box" }}
            onFocus={e => (e.currentTarget.style.borderColor = INDIGO)}
            onBlur={e => (e.currentTarget.style.borderColor = "#e4e4e7")}
          />
          <button
            type="button"
            onClick={handleUrlAutoFill}
            disabled={!inputs.supplierUrl || urlLoading}
            title="Auto-fill from URL (coming soon)"
            style={{
              padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
              border: "1.5px solid #e4e4e7", background: "#f8f8fb", color: "#a1a1aa",
              cursor: !inputs.supplierUrl || urlLoading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {urlLoading ? "…" : "Auto-fill"}
          </button>
        </div>
      </Field>

      <div style={{ height: 1, background: "#f4f4f5", margin: "20px 0" }} />

      {/* Reviews */}
      <Field label="📣 Reviews" hint="Average star rating + how many reviews exist">
        <div style={{ marginBottom: 8 }}>
          <StarRater value={inputs.reviewRating} onChange={v => update("reviewRating", v)} />
        </div>
        <NumberInput value={inputs.reviewCount} onChange={v => update("reviewCount", Math.max(0, v))} min={0} suffix="reviews" />
      </Field>

      {/* Shipping */}
      <Field label="🚚 Shipping time" hint="How many days from order to delivery">
        <NumberInput value={inputs.shippingDays} onChange={v => update("shippingDays", Math.max(0, v))} min={0} suffix="days" />
      </Field>

      {/* Communication */}
      <Field label="💬 Communication" hint="How responsive and helpful are they?">
        <StarRater value={inputs.communication} onChange={v => update("communication", v)} />
      </Field>

      {/* Quality */}
      <Field label="📦 Product quality" hint="Based on samples or research">
        <StarRater value={inputs.quality} onChange={v => update("quality", v)} />
      </Field>

      {/* Margin */}
      <Field label="💰 Margin %" hint="(sell price − supplier cost) ÷ sell price × 100. Aim for 67%+ (the 3X rule)">
        <NumberInput value={inputs.marginPct} onChange={v => update("marginPct", Math.max(0, Math.min(100, v)))} min={0} max={100} suffix="%" />
      </Field>

      <Field label="Notes (optional)" hint="Anything else worth remembering">
        <textarea
          value={inputs.notes}
          onChange={e => update("notes", e.target.value)}
          rows={2}
          placeholder="e.g. Great packaging, slow during Chinese New Year"
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7", fontSize: 13, color: "#09090b", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
          onFocus={e => (e.currentTarget.style.borderColor = INDIGO)}
          onBlur={e => (e.currentTarget.style.borderColor = "#e4e4e7")}
        />
      </Field>

      <button
        onClick={calculate}
        disabled={!canCalculate}
        style={{
          width: "100%",
          background: !canCalculate ? "#e4e4e7" : "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
          color: !canCalculate ? "#a1a1aa" : "#fff",
          fontWeight: 700, fontSize: 14,
          padding: "13px 28px", borderRadius: 14, border: "none",
          cursor: !canCalculate ? "not-allowed" : "pointer",
          boxShadow: !canCalculate ? "none" : "0 4px 20px rgba(99,102,241,0.28)",
          transition: "box-shadow 0.2s, transform 0.2s",
          marginTop: 8,
        }}
      >
        {result ? "↺ Recalculate" : "Calculate trust score →"}
      </button>

      {/* ── Result ── */}
      {result && verdictMeta && (
        <div style={{ marginTop: 24, background: verdictMeta.bg, border: `1.5px solid ${verdictMeta.border}`, borderRadius: 18, padding: "22px 22px 20px" }}>
          {/* Big score */}
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: verdictMeta.color, letterSpacing: "-2px", lineHeight: 1 }}>
              {result.total}
              <span style={{ fontSize: 22, color: verdictMeta.color, opacity: 0.5, fontWeight: 700, marginLeft: 4 }}>/100</span>
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: verdictMeta.color, marginTop: 8, letterSpacing: "-0.3px" }}>
              {verdictMeta.label}
            </p>
            <p style={{ fontSize: 12, color: verdictMeta.color, opacity: 0.75, marginTop: 4 }}>
              {result.verdict === "good"  && "Solid supplier — comfortable to scale with."}
              {result.verdict === "risky" && "Workable but address the weak categories before scaling."}
              {result.verdict === "avoid" && "Too many red flags. Consider a different supplier."}
            </p>
          </div>

          {/* Breakdown */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", marginTop: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: 12 }}>Score breakdown</p>
            <ScoreBar label="📣 Reviews"        value={result.scores.reviews}       max={25} color={verdictMeta.barColor} />
            <ScoreBar label="🚚 Shipping"       value={result.scores.shipping}      max={20} color={verdictMeta.barColor} />
            <ScoreBar label="💬 Communication"  value={result.scores.communication} max={15} color={verdictMeta.barColor} />
            <ScoreBar label="📦 Quality"        value={result.scores.quality}       max={20} color={verdictMeta.barColor} />
            <ScoreBar label="💰 Price/margin"   value={result.scores.price}         max={20} color={verdictMeta.barColor} />
          </div>

          {/* ── AI Analysis (Pro feature) ── */}
          {authState === "pro" ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", marginTop: 12, border: "1.5px solid #c4b5fd" }}>
              {!analysis ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 200px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 4 }}>
                      ✨ Pro · AI Analysis
                    </p>
                    <p style={{ fontSize: 12, color: "#52525b", lineHeight: 1.5 }}>
                      Get red flags, questions to ask, likely issues, and a verification checklist tailored to this supplier.
                    </p>
                  </div>
                  <button
                    onClick={runAIAnalysis}
                    disabled={analyzing}
                    style={{
                      background: analyzing ? "#e4e4e7" : "linear-gradient(135deg, #6366f1, #7c3aed)",
                      color: analyzing ? "#a1a1aa" : "#fff",
                      fontWeight: 700, fontSize: 13, padding: "10px 18px",
                      borderRadius: 10, border: "none",
                      cursor: analyzing ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {analyzing ? "Analysing…" : "🤖 Run AI analysis"}
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 8 }}>
                    🤖 AI Analysis
                  </p>
                  {analysis.summary && (
                    <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.65, marginBottom: 14, fontStyle: "italic", paddingLeft: 12, borderLeft: "3px solid #c4b5fd" }}>
                      {analysis.summary}
                    </p>
                  )}

                  {analysis.red_flags?.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>🚩 Red flags</p>
                      <ul style={{ margin: 0, paddingLeft: 20, color: "#7f1d1d" }}>
                        {analysis.red_flags.map((f, i) => (
                          <li key={i} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 4 }}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.questions?.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>❓ Ask the supplier</p>
                      <ul style={{ margin: 0, paddingLeft: 20, color: "#1e40af" }}>
                        {analysis.questions.map((q, i) => (
                          <li key={i} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 4 }}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.likely_issues?.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#d97706", marginBottom: 6 }}>⚠️ Likely issues to watch for</p>
                      <ul style={{ margin: 0, paddingLeft: 20, color: "#92400e" }}>
                        {analysis.likely_issues.map((it, i) => (
                          <li key={i} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 4 }}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.checklist?.length > 0 && (
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", marginBottom: 6 }}>✅ Pre-order checklist</p>
                      <ul style={{ margin: 0, paddingLeft: 20, color: "#166534" }}>
                        {analysis.checklist.map((c, i) => (
                          <li key={i} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 4 }}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={runAIAnalysis}
                    disabled={analyzing}
                    style={{ background: "transparent", border: "none", color: "#7c3aed", fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 12, padding: 0 }}
                  >
                    ↺ Re-run analysis
                  </button>
                </div>
              )}
              {analysisErr && (
                <p style={{ fontSize: 12, color: "#dc2626", marginTop: 10 }}>⚠ {analysisErr}</p>
              )}
            </div>
          ) : authState !== "unknown" && (
            <Link
              href={authState === "anon" ? "/signup" : "/upgrade"}
              style={{
                display: "block", textDecoration: "none", marginTop: 12,
                background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)",
                borderRadius: 12, padding: "16px 18px", position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", position: "relative" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fde68a", marginBottom: 4 }}>
                    🔒 Pro · AI Analysis
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                    Unlock red flags, questions, and a tailored checklist
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                    {authState === "anon"
                      ? "Sign up free to get started, then upgrade to Pro for AI-powered supplier analysis."
                      : "Pro members get AI-tailored red flags, verification questions, and a custom pre-order checklist for every supplier."}
                  </p>
                </div>
                <span style={{ background: "linear-gradient(135deg, #facc15, #f59e0b)", color: "#1c1917", fontSize: 12, fontWeight: 800, padding: "8px 16px", borderRadius: 10, whiteSpace: "nowrap" }}>
                  {authState === "anon" ? "Get started →" : "Upgrade to Pro →"}
                </span>
              </div>
            </Link>
          )}

          {/* Save + reset */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <button
              onClick={save}
              disabled={saving}
              style={{
                flex: "1 1 160px",
                background: saving ? "#e4e4e7" : verdictMeta.color,
                color: saving ? "#a1a1aa" : "#fff",
                fontWeight: 700, fontSize: 13,
                padding: "11px 20px", borderRadius: 10, border: "none",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving…" : "💾 Save this validation"}
            </button>
            <button
              onClick={reset}
              style={{
                background: "transparent",
                color: "#71717a",
                fontWeight: 600, fontSize: 13,
                padding: "11px 20px", borderRadius: 10,
                border: "1.5px solid #e4e4e7",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>

          {saveMsg && (
            <p style={{ fontSize: 12, color: saveMsg.type === "success" ? "#16a34a" : "#dc2626", fontWeight: 500, marginTop: 12 }}>
              {saveMsg.type === "success" ? "✓ " : "⚠ "}{saveMsg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
