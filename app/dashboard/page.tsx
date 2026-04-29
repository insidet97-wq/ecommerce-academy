"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import AdBanner from "@/components/AdBanner";
import ReferralCard from "@/components/ReferralCard";
import GettingStartedChecklist from "@/components/GettingStartedChecklist";

/* ── Design tokens ── */
const TRACK_COLORS: Record<string, string> = {
  "Beginner Fast-Start": "#4f46e5",
  "Fast-Track Builder":  "#7c3aed",
  "Optimization Track":  "#0891b2",
  "Explorer Track":      "#059669",
};
const GOAL_LABELS: Record<string, string> = {
  first_sale:  "First ever sale",
  side_income: "$500–2k/month side income",
  full_time:   "Replace full-time income",
  learn:       "Learn how ecommerce works",
};
type Tier = "free" | "pro" | "growth";
type ModuleListItem = { id: number; emoji: string; title: string; duration: string; description: string; tier: Tier };

const MODULES: ModuleListItem[] = [
  // FREE
  { id: 1,  emoji: "🎮", title: "The Rules of the Game",         duration: "~20 min", description: "Understand how ecommerce works before spending $1.",            tier: "free" },
  { id: 2,  emoji: "🎯", title: "Find Your Niche",               duration: "~25 min", description: "Choose a specific, passionate, profitable niche.",              tier: "free" },
  { id: 3,  emoji: "🏆", title: "Find Your Winning Product",     duration: "~30 min", description: "Validate one product with the 3X margin rule.",                 tier: "free" },
  { id: 4,  emoji: "🧠", title: "Know Your Customer",            duration: "~25 min", description: "Build a detailed customer avatar.",                             tier: "free" },
  { id: 5,  emoji: "🛒", title: "Build Your Shopify Store",      duration: "~45 min", description: "Launch a clean, professional store with trust signals.",        tier: "free" },
  { id: 6,  emoji: "⚡", title: "Build Your First Sales Funnel", duration: "~35 min", description: "A focused landing page + upsell for your hero product.",        tier: "free" },
  // PRO
  { id: 7,  emoji: "📱", title: "Drive Traffic: TikTok Organic", duration: "~30 min", description: "Get eyes on your product for free using TikTok.",               tier: "pro" },
  { id: 8,  emoji: "📣", title: "Run Your First Paid Ad",        duration: "~40 min", description: "Launch a small Meta or TikTok ad campaign.",                    tier: "pro" },
  { id: 9,  emoji: "📈", title: "Conversion Optimisation",       duration: "~30 min", description: "Squeeze more sales out of the traffic you have.",               tier: "pro" },
  { id: 10, emoji: "📧", title: "Build Your Email List",         duration: "~35 min", description: "Own a direct line to your audience — forever.",                tier: "pro" },
  { id: 11, emoji: "💰", title: "Make Your First Sale",          duration: "~20 min", description: "Get everything in place and land your first transaction.",     tier: "pro" },
  { id: 12, emoji: "🚀", title: "Scale and Grow",                duration: "~25 min", description: "Add recurring income, a second product, a second channel.",    tier: "pro" },
  // GROWTH (Scale Lab — modules 13-24)
  { id: 13, emoji: "🔬", title: "Why Your First Sales Won't Repeat",   duration: "~30 min", description: "Why early sales feel random — survivorship bias and the noise problem at low volume.", tier: "growth" },
  { id: 14, emoji: "📊", title: "The Numbers That Actually Matter",    duration: "~40 min", description: "The 8 metrics every operator tracks daily — with thresholds.",                          tier: "growth" },
  { id: 15, emoji: "💸", title: "The Profit Audit",                    duration: "~35 min", description: "Run a true 30-day P&L. Most 'profitable' stores aren't.",                               tier: "growth" },
  { id: 16, emoji: "🎯", title: "Real Winners vs Fake Signals",        duration: "~35 min", description: "The 100-click rule and the repeatability test for any 'winner'.",                       tier: "growth" },
  { id: 17, emoji: "🎁", title: "Engineering the Offer",               duration: "~40 min", description: "Stop optimizing the product. Engineer the offer (Hormozi value equation).",            tier: "growth" },
  { id: 18, emoji: "💰", title: "Increasing AOV Without Cost",         duration: "~30 min", description: "4 mechanisms that lift AOV 25–50% from the same traffic.",                              tier: "growth" },
  { id: 19, emoji: "🧠", title: "Persuasion Foundations",              duration: "~45 min", description: "Cialdini's 6 principles applied to ads, product page, and email.",                     tier: "growth" },
  { id: 20, emoji: "🪝", title: "The Hook Library",                    duration: "~40 min", description: "6 hook frameworks. Build 20+ hooks. Find the winner for your product.",                tier: "growth" },
  { id: 21, emoji: "🎬", title: "UGC at Scale",                        duration: "~45 min", description: "Brief, source, and iterate UGC creators. 8–15 variants/month at $50–150 each.",        tier: "growth" },
  { id: 22, emoji: "🧪", title: "How to Test Ads Properly",            duration: "~40 min", description: "ICE prioritization, isolation, and proper sample size. Stop guessing.",                tier: "growth" },
  { id: 23, emoji: "⚖️", title: "Killing, Iterating, or Scaling",      duration: "~35 min", description: "The decision matrix. The 20% scaling rule. Ad fatigue signals.",                       tier: "growth" },
  { id: 24, emoji: "🚀", title: "Scaling Without Destroying ROAS",     duration: "~50 min", description: "30-day scaling plan, kill triggers, the retention layer (LTV multiplier).",            tier: "growth" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function getMilestone(count: number, total: number): string {
  if (count === 0)       return "Your journey to your first sale starts here.";
  if (count === 1)       return "Strong start. Keep the momentum going.";
  if (count === 3)       return "You already know more than most people who try this.";
  if (count === 6)       return "Halfway there. You're ahead of 90% of beginners.";
  if (count === 9)       return "Three modules from your first sale. Don't stop now.";
  if (count === 11)      return "One more. You're this close.";
  if (count === total)   return "You've completed the entire course. Time to sell.";
  return "Keep going — you're building real momentum.";
}

type Profile = {
  track: string | null; start_module: number;
  goal: string | null; first_name: string | null;
  streak_days: number | null; last_active: string | null;
  is_pro: boolean; is_growth: boolean; stripe_customer_id: string | null;
};

/* ── Certificate Modal ── */
function CertificateModal({ name, onClose }: { name: string; onClose: () => void }) {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const [copied, setCopied] = useState(false);
  function share() {
    const text = `🎉 I just completed all 12 modules of First Sale Lab!\n\nI now know how to find a winning product, build a Shopify store, run ads, and scale an ecommerce business from scratch.\n\nStart your free roadmap → https://firstsalelab.com`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  }
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: 28, maxWidth: 480, width: "100%", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.4)", animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)", padding: "36px 32px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.4) 0%, transparent 70%)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🏆</div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)", marginBottom: 6, textTransform: "uppercase" }}>Certificate of Completion</p>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.6px" }}>First Sale Lab</h2>
          </div>
        </div>
        <div style={{ padding: "28px 32px 32px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 6 }}>This certifies that</p>
          <p style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.8px", marginBottom: 6, background: "linear-gradient(135deg, #6366f1, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{name}</p>
          <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.65, marginBottom: 4 }}>has successfully completed all <strong style={{ color: "#09090b" }}>12 modules</strong> of</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#09090b", marginBottom: 16 }}>First Sale Lab — From Zero to First Sale</p>
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #e4e4e7, transparent)", margin: "16px 0" }} />
          <p style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 24 }}>Completed on {date}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={share} style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", fontWeight: 700, fontSize: 13, padding: "11px 24px", borderRadius: 12, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
              {copied ? "✓ Copied!" : "Share achievement 🎉"}
            </button>
            <button onClick={onClose} style={{ background: "#f4f4f5", color: "#52525b", fontWeight: 600, fontSize: 13, padding: "11px 24px", borderRadius: 12, border: "none", cursor: "pointer" }}>
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Hover card ── */
function ModuleCard({ children, unlocked }: { children: React.ReactNode; unlocked: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref}
      onMouseEnter={() => { if (!unlocked || !ref.current) return; ref.current.style.transform = "translateY(-1px)"; ref.current.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)"; }}
      onMouseLeave={() => { if (!ref.current) return; ref.current.style.transform = "translateY(0)"; ref.current.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "transform 0.2s, box-shadow 0.2s" }}
    >{children}</div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [email,          setEmail]          = useState("");
  const [userId,         setUserId]         = useState<string | null>(null);
  const [completed,      setCompleted]      = useState<number[]>([]);
  const [profile,        setProfile]        = useState<Profile>({ track: null, start_module: 1, goal: null, first_name: null, streak_days: null, last_active: null, is_pro: false, is_growth: false, stripe_customer_id: null });
  const [loading,        setLoading]        = useState(true);
  const [showCert,       setShowCert]       = useState(false);
  const [upgradedBanner, setUpgradedBanner] = useState(false);
  const [portalLoading,  setPortalLoading]  = useState(false);
  const [hasUsedTool,    setHasUsedTool]    = useState(false);

  const openCert  = useCallback(() => setShowCert(true),  []);
  const closeCert = useCallback(() => setShowCert(false), []);

  // When the upgraded banner is shown, force is_pro = true immediately
  // (webhook may still be in flight when the success redirect lands).
  // Growth upgrades flip both is_pro and is_growth.
  const [upgradedTier, setUpgradedTier] = useState<"pro" | "growth" | null>(null);
  useEffect(() => {
    if (upgradedBanner) {
      setProfile(prev => ({
        ...prev,
        is_pro: true,
        is_growth: upgradedTier === "growth" ? true : prev.is_growth,
      }));
    }
  }, [upgradedBanner, upgradedTier]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setEmail(user.email ?? "");
      setUserId(user.id);

      // Check for ?upgraded=<tier> in URL — set tier optimistically (webhook may still be in flight).
      // Backwards-compat: ?upgraded=true also accepted, treated as Pro.
      const upgradedParam = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("upgraded")
        : null;
      const justUpgraded = upgradedParam !== null;
      const upgradedToGrowth = upgradedParam === "growth";
      if (justUpgraded) {
        setUpgradedBanner(true);
        setUpgradedTier(upgradedToGrowth ? "growth" : "pro");
        window.history.replaceState({}, "", "/dashboard");
      }

      const [progressRes, profileRes, aiToolRes, supplierValRes] = await Promise.all([
        supabase.from("user_progress").select("module_id").eq("user_id", user.id),
        supabase.from("user_profiles").select("track, start_module, goal, first_name, streak_days, last_active, is_pro, is_growth, stripe_customer_id").eq("id", user.id).single(),
        // For the getting-started checklist: has the user touched any tool?
        // Two HEAD-only count queries (no rows returned). Either one being non-zero
        // is enough to check off the "Try a tool" milestone.
        supabase.from("ai_tool_log")          .select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("supplier_validations") .select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setCompleted((progressRes.data ?? []).map((r: { module_id: number }) => r.module_id));
      setHasUsedTool((aiToolRes.count ?? 0) > 0 || (supplierValRes.count ?? 0) > 0);
      // Always call setProfile — even if no row exists, use safe defaults
      setProfile({
        track:               profileRes.data?.track               ?? null,
        start_module:        profileRes.data?.start_module        ?? 1,
        goal:                profileRes.data?.goal                ?? null,
        first_name:          profileRes.data?.first_name          ?? null,
        streak_days:         profileRes.data?.streak_days         ?? 0,
        last_active:         profileRes.data?.last_active         ?? null,
        is_pro:              (profileRes.data?.is_pro ?? false)   || justUpgraded,
        is_growth:           (profileRes.data?.is_growth ?? false) || upgradedToGrowth,
        stripe_customer_id:  profileRes.data?.stripe_customer_id ?? null,
      });
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleManageBilling() {
    if (!userId) return;
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push("/"); }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="text-center"><div className="spinner mx-auto mb-3" /><p style={{ color: "#a1a1aa", fontSize: 14 }}>Loading…</p></div>
      </div>
    );
  }

  const admin           = isAdmin(email);
  const isPro           = profile.is_pro    || admin;
  const isGrowth        = profile.is_growth || admin;
  const completedCount  = completed.length;
  const progressPercent = Math.round((completedCount / MODULES.length) * 100);
  const startModule     = profile.start_module ?? 1;
  const firstName       = profile.first_name || email.split("@")[0];
  const trackColor      = profile.track ? (TRACK_COLORS[profile.track] ?? "#4f46e5") : "#4f46e5";
  const isProGated      = (id: number) => id > 6  && id <= 12 && !isPro;
  const isGrowthGated   = (id: number) => id > 12 && !isGrowth;
  const isTierGated     = (id: number) => isProGated(id) || isGrowthGated(id);
  const isUnlocked      = (id: number) => {
    if (isTierGated(id)) return false;
    return admin || id <= startModule || completed.includes(id - 1);
  };
  const nextModule      = MODULES.find(m => !completed.includes(m.id) && isUnlocked(m.id));
  const allDone         = completedCount === MODULES.length;

  // Time invested
  const minutesInvested = completed.reduce((t, id) => {
    const m = MODULES.find(m => m.id === id);
    return t + (m ? parseInt(m.duration.replace(/\D/g, "")) : 0);
  }, 0);
  const timeLabel = minutesInvested >= 60
    ? `${(minutesInvested / 60).toFixed(1)} hrs invested`
    : `${minutesInvested} min invested`;

  // Streak
  const streak = profile.streak_days ?? 0;
  const today  = new Date().toISOString().split("T")[0];
  const streakActiveToday = profile.last_active === today;

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {showCert && <CertificateModal name={firstName} onClose={closeCert} />}

      {/* ── Upgraded success banner ── */}
      {upgradedBanner && (
        <div style={{
          background: upgradedTier === "growth"
            ? "linear-gradient(135deg, #0c0a09, #292524)"
            : "linear-gradient(135deg, #4c1d95, #6d28d9)",
          padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{upgradedTier === "growth" ? "🚀" : "🎉"}</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {upgradedTier === "growth" ? "Welcome to Scale Lab!" : "Welcome to First Sale Lab Pro!"}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                {upgradedTier === "growth"
                  ? "All 24 modules unlocked. Time to make your sales predictable."
                  : "All 12 modules are now unlocked. Let’s get that first sale."}
              </p>
            </div>
          </div>
          <button onClick={() => setUpgradedBanner(false)} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
            Dismiss
          </button>
        </div>
      )}

      {/* ── Nav ── */}
      <nav style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Left — logo + admin/pro badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
              <img src="/logo.png" alt="First Sale Lab" decoding="async" style={{ height: 40, width: "auto" }} />
              <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.4px" }}>First Sale Lab</span>
            </Link>
            {admin ? (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Admin
              </span>
            ) : isPro ? (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "linear-gradient(135deg, #facc15, #f59e0b)", color: "#1c1917", letterSpacing: "0.06em" }}>
                ✨ Pro
              </span>
            ) : null}
          </div>

          {/* Right — nav links + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[
              { href: "/tools",     label: "Tools"     },
              { href: "/resources", label: "Resources" },
              ...(isPro && !admin ? [
                { href: "/pro/products",  label: "📦 Picks"     },
                { href: "/pro/briefings", label: "📋 Briefings" },
              ] : []),
              ...(admin ? [
                { href: "/admin",         label: "Analytics" },
                { href: "/admin/content", label: "Content"   },
                { href: "/admin/users",   label: "Users"     },
                { href: "/admin/blog",    label: "Blog"      },
                { href: "/admin/email",   label: "Email"     },
                { href: "/admin/leads",   label: "Leads"     },
              ] : []),
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="hidden sm:block"
                style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none", padding: "6px 12px", borderRadius: 8 }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#09090b"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#52525b"; }}
              >{item.label}</Link>
            ))}
            {!isPro && (
              <Link href="/upgrade"
                style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", textDecoration: "none", padding: "5px 12px", borderRadius: 8, border: "1.5px solid #c4b5fd", background: "#f5f3ff" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#ede9fe"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f5f3ff"; }}
              >✨ Upgrade</Link>
            )}
            {isPro && profile.stripe_customer_id && !admin && (
              <button onClick={handleManageBilling} disabled={portalLoading}
                className="hidden sm:block"
                style={{ fontSize: 12, fontWeight: 600, color: "#71717a", background: "none", border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 8 }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#09090b"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
              >{portalLoading ? "Loading…" : "Billing"}</button>
            )}
            <Link href="/settings"
              style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none", padding: "6px 12px", borderRadius: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#09090b"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#52525b"; }}
            >Settings</Link>
            <div style={{ width: 1, height: 16, background: "#e4e4e7", margin: "0 4px" }} />
            <button onClick={handleLogout}
              style={{ fontSize: 13, fontWeight: 500, color: "#a1a1aa", background: "none", border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fff7f7"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a1a1aa"; }}
            >Log out</button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── ONBOARDING — shown only to first-time users with no track yet ── */}
        {completedCount === 0 && !profile.track ? (
          <div className="fade-up" style={{ marginBottom: 28 }}>
            <div style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
              borderRadius: 24, padding: "32px 28px",
              position: "relative", overflow: "hidden",
            }}>
              <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.45) 0%, transparent 70%)" }} />
              <div style={{ position: "relative" }}>

                {/* Label */}
                <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(167,139,250,0.9)", marginBottom: 14, background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)", padding: "4px 12px", borderRadius: 99 }}>
                  Welcome 🎉
                </span>

                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.6px", lineHeight: 1.2, marginBottom: 10 }}>
                  You&apos;re all set, {firstName}. Here&apos;s how this works.
                </h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, marginBottom: 24, maxWidth: 460 }}>
                  12 focused modules. Real tasks. One clear step at a time. Complete each module&apos;s task to unlock the next — no skipping ahead.
                </p>

                {/* 3-step path */}
                <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                  {[
                    { n: "1", emoji: "⚡", label: "Do each module",       sub: "20–45 min each · one real task per step" },
                    { n: "2", emoji: "🔓", label: "Unlock the next step", sub: "Complete the task to advance" },
                    { n: "3", emoji: "💰", label: "Make your first sale", sub: "By Module 11 your store is live" },
                  ].map((step) => (
                    <div key={step.n} style={{ flex: "1 1 160px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(99,102,241,0.55)", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step.n}</span>
                        <span style={{ fontSize: 16 }}>{step.emoji}</span>
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{step.label}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{step.sub}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link href="/modules/1"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #facc15, #f59e0b)", color: "#1c1917", fontWeight: 800, fontSize: 14, padding: "13px 22px", borderRadius: 14, textDecoration: "none", boxShadow: "0 4px 16px rgba(250,204,21,0.35)", letterSpacing: "-0.2px" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(250,204,21,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(250,204,21,0.35)"; }}
                >
                  🚀 Start Module 1 →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Welcome (returning users) ── */}
            <div className="fade-up" style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: trackColor, marginBottom: 4 }}>
                {getGreeting()}, {firstName} 👋
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  {profile.track && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: trackColor, color: "#fff" }}>
                      {profile.track}
                    </span>
                  )}
                  {profile.goal && (
                    <span style={{ fontSize: 12, color: "#a1a1aa", marginLeft: 8 }}>· {GOAL_LABELS[profile.goal] ?? profile.goal}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Progress card ── */}
            <div className="fade-up-d1" style={{ marginBottom: 28 }}>
              <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(0,0,0,0.06)", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#09090b" }}>
                      {completedCount} <span style={{ fontWeight: 400, color: "#71717a" }}>of {MODULES.length} modules complete</span>
                    </span>
                    {minutesInvested > 0 && (
                      <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 2 }}>{timeLabel}</p>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Streak badge */}
                    {streak > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, background: streakActiveToday ? "#fff7ed" : "#f4f4f5", border: `1.5px solid ${streakActiveToday ? "#fed7aa" : "#e4e4e7"}`, borderRadius: 99, padding: "4px 10px" }}>
                        <span style={{ fontSize: 14 }}>🔥</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: streakActiveToday ? "#ea580c" : "#a1a1aa", letterSpacing: "-0.3px" }}>{streak}</span>
                        <span style={{ fontSize: 11, color: streakActiveToday ? "#fb923c" : "#a1a1aa", fontWeight: 500 }}>{streak === 1 ? "day" : "days"}</span>
                      </div>
                    )}
                    <span style={{ fontSize: 22, fontWeight: 900, color: trackColor, letterSpacing: "-0.5px" }}>{progressPercent}%</span>
                  </div>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: "#f4f4f5" }}>
                  <div style={{ height: 8, borderRadius: 99, background: `linear-gradient(90deg, ${trackColor}, #7c3aed)`, width: `${progressPercent}%`, transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
                </div>
              </div>
            </div>

            {/* ── Getting Started checklist — auto-hides at 5/6 done ── */}
            <GettingStartedChecklist
              hasQuiz     ={profile.track !== null}
              hasModule1  ={completed.includes(1)}
              hasStreak3  ={(profile.streak_days ?? 0) >= 3}
              hasUsedTool ={hasUsedTool}
              hasModule6  ={completed.includes(6)}
              trackColor  ={trackColor}
            />
          </>
        )}

        {/* ── UP NEXT — dominant card ── */}
        <div className="fade-up-d2" style={{ marginBottom: 12 }}>
          {nextModule ? (
            <div style={{ background: "#fff", borderRadius: 24, border: `2px solid ${trackColor}30`, padding: "28px 28px 24px", boxShadow: `0 8px 40px ${trackColor}18` }}>
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: trackColor }}>Up next</span>
                <span style={{ fontSize: 10, color: "#d4d4d8" }}>·</span>
                <span style={{ fontSize: 11, color: "#a1a1aa" }}>Module {nextModule.id} of {MODULES.length}</span>
                <span style={{ fontSize: 10, color: "#d4d4d8" }}>·</span>
                <span style={{ fontSize: 11, color: "#a1a1aa" }}>{nextModule.duration}</span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${trackColor}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                  {nextModule.emoji}
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#09090b", letterSpacing: "-0.5px", marginBottom: 4 }}>
                    {nextModule.title}
                  </h2>
                  <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.5 }}>{nextModule.description}</p>
                </div>
              </div>

              {/* Milestone */}
              <p style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 16, fontStyle: "italic" }}>
                {getMilestone(completedCount, MODULES.length)}
              </p>

              {/* Primary CTA */}
              <Link
                href={`/modules/${nextModule.id}`}
                style={{
                  display: "block", textAlign: "center", color: "#fff", fontWeight: 800,
                  fontSize: 15, padding: "15px", borderRadius: 16, textDecoration: "none",
                  background: `linear-gradient(135deg, ${trackColor}, #7c3aed)`,
                  boxShadow: `0 4px 20px ${trackColor}40`,
                  letterSpacing: "-0.2px",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${trackColor}55`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 20px ${trackColor}40`; }}
              >
                {completedCount === 0 ? `Start Module ${nextModule.id} →` : `Continue → ${nextModule.title}`}
              </Link>
            </div>
          ) : (allDone || admin) ? (
            <div style={{ background: "#fff", borderRadius: 24, border: "2px solid #a7f3d0", padding: "28px", textAlign: "center", boxShadow: "0 8px 40px rgba(16,185,129,0.1)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#09090b", letterSpacing: "-0.5px", marginBottom: 6 }}>Course Complete!</h2>
              <p style={{ fontSize: 13, color: "#71717a", marginBottom: 20 }}>You&apos;ve finished all 12 modules. You have everything you need to sell.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={openCert} style={{ background: "#059669", color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 28px", borderRadius: 14, border: "none", cursor: "pointer" }}>
                  View Certificate 🏆
                </button>
                {userId && (
                  <Link href={`/certificate/${userId}`} target="_blank"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdf4", color: "#059669", fontWeight: 700, fontSize: 14, padding: "13px 28px", borderRadius: 14, border: "1.5px solid #a7f3d0", textDecoration: "none" }}>
                    Share certificate 🔗
                  </Link>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Admin cert shortcut */}
        {admin && userId && (
          <div style={{ textAlign: "center", marginBottom: 20, display: "flex", gap: 16, justifyContent: "center" }}>
            <button onClick={openCert} style={{ fontSize: 12, color: "#a1a1aa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              View certificate
            </button>
            <Link href={`/certificate/${userId}`} target="_blank" style={{ fontSize: 12, color: "#6366f1", textDecoration: "underline" }}>
              Public certificate →
            </Link>
          </div>
        )}

        {/* ── Ad (free users only) ── */}
        <AdBanner isPro={isPro} slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD ?? ""} />

        {/* ── Refer a friend ── */}
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <ReferralCard />
        </div>

        {/* ── Module list ── */}
        <div className="fade-up-d3">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa" }}>
              All Modules
            </p>
            {!isPro && (
              <Link href="/upgrade" style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textDecoration: "none" }}>
                ✨ Unlock Modules 7–12
              </Link>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MODULES.map((mod, idx) => {
              const isDone        = completed.includes(mod.id);
              const proGated      = isProGated(mod.id);
              const growthGated   = isGrowthGated(mod.id);
              const tierGated     = proGated || growthGated;
              const unlocked      = isUnlocked(mod.id);
              const isNext        = nextModule?.id === mod.id;
              const isSkipped     = mod.id < startModule && !isDone;

              // Tier section header — shows above the first module of each tier
              const prevTier = idx > 0 ? MODULES[idx - 1].tier : null;
              const showTierHeader = mod.tier !== prevTier;
              const tierHeaderText =
                mod.tier === "pro"    ? `✨ Pro Modules · $19/mo` :
                mod.tier === "growth" ? `🚀 Scale Lab · $49/mo` :
                                        `Free Modules`;
              const tierHeaderColor = mod.tier === "growth" ? "#0c0a09" : mod.tier === "pro" ? "#7c3aed" : "#71717a";

              return (
                <div key={mod.id}>
                  {showTierHeader && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: idx === 0 ? 0 : 16, marginBottom: 8 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: tierHeaderColor, margin: 0 }}>
                        {tierHeaderText}
                      </p>
                      <div style={{ flex: 1, height: 1, background: "#e4e4e7" }} />
                    </div>
                  )}

                  <ModuleCard unlocked={unlocked}>
                    <div style={{
                      background:    growthGated ? "#fafaf9" : proGated ? "#fafafa" : "#fff",
                      borderRadius:  18,
                      border:        `1.5px solid ${growthGated ? "rgba(28,25,23,0.12)" : proGated ? "rgba(124,58,237,0.12)" : isNext ? "#c7d2fe" : isDone ? "#d1fae5" : "rgba(0,0,0,0.06)"}`,
                      padding:       "14px 16px",
                      display:       "flex",
                      alignItems:    "center",
                      gap:           14,
                      opacity:       (!unlocked && !tierGated) ? 0.45 : 1,
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20,
                        background: isDone ? "#ecfdf5" : isNext ? "#eef2ff" : growthGated ? "#fef3c7" : proGated ? "#f5f3ff" : "#f4f4f5",
                      }}>
                        {isDone ? "✅" : mod.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: isDone ? "#a1a1aa" : tierGated ? "#71717a" : "#09090b", textDecoration: isDone ? "line-through" : "none" }}>{mod.title}</span>
                          {isNext     && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: trackColor, color: "#fff" }}>Up next</span>}
                          {isSkipped  && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>Pre-unlocked</span>}
                          {proGated   && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff" }}>✨ Pro</span>}
                          {growthGated && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "#0c0a09", color: "#fde68a" }}>🚀 Scale Lab</span>}
                        </div>
                        <p style={{ fontSize: 12, color: "#a1a1aa" }}>{mod.duration} · {mod.description}</p>
                      </div>
                      {growthGated ? (
                        <Link href="/upgrade?tier=growth" style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, padding: "7px 14px", borderRadius: 10, textDecoration: "none", background: "#0c0a09", color: "#fde68a", whiteSpace: "nowrap" }}>
                          Unlock →
                        </Link>
                      ) : proGated ? (
                        <Link href="/upgrade" style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, padding: "7px 14px", borderRadius: 10, textDecoration: "none", background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", color: "#7c3aed", border: "1px solid #c4b5fd", whiteSpace: "nowrap" }}>
                          Unlock →
                        </Link>
                      ) : !unlocked ? (
                        <span style={{ fontSize: 16, flexShrink: 0, color: "#d4d4d8" }}>🔒</span>
                      ) : (
                        <Link href={`/modules/${mod.id}`} style={{ fontSize: 12, fontWeight: 700, flexShrink: 0, padding: "7px 16px", borderRadius: 10, textDecoration: "none", background: isDone ? "#ecfdf5" : isNext ? trackColor : "#f4f4f5", color: isDone ? "#16a34a" : isNext ? "#fff" : "#52525b" }}>
                          {isDone ? "Review" : "Start →"}
                        </Link>
                      )}
                    </div>
                  </ModuleCard>
                </div>
              );
            })}
          </div>

          {/* ── Upgrade CTA banner — Free users see Pro pitch ── */}
          {!isPro && (
            <div style={{ marginTop: 20, background: "linear-gradient(135deg, #1e1b4b, #4c1d95)", borderRadius: 20, padding: "24px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", position: "relative", overflow: "hidden" }}>
              <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", marginBottom: 4 }}>
                  ✨ Unlock the full roadmap
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  Modules 7–12 cover traffic, ads, conversions & your first sale.
                </p>
              </div>
              <Link href="/upgrade" style={{ flexShrink: 0, background: "linear-gradient(135deg, #facc15, #f59e0b)", color: "#1c1917", fontWeight: 800, fontSize: 13, padding: "11px 22px", borderRadius: 12, textDecoration: "none", boxShadow: "0 4px 16px rgba(250,204,21,0.35)", position: "relative", whiteSpace: "nowrap" }}>
                Upgrade for $19/mo →
              </Link>
            </div>
          )}

          {/* ── Upgrade CTA banner — Pro users (not Growth) see Scale Lab pitch ── */}
          {isPro && !isGrowth && (
            <div style={{ marginTop: 20, background: "linear-gradient(135deg, #0c0a09 0%, #1c1917 100%)", borderRadius: 20, padding: "24px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", position: "relative", overflow: "hidden" }}>
              <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(250,204,21,0.18) 0%, transparent 70%)" }} />
              <div style={{ position: "relative" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fde68a", marginBottom: 6 }}>🚀 Scale Lab</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", marginBottom: 4 }}>
                  Made your first sales? Now make them predictable.
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  Modules 13–24: real winners vs fake signals, persuasion, UGC at scale, profitable scaling.
                </p>
              </div>
              <Link href="/upgrade?tier=growth" style={{ flexShrink: 0, background: "linear-gradient(135deg, #facc15, #f59e0b)", color: "#1c1917", fontWeight: 800, fontSize: 13, padding: "11px 22px", borderRadius: 12, textDecoration: "none", boxShadow: "0 4px 16px rgba(250,204,21,0.35)", position: "relative", whiteSpace: "nowrap" }}>
                Upgrade to Growth — $49/mo →
              </Link>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
