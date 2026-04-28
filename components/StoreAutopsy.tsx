"use client";

/**
 * StoreAutopsy — Growth-tier exclusive tool.
 *
 * User pastes a competitor URL + describes what they observed on the store,
 * Groq returns a structured teardown:
 *   - Summary (2–3 sentences)
 *   - Offer analysis (3–5 bullets)
 *   - Hook / messaging analysis (3–5 bullets)
 *   - Social proof analysis (2–4 bullets)
 *   - Conversion gaps (3–5 bullets)
 *   - Exploitation angles (3–5 bullets)
 *   - Threat level (Low / Medium / High)
 *
 * Free / Pro users see an upgrade card. Anonymous users see a sign-up CTA.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { useAIToolUsage } from "@/lib/useAIToolUsage";

type Autopsy = {
  summary: string;
  offer_analysis: string[];
  hook_analysis: string[];
  social_proof: string[];
  conversion_gaps: string[];
  exploitation_angles: string[];
  threat_level: "Low" | "Medium" | "High";
};

const THREAT_META: Record<Autopsy["threat_level"], { color: string; bg: string; border: string; label: string; description: string }> = {
  Low:    { color: "#16a34a", bg: "#ecfdf5", border: "#a7f3d0", label: "🟢 Low threat",    description: "Thin store. You can outclass them with a tighter niche, better creative, or a stronger offer." },
  Medium: { color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "🟡 Medium threat", description: "Decent operator with gaps. Find the angle they're missing and lean into it." },
  High:   { color: "#dc2626", bg: "#fff1f2", border: "#fecaca", label: "🔴 High threat",   description: "Serious player. Don't compete head-on — find an under-served sub-niche they don't serve." },
};

export default function StoreAutopsy() {
  const [authState, setAuthState] = useState<"unknown" | "anon" | "free" | "pro" | "growth">("unknown");

  // Form state
  const [url,         setUrl]         = useState("");
  const [niche,       setNiche]       = useState("");
  const [description, setDescription] = useState("");

  // Result state
  const [analyzing, setAnalyzing] = useState(false);
  const [autopsy,   setAutopsy]   = useState<Autopsy | null>(null);
  const [error,     setError]     = useState("");
  const { usage, refresh: refreshUsage, bump: bumpUsage } = useAIToolUsage("store_autopsy");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) { setAuthState("anon"); return; }
      if (isAdmin(user.email)) { setAuthState("growth"); return; } // admins always Growth-equivalent
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

  async function handleAnalyze() {
    if (!url.trim()) return;
    setAnalyzing(true);
    setError("");
    setAutopsy(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError("Log in to use Store Autopsy."); return; }

      const res = await fetch("/api/store-autopsy", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ url: url.trim(), niche: niche.trim() || undefined, description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.rateLimited) refreshUsage();
        throw new Error(data.error ?? "Analysis failed");
      }
      setAutopsy(data.autopsy);
      bumpUsage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  function reset() {
    setUrl(""); setNiche(""); setDescription("");
    setAutopsy(null); setError("");
  }

  // ── Locked state for non-Growth users ──────────────────────
  if (authState !== "unknown" && authState !== "growth") {
    return (
      <div>
        <div style={{ background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)", border: "1.5px solid rgba(250,204,21,0.4)", borderRadius: 18, padding: "32px 28px", position: "relative", overflow: "hidden" }}>
          <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(250,204,21,0.18) 0%, transparent 70%)" }} />
          <div style={{ position: "relative", textAlign: "center" }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🔒</p>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#fde68a", marginBottom: 10 }}>🚀 Scale Lab exclusive</p>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 10, lineHeight: 1.2 }}>
              Store Autopsy — see what your competitors are doing right (and wrong)
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: 22, maxWidth: 460, margin: "0 auto 22px" }}>
              Paste any competitor store URL + describe what you see. AI returns a structured teardown: their offer strategy, hooks, social proof, conversion gaps, and the exact angles you can use to out-position them.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 22, maxWidth: 480, margin: "0 auto 22px" }}>
              {[
                { e: "🎁", t: "Offer analysis" },
                { e: "🪝", t: "Hook strategy" },
                { e: "⭐", t: "Social proof" },
                { e: "🎯", t: "Conversion gaps" },
                { e: "🥷", t: "Exploit angles" },
                { e: "⚔️", t: "Threat level" },
              ].map((c, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(253,224,71,0.15)", borderRadius: 10, padding: "10px 8px" }}>
                  <p style={{ fontSize: 18, marginBottom: 4 }}>{c.e}</p>
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
              {authState === "anon" ? "Start with the free tier, upgrade when ready" : "Already Pro? Scale Lab unlocks this + 12 advanced modules"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading auth state ──────────────────────
  if (authState === "unknown") {
    return <div className="spinner" style={{ margin: "40px auto" }} />;
  }

  // ── Growth user / admin form ──────────────────────
  return (
    <div>
      {/* Header notice */}
      <div style={{ background: "#0c0a09", color: "#fde68a", border: "1px solid rgba(250,204,21,0.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🚀</span>
          <span><strong>Scale Lab · Store Autopsy.</strong> Paste a URL — AI fetches the page and returns a teardown. Notes optional.</span>
        </p>
        {usage && (
          <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>{usage.used} / {usage.limit} runs today</p>
        )}
      </div>

      {!autopsy ? (
        <>
          {/* Form */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Competitor URL</label>
            <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>The store you want analysed (Shopify, Amazon, anywhere).</p>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7", fontSize: 14, color: "#09090b", outline: "none", boxSizing: "border-box" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#0c0a09")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e4e4e7")}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Niche (optional)</label>
            <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>e.g. &ldquo;dog supplements&rdquo;, &ldquo;home gym recovery tools&rdquo;.</p>
            <input
              type="text"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="What niche are they in?"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7", fontSize: 14, color: "#09090b", outline: "none", boxSizing: "border-box" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#0c0a09")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e4e4e7")}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Notes (optional)</label>
            <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>The AI fetches the URL directly. Use this box for things AI can&apos;t see: ads you&apos;ve spotted on Meta/TikTok, founder backstory, anything off-site. Leave blank to let the AI work from just the page.</p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              placeholder="Optional. e.g. 'I've seen their Meta ads show before/after of older dogs. Founder posts daily on TikTok. Their reviews look filtered — only 5-stars on the homepage but 3-star avg on Trustpilot.'"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7", fontSize: 13, color: "#09090b", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", lineHeight: 1.55 }}
              onFocus={e => (e.currentTarget.style.borderColor = "#0c0a09")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e4e4e7")}
            />
            <p style={{ fontSize: 10, color: "#a1a1aa", marginTop: 4, textAlign: "right" }}>{description.length}/3000</p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !url.trim()}
            style={{
              width: "100%",
              background: analyzing || !url.trim() ? "#e4e4e7" : "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
              color: analyzing || !url.trim() ? "#a1a1aa" : "#fde68a",
              fontWeight: 800, fontSize: 14,
              padding: "14px 28px", borderRadius: 14, border: "none",
              cursor: analyzing || !url.trim() ? "not-allowed" : "pointer",
              letterSpacing: "-0.2px",
            }}
          >
            {analyzing ? "🤖 Fetching the page + analysing…" : "🔍 Run Store Autopsy →"}
          </button>

          {error && (
            <p style={{ fontSize: 12, color: "#dc2626", marginTop: 12, textAlign: "center" }}>⚠ {error}</p>
          )}
        </>
      ) : (
        // ── Result ──
        <div>
          {/* Threat banner */}
          <div style={{ background: THREAT_META[autopsy.threat_level].bg, border: `1.5px solid ${THREAT_META[autopsy.threat_level].border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: THREAT_META[autopsy.threat_level].color, marginBottom: 4 }}>
              {THREAT_META[autopsy.threat_level].label}
            </p>
            <p style={{ fontSize: 12, color: THREAT_META[autopsy.threat_level].color, opacity: 0.85, lineHeight: 1.6 }}>
              {THREAT_META[autopsy.threat_level].description}
            </p>
          </div>

          {/* Summary */}
          {autopsy.summary && (
            <div style={{ background: "#0c0a09", color: "#fff", borderRadius: 14, padding: "18px 22px", marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fde68a", marginBottom: 8 }}>Read</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.65 }}>{autopsy.summary}</p>
            </div>
          )}

          {/* Sections */}
          {[
            { title: "🎁 Offer analysis",          items: autopsy.offer_analysis,      color: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe" },
            { title: "🪝 Hook strategy",           items: autopsy.hook_analysis,       color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
            { title: "⭐ Social proof",            items: autopsy.social_proof,        color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
            { title: "🎯 Conversion gaps",         items: autopsy.conversion_gaps,     color: "#dc2626", bg: "#fff1f2", border: "#fecaca" },
            { title: "🥷 Exploit angles for you", items: autopsy.exploitation_angles, color: "#16a34a", bg: "#ecfdf5", border: "#a7f3d0" },
          ].map((s, i) => s.items.length > 0 && (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: s.color, marginBottom: 8 }}>{s.title}</p>
              <ul style={{ margin: 0, paddingLeft: 18, color: s.color }}>
                {s.items.map((it, j) => (
                  <li key={j} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 4 }}>{it}</li>
                ))}
              </ul>
            </div>
          ))}

          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{ flex: 1, minWidth: 140, background: "#fff", border: "1.5px solid #e4e4e7", color: "#52525b", fontWeight: 700, fontSize: 13, padding: "11px 20px", borderRadius: 10, cursor: "pointer" }}
            >
              ↺ Analyse another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
