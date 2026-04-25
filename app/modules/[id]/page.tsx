"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getModule } from "@/lib/modules";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";

const MODULE_EMOJIS: Record<number, string> = {
  1: "🎮", 2: "🎯", 3: "🏆", 4: "🧠",  5: "🛒",
  6: "⚡", 7: "📱", 8: "📣", 9: "📈", 10: "📧",
  11: "💰", 12: "🚀",
};

/* ── Section wrapper card ── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      border: "1.5px solid rgba(0,0,0,0.06)",
      padding: "22px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Section heading ── */
function SectionHeading({ icon, title, right }: { icon: string; title: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#09090b", letterSpacing: "-0.3px" }}>{title}</h2>
      </div>
      {right}
    </div>
  );
}

/* ── Glow CTA button ── */
function GlowButton({ children, onClick, disabled, style }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  function enter() {
    if (disabled || !ref.current) return;
    ref.current.style.boxShadow = "0 8px 32px rgba(99,102,241,0.45)";
    ref.current.style.transform = "translateY(-1px)";
  }
  function leave() {
    if (!ref.current) return;
    ref.current.style.boxShadow = "0 4px 20px rgba(99,102,241,0.28)";
    ref.current.style.transform = "translateY(0)";
  }
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={enter}
      onMouseLeave={leave}
      style={{
        background: disabled ? "#e4e4e7" : "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
        color: disabled ? "#a1a1aa" : "#fff",
        fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px",
        padding: "14px 36px", borderRadius: 14, border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 4px 20px rgba(99,102,241,0.28)",
        transition: "box-shadow 0.2s, transform 0.2s, background 0.2s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default function ModulePage() {
  const params   = useParams();
  const router   = useRouter();
  const moduleId = Number(params.id);
  const mod      = getModule(moduleId);

  const [userId,   setUserId]   = useState<string | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const [checked,  setChecked]  = useState<boolean[]>([]);
  const [marking,  setMarking]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from("user_progress")
        .select("module_id")
        .eq("user_id", user.id);

      const doneIds = (data ?? []).map((r: { module_id: number }) => r.module_id);
      setCompleted(doneIds);

      const admin   = isAdmin(user.email);
      const unlocked = admin || moduleId === 1 || doneIds.includes(moduleId - 1);
      if (!unlocked) { router.push("/dashboard"); return; }

      // Already completed → skip intro, go straight to review
      if (doneIds.includes(moduleId)) setShowIntro(false);

      if (mod) setChecked(new Array(mod.checklist.length).fill(false));
      setLoading(false);
    }
    load();
  }, [moduleId, router, mod]);

  async function handleComplete() {
    if (!userId || !mod) return;
    setMarking(true);
    await supabase.from("user_progress").upsert({ user_id: userId, module_id: moduleId });
    setMarking(false);
    setCountdown(5);
    setShowCompletion(true);
  }

  // Countdown auto-redirect
  useEffect(() => {
    if (!showCompletion) return;
    if (countdown <= 0) {
      if (moduleId < 12) router.push(`/modules/${moduleId + 1}`);
      else router.push("/dashboard");
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [showCompletion, countdown, moduleId, router]);

  function toggleCheck(i: number) {
    setChecked(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
  }

  if (loading || !mod) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p style={{ color: "#a1a1aa", fontSize: 14 }}>Loading module…</p>
        </div>
      </div>
    );
  }

  const isDone       = completed.includes(moduleId);
  const allChecked   = checked.every(Boolean);
  const emoji        = MODULE_EMOJIS[moduleId] ?? "📖";

  // ── Module intro screen ──
  if (showIntro) {
    return (
      <div className="min-h-screen" style={{ background: "#f8f8fb" }}>
        {/* Nav */}
        <nav style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: 15, color: "#09090b", textDecoration: "none", letterSpacing: "-0.3px" }}>Ecommerce Academy</Link>
            <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
            >← Dashboard</Link>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)", padding: "64px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.35) 0%, transparent 70%)" }} />
          <div style={{ position: "relative" }}>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 16, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", padding: "5px 14px", borderRadius: 99 }}>
              Module {mod.id} of 12
            </span>
            <div style={{ fontSize: 64, marginBottom: 18, lineHeight: 1 }}>{emoji}</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.8px", marginBottom: 14, lineHeight: 1.15 }}>{mod.title}</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.65 }}>{mod.objective}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.12)", padding: "5px 14px", borderRadius: 99 }}>⏱ {mod.duration}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.12)", padding: "5px 14px", borderRadius: 99 }}>✅ {mod.checklist.length} tasks</span>
            </div>
          </div>
        </div>

        {/* Intro content */}
        <main style={{ maxWidth: 600, margin: "0 auto", padding: "36px 24px 80px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* What you'll learn */}
          <div className="fade-up" style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(0,0,0,0.06)", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6366f1", marginBottom: 16 }}>What you&apos;ll learn</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mod.concepts.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 2 }}>{c.title}</p>
                    <p style={{ fontSize: 12, color: "#a1a1aa", lineHeight: 1.5 }}>{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What you'll do */}
          <div className="fade-up-d1" style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(0,0,0,0.06)", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#059669", marginBottom: 16 }}>Your action steps</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mod.steps.slice(0, 4).map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 13, color: "#34d399", flexShrink: 0, marginTop: 1 }}>✓</span>
                  <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.55 }}>{step}</p>
                </div>
              ))}
              {mod.steps.length > 4 && (
                <p style={{ fontSize: 12, color: "#a1a1aa", paddingLeft: 22 }}>+ {mod.steps.length - 4} more steps inside…</p>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="fade-up-d2" style={{ textAlign: "center", paddingTop: 8 }}>
            <button
              onClick={() => setShowIntro(false)}
              style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", fontWeight: 800, fontSize: 16, borderRadius: 16, border: "none", cursor: "pointer", boxShadow: "0 4px 24px rgba(99,102,241,0.35)", letterSpacing: "-0.3px", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 36px rgba(99,102,241,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(99,102,241,0.35)"; }}
            >
              Start Module {mod.id} →
            </button>
            <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 12 }}>Takes approximately {mod.duration}</p>
          </div>

        </main>
      </div>
    );
  }
  const checkedCount = checked.filter(Boolean).length;
  const isLast       = moduleId === 12;
  const nextId       = moduleId + 1;

  const NEXT_TITLES: Record<number, { emoji: string; title: string; duration: string }> = {
    1:  { emoji: "🎯", title: "Find Your Niche",               duration: "~25 min" },
    2:  { emoji: "🏆", title: "Find Your Winning Product",     duration: "~30 min" },
    3:  { emoji: "🧠", title: "Know Your Customer",            duration: "~25 min" },
    4:  { emoji: "🛒", title: "Build Your Shopify Store",      duration: "~45 min" },
    5:  { emoji: "⚡", title: "Build Your First Sales Funnel", duration: "~35 min" },
    6:  { emoji: "📱", title: "Drive Traffic: TikTok Organic", duration: "~30 min" },
    7:  { emoji: "📣", title: "Run Your First Paid Ad",        duration: "~40 min" },
    8:  { emoji: "📈", title: "Conversion Optimisation",       duration: "~30 min" },
    9:  { emoji: "📧", title: "Build Your Email List",         duration: "~35 min" },
    10: { emoji: "💰", title: "Make Your First Sale",          duration: "~20 min" },
    11: { emoji: "🚀", title: "Scale and Grow",                duration: "~25 min" },
  };
  const nextInfo = NEXT_TITLES[moduleId];

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* ── Completion overlay ── */}
      {showCompletion && (
        <div className="slide-up" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: "#fff", borderRadius: "24px 24px 0 0", padding: "28px 24px 44px", boxShadow: "0 -8px 48px rgba(0,0,0,0.14)", borderTop: "1.5px solid rgba(0,0,0,0.06)" }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✅</div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#09090b", letterSpacing: "-0.3px" }}>Module {moduleId} complete!</p>
                <p style={{ fontSize: 12, color: "#a1a1aa" }}>{mod?.title}</p>
              </div>
            </div>

            {!isLast && nextInfo ? (
              <>
                {/* Next module preview */}
                <div style={{ background: "#f8f8fb", borderRadius: 16, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{nextInfo.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 2 }}>Up next · Module {nextId} · {nextInfo.duration}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#09090b" }}>{nextInfo.title}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa" }}>{countdown}s</span>
                </div>

                {/* Countdown bar */}
                <div style={{ height: 3, borderRadius: 99, background: "#e4e4e7", marginBottom: 16, overflow: "hidden" }}>
                  <div style={{ height: 3, background: "linear-gradient(90deg, #6366f1, #7c3aed)", width: `${(countdown / 5) * 100}%`, transition: "width 1s linear" }} />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <Link href={`/modules/${nextId}`} style={{ flex: 1, display: "block", textAlign: "center", background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px", borderRadius: 14, textDecoration: "none", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                    Start Module {nextId} →
                  </Link>
                  <Link href="/dashboard" style={{ padding: "13px 18px", borderRadius: 14, background: "#f4f4f5", color: "#52525b", fontWeight: 600, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>
                    Dashboard
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, color: "#71717a", marginBottom: 20, lineHeight: 1.6 }}>
                  You&apos;ve completed all 12 modules. You have everything you need to start selling.
                </p>
                <Link href="/dashboard" style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px", borderRadius: 14, textDecoration: "none", boxShadow: "0 4px 16px rgba(5,150,105,0.3)" }}>
                  View your certificate 🏆
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: 15, color: "#09090b", textDecoration: "none", letterSpacing: "-0.3px" }}>
            Ecommerce Academy
          </Link>
          <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
            onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      {/* ── Hero header ── */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
        padding: "56px 24px 48px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* dot grid */}
        <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        {/* radial glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.35) 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 48, marginBottom: 14, lineHeight: 1 }}>{emoji}</div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)", marginBottom: 10, textTransform: "uppercase" }}>
            Module {mod.id} of 12
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.7px", marginBottom: 12, lineHeight: 1.2 }}>
            {mod.title}
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
            {mod.objective}
          </p>

          {/* Duration pill */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              padding: "5px 14px", borderRadius: 99,
            }}>
              ⏱ {mod.duration}
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Already completed banner */}
        {isDone && (
          <div className="fade-up" style={{
            background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
            border: "1.5px solid #a7f3d0",
            borderRadius: 16, padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#065f46" }}>
              You&apos;ve already completed this module — you can review it anytime.
            </p>
          </div>
        )}

        {/* ── Key Concepts ── */}
        <section className="fade-up">
          <SectionHeading icon="💡" title="Key Concepts" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mod.concepts.map((c, i) => (
              <Card key={i}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 5 }}>{c.title}</p>
                <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.65 }}>{c.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Action Steps ── */}
        <section className="fade-up-d1">
          <SectionHeading icon="⚡" title="Your Action Steps" />
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mod.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                    color: "#fff", fontSize: 11, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginTop: 1,
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.65 }}>{step}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ── Common Mistakes ── */}
        <section className="fade-up-d2">
          <SectionHeading icon="⚠️" title="Common Mistakes to Avoid" />
          <div style={{
            background: "#fff7f7",
            border: "1.5px solid #fecaca",
            borderRadius: 20, padding: "22px 24px",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {mod.mistakes.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", flexShrink: 0, marginTop: 1 }}>✕</span>
                <p style={{ fontSize: 13, color: "#7f1d1d", lineHeight: 1.65 }}>{m}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Resources ── */}
        {mod.resources && mod.resources.length > 0 && (
          <section className="fade-up-d3">
            <SectionHeading icon="🔗" title="Recommended Resources" />
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mod.resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
                  >
                    <span style={{
                      width: 30, height: 30, borderRadius: 10, background: "#eef2ff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, flexShrink: 0,
                    }}>→</span>
                    {r.label}
                  </a>
                ))}
              </div>
            </Card>
          </section>
        )}

        {/* ── Checklist ── */}
        <section className="fade-up-d3">
          <SectionHeading
            icon="✅"
            title="Completion Checklist"
            right={
              <span style={{ fontSize: 12, fontWeight: 700, color: checkedCount === mod.checklist.length ? "#16a34a" : "#6366f1" }}>
                {checkedCount}/{mod.checklist.length}
              </span>
            }
          />
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mod.checklist.map((item, i) => (
                <label key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={checked[i] ?? false}
                    onChange={() => toggleCheck(i)}
                    style={{ width: 16, height: 16, marginTop: 2, accentColor: "#6366f1", cursor: "pointer", flexShrink: 0 }}
                  />
                  <span style={{
                    fontSize: 13, lineHeight: 1.6, color: checked[i] ? "#a1a1aa" : "#3f3f46",
                    textDecoration: checked[i] ? "line-through" : "none",
                    transition: "color 0.15s",
                  }}>
                    {item}
                  </span>
                </label>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, borderRadius: 99, background: "#f4f4f5", marginTop: 18 }}>
              <div style={{
                height: 4, borderRadius: 99,
                background: "linear-gradient(90deg, #6366f1, #7c3aed)",
                width: `${(checkedCount / mod.checklist.length) * 100}%`,
                transition: "width 0.35s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>
          </Card>
        </section>

        {/* ── Mark Complete / Already done ── */}
        <div className="fade-up-d4" style={{ paddingBottom: 8, textAlign: "center" }}>
          {isDone ? (
            <div style={{
              background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
              border: "1.5px solid #a7f3d0",
              borderRadius: 20, padding: "28px 24px",
            }}>
              <p style={{ fontSize: 22, marginBottom: 6 }}>🎉</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#065f46", marginBottom: 4 }}>Module Complete!</p>
              <p style={{ fontSize: 13, color: "#34d399", marginBottom: 20 }}>You&apos;ve already completed this module.</p>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #059669, #047857)",
                  color: "#fff", fontWeight: 700, fontSize: 13,
                  padding: "12px 28px", borderRadius: 12, textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(5,150,105,0.3)",
                }}
              >
                Back to Dashboard →
              </Link>
            </div>
          ) : (
            <div>
              {!allChecked ? (
                <p style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 16 }}>
                  Tick all {mod.checklist.length} items above to unlock completion
                </p>
              ) : (
                <p style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", marginBottom: 16 }}>
                  ✓ All done! You&apos;re ready to mark this module complete.
                </p>
              )}
              <GlowButton onClick={handleComplete} disabled={!allChecked || marking}>
                {marking ? "Saving…" : isLast ? "Complete Course 🚀" : `Complete & Continue to Module ${nextId} →`}
              </GlowButton>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
