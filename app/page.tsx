"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ── Design tokens ── */
const HERO_BG   = "linear-gradient(135deg, #08080f 0%, #0f0a2e 55%, #150a2e 100%)";
const GRAD_BTN  = "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)";
const GLOW_BASE = "0 0 0 1px rgba(99,102,241,0.35), 0 4px 24px rgba(99,102,241,0.35), 0 8px 40px rgba(139,92,246,0.15)";
const GLOW_HOV  = "0 0 0 1px rgba(99,102,241,0.55), 0 8px 40px rgba(99,102,241,0.5),  0 16px 60px rgba(139,92,246,0.25)";
const CARD_SHADOW = "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)";
const CARD_SHADOW_HOV = "0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(99,102,241,0.1)";

/* ── Reusable hover button ── */
function GlowButton({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Link
      ref={ref}
      href={href}
      className="inline-flex items-center gap-2 text-white font-semibold text-sm px-7 py-3.5 rounded-xl"
      style={{ background: GRAD_BTN, boxShadow: GLOW_BASE, transition: "transform 200ms, box-shadow 200ms" }}
      onMouseEnter={() => { if (ref.current) { ref.current.style.transform = "translateY(-2px)"; ref.current.style.boxShadow = GLOW_HOV; } }}
      onMouseLeave={() => { if (ref.current) { ref.current.style.transform = "translateY(0)"; ref.current.style.boxShadow = GLOW_BASE; } }}
    >
      {children}
    </Link>
  );
}

/* ── Hover card ── */
function HoverCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={className}
      style={{ boxShadow: CARD_SHADOW, transition: "transform 250ms, box-shadow 250ms" }}
      onMouseEnter={() => { if (ref.current) { ref.current.style.transform = "translateY(-4px)"; ref.current.style.boxShadow = CARD_SHADOW_HOV; } }}
      onMouseLeave={() => { if (ref.current) { ref.current.style.transform = "translateY(0)"; ref.current.style.boxShadow = CARD_SHADOW; } }}
    >
      {children}
    </div>
  );
}

/* ── Floating product mockup ── */
function ProductMockup() {
  const items = [
    { emoji: "🎮", label: "The Rules of the Game",     done: true  },
    { emoji: "🎯", label: "Find Your Niche",            done: true  },
    { emoji: "🏆", label: "Find Your Winning Product",  done: false, active: true },
    { emoji: "🧠", label: "Know Your Customer",         done: false },
    { emoji: "🛒", label: "Build Your Shopify Store",   done: false },
  ];
  return (
    <div
      className="rounded-2xl p-5 w-72 flex-shrink-0"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Mini progress bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/60 text-xs font-semibold">Your Progress</span>
        <span className="text-xs font-bold" style={{ color: "#a78bfa" }}>2 / 12</span>
      </div>
      <div className="w-full rounded-full h-1.5 mb-5" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div className="h-1.5 rounded-full w-1/6" style={{ background: GRAD_BTN }} />
      </div>

      {/* Mini module list */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{
              background: item.active
                ? "rgba(99,102,241,0.15)"
                : "rgba(255,255,255,0.03)",
              border: item.active
                ? "1px solid rgba(99,102,241,0.3)"
                : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span className="text-sm">{item.done ? "✅" : item.emoji}</span>
            <span
              className="text-xs font-medium flex-1 truncate"
              style={{ color: item.done ? "rgba(255,255,255,0.4)" : item.active ? "#c4b5fd" : "rgba(255,255,255,0.7)" }}
            >
              {item.label}
            </span>
            {item.active && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.3)", color: "#c4b5fd" }}>
                Now
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div
          className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-white"
          style={{ background: GRAD_BTN }}
        >
          Continue → Module 3
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function Home() {
  const [loggedIn,   setLoggedIn]   = useState(false);
  const [firstName,  setFirstName]  = useState("");
  const [nextModId,  setNextModId]  = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      setLoggedIn(true);
      const userId = session.user.id;

      const [profileRes, progressRes] = await Promise.all([
        supabase.from("user_profiles").select("first_name, start_module").eq("id", userId).single(),
        supabase.from("user_progress").select("module_id").eq("user_id", userId),
      ]);

      setFirstName(profileRes.data?.first_name || session.user.email?.split("@")[0] || "");

      const done = (progressRes.data ?? []).map((r: { module_id: number }) => r.module_id);
      const start = profileRes.data?.start_module ?? 1;
      const allIds = [1,2,3,4,5,6,7,8,9,10,11,12];
      const next = allIds.find(id => !done.includes(id) && (id <= start || done.includes(id - 1)));
      setNextModId(next ?? null);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── NAV ── */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-8 py-5 flex items-center justify-between">
        <span className="text-base font-bold text-white tracking-tight">Ecommerce Academy</span>
        <div className="flex items-center gap-6">
          {loggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden sm:block" style={{ color: "rgba(255,255,255,0.5)" }}>
                Hey, <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{firstName}</span> 👋
              </span>
              <Link
                href="/dashboard"
                className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all duration-200"
                style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)" }}
                onMouseEnter={e => { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.12)"; t.style.borderColor = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={e => { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.06)"; t.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                Continue learning →
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.55)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "white")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              >
                Log in
              </Link>
              <Link
                href="/quiz"
                className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all duration-200"
                style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)" }}
                onMouseEnter={e => { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.12)"; t.style.borderColor = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={e => { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.06)"; t.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative min-h-[100vh] flex items-center overflow-hidden dot-grid"
        style={{ background: HERO_BG }}
      >
        {/* Radial glow */}
        <div className="absolute pointer-events-none" style={{
          top: "-10%", left: "50%", transform: "translateX(-50%)",
          width: "900px", height: "700px",
          background: "radial-gradient(ellipse at center, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)",
        }} />
        <div className="absolute pointer-events-none" style={{
          bottom: "10%", right: "15%", width: "400px", height: "400px",
          background: "radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 70%)",
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-8 w-full flex flex-col lg:flex-row items-center gap-16 py-32">

          {/* Left — copy */}
          <div className="flex-1 max-w-xl">
            <div className="fade-up">
              <span
                className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-8"
                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a78bfa" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Free for complete beginners
              </span>
            </div>

            <h1
              className="fade-up-d1 text-5xl sm:text-6xl font-extrabold text-white mb-6"
              style={{ lineHeight: "1.05", letterSpacing: "-0.04em" }}
            >
              Stop learning.
              <br />
              <span style={{ color: "#c4b5fd" }}>Start selling.</span>
            </h1>

            <p
              className="fade-up-d2 text-base mb-10 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.55)", maxWidth: "440px" }}
            >
              12 focused modules. Real tasks. One clear step at a time.
              No courses, no fluff — just the system that gets complete beginners to their first sale.
            </p>

            <div className="fade-up-d3 flex flex-col sm:flex-row gap-3 items-start">
              <GlowButton href="/quiz">Build my free plan →</GlowButton>
              <Link
                href="/login"
                className="text-sm font-medium px-7 py-3.5 rounded-xl transition-all duration-200"
                style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                onMouseEnter={e => { const t = e.currentTarget; t.style.color = "white"; t.style.borderColor = "rgba(255,255,255,0.25)"; t.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { const t = e.currentTarget; t.style.color = "rgba(255,255,255,0.5)"; t.style.borderColor = "rgba(255,255,255,0.1)"; t.style.background = "transparent"; }}
              >
                Log in
              </Link>
            </div>

            <div className="fade-up-d4 flex items-center gap-5 mt-8">
              {["Free forever", "No credit card", "Takes 2 minutes"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <span style={{ color: "#818cf8", fontSize: "12px" }}>✓</span>
                  <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating product mockup */}
          <div className="fade-up-d3 hidden lg:flex items-center justify-center flex-shrink-0">
            <div style={{ transform: "perspective(1200px) rotateY(-6deg) rotateX(2deg)" }}>
              <ProductMockup />
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1440 30 1080 0 720 0C360 0 0 30 0 30L0 60Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── WHY DIFFERENT — comparison ── */}
      <section className="bg-white px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: "#6366f1" }}>Why this works</p>
            <h2 className="text-4xl font-bold text-gray-900" style={{ letterSpacing: "-0.025em" }}>Not another course.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Old way */}
            <div className="rounded-2xl p-7 border border-red-100 bg-red-50/50">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-red-400 mb-5">The old way</p>
              <div className="space-y-4">
                {[
                  "6-hour courses you never finish",
                  "10 YouTube videos that all contradict each other",
                  "€997 for a PDF and a Facebook group",
                  "No clear next step — ever",
                  "Months pass. Zero sales.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="text-red-400 font-bold flex-shrink-0 mt-0.5">✕</span>
                    <p className="text-sm text-red-800/70 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* New way */}
            <div
              className="rounded-2xl p-7 border"
              style={{ background: "rgba(99,102,241,0.04)", borderColor: "rgba(99,102,241,0.2)" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.1em] mb-5" style={{ color: "#6366f1" }}>Ecommerce Academy</p>
              <div className="space-y-4">
                {[
                  "12 focused modules, 20–45 min each",
                  "One concrete task per module — then you unlock the next",
                  "Free forever. No upsells. No hidden fees.",
                  "Always know exactly what your next step is",
                  "Built on frameworks used by 7-figure ecommerce stores",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: "#6366f1" }}>✓</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — timeline ── */}
      <section className="px-8 py-24" style={{ background: "#f7f7fb" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: "#6366f1" }}>How it works</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ letterSpacing: "-0.025em" }}>
              From confused to confident.
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">
              No passive learning. No overwhelm. Just momentum.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div
              className="absolute left-6 top-8 bottom-8 w-px"
              style={{ background: "linear-gradient(to bottom, rgba(99,102,241,0.4), rgba(139,92,246,0.2))" }}
            />

            <div className="space-y-12">
              {[
                {
                  n: "01", emoji: "🧭",
                  title: "You get a plan built around you",
                  body: "Answer 5 quick questions. In 2 minutes you have a personalized roadmap — not a generic syllabus. Your experience, goal, and budget all shape it.",
                },
                {
                  n: "02", emoji: "⚡",
                  title: "You take real action — not just notes",
                  body: "Each module ends with a concrete task and a checklist. You don't move forward until you've done something. No passive watching.",
                },
                {
                  n: "03", emoji: "💰",
                  title: "You make your first sale — for real",
                  body: "By Module 11, your store is live, your ad is running, and your first sale is within reach. The next step is always obvious.",
                },
              ].map((step) => (
                <div key={step.n} className="flex gap-8 relative">
                  {/* Circle on line */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl z-10"
                    style={{ background: "white", border: "2px solid rgba(99,102,241,0.2)", boxShadow: "0 2px 12px rgba(99,102,241,0.1)" }}
                  >
                    {step.emoji}
                  </div>

                  <div className="pb-4">
                    <span
                      className="text-xs font-bold tracking-[0.1em] uppercase mb-2 block"
                      style={{ color: "#6366f1" }}
                    >
                      Step {step.n}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ letterSpacing: "-0.01em" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white px-8 py-16 border-t border-gray-100">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { n: "12", label: "Step-by-step modules", color: "#4f46e5" },
            { n: "3×",  label: "Minimum margin rule",  color: "#7c3aed" },
            { n: "1st", label: "Sale is your goal",    color: "#a855f7" },
          ].map((s) => (
            <div key={s.n}>
              <p className="text-5xl font-extrabold mb-1" style={{ color: s.color, letterSpacing: "-0.04em" }}>{s.n}</p>
              <p className="text-xs font-medium text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-8 py-24" style={{ background: "#f7f7fb" }}>
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-3xl p-12 text-center relative overflow-hidden dot-grid"
            style={{ background: HERO_BG }}
          >
            <div className="absolute pointer-events-none" style={{
              top: "-30%", left: "50%", transform: "translateX(-50%)",
              width: "600px", height: "400px",
              background: "radial-gradient(ellipse, rgba(99,102,241,0.3) 0%, transparent 70%)",
            }} />
            <div className="relative z-10">
              <h2
                className="text-4xl font-extrabold text-white mb-4"
                style={{ letterSpacing: "-0.03em" }}
              >
                Ready to build your plan?
              </h2>
              <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
                Answer 5 questions · Get your personalized roadmap · Start Module 1 today
              </p>
              <GlowButton href="/quiz">Build my free ecommerce plan →</GlowButton>
              <p className="mt-5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                No credit card · No commitment · Free forever
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-100 px-8 py-10 text-center">
        <p className="text-base font-bold text-gray-900 mb-1">Ecommerce Academy</p>
        <p className="text-sm text-gray-400">© 2026 · Built for complete beginners</p>
      </footer>
    </div>
  );
}
