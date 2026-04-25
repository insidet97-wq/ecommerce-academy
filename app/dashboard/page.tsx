"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ── Design tokens ── */
const TRACK_COLORS: Record<string, string> = {
  "Beginner Fast-Start": "#4f46e5",
  "Fast-Track Builder":  "#7c3aed",
  "Optimization Track":  "#0891b2",
  "Explorer Track":      "#059669",
};
const GOAL_LABELS: Record<string, string> = {
  first_sale:  "First ever sale",
  side_income: "€500–2k/month side income",
  full_time:   "Replace full-time income",
  learn:       "Learn how ecommerce works",
};
const MODULES = [
  { id: 1,  emoji: "🎮", title: "The Rules of the Game",         duration: "~20 min", description: "Understand how ecommerce works before spending €1." },
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

/* ── Reusable hover-card wrapper ── */
function ModuleCard({ children, unlocked }: { children: React.ReactNode; unlocked: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  function enter() {
    if (!unlocked || !ref.current) return;
    ref.current.style.transform = "translateY(-1px)";
    ref.current.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)";
  }
  function leave() {
    if (!ref.current) return;
    ref.current.style.transform = "translateY(0)";
    ref.current.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
  }
  return (
    <div
      ref={ref}
      onMouseEnter={enter}
      onMouseLeave={leave}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "transform 0.2s, box-shadow 0.2s" }}
    >
      {children}
    </div>
  );
}

type Profile = { track: string | null; start_module: number; goal: string | null };

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [completed, setCompleted] = useState<number[]>([]);
  const [profile, setProfile] = useState<Profile>({ track: null, start_module: 1, goal: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setEmail(user.email ?? "");

      const [progressRes, profileRes] = await Promise.all([
        supabase.from("user_progress").select("module_id").eq("user_id", user.id),
        supabase.from("user_profiles").select("track, start_module, goal").eq("id", user.id).single(),
      ]);
      setCompleted((progressRes.data ?? []).map((r: { module_id: number }) => r.module_id));
      if (profileRes.data) {
        setProfile({
          track:        profileRes.data.track,
          start_module: profileRes.data.start_module ?? 1,
          goal:         profileRes.data.goal,
        });
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p style={{ color: "#a1a1aa", fontSize: 14 }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const completedCount   = completed.length;
  const progressPercent  = Math.round((completedCount / MODULES.length) * 100);
  const startModule      = profile.start_module ?? 1;
  const firstName        = email.split("@")[0];
  const trackColor       = profile.track ? (TRACK_COLORS[profile.track] ?? "#4f46e5") : "#4f46e5";
  const isUnlocked       = (id: number) => id <= startModule || completed.includes(id - 1);
  const nextModule       = MODULES.find(m => !completed.includes(m.id) && isUnlocked(m.id));

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* ── Nav ── */}
      <nav style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: 15, color: "#09090b", textDecoration: "none", letterSpacing: "-0.3px" }}>
            Ecommerce Academy
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/tools" style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
            >
              🛠 Tools
            </Link>
            <Link href="/resources" style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
            >
              📚 Resources
            </Link>
            <span style={{ fontSize: 13, color: "#a1a1aa" }} className="hidden sm:block">{email}</span>
            <button
              onClick={handleLogout}
              style={{ fontSize: 13, color: "#a1a1aa", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={e => (e.currentTarget.style.color = "#a1a1aa")}
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* ── Welcome ── */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: trackColor, marginBottom: 4 }}>
            {getGreeting()}, {firstName} 👋
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#09090b", letterSpacing: "-0.6px", marginBottom: 10 }}>
            Your Learning Dashboard
          </h1>
          {profile.track ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                background: trackColor, color: "#fff", letterSpacing: "0.2px",
              }}>
                {profile.track}
              </span>
              {profile.goal && (
                <span style={{ fontSize: 12, color: "#a1a1aa" }}>
                  · Goal: {GOAL_LABELS[profile.goal] ?? profile.goal}
                </span>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#a1a1aa" }}>
              Complete each module in order to unlock the next.{" "}
              <Link href="/quiz" style={{ color: "#6366f1", textDecoration: "underline" }}>Take the quiz</Link> to personalise your roadmap.
            </p>
          )}
        </div>

        {/* ── Progress card ── */}
        <div
          className="fade-up-d1"
          style={{
            borderRadius: 24,
            padding: "28px 28px 24px",
            marginBottom: 32,
            color: "#fff",
            background: `linear-gradient(135deg, ${trackColor} 0%, #7c3aed 100%)`,
            boxShadow: `0 20px 60px ${trackColor}40`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle inner glow */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, position: "relative" }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>Overall Progress</p>
              <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px" }}>
                {completedCount}
                <span style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>/ {MODULES.length} modules</span>
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-1.5px" }}>{progressPercent}%</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>completed</p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.2)", position: "relative" }}>
            <div style={{
              height: 6, borderRadius: 99, background: "#fff",
              width: `${progressPercent}%`,
              transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
            }} />
          </div>

          {/* Up next row */}
          {nextModule && (
            <div style={{
              marginTop: 20, paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              position: "relative",
            }}>
              <div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 3 }}>Up next · {nextModule.duration}</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{nextModule.emoji} {nextModule.title}</p>
              </div>
              <Link
                href={`/modules/${nextModule.id}`}
                style={{
                  background: "#fff", color: trackColor, fontWeight: 700, fontSize: 12,
                  padding: "8px 18px", borderRadius: 12, textDecoration: "none",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                Continue →
              </Link>
            </div>
          )}

          {completedCount === MODULES.length && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.15)", textAlign: "center", position: "relative" }}>
              <p style={{ fontWeight: 700, fontSize: 14 }}>🎉 You&apos;ve completed all modules! You&apos;re ready to sell.</p>
            </div>
          )}

          {startModule > 1 && completedCount === 0 && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.15)", position: "relative" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
                ✨ Based on your quiz, modules 1–{startModule - 1} are pre-unlocked. Jump straight to where you need to be.
              </p>
            </div>
          )}
        </div>

        {/* ── Module list ── */}
        <div className="fade-up-d2" style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {MODULES.map((mod) => {
            const isDone    = completed.includes(mod.id);
            const unlocked  = isUnlocked(mod.id);
            const isNext    = nextModule?.id === mod.id;
            const isSkipped = mod.id < startModule && !isDone;

            return (
              <ModuleCard key={mod.id} unlocked={unlocked}>
                <div style={{
                  background: "#fff",
                  borderRadius: 18,
                  border: `1.5px solid ${isNext ? "#c7d2fe" : isDone ? "#d1fae5" : "rgba(0,0,0,0.06)"}`,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: unlocked ? 1 : 0.45,
                }}>
                  {/* Icon blob */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                    background: isDone ? "#ecfdf5" : isNext ? "#eef2ff" : "#f4f4f5",
                  }}>
                    {isDone ? "✅" : mod.emoji}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: isDone ? "#a1a1aa" : "#09090b",
                        textDecoration: isDone ? "line-through" : "none",
                      }}>
                        {mod.title}
                      </span>
                      {isNext && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                          background: trackColor, color: "#fff", letterSpacing: "0.2px",
                        }}>
                          Up next
                        </span>
                      )}
                      {isSkipped && (
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99,
                          background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a",
                        }}>
                          Pre-unlocked
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "#a1a1aa" }}>{mod.duration} · {mod.description}</p>
                  </div>

                  {/* Action */}
                  {!unlocked ? (
                    <span style={{ fontSize: 16, flexShrink: 0, color: "#d4d4d8" }}>🔒</span>
                  ) : (
                    <Link
                      href={`/modules/${mod.id}`}
                      style={{
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                        padding: "7px 16px", borderRadius: 10, textDecoration: "none",
                        background: isDone ? "#ecfdf5" : isNext ? trackColor : "#f4f4f5",
                        color: isDone ? "#16a34a" : isNext ? "#fff" : "#52525b",
                        transition: "opacity 0.15s",
                      }}
                    >
                      {isDone ? "Review" : "Start →"}
                    </Link>
                  )}
                </div>
              </ModuleCard>
            );
          })}
        </div>

      </main>
    </div>
  );
}
