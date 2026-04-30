"use client";

/**
 * OfferBuilder — Scale Lab exclusive (Module 17 fit).
 *
 * User describes their product + price + customer + dream outcome + obstacles.
 * Gemini constructs an irresistible offer using Hormozi's value equation,
 * returning the offer headline + a full value stack ready to paste into a
 * landing page or product page.
 *
 * Free / Pro users see an upgrade card. Anonymous users see a sign-up CTA.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { useAIToolUsage } from "@/lib/useAIToolUsage";
import { Icon } from "./Icon";

type Bonus = { name: string; value: string; why_it_matters: string };
type Offer = {
  headline:           string;
  dream_outcome:      string;
  likelihood_levers:  string[];
  time_compression:   string[];
  effort_removers:    string[];
  bonus_stack:        Bonus[];
  guarantee:          string;
  scarcity_hook:      string;
  total_value:        string;
  price_anchor:       string;
  cta_line:           string;
};

export default function OfferBuilder() {
  const [authState, setAuthState] = useState<"unknown" | "anon" | "free" | "pro" | "growth">("unknown");

  // Form state
  const [productName,      setProductName]      = useState("");
  const [currentPrice,     setCurrentPrice]     = useState("");
  const [targetCustomer,   setTargetCustomer]   = useState("");
  const [dreamOutcome,     setDreamOutcome]     = useState("");
  const [currentObstacles, setCurrentObstacles] = useState("");

  // Result state
  const [building, setBuilding] = useState(false);
  const [offer,    setOffer]    = useState<Offer | null>(null);
  const [error,    setError]    = useState("");
  const { usage, refresh: refreshUsage, bump: bumpUsage } = useAIToolUsage("offer_builder");

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

  const formValid = productName.trim().length > 0
    && currentPrice.trim().length > 0
    && targetCustomer.trim().length > 0
    && dreamOutcome.trim().length >= 10
    && currentObstacles.trim().length >= 10;

  async function handleBuild() {
    if (!formValid) return;
    setBuilding(true);
    setError("");
    setOffer(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError("Log in to use Offer Builder."); return; }

      const res = await fetch("/api/ai-tools/offer-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          product_name:      productName.trim(),
          current_price:     currentPrice.trim(),
          target_customer:   targetCustomer.trim(),
          dream_outcome:     dreamOutcome.trim(),
          current_obstacles: currentObstacles.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.rateLimited) refreshUsage();
        throw new Error(data.error ?? "Couldn't build offer");
      }
      setOffer(data.offer);
      bumpUsage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't build offer");
    } finally {
      setBuilding(false);
    }
  }

  function reset() {
    setOffer(null); setError("");
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  // ── Locked state for non-Growth users ──────────────────────
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
              Grand Slam Offer Builder — engineer an offer they can&apos;t refuse
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: 22, maxWidth: 480, margin: "0 auto 22px" }}>
              Built on Hormozi&apos;s $100M Offers framework. Paste your product. AI builds the headline, dream outcome, bonus stack with $ values, guarantee, and scarcity hook — ready to paste into your page.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 22, maxWidth: 480, margin: "0 auto 22px" }}>
              {([
                { i: "target",  t: "Headline offer" },
                { i: "layers",  t: "Value stack" },
                { i: "gift",    t: "Bonus stack ($)" },
                { i: "shield",  t: "Risk reversal" },
                { i: "flame",   t: "Real scarcity" },
                { i: "send",    t: "Paste-ready CTA" },
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
              {authState === "anon" ? "Start with the free tier, upgrade when ready" : "Already Pro? Scale Lab unlocks this + 11 advanced modules"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (authState === "unknown") return <div className="spinner" style={{ margin: "40px auto" }} />;

  // ── Growth user / admin form ──────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid #e4e4e7", fontSize: 14, color: "#09090b",
    outline: "none", boxSizing: "border-box",
  };
  const textareaStyle: React.CSSProperties = { ...inputStyle, fontFamily: "inherit", lineHeight: 1.55, resize: "vertical" };
  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = "#0c0a09");
  const blurBorder  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = "#e4e4e7");

  return (
    <div>
      {/* Header notice */}
      <div style={{ background: "#0c0a09", color: "#fde68a", border: "1px solid rgba(250,204,21,0.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="rocket" size={14} strokeWidth={2} />
          <span><strong>Scale Lab · Grand Slam Offer Builder.</strong> Hormozi&apos;s value equation applied to your product.</span>
        </p>
        {usage && (
          <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>{usage.used} / {usage.limit} runs today</p>
        )}
      </div>

      {!offer ? (
        <>
          {/* Form */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Product name</label>
            <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. The Sleep Reset Course"
              maxLength={200} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Current price</label>
            <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>Include the cadence — e.g. &ldquo;$49/mo&rdquo; or &ldquo;$197 one-time&rdquo;.</p>
            <input type="text" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} placeholder="e.g. $49 one-time"
              maxLength={50} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Target customer</label>
            <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>Be specific — &ldquo;parents of toddlers who can&apos;t fall asleep&rdquo;, not &ldquo;people&rdquo;.</p>
            <input type="text" value={targetCustomer} onChange={e => setTargetCustomer(e.target.value)} placeholder="Specific customer + situation"
              maxLength={400} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Dream outcome</label>
            <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>What do they actually want? Use their words. Specific outcomes beat vague benefits.</p>
            <textarea value={dreamOutcome} onChange={e => setDreamOutcome(e.target.value)} rows={3}
              placeholder="e.g. Fall asleep in 15 minutes without grogginess the next morning, every night, even when they&rsquo;re anxious."
              maxLength={600} style={textareaStyle} onFocus={focusBorder} onBlur={blurBorder} />
            <p style={{ fontSize: 10, color: "#a1a1aa", marginTop: 4, textAlign: "right" }}>{dreamOutcome.length}/600</p>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Current obstacles</label>
            <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8 }}>What&apos;s stopping them from achieving the dream right now? List 2–4 specific blockers.</p>
            <textarea value={currentObstacles} onChange={e => setCurrentObstacles(e.target.value)} rows={4}
              placeholder="e.g. They&rsquo;ve tried meditation apps but can&rsquo;t stick with them. They wake up at 3am with anxiety. They don&rsquo;t want to take medication."
              maxLength={800} style={textareaStyle} onFocus={focusBorder} onBlur={blurBorder} />
            <p style={{ fontSize: 10, color: "#a1a1aa", marginTop: 4, textAlign: "right" }}>{currentObstacles.length}/800</p>
          </div>

          <button
            onClick={handleBuild}
            disabled={building || !formValid}
            style={{
              width: "100%",
              background: building || !formValid ? "#e4e4e7" : "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
              color:      building || !formValid ? "#a1a1aa" : "#fde68a",
              fontWeight: 800, fontSize: 14, padding: "14px 28px", borderRadius: 14, border: "none",
              cursor: building || !formValid ? "not-allowed" : "pointer", letterSpacing: "-0.2px",
            }}
          >
            {building ? "Building your offer…" : "Build my Grand Slam Offer →"}
          </button>

          {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 12, textAlign: "center" }}>⚠ {error}</p>}
        </>
      ) : (
        // ── Result ──
        <div>
          {/* Headline + dream outcome */}
          <div style={{ background: "linear-gradient(135deg, #0c0a09 0%, #1c1917 100%)", borderRadius: 16, padding: "22px 24px", marginBottom: 16, position: "relative" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fde68a", marginBottom: 10 }}>The offer</p>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.3, marginBottom: 14, letterSpacing: "-0.4px" }}>
              {offer.headline}
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.65 }}>{offer.dream_outcome}</p>
            <button onClick={() => copy(`${offer.headline}\n\n${offer.dream_outcome}`)}
              style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fde68a", fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 8, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Icon name="copy" size={11} strokeWidth={2} /> Copy
            </button>
          </div>

          {/* Value stack — 3 columns */}
          {[
            { title: "How we make achievement feel inevitable", color: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe", items: offer.likelihood_levers, icon: "shield" as const },
            { title: "How we compress time-to-result",          color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", items: offer.time_compression,  icon: "zap" as const },
            { title: "How we remove friction & effort",         color: "#16a34a", bg: "#ecfdf5", border: "#a7f3d0", items: offer.effort_removers,   icon: "minus" as const },
          ].map((s, i) => s.items.length > 0 && (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: s.color, marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name={s.icon} size={14} strokeWidth={2} /> {s.title}
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, color: s.color }}>
                {s.items.map((it, j) => <li key={j} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 4 }}>{it}</li>)}
              </ul>
            </div>
          ))}

          {/* Bonus stack */}
          {offer.bonus_stack.length > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#d97706", marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="gift" size={14} strokeWidth={2} /> Bonus stack
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {offer.bonus_stack.map((b, j) => (
                  <li key={j} style={{ paddingTop: 10, paddingBottom: 10, borderTop: j === 0 ? "none" : "1px solid #fde68a" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#92400e", flex: 1 }}>{b.name}</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: "#16a34a", whiteSpace: "nowrap" }}>{b.value}</p>
                    </div>
                    <p style={{ fontSize: 11, color: "#a16207", lineHeight: 1.55 }}>{b.why_it_matters}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Guarantee */}
          {offer.guarantee && (
            <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#16a34a", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="shield" size={14} strokeWidth={2} /> Risk reversal
              </p>
              <p style={{ fontSize: 13, color: "#065f46", lineHeight: 1.65 }}>{offer.guarantee}</p>
            </div>
          )}

          {/* Scarcity */}
          {offer.scarcity_hook && (
            <div style={{ background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#dc2626", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="flame" size={14} strokeWidth={2} /> Real scarcity
              </p>
              <p style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.65 }}>{offer.scarcity_hook}</p>
            </div>
          )}

          {/* Price anchor — total value vs price */}
          <div style={{ background: "#0c0a09", color: "#fde68a", borderRadius: 14, padding: "18px 22px", marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fde68a", marginBottom: 8 }}>Price anchor</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
              <p style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{offer.total_value}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>total perceived value</p>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.65 }}>{offer.price_anchor}</p>
          </div>

          {/* CTA */}
          {offer.cta_line && (
            <div style={{ background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 12, padding: "14px 18px", marginBottom: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#7c3aed", marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="send" size={14} strokeWidth={2} /> CTA copy
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#5b21b6", lineHeight: 1.55 }}>&ldquo;{offer.cta_line}&rdquo;</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <button onClick={reset}
              style={{ flex: 1, minWidth: 140, background: "#fff", border: "1.5px solid #e4e4e7", color: "#52525b", fontWeight: 700, fontSize: 13, padding: "11px 20px", borderRadius: 10, cursor: "pointer" }}>
              ↺ Build another offer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
