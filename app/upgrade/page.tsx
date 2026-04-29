"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";

type Tier = "pro" | "growth";

const PRO_INCLUDES = [
  "All 6 free modules",
  "Modules 7–12 — TikTok, paid ads, conversions, email list, first sale",
  "Weekly product picks (5 trending products every Monday)",
  "Monthly ecom briefing (what's working on Meta + TikTok)",
  "Ad-free experience",
  "Cancel anytime",
];

const GROWTH_INCLUDES = [
  "Everything in Pro",
  "Modules 13–24 — Scale Lab (12 advanced modules)",
  "Diagnose: why your sales don't repeat (M13–15)",
  "Validate: real winners vs fake signals (M16–18)",
  "Persuade: Cialdini, hook library, UGC at scale (M19–21)",
  "Test: ICE framework, kill/iterate/scale (M22–23)",
  "Scale: 30-day plan with kill triggers (M24)",
  "Built on Cialdini, Hormozi, Sean Ellis, Hopkins",
];

function UpgradePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialTier: Tier = params.get("tier") === "growth" ? "growth" : "pro";

  const [userId,    setUserId]    = useState<string | null>(null);
  const [email,     setEmail]     = useState<string>("");
  const [isPro,     setIsPro]     = useState(false);
  const [isGrowth,  setIsGrowth]  = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [checking,  setChecking]  = useState(false);
  const [selected,  setSelected]  = useState<Tier>(initialTier);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("user_profiles")
        .select("is_pro, is_growth")
        .eq("id", user.id)
        .single();

      const userIsPro    = data?.is_pro    ?? false;
      const userIsGrowth = data?.is_growth ?? false;
      setIsPro(userIsPro);
      setIsGrowth(userIsGrowth);

      // Already on the highest tier → no upgrade path
      if (userIsGrowth) { router.push("/dashboard"); return; }

      // Pro user landing here? Default the toggle to Growth (their natural next step)
      if (userIsPro && initialTier === "pro") setSelected("growth");

      setLoading(false);
    }
    load();
  }, [router, initialTier]);

  async function handleUpgrade(tier: Tier) {
    if (!userId || !email) return;
    setChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert("Please log in to continue.");
        setChecking(false);
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tier }),
      });
      const { url, error } = await res.json();
      if (error || !url) {
        alert(error ?? "Something went wrong. Please try again.");
        setChecking(false);
        return;
      }
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

  const proButtonLocked = isPro;  // Pro users can't re-buy Pro; they can only go Growth

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* ── Nav ── */}
      <nav style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <img src="/logo.png" alt="First Sale Lab" decoding="async" style={{ height: 40, width: "auto" }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.4px" }}>First Sale Lab</span>
          </Link>
          <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}>← Dashboard</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #292524 100%)", padding: "64px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(250,204,21,0.18) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#fde68a", marginBottom: 16 }}>
            Choose your tier
          </p>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", lineHeight: 1.15, marginBottom: 16 }}>
            {isPro ? "You've outgrown Pro." : "Pick the path that matches where you are."}
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
            {isPro
              ? "You finished the foundation. Now turn random sales into predictable revenue."
              : "Modules 1–6 are free. Pro unlocks your first sale. Scale Lab makes those sales repeat."}
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* 3-tier grid */}
        <div className="upgrade-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, alignItems: "start" }}>

          {/* ── FREE ── */}
          <div style={{ background: "#fff", border: "1.5px solid #e4e4e7", borderRadius: 22, padding: "28px 24px", display: "flex", flexDirection: "column" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 8 }}>Free</p>
            <p style={{ fontSize: 38, fontWeight: 900, color: "#09090b", letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 6 }}>$0</p>
            <p style={{ fontSize: 12, color: "#71717a", marginBottom: 18 }}>Forever — no card needed</p>

            <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.6, marginBottom: 18 }}>
              The 6-module foundation. Pick your niche, validate a product, set up your store and first funnel.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
              {[
                "Module 1: The Rules of the Game",
                "Module 2: Find Your Niche",
                "Module 3: Find Your Winning Product",
                "Module 4: Know Your Customer",
                "Module 5: Build Your Shopify Store",
                "Module 6: Build Your First Sales Funnel",
              ].map((it, i) => (
                <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#52525b", lineHeight: 1.55 }}>
                  <span style={{ color: "#16a34a", flexShrink: 0, marginTop: 1 }}>✓</span>{it}
                </li>
              ))}
            </ul>

            <div style={{ background: "#f4f4f5", color: "#71717a", textAlign: "center", padding: "11px 16px", borderRadius: 11, fontSize: 13, fontWeight: 600 }}>
              ✓ You&apos;re here
            </div>
          </div>

          {/* ── PRO ── */}
          <div style={{
            background: "#fff",
            border: `2px solid ${selected === "pro" ? "#7c3aed" : "rgba(124,58,237,0.2)"}`,
            borderRadius: 22, padding: "28px 24px",
            display: "flex", flexDirection: "column",
            position: "relative",
            boxShadow: selected === "pro" ? "0 8px 30px rgba(124,58,237,0.12)" : "none",
            transition: "all 0.2s",
            cursor: !proButtonLocked ? "pointer" : "default",
          }}
            onClick={() => !proButtonLocked && setSelected("pro")}
          >
            {isPro && (
              <span style={{ position: "absolute", top: 14, right: 14, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "#7c3aed", color: "#fff", letterSpacing: "0.06em" }}>
                ✓ Active
              </span>
            )}
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="sparkles" size={12} strokeWidth={2.5} /> Pro</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
              <p style={{ fontSize: 38, fontWeight: 900, color: "#09090b", letterSpacing: "-1.5px", lineHeight: 1 }}>$19</p>
              <span style={{ fontSize: 13, color: "#a1a1aa", fontWeight: 600 }}>/month</span>
            </div>
            <p style={{ fontSize: 12, color: "#71717a", marginBottom: 18 }}>Cancel anytime · no questions</p>

            <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.6, marginBottom: 18 }}>
              Everything you need to launch and make your first sale. Modules 7–12 cover ads, traffic, and conversions.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
              {PRO_INCLUDES.map((it, i) => (
                <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#52525b", lineHeight: 1.55 }}>
                  <span style={{ color: "#7c3aed", flexShrink: 0, marginTop: 1 }}>✓</span>{it}
                </li>
              ))}
            </ul>

            <button
              onClick={(e) => { e.stopPropagation(); if (!proButtonLocked) handleUpgrade("pro"); }}
              disabled={proButtonLocked || (checking && selected === "pro")}
              style={{
                width: "100%",
                background: proButtonLocked ? "#f4f4f5" : "linear-gradient(135deg, #6366f1, #7c3aed)",
                color: proButtonLocked ? "#a1a1aa" : "#fff",
                fontWeight: 800, fontSize: 14,
                padding: "13px 16px", borderRadius: 12, border: "none",
                cursor: proButtonLocked ? "default" : "pointer",
                letterSpacing: "-0.2px",
              }}
            >
              {proButtonLocked ? "Already Pro" : checking && selected === "pro" ? "Redirecting…" : "Upgrade to Pro →"}
            </button>
          </div>

          {/* ── GROWTH (Scale Lab) ── */}
          <div style={{
            background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
            border: `2px solid ${selected === "growth" ? "#facc15" : "rgba(250,204,21,0.4)"}`,
            borderRadius: 22, padding: "28px 24px",
            display: "flex", flexDirection: "column",
            position: "relative", overflow: "hidden",
            boxShadow: selected === "growth" ? "0 8px 32px rgba(250,204,21,0.18)" : "none",
            transition: "all 0.2s",
            cursor: "pointer",
          }}
            onClick={() => setSelected("growth")}
          >
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(250,204,21,0.12) 0%, transparent 70%)" }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1 }}>
              <span style={{ position: "absolute", top: -2, right: -2, fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 99, background: "linear-gradient(135deg, #facc15, #f59e0b)", color: "#1c1917", letterSpacing: "0.04em" }}>
                MOST POWERFUL
              </span>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fde68a", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="rocket" size={12} strokeWidth={2.5} /> Scale Lab</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                <p style={{ fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1 }}>$49</p>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>/month</span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 18 }}>Cancel anytime · for operators</p>

              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 18 }}>
                For users who got their first sale and want consistent revenue. Modules 13–24 turn random sales into a predictable system.
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                {GROWTH_INCLUDES.map((it, i) => (
                  <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
                    <span style={{ color: "#fde68a", flexShrink: 0, marginTop: 1 }}>✓</span>{it}
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => { e.stopPropagation(); handleUpgrade("growth"); }}
                disabled={checking && selected === "growth"}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)",
                  color: "#1c1917",
                  fontWeight: 800, fontSize: 14,
                  padding: "13px 16px", borderRadius: 12, border: "none",
                  cursor: "pointer",
                  letterSpacing: "-0.2px",
                  boxShadow: "0 4px 16px rgba(250,204,21,0.3)",
                }}
              >
                {checking && selected === "growth" ? "Redirecting…" : "Upgrade to Scale Lab →"}
              </button>
            </div>
          </div>
        </div>

        {/* Pro → Growth note */}
        {isPro && (
          <p style={{ fontSize: 12, color: "#71717a", textAlign: "center", marginTop: 18, lineHeight: 1.6 }}>
            ⓘ Going from Pro to Scale Lab? Your existing Pro subscription stays active until period end. Cancel it from your <Link href="/dashboard" style={{ color: "#6366f1", textDecoration: "underline" }}>billing portal</Link> after Scale Lab is live so you don&apos;t double-pay.
          </p>
        )}

        {/* Why Scale Lab is more powerful */}
        <section style={{ marginTop: 56, background: "#fff", borderRadius: 24, border: "1.5px solid rgba(0,0,0,0.06)", padding: "32px 32px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0c0a09", marginBottom: 8 }}>What Scale Lab adds beyond Pro</p>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#09090b", letterSpacing: "-0.6px", marginBottom: 14 }}>
            Pro gets you to your first sale. Scale Lab makes that sale repeat.
          </h2>
          <p style={{ fontSize: 14, color: "#52525b", lineHeight: 1.7, marginBottom: 22 }}>
            The biggest gap in beginner ecommerce content: nobody teaches what happens <em>after</em> the first sale. Most stores get one or two early sales, scale aggressively, and crash. Scale Lab is the operator&apos;s playbook for the next phase — diagnosing real winners, engineering offers, mastering persuasion, testing properly, and scaling without breaking ROAS.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { e: "🔬", t: "Diagnose", b: "Why first sales don't repeat. The 8 metrics that matter. The profit audit." },
              { e: "🎯", t: "Validate", b: "Real winners vs fake signals. Engineering offers. AOV mechanics." },
              { e: "🧠", t: "Persuade", b: "Cialdini's 6 principles. The hook library. UGC at scale." },
              { e: "🧪", t: "Test", b: "ICE prioritization. Sample size discipline. Kill / iterate / scale." },
              { e: "🚀", t: "Scale", b: "30-day plan with kill triggers. Retention layer. LTV multipliers." },
            ].map((p, i) => (
              <div key={i} style={{ background: "#f8f8fb", borderRadius: 14, padding: "16px 18px" }}>
                <p style={{ fontSize: 22, marginBottom: 6 }}>{p.e}</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#09090b", marginBottom: 4 }}>{p.t}</p>
                <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.55 }}>{p.b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ-style notes */}
        <section style={{ marginTop: 32, fontSize: 12, color: "#a1a1aa", textAlign: "center", lineHeight: 1.7 }}>
          <p>All payments are non-refundable. Pro and Scale Lab can be cancelled anytime — your access continues until the end of the billing period.</p>
          <p style={{ marginTop: 6 }}>Powered by Stripe · 100% secure</p>
        </section>

      </main>

      {/* Mobile: stack the 3-tier grid */}
      <style jsx global>{`
        @media (max-width: 800px) {
          .upgrade-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="spinner" />
      </div>
    }>
      <UpgradePageInner />
    </Suspense>
  );
}
