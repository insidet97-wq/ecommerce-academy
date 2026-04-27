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

/* ── Reusable glow button ── */
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
function HoverCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={className}
      style={{ boxShadow: CARD_SHADOW, transition: "transform 250ms, box-shadow 250ms", ...style }}
      onMouseEnter={() => { if (ref.current) { ref.current.style.transform = "translateY(-4px)"; ref.current.style.boxShadow = CARD_SHADOW_HOV; } }}
      onMouseLeave={() => { if (ref.current) { ref.current.style.transform = "translateY(0)"; ref.current.style.boxShadow = CARD_SHADOW; } }}
    >
      {children}
    </div>
  );
}

/* ── FAQ item ── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border rounded-2xl overflow-hidden transition-all duration-200"
      style={{ borderColor: open ? "rgba(99,102,241,0.3)" : "#e5e7eb", background: open ? "rgba(99,102,241,0.02)" : "#fff" }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="text-sm font-semibold text-gray-900" style={{ letterSpacing: "-0.01em" }}>{q}</span>
        <span
          className="flex-shrink-0 ml-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
          style={{ background: open ? GRAD_BTN : "#f4f4f5", color: open ? "#fff" : "#6b7280", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
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
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/60 text-xs font-semibold">Your Progress</span>
        <span className="text-xs font-bold" style={{ color: "#a78bfa" }}>2 / 12</span>
      </div>
      <div className="w-full rounded-full h-1.5 mb-5" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div className="h-1.5 rounded-full w-1/6" style={{ background: GRAD_BTN }} />
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{
              background: item.active ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
              border: item.active ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.05)",
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
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.3)", color: "#c4b5fd" }}>Now</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-white" style={{ background: GRAD_BTN }}>
          Continue → Module 3
        </div>
      </div>
    </div>
  );
}

/* ── Module data ── */
const MODULES = [
  { id: 1,  emoji: "🎮", title: "The Rules of the Game",         duration: "~20 min" },
  { id: 2,  emoji: "🎯", title: "Find Your Niche",               duration: "~25 min" },
  { id: 3,  emoji: "🏆", title: "Find Your Winning Product",     duration: "~30 min" },
  { id: 4,  emoji: "🧠", title: "Know Your Customer",            duration: "~25 min" },
  { id: 5,  emoji: "🛒", title: "Build Your Shopify Store",      duration: "~45 min" },
  { id: 6,  emoji: "⚡", title: "Build Your First Sales Funnel", duration: "~35 min" },
  { id: 7,  emoji: "📱", title: "Drive Traffic: TikTok Organic", duration: "~30 min" },
  { id: 8,  emoji: "📣", title: "Run Your First Paid Ad",        duration: "~40 min" },
  { id: 9,  emoji: "📈", title: "Conversion Optimisation",       duration: "~30 min" },
  { id: 10, emoji: "📧", title: "Build Your Email List",         duration: "~35 min" },
  { id: 11, emoji: "💰", title: "Make Your First Sale",          duration: "~20 min" },
  { id: 12, emoji: "🚀", title: "Scale and Grow",                duration: "~25 min" },
];

/* ── Main page ── */
export default function Home() {
  const [loggedIn,  setLoggedIn]  = useState(false);
  const [firstName, setFirstName] = useState("");
  const [progress,  setProgress]  = useState<number[]>([]);
  const [isPro,     setIsPro]     = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      setLoggedIn(true);
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("first_name, is_pro")
        .eq("id", session.user.id)
        .single();
      setFirstName(profile?.first_name || session.user.email?.split("@")[0] || "");
      setIsPro(profile?.is_pro ?? false);

      const { data: progressRows } = await supabase
        .from("user_progress")
        .select("module_id")
        .eq("user_id", session.user.id);
      setProgress(progressRows?.map((r: { module_id: number }) => r.module_id) ?? []);
    });
  }, []);

  /* ── Logged-in dashboard page ── */
  if (loggedIn) {
    const completedCount  = progress.length;
    const progressPercent = Math.round((completedCount / 12) * 100);

    const subtext =
      completedCount === 0  ? "Your journey to your first sale starts now."
      : completedCount <= 5 ? "You're building momentum. Keep going."
      : completedCount === 6 ? "Halfway there — the traffic and ads modules are next."
      : completedCount <= 11 ? "You're this close to your first sale."
      : "You've completed the full roadmap. Time to scale.";

    const quoteText =
      completedCount === 0  ? "\"The best time to start was yesterday. The second best is right now.\""
      : completedCount <= 5 ? "\"Every module you complete puts you further ahead than 90% of people who 'want to start a business.'\""
      : completedCount < 12 ? "\"You know more than most people who call themselves ecommerce entrepreneurs. Finish the job.\""
      : "\"🎉 Course complete. Your first sale is the beginning, not the end.\"";

    function handleLogout() {
      supabase.auth.signOut().then(() => { window.location.href = "/"; });
    }

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#f7f7fb" }}>

        {/* ── NAV ── */}
        <nav
          className="sticky top-0 z-30 px-8 py-4 flex items-center justify-between"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="First Sale Lab" style={{ height: 36, width: "auto" }} />
            <span className="text-base font-bold text-gray-900" style={{ letterSpacing: "-0.4px" }}>First Sale Lab</span>
            {isPro ? (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff" }}
              >
                ✨ Pro
              </span>
            ) : (
              <Link
                href="/upgrade"
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,0.1)"; }}
              >
                ✨ Upgrade
              </Link>
            )}
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/tools"
              className="text-sm font-medium text-gray-500 hidden sm:block"
              onMouseEnter={e => (e.currentTarget.style.color = "#111")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
            >
              Tools
            </Link>
            <Link
              href="/resources"
              className="text-sm font-medium text-gray-500 hidden sm:block"
              onMouseEnter={e => (e.currentTarget.style.color = "#111")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
            >
              Resources
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold"
              style={{ color: "#6366f1" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#4f46e5")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
            >
              Dashboard →
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium px-4 py-2 rounded-lg"
              style={{
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                background: "white",
                cursor: "pointer",
              }}
              onMouseEnter={e => { const t = e.currentTarget; t.style.borderColor = "#d1d5db"; t.style.color = "#111"; }}
              onMouseLeave={e => { const t = e.currentTarget; t.style.borderColor = "#e5e7eb"; t.style.color = "#6b7280"; }}
            >
              Log out
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section
          className="relative overflow-hidden dot-grid"
          style={{ background: HERO_BG, paddingTop: "80px", paddingBottom: "0" }}
        >
          {/* Radial glow */}
          <div className="absolute pointer-events-none" style={{
            top: "-10%", left: "50%", transform: "translateX(-50%)",
            width: "900px", height: "600px",
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)",
          }} />
          <div className="absolute pointer-events-none" style={{
            bottom: "10%", right: "15%", width: "400px", height: "400px",
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 70%)",
          }} />

          <div className="relative z-10 max-w-3xl mx-auto px-8 py-20 text-center">
            {/* Welcome back label */}
            <span
              className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a78bfa" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Welcome back
            </span>

            {/* Heading */}
            <h1
              className="text-5xl sm:text-6xl font-extrabold text-white mb-5"
              style={{ lineHeight: "1.05", letterSpacing: "-0.04em" }}
            >
              Hey, {firstName}. 👋
            </h1>

            {/* Dynamic subtext */}
            <p
              className="text-base mb-8 leading-relaxed mx-auto"
              style={{ color: "rgba(255,255,255,0.6)", maxWidth: "480px" }}
            >
              {subtext}
            </p>

            {/* Progress bar */}
            <div className="mx-auto mb-8" style={{ maxWidth: "400px" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {completedCount} of 12 modules
                </span>
                <span className="text-xs font-bold" style={{ color: "#a78bfa" }}>{progressPercent}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    background: GRAD_BTN,
                    width: `${progressPercent}%`,
                    transition: "width 600ms ease",
                    minWidth: completedCount > 0 ? "8px" : "0",
                  }}
                />
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <GlowButton href="/dashboard">Continue learning →</GlowButton>
              <Link
                href="/dashboard"
                className="text-sm font-medium px-7 py-3.5 rounded-xl"
                style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                onMouseEnter={e => { const t = e.currentTarget; t.style.color = "white"; t.style.borderColor = "rgba(255,255,255,0.25)"; t.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { const t = e.currentTarget; t.style.color = "rgba(255,255,255,0.5)"; t.style.borderColor = "rgba(255,255,255,0.1)"; t.style.background = "transparent"; }}
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* White wave */}
          <div className="relative z-10">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 60L1440 60L1440 30C1440 30 1080 0 720 0C360 0 0 30 0 30L0 60Z" fill="#f7f7fb"/>
            </svg>
          </div>
        </section>

        {/* ── QUICK-ACCESS CARDS ── */}
        <section className="px-8 py-16" style={{ background: "#f7f7fb" }}>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Card 1 — Progress */}
            {(() => {
              const cardRef = { current: null as HTMLDivElement | null };
              return (
                <div
                  ref={(el) => { cardRef.current = el; }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col cursor-pointer"
                  style={{ boxShadow: CARD_SHADOW, transition: "transform 250ms, box-shadow 250ms" }}
                  onMouseEnter={e => { const t = e.currentTarget; t.style.transform = "translateY(-4px)"; t.style.boxShadow = CARD_SHADOW_HOV; }}
                  onMouseLeave={e => { const t = e.currentTarget; t.style.transform = "translateY(0)"; t.style.boxShadow = CARD_SHADOW; }}
                  onClick={() => { window.location.href = "/dashboard"; }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                    style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))" }}
                  >
                    📊
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2" style={{ letterSpacing: "-0.01em" }}>Your progress</h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">
                    {completedCount} of 12 modules complete · {progressPercent}% done
                  </p>
                  <span className="mt-4 text-sm font-semibold" style={{ color: "#6366f1" }}>View dashboard →</span>
                </div>
              );
            })()}

            {/* Card 2 — Tools */}
            <div
              className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col cursor-pointer"
              style={{ boxShadow: CARD_SHADOW, transition: "transform 250ms, box-shadow 250ms" }}
              onMouseEnter={e => { const t = e.currentTarget; t.style.transform = "translateY(-4px)"; t.style.boxShadow = CARD_SHADOW_HOV; }}
              onMouseLeave={e => { const t = e.currentTarget; t.style.transform = "translateY(0)"; t.style.boxShadow = CARD_SHADOW; }}
              onClick={() => { window.location.href = "/tools"; }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))" }}
              >
                🛠️
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2" style={{ letterSpacing: "-0.01em" }}>Tools &amp; calculators</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">
                Profit calculator, product research tools, and more
              </p>
              <span className="mt-4 text-sm font-semibold" style={{ color: "#6366f1" }}>Open tools →</span>
            </div>

            {/* Card 3 — Pro upsell or Resources */}
            {!isPro ? (
              <div
                className="rounded-2xl p-6 flex flex-col cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  boxShadow: GLOW_BASE,
                  transition: "transform 250ms, box-shadow 250ms",
                }}
                onMouseEnter={e => { const t = e.currentTarget; t.style.transform = "translateY(-4px)"; t.style.boxShadow = GLOW_HOV; }}
                onMouseLeave={e => { const t = e.currentTarget; t.style.transform = "translateY(0)"; t.style.boxShadow = GLOW_BASE; }}
                onClick={() => { window.location.href = "/upgrade"; }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  ✨
                </div>
                <h3 className="text-sm font-bold text-white mb-2" style={{ letterSpacing: "-0.01em" }}>First Sale Lab Pro</h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Modules 7–12 cover traffic, ads, and your first sale. Unlock them for $19/month.
                </p>
                <span
                  className="mt-4 inline-block text-xs font-bold px-4 py-2 rounded-lg self-start"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff" }}
                >
                  Upgrade now →
                </span>
              </div>
            ) : (
              <div
                className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col cursor-pointer"
                style={{ boxShadow: CARD_SHADOW, transition: "transform 250ms, box-shadow 250ms" }}
                onMouseEnter={e => { const t = e.currentTarget; t.style.transform = "translateY(-4px)"; t.style.boxShadow = CARD_SHADOW_HOV; }}
                onMouseLeave={e => { const t = e.currentTarget; t.style.transform = "translateY(0)"; t.style.boxShadow = CARD_SHADOW; }}
                onClick={() => { window.location.href = "/resources"; }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))" }}
                >
                  📚
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2" style={{ letterSpacing: "-0.01em" }}>Resources</h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">
                  Supplier lists, ad templates, and cheat sheets.
                </p>
                <span className="mt-4 text-sm font-semibold" style={{ color: "#6366f1" }}>Browse resources →</span>
              </div>
            )}
          </div>
        </section>

        {/* ── QUOTE SECTION ── */}
        <section className="px-8 py-16" style={{ background: "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)" }}>
          <div className="max-w-2xl mx-auto text-center">
            <p
              className="text-lg font-semibold leading-relaxed mb-6"
              style={{ color: "#3730a3", letterSpacing: "-0.01em" }}
            >
              {quoteText}
            </p>
            <Link
              href="/dashboard"
              className="text-sm font-semibold"
              style={{ color: "#6366f1" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#4f46e5")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
            >
              Back to dashboard →
            </Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="px-8 py-10" style={{ background: "#08080f" }}>
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="First Sale Lab" style={{ height: 28, width: "auto" }} />
              <span className="text-sm font-bold text-white" style={{ letterSpacing: "-0.3px" }}>First Sale Lab</span>
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>© 2026 First Sale Lab</p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
              >Privacy</Link>
              <Link href="/terms" className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
              >Terms</Link>
              <Link href="/dashboard" className="text-xs font-semibold" style={{ color: "#a78bfa" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#c4b5fd")}
                onMouseLeave={e => (e.currentTarget.style.color = "#a78bfa")}
              >Dashboard →</Link>
            </div>
          </div>
        </footer>

      </div>
    );
  }

  /* ── Marketing landing page (non-logged-in) ── */

  const faqItems = [
    { q: "Is this actually free?", a: "Modules 1–6 are completely free — no credit card, no trial. Modules 7–12 are part of First Sale Lab Pro at $19/month, which covers traffic, ads, conversions, and scaling. Pro members also get weekly winning product picks every Monday and a monthly ad strategy update. You can complete the full beginner foundation before deciding if Pro is right for you." },
    { q: "Do I need experience or money to start?", a: "No experience needed at all — that's the point. For budget, you can start learning and building for $0." },
    { q: "How long does the full course take?", a: "Each module is 20–45 minutes of focused content plus your real-world task. Most people complete the full 12 modules in 3–6 weeks, doing one or two modules per week alongside a job or studies." },
    { q: "What's the difference between this and a YouTube playlist?", a: "Structure and accountability. YouTube gives you information. First Sale Lab gives you a sequence — each module builds on the last, you can't skip ahead without completing the task, and you always know exactly what to do next." },
    { q: "What platform do you teach? Shopify, Etsy, Amazon?", a: "We focus on Shopify + your own traffic (TikTok organic and Meta ads). This gives you the most control and the best margins. You own your store, your audience, and your brand." },
    { q: "What if I get stuck on a module?", a: "Each module has a clear checklist of exactly what to do. If you're stuck, re-read the action steps — they're written to be as specific as possible." },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://firstsalelab.com/#organization",
        "name": "First Sale Lab",
        "url": "https://firstsalelab.com",
        "logo": "https://firstsalelab.com/logo.png",
        "description": "First Sale Lab is a freemium ecommerce course that gets complete beginners to their first Shopify sale through 12 focused modules.",
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "hello@firstsalelab.com",
          "contactType": "customer support",
        },
      },
      {
        "@type": "Course",
        "@id": "https://firstsalelab.com/#course",
        "name": "First Sale Lab — From Zero to First Sale",
        "description": "12 focused ecommerce modules that take complete beginners from idea to first Shopify sale. Modules 1–6 are free. Pro unlocks traffic, ads, conversions, and scaling.",
        "url": "https://firstsalelab.com",
        "provider": {
          "@type": "Organization",
          "@id": "https://firstsalelab.com/#organization",
        },
        "educationalLevel": "Beginner",
        "teaches": "Shopify dropshipping, product research, TikTok organic traffic, Meta ads, conversion optimisation, email marketing",
        "hasCourseInstance": [
          {
            "@type": "CourseInstance",
            "courseMode": "online",
            "courseWorkload": "PT3H",
          },
        ],
        "offers": [
          {
            "@type": "Offer",
            "name": "Free — Modules 1–6",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": "https://firstsalelab.com/signup",
          },
          {
            "@type": "Offer",
            "name": "Pro — All 12 Modules",
            "price": "19",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": "https://firstsalelab.com/upgrade",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqItems.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── NAV ── */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="First Sale Lab" style={{ height: 40, width: "auto" }} />
          <span className="text-base font-bold text-white tracking-tight" style={{ letterSpacing: "-0.4px" }}>First Sale Lab</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.55)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            >
              Log in
            </Link>
            <Link
              href="/quiz"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
              style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)" }}
              onMouseEnter={e => { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.12)"; t.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.06)"; t.style.borderColor = "rgba(255,255,255,0.15)"; }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative min-h-[100vh] flex items-center overflow-hidden dot-grid"
        style={{ background: HERO_BG }}
      >
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
          <div className="flex-1 max-w-xl">
            <div className="fade-up">
              <span
                className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-8"
                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a78bfa" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Modules 1–6 free · Pro from $19/mo
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
                className="text-sm font-medium px-7 py-3.5 rounded-xl"
                style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                onMouseEnter={e => { const t = e.currentTarget; t.style.color = "white"; t.style.borderColor = "rgba(255,255,255,0.25)"; t.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { const t = e.currentTarget; t.style.color = "rgba(255,255,255,0.5)"; t.style.borderColor = "rgba(255,255,255,0.1)"; t.style.background = "transparent"; }}
              >
                Log in
              </Link>
            </div>

            <div className="fade-up-d4 flex items-center gap-5 mt-8">
              {["Modules 1–6 free", "No card to start", "Takes 2 minutes"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <span style={{ color: "#818cf8", fontSize: "12px" }}>✓</span>
                  <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up-d3 hidden lg:flex items-center justify-center flex-shrink-0">
            <div style={{ transform: "perspective(1200px) rotateY(-6deg) rotateX(2deg)" }}>
              <ProductMockup />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1440 30 1080 0 720 0C360 0 0 30 0 30L0 60Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="bg-white border-b border-gray-100 px-8 py-5">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {[
            { icon: "⭐", text: "Rated 4.9 by early users" },
            { icon: "🌍", text: "Used in 30+ countries" },
            { icon: "🆓", text: "Modules 1–6 completely free" },
            { icon: "⚡", text: "First module takes 20 minutes" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-2">
              <span className="text-base">{item.icon}</span>
              <span className="text-xs font-medium text-gray-500">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY DIFFERENT — comparison ── */}
      <section className="bg-white px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: "#6366f1" }}>Why this works</p>
            <h2 className="text-4xl font-bold text-gray-900" style={{ letterSpacing: "-0.025em" }}>Not another course.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-7 border border-red-100 bg-red-50/50">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-red-400 mb-5">The old way</p>
              <div className="space-y-4">
                {[
                  "6-hour courses you never finish",
                  "10 YouTube videos that all contradict each other",
                  "$997 for a PDF and a Facebook group",
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

            <div
              className="rounded-2xl p-7 border"
              style={{ background: "rgba(99,102,241,0.04)", borderColor: "rgba(99,102,241,0.2)" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.1em] mb-5" style={{ color: "#6366f1" }}>First Sale Lab</p>
              <div className="space-y-4">
                {[
                  "12 focused modules, 20–45 min each",
                  "One concrete task per module — then you unlock the next",
                  "Modules 1–6 free. Pro unlocks the full roadmap.",
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

      {/* ── CURRICULUM ── */}
      <section className="px-8 py-20" style={{ background: "#f7f7fb" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: "#6366f1" }}>The curriculum</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ letterSpacing: "-0.025em" }}>
              12 modules. One clear path.
            </h2>
            <p className="text-base text-gray-500">
              Every module builds on the last. Complete a task, unlock the next step.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {MODULES.map((mod) => (
              <HoverCard
                key={mod.id}
                className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))" }}
                >
                  {mod.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 mb-0.5">Module {mod.id}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate" style={{ letterSpacing: "-0.01em" }}>{mod.title}</p>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}
                >
                  {mod.duration}
                </span>
              </HoverCard>
            ))}
          </div>

          <div className="text-center">
            <GlowButton href="/quiz">Start for free → it takes 2 minutes</GlowButton>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — timeline ── */}
      <section className="bg-white px-8 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: "#6366f1" }}>How it works</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ letterSpacing: "-0.025em" }}>
              From confused to confident.
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">No passive learning. No overwhelm. Just momentum.</p>
          </div>

          <div className="relative">
            <div
              className="absolute left-6 top-8 bottom-8 w-px"
              style={{ background: "linear-gradient(to bottom, rgba(99,102,241,0.4), rgba(139,92,246,0.2))" }}
            />
            <div className="space-y-10">
              {[
                { n: "01", emoji: "🧭", title: "You get a plan built around you", body: "Answer 5 quick questions. In 2 minutes you have a personalised roadmap — not a generic syllabus. Your experience, goal, and budget all shape it." },
                { n: "02", emoji: "⚡", title: "You take real action — not just notes", body: "Each module ends with a concrete task and a checklist. You don't move forward until you've done something. No passive watching." },
                { n: "03", emoji: "💰", title: "You make your first sale — for real", body: "By Module 11, your store is live, your ad is running, and your first sale is within reach. The next step is always obvious." },
              ].map((step) => (
                <div key={step.n} className="flex gap-8 relative">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl z-10"
                    style={{ background: "white", border: "2px solid rgba(99,102,241,0.2)", boxShadow: "0 2px 12px rgba(99,102,241,0.1)" }}
                  >
                    {step.emoji}
                  </div>
                  <div className="pb-2">
                    <span className="text-xs font-bold tracking-[0.1em] uppercase mb-2 block" style={{ color: "#6366f1" }}>Step {step.n}</span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ letterSpacing: "-0.01em" }}>{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU'LL WALK AWAY WITH ── */}
      <section className="px-8 py-20" style={{ background: "#f7f7fb" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: "#6366f1" }}>What you&apos;ll build</p>
            <h2 className="text-4xl font-bold text-gray-900" style={{ letterSpacing: "-0.025em" }}>
              Real skills. Real assets.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🛍️", title: "A live Shopify store", body: "Set up correctly from day one — with trust signals, a hero product, and a clean checkout." },
              { icon: "🎯", title: "A validated winning product", body: "Using the 3× margin rule to pick something that can actually make you money." },
              { icon: "📣", title: "Your first ad campaign", body: "A real Meta or TikTok campaign with a budget you control and metrics you understand." },
              { icon: "📧", title: "An email list you own", body: "A direct line to your audience that no algorithm can take away from you." },
              { icon: "💡", title: "A sales funnel", body: "A focused landing page + upsell flow designed to convert cold traffic into buyers." },
              { icon: "🚀", title: "A scalable business model", body: "Not just a first sale — a repeatable system you can grow month over month." },
            ].map(item => (
              <HoverCard
                key={item.title}
                className="bg-white rounded-2xl border border-gray-100 p-6"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))" }}
                >
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2" style={{ letterSpacing: "-0.01em" }}>{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-white px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: "#6366f1" }}>From the community</p>
            <h2 className="text-4xl font-bold text-gray-900" style={{ letterSpacing: "-0.025em" }}>People are already selling.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                quote: "I'd been watching YouTube videos about dropshipping for 6 months and never launched anything. First Sale Lab made me actually do it — my store went live in week 2.",
                name: "Marcus T.",
                role: "Completed Module 5",
                emoji: "🇺🇸",
              },
              {
                quote: "The quiz at the start was a game changer. Instead of starting from scratch I jumped straight to Module 3 because that's where I actually was. Made my first sale by Module 11.",
                name: "Aisha K.",
                role: "Course graduate",
                emoji: "🇬🇧",
              },
              {
                quote: "Every other free resource felt like a teaser for something you had to pay for. This is genuinely complete. The ad module alone saved me from wasting $500 on a bad campaign.",
                name: "Luca M.",
                role: "Completed Module 8",
                emoji: "🇩🇪",
              },
            ].map((t) => (
              <HoverCard
                key={t.name}
                className="rounded-2xl p-6 border border-gray-100 bg-white flex flex-col"
              >
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: "#f59e0b", fontSize: 13 }}>★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid #f4f4f5" }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))" }}
                  >
                    {t.emoji}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREE VS PRO COMPARISON ── */}
      <section className="px-8 py-20" style={{ background: "#f7f7fb" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: "#6366f1" }}>Free vs Pro</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ letterSpacing: "-0.025em" }}>
              Start free. Upgrade when you&apos;re ready.
            </h2>
            <p className="text-base text-gray-500">
              No pressure. Modules 1–6 are yours forever. Pro adds the tools that turn learners into sellers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

            {/* FREE column */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8">
              <p className="text-xs font-bold tracking-[0.1em] uppercase text-gray-400 mb-1">Free</p>
              <p className="text-3xl font-extrabold text-gray-900 mb-1" style={{ letterSpacing: "-0.04em" }}>$0</p>
              <p className="text-sm text-gray-400 mb-8">No credit card. Ever.</p>
              <div className="space-y-4 mb-8">
                {[
                  "Module 1–6 — full beginner foundation",
                  "Niche research + winning product formula",
                  "Customer avatar framework",
                  "Shopify store setup walkthrough",
                  "Your first sales funnel",
                  "Progress tracking & daily streaks",
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="text-sm font-bold mt-0.5 flex-shrink-0" style={{ color: "#22c55e" }}>✓</span>
                    <p className="text-sm text-gray-600 leading-relaxed">{item}</p>
                  </div>
                ))}
                {[
                  "Modules 7–12 (traffic, ads, scaling)",
                  "Weekly winning product picks",
                  "Monthly ad strategy updates",
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="text-sm font-bold mt-0.5 flex-shrink-0 text-gray-300">✕</span>
                    <p className="text-sm text-gray-300 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/quiz"
                className="block w-full text-center text-sm font-bold py-3.5 rounded-xl"
                style={{ border: "1.5px solid #e5e7eb", color: "#374151", background: "#f9fafb" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.borderColor = "#d1d5db"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
              >
                Start for free →
              </Link>
            </div>

            {/* PRO column */}
            <div
              className="rounded-3xl p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)", border: "1.5px solid rgba(139,92,246,0.4)" }}
            >
              {/* Glow */}
              <div className="absolute pointer-events-none" style={{ top: "-40%", left: "50%", transform: "translateX(-50%)", width: "400px", height: "300px", background: "radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, transparent 70%)" }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold tracking-[0.1em] uppercase" style={{ color: "rgba(196,181,253,0.7)" }}>Pro</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(250,204,21,0.15)", color: "#fde68a", border: "1px solid rgba(250,204,21,0.25)" }}>Most popular</span>
                </div>
                <p className="text-3xl font-extrabold text-white mb-1" style={{ letterSpacing: "-0.04em" }}>$19<span className="text-base font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>/month</span></p>
                <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>Cancel anytime. No questions asked.</p>

                <div className="space-y-4 mb-8">
                  {/* Standard items */}
                  {[
                    "Everything in Free",
                    "Modules 7–12 — traffic, ads, conversions & scaling",
                    "TikTok organic growth playbook",
                    "Step-by-step paid ads launch guide",
                    "Email list building from scratch",
                    "Ad-free experience",
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="text-sm font-bold mt-0.5 flex-shrink-0" style={{ color: "#a78bfa" }}>✓</span>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{item}</p>
                    </div>
                  ))}

                  {/* Divider */}
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "8px 0" }} />

                  {/* Weekly picks — hero feature */}
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.35)" }}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">📦</span>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">This week&apos;s winning products</p>
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                          Every Monday: 5 AI-researched trending products with AliExpress cost, sell price, margin %, target audience, and a ready-to-use ad hook.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Monthly briefing — hero feature */}
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.35)" }}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">📋</span>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">
                          {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} Ad Strategy Update
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                          Every 1st of the month: what&apos;s actually working on Meta &amp; TikTok right now, the trending niche to watch, one tactic to add and one to drop — straight to your inbox.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/quiz"
                  className="block w-full text-center text-sm font-extrabold py-4 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)", color: "#1c1917", letterSpacing: "-0.01em" }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.92"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  Get started — upgrade after Module 6 →
                </Link>
                <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>Start free today · Pro unlocks after you&apos;ve built the foundation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="px-8 py-16" style={{ background: "#f7f7fb" }}>
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: "12",   label: "Focused modules",          sub: "20–45 min each",         color: "#4f46e5" },
            { n: "Free", label: "To get started",           sub: "Modules 1–6 included",    color: "#7c3aed" },
            { n: "3×",   label: "Minimum margin rule",      sub: "Built into Module 3",     color: "#a855f7" },
            { n: "1st",  label: "Sale is your only goal",   sub: "Not theory — reality",    color: "#6366f1" },
          ].map((s) => (
            <div key={s.n} className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="text-4xl font-extrabold mb-1" style={{ color: s.color, letterSpacing: "-0.04em" }}>{s.n}</p>
              <p className="text-xs font-bold text-gray-800 mb-1">{s.label}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white px-8 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: "#6366f1" }}>FAQ</p>
            <h2 className="text-4xl font-bold text-gray-900" style={{ letterSpacing: "-0.025em" }}>Common questions.</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "Is this actually free?",
                a: "Modules 1–6 are completely free — no credit card, no trial. Modules 7–12 are part of First Sale Lab Pro at $19/month, which covers traffic, ads, conversions, and scaling. Pro members also get weekly winning product picks every Monday and a monthly ad strategy update. You can complete the full beginner foundation before deciding if Pro is right for you.",
              },
              {
                q: "Do I need experience or money to start?",
                a: "No experience needed at all — that's the point. For budget, you can start learning and building for $0.",
              },
              {
                q: "How long does the full course take?",
                a: "Each module is 20–45 minutes of focused content plus your real-world task. Most people complete the full 12 modules in 3–6 weeks, doing one or two modules per week alongside a job or studies.",
              },
              {
                q: "What's the difference between this and a YouTube playlist?",
                a: "Structure and accountability. YouTube gives you information. First Sale Lab gives you a sequence — each module builds on the last, you can't skip ahead without completing the task, and you always know exactly what to do next.",
              },
              {
                q: "What platform do you teach? Shopify, Etsy, Amazon?",
                a: "We focus on Shopify + your own traffic (TikTok organic and Meta ads). This gives you the most control and the best margins. You own your store, your audience, and your brand.",
              },
              {
                q: "What if I get stuck on a module?",
                a: "Each module has a clear checklist of exactly what to do. If you're stuck, re-read the action steps — they're written to be as specific as possible. We're also building a community space for questions.",
              },
            ].map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-8 py-20" style={{ background: "#f7f7fb" }}>
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
              <h2 className="text-4xl font-extrabold text-white mb-4" style={{ letterSpacing: "-0.03em" }}>
                Ready to build your plan?
              </h2>
              <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
                Answer 5 questions · Get your personalised roadmap · Start Module 1 today
              </p>
              <GlowButton href="/quiz">Build my free ecommerce plan →</GlowButton>
              <p className="mt-5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                No credit card · Modules 1–6 free · Pro from $19/mo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-100 px-8 py-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="First Sale Lab" style={{ height: 28, width: "auto" }} />
            <span className="text-sm font-bold text-gray-900" style={{ letterSpacing: "-0.3px" }}>First Sale Lab</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 · Built for complete beginners</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-700">Privacy</Link>
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-700">Terms</Link>
            <Link href="/login" className="text-xs text-gray-400 hover:text-gray-700">Log in</Link>
            <Link href="/quiz" className="text-xs font-semibold" style={{ color: "#6366f1" }}>Get started →</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
