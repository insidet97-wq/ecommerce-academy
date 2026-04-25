"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";

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
const MODULES = [
  { id: 1,  emoji: "🎮", title: "The Rules of the Game",         duration: "~20 min", description: "Understand how ecommerce works before spending $1." },
  { id: 2,  emoji: "🎯", title: "Find Your Niche",               duration: "~25 min", description: "Choose a specific, passionate, profitable niche." },
  { id: 3,  emoji: "🏆", title: "Find Your Winning Product",     duration: "~30 min", description: "Validate one product with the 3X margin rule." },
  { id: 4,  emoji: "🧠", title: "Know Your Customer",            duration: "~25 min", description: "Build a detailed customer avatar." },
  { id: 5,  emoji: "🛒", title: "Build Your Shopify Store",      duration: "~45 min", description: "Launch a clean, professional store with trust signals." },
  { id: 6,  emoji: "⚡", title: "Build Your First Sales Funnel", duration: "~35 min", description: "A focused landing page + upsell for your hero product." },
  { id: 7,  emoji: "📱", title: "Drive Traffic: TikTok Organic", duration: "~30 min", description: "Get eyes on your product for free using TikTok." },
  { id: 8,  emoji: "📣", title: "Run Your First Paid Ad",        duration: "~40 min", description: "Launch a small Meta or TikTok ad campaign." },
  { id: 9,  emoji: "📈", title: "Conversion Optimisation",       duration: "~30 min", description: "Squeeze more sales out of the traffic you have." },
  { id: 10, emoji: "📧", title: "Build Your Email List",         duration: "~35 min", description: "Own a direct line to your audience — forever." },
  { id: 11, emoji: "💰", title: "Make Your First Sale",          duration: "~20 min", description: "Get everything in place and land your first transaction." },
  { id: 12, emoji: "🚀", title: "Scale and Grow",                duration: "~25 min", description: "Add recurring income, a second product, a second channel." },
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
  const [email,      setEmail]      = useState("");
  const [completed,  setCompleted]  = useState<number[]>([]);
  const [profile,    setProfile]    = useState<Profile>({ track: null, start_module: 1, goal: null, first_name: null, streak_days: null, last_active: null });
  const [loading,    setLoading]    = useState(true);
  const [showCert,   setShowCert]   = useState(false);

  const openCert  = useCallback(() => setShowCert(true),  []);
  const closeCert = useCallback(() => setShowCert(false), []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setEmail(user.email ?? "");
      const [progressRes, profileRes] = await Promise.all([
        supabase.from("user_progress").select("module_id").eq("user_id", user.id),
        supabase.from("user_profiles").select("track, start_module, goal, first_name, streak_days, last_active").eq("id", user.id).single(),
      ]);
      setCompleted((progressRes.data ?? []).map((r: { module_id: number }) => r.module_id));
      if (profileRes.data) setProfile({ track: profileRes.data.track, start_module: profileRes.data.start_module ?? 1, goal: profileRes.data.goal, first_name: profileRes.data.first_name ?? null, streak_days: profileRes.data.streak_days ?? 0, last_active: profileRes.data.last_active ?? null });
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() { await supabase.auth.signOut(); router.push("/"); }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="text-center"><div className="spinner mx-auto mb-3" /><p style={{ color: "#a1a1aa", fontSize: 14 }}>Loading…</p></div>
      </div>
    );
  }

  const admin           = isAdmin(email);
  const completedCount  = completed.length;
  const progressPercent = Math.round((completedCount / MODULES.length) * 100);
  const startModule     = profile.start_module ?? 1;
  const firstName       = profile.first_name || email.split("@")[0];
  const trackColor      = profile.track ? (TRACK_COLORS[profile.track] ?? "#4f46e5") : "#4f46e5";
  const isUnlocked      = (id: number) => admin || id <= startModule || completed.includes(id - 1);
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

      {/* ── Nav ── */}
      <nav style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Left — logo + admin badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
              <div style={{ background: "#09090b", borderRadius: 8, padding: "2px 6px", display: "flex", alignItems: "center" }}>
                <img src="/logo.png" alt="First Sale Lab" style={{ height: 26, width: "auto" }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.4px" }}>First Sale Lab</span>
            </Link>
            {admin && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Admin
              </span>
            )}
          </div>

          {/* Right — nav links + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[
              { href: "/tools",     label: "Tools"     },
              { href: "/resources", label: "Resources" },
              ...(admin ? [{ href: "/admin", label: "Analytics" }] : []),
            ].map(item => (
              <Link key={item.href} href={item.href}
                style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none", padding: "6px 12px", borderRadius: 8 }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#09090b"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#52525b"; }}
              >{item.label}</Link>
            ))}
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

        {/* ── Welcome ── */}
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
              <button onClick={openCert} style={{ background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 32px", borderRadius: 14, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(5,150,105,0.3)" }}>
                View Your Certificate 🏆
              </button>
            </div>
          ) : null}
        </div>

        {/* Admin cert shortcut */}
        {admin && nextModule && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <button onClick={openCert} style={{ fontSize: 12, color: "#a1a1aa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              View certificate
            </button>
          </div>
        )}

        {/* ── Module list ── */}
        <div className="fade-up-d3">
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 12 }}>
            All Modules
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MODULES.map(mod => {
              const isDone   = completed.includes(mod.id);
              const unlocked = isUnlocked(mod.id);
              const isNext   = nextModule?.id === mod.id;
              const isSkipped = mod.id < startModule && !isDone;
              return (
                <ModuleCard key={mod.id} unlocked={unlocked}>
                  <div style={{ background: "#fff", borderRadius: 18, border: `1.5px solid ${isNext ? "#c7d2fe" : isDone ? "#d1fae5" : "rgba(0,0,0,0.06)"}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, opacity: unlocked ? 1 : 0.45 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: isDone ? "#ecfdf5" : isNext ? "#eef2ff" : "#f4f4f5" }}>
                      {isDone ? "✅" : mod.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isDone ? "#a1a1aa" : "#09090b", textDecoration: isDone ? "line-through" : "none" }}>{mod.title}</span>
                        {isNext && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: trackColor, color: "#fff" }}>Up next</span>}
                        {isSkipped && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>Pre-unlocked</span>}
                      </div>
                      <p style={{ fontSize: 12, color: "#a1a1aa" }}>{mod.duration} · {mod.description}</p>
                    </div>
                    {!unlocked ? (
                      <span style={{ fontSize: 16, flexShrink: 0, color: "#d4d4d8" }}>🔒</span>
                    ) : (
                      <Link href={`/modules/${mod.id}`} style={{ fontSize: 12, fontWeight: 700, flexShrink: 0, padding: "7px 16px", borderRadius: 10, textDecoration: "none", background: isDone ? "#ecfdf5" : isNext ? trackColor : "#f4f4f5", color: isDone ? "#16a34a" : isNext ? "#fff" : "#52525b" }}>
                        {isDone ? "Review" : "Start →"}
                      </Link>
                    )}
                  </div>
                </ModuleCard>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
