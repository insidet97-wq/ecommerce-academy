"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PRO_MODULES = [
  { emoji: "📱", id: 7,  title: "Drive Traffic: TikTok Organic", desc: "Get free eyes on your product every day." },
  { emoji: "📣", id: 8,  title: "Run Your First Paid Ad",        desc: "Launch a small Meta or TikTok ad campaign." },
  { emoji: "📈", id: 9,  title: "Conversion Optimisation",       desc: "Squeeze more sales from the traffic you have." },
  { emoji: "📧", id: 10, title: "Build Your Email List",         desc: "Own a direct line to your audience — forever." },
  { emoji: "💰", id: 11, title: "Make Your First Sale",          desc: "Get everything in place and land that first order." },
  { emoji: "🚀", id: 12, title: "Scale and Grow",                desc: "Add recurring income, a second product, a second channel." },
];

const FREE_INCLUDES = [
  "Modules 1–6 — complete beginner foundation",
  "Niche selection & winning product formula",
  "Customer avatar & Shopify store setup",
  "Your first sales funnel",
  "Progress tracking & completion streaks",
];

const PRO_INCLUDES = [
  "Everything in Free",
  "Modules 7–12 — traffic, ads, conversions & scaling",
  "TikTok organic growth playbook",
  "Step-by-step paid ads launch guide",
  "Email list building from scratch",
  "\"Make Your First Sale\" action plan",
  "Full scaling roadmap for Month 2+",
  "📦 Weekly product picks — 5 AI-researched products every Monday",
  "📋 Monthly ecom briefing — what's working now on Meta & TikTok",
  "Ad-free experience",
  "Cancel anytime",
];

export default function UpgradePage() {
  const router = useRouter();
  const [userId,   setUserId]   = useState<string | null>(null);
  const [email,    setEmail]    = useState<string>("");
  const [isPro,    setIsPro]    = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("user_profiles")
        .select("is_pro")
        .eq("id", user.id)
        .single();

      if (data?.is_pro) {
        setIsPro(true);
        router.push("/dashboard");
        return;
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleUpgrade() {
    if (!userId || !email) return;
    setChecking(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });
      const { url, error } = await res.json();
      if (error || !url) { alert("Something went wrong. Please try again."); setChecking(false); return; }
      window.location.href = url;
    } catch {
      alert("Something went wrong. Please try again.");
      setChecking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="text-center"><div className="spinner mx-auto mb-3" /><p style={{ color: "#a1a1aa", fontSize: 14 }}>Loading…</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* ── Nav ── */}
      <nav style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <img src="/logo.png" alt="First Sale Lab" style={{ height: 40, width: "auto" }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.4px" }}>First Sale Lab</span>
          </Link>
          <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
            onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
          >← Dashboard</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)", padding: "72px 24px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(139,92,246,0.45) 0%, transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.3)", borderRadius: 99, padding: "5px 14px", marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>✨</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fde68a" }}>First Sale Lab Pro</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 16, maxWidth: 520, margin: "0 auto 16px" }}>
            Unlock the complete roadmap to your first sale
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.65 }}>
            You&apos;ve built the foundation. Now learn how to drive traffic, run ads, optimise conversions, and actually make money.
          </p>

          {/* Price badge */}
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 24, padding: "24px 40px", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>$</span>
              <span style={{ fontSize: 52, fontWeight: 900, color: "#fff", letterSpacing: "-2px", lineHeight: 1 }}>19</span>
              <span style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.5)", alignSelf: "flex-end", marginBottom: 6 }}>/month</span>
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Cancel anytime. No questions asked.</span>
          </div>

          <div>
            <button
              onClick={handleUpgrade}
              disabled={checking}
              style={{ background: checking ? "rgba(255,255,255,0.15)" : "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)", color: checking ? "rgba(255,255,255,0.4)" : "#1c1917", fontWeight: 800, fontSize: 16, padding: "16px 44px", borderRadius: 16, border: "none", cursor: checking ? "not-allowed" : "pointer", boxShadow: checking ? "none" : "0 4px 24px rgba(250,204,21,0.4)", letterSpacing: "-0.3px", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { if (!checking) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 36px rgba(250,204,21,0.55)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(250,204,21,0.4)"; }}
            >
              {checking ? "Redirecting to checkout…" : "Upgrade to Pro →"}
            </button>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>
              Powered by Stripe — 100% secure
            </p>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "52px 24px 80px", display: "flex", flexDirection: "column", gap: 40 }}>

        {/* ── Pro modules unlock ── */}
        <section className="fade-up">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 6 }}>What you unlock</p>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.6px", marginBottom: 20 }}>6 modules that take you from store to sales</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PRO_MODULES.map(mod => (
              <div key={mod.id} style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(99,102,241,0.15)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg, #ede9fe, #ddd6fe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {mod.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 2 }}>Module {mod.id} — {mod.title}</p>
                  <p style={{ fontSize: 12, color: "#71717a" }}>{mod.desc}</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", flexShrink: 0 }}>PRO</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Free vs Pro comparison ── */}
        <section className="fade-up-d1">
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.6px", marginBottom: 20 }}>Free vs Pro</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* Free */}
            <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(0,0,0,0.08)", padding: "22px 20px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#71717a", marginBottom: 16 }}>Free</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {FREE_INCLUDES.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 12, color: "#34d399", flexShrink: 0, marginTop: 1 }}>✓</span>
                    <p style={{ fontSize: 12, color: "#52525b", lineHeight: 1.5 }}>{item}</p>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 12, color: "#ef4444", flexShrink: 0, marginTop: 1 }}>✕</span>
                  <p style={{ fontSize: 12, color: "#a1a1aa", lineHeight: 1.5 }}>Modules 7–12 locked</p>
                </div>
              </div>
            </div>

            {/* Pro */}
            <div style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", borderRadius: 20, border: "1.5px solid #c4b5fd", padding: "22px 20px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 12, right: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff" }}>✨ PRO</span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#4c1d95", marginBottom: 16 }}>Pro — $19/mo</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PRO_INCLUDES.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 12, color: "#7c3aed", flexShrink: 0, marginTop: 1 }}>✓</span>
                    <p style={{ fontSize: 12, color: "#4c1d95", lineHeight: 1.5, fontWeight: i === 0 ? 400 : 500 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Why now ── */}
        <section className="fade-up-d2" style={{ background: "#fff", borderRadius: 24, border: "1.5px solid rgba(0,0,0,0.06)", padding: "28px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#059669", marginBottom: 12 }}>Why upgrade now?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { emoji: "🎯", text: "Most people quit after building their store because they don't know how to get traffic. Modules 7–12 solve exactly that." },
              { emoji: "📣", text: "Running one $5/day ad correctly is more valuable than any course that costs $500+." },
              { emoji: "💰", text: "At $19/month, one sale pays for 6+ months of Pro. Most students make their first sale within 30 days." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</span>
                <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.65 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="fade-up-d3" style={{ textAlign: "center", background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)", borderRadius: 24, padding: "44px 28px", position: "relative", overflow: "hidden" }}>
          <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: 28, marginBottom: 12 }}>🚀</p>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.6px", marginBottom: 10 }}>
              Ready to go from store to sales?
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 28, lineHeight: 1.65 }}>
              Join First Sale Lab Pro today for $19/month.<br />Cancel anytime. No risk.
            </p>
            <button
              onClick={handleUpgrade}
              disabled={checking}
              style={{ background: checking ? "rgba(255,255,255,0.15)" : "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)", color: checking ? "rgba(255,255,255,0.4)" : "#1c1917", fontWeight: 800, fontSize: 15, padding: "15px 40px", borderRadius: 16, border: "none", cursor: checking ? "not-allowed" : "pointer", boxShadow: checking ? "none" : "0 4px 24px rgba(250,204,21,0.4)", letterSpacing: "-0.3px", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { if (!checking) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 36px rgba(250,204,21,0.55)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(250,204,21,0.4)"; }}
            >
              {checking ? "Redirecting…" : "Upgrade to Pro — $19/month →"}
            </button>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 12 }}>Powered by Stripe · Cancel anytime</p>
          </div>
        </section>

      </main>
    </div>
  );
}
