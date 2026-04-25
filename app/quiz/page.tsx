"use client";

import { useState, useRef } from "react";
import Link from "next/link";

/* ── Tokens ── */
const HERO_BG  = "linear-gradient(135deg, #08080f 0%, #0f0a2e 55%, #150a2e 100%)";
const GRAD_BTN = "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)";
const GLOW_BASE = "0 0 0 1px rgba(99,102,241,0.35), 0 4px 24px rgba(99,102,241,0.35), 0 8px 40px rgba(139,92,246,0.15)";
const GLOW_HOV  = "0 0 0 1px rgba(99,102,241,0.55), 0 8px 40px rgba(99,102,241,0.5), 0 16px 60px rgba(139,92,246,0.25)";

type Answers = { experience: string; goal: string; time: string; budget: string; productIdea: string };

const questions = [
  {
    key: "experience" as keyof Answers,
    emoji: "🌱",
    question: "Where are you starting from?",
    microcopy: "No wrong answer — your plan adapts to where you are.",
    options: [
      { label: "Complete beginner — I've never sold anything online", value: "beginner" },
      { label: "I've tried before but haven't made consistent sales yet", value: "intermediate" },
      { label: "I already have a store — I want to optimize and grow", value: "advanced" },
    ],
  },
  {
    key: "goal" as keyof Answers,
    emoji: "🏆",
    question: "What would make this worth it for you?",
    microcopy: "This shapes which modules we prioritize for you.",
    options: [
      { label: "Making my first ever sale — proving to myself it's possible", value: "first_sale" },
      { label: "Earning a reliable €500–2,000/month on the side", value: "side_income" },
      { label: "Replacing my job income — full financial freedom", value: "full_time" },
      { label: "Understanding how ecommerce works — knowledge first", value: "learn" },
    ],
  },
  {
    key: "time" as keyof Answers,
    emoji: "⏰",
    question: "How much time can you realistically dedicate each week?",
    microcopy: "There's no wrong answer — your plan adapts to your schedule.",
    options: [
      { label: "1–5 hours — I have a busy life and that's okay", value: "low" },
      { label: "5–10 hours — a few focused evenings per week", value: "medium" },
      { label: "10–20 hours — I'm treating this seriously", value: "high" },
      { label: "20+ hours — this is my main priority right now", value: "full" },
    ],
  },
  {
    key: "budget" as keyof Answers,
    emoji: "💶",
    question: "What budget are you working with to start?",
    microcopy: "We'll show you how to get the most out of whatever you have.",
    options: [
      { label: "Under €100 — I need to start as lean as possible", value: "minimal" },
      { label: "€100–500 — I have a small budget to invest", value: "small" },
      { label: "€500–2,000 — I'm ready to invest to move faster", value: "medium" },
      { label: "€2,000+ — I want to scale quickly", value: "large" },
    ],
  },
  {
    key: "productIdea" as keyof Answers,
    emoji: "🛍️",
    question: "Do you have a product or niche idea yet?",
    microcopy: "Most beginners don't — that's what Modules 2 and 3 are for.",
    options: [
      { label: "Not at all — I need help finding one from scratch", value: "no_idea" },
      { label: "I have a rough idea, but haven't validated it yet", value: "rough_idea" },
      { label: "Yes — I know what I want to sell and who to sell it to", value: "ready" },
    ],
  },
];

function computeResult(a: Answers) {
  if (a.experience === "advanced") return { track: "Optimization Track", emoji: "📈", tagline: "Skip the basics. Scale what works.", description: "You already have experience — let's focus on funnels, conversion, and scaling your ads. Jump straight to the growth modules.", startModule: 6 };
  if (a.experience === "intermediate" && a.productIdea === "ready") return { track: "Fast-Track Builder", emoji: "⚡", tagline: "You have the idea. Let's execute.", description: "You have a product idea and some experience. Let's validate it, build your funnel, and get consistent traffic. You can move faster than most.", startModule: 3 };
  if (a.goal === "learn") return { track: "Explorer Track", emoji: "🔍", tagline: "Learn at your own pace. No pressure.", description: "You're here to understand how ecommerce works first — perfect. Go through every module at your own pace.", startModule: 1 };
  return { track: "Beginner Fast-Start", emoji: "🚀", tagline: "From zero to first sale — step by step.", description: "You're starting from scratch — perfectly fine. We'll guide you through every step, from picking a product to making your first real sale.", startModule: 1 };
}

const goalLabels: Record<string, string>       = { first_sale: "First ever sale", side_income: "€500–2k/month side income", full_time: "Replace full-time income", learn: "Learn how ecommerce works" };
const timeLabels: Record<string, string>        = { low: "1–5 hrs/week", medium: "5–10 hrs/week", high: "10–20 hrs/week", full: "20+ hrs/week" };
const budgetLabels: Record<string, string>      = { minimal: "Under €100", small: "€100–500", medium: "€500–2,000", large: "€2,000+" };
const experienceLabels: Record<string, string>  = { beginner: "Complete beginner", intermediate: "Some experience", advanced: "Already have a store" };
const ideaLabels: Record<string, string>        = { no_idea: "No idea yet", rough_idea: "Rough idea", ready: "Ready to go" };

type Screen = "intro" | "quiz" | "result";

/* ── Segmented progress dots ── */
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: "6px",
            borderRadius: "3px",
            background: i < current ? "#6366f1" : i === current ? GRAD_BTN : "rgba(0,0,0,0.1)",
            width: i === current ? "28px" : "8px",
            transition: "all 300ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      ))}
    </div>
  );
}

/* ── Option card ── */
function OptionCard({
  label, value, selected, onSelect,
}: { label: string; value: string; selected: boolean; onSelect: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);

  const baseStyle = {
    background: selected ? "rgba(99,102,241,0.05)" : "white",
    border: selected ? "2px solid #6366f1" : "1.5px solid rgba(0,0,0,0.08)",
    boxShadow: selected ? "0 0 0 3px rgba(99,102,241,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
    transform: selected ? "scale(1.01)" : "scale(1)",
    transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
    width: "100%",
    textAlign: "left" as const,
    padding: "14px 16px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  };

  return (
    <button
      ref={ref}
      onClick={onSelect}
      style={baseStyle}
      onMouseEnter={() => { if (!selected && ref.current) { ref.current.style.background = "rgba(0,0,0,0.02)"; ref.current.style.borderColor = "rgba(0,0,0,0.15)"; } }}
      onMouseLeave={() => { if (!selected && ref.current) { ref.current.style.background = "white"; ref.current.style.borderColor = "rgba(0,0,0,0.08)"; } }}
    >
      {/* Radio */}
      <div style={{
        width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
        border: selected ? "2px solid #6366f1" : "2px solid rgba(0,0,0,0.15)",
        background: selected ? "#6366f1" : "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 200ms",
      }}>
        {selected && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />}
      </div>
      <span style={{ fontSize: "14px", fontWeight: selected ? 600 : 400, color: selected ? "#4338ca" : "#374151", lineHeight: "1.4" }}>
        {label}
      </span>
    </button>
  );
}

export default function QuizPage() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [showError, setShowError] = useState(false);

  const question  = questions[current];
  const finalAnswers = answers as Answers;
  const result    = screen === "result" ? computeResult(finalAnswers) : null;

  function handleNext() {
    if (!selected) { setShowError(true); return; }
    setShowError(false);

    const newAnswers = { ...answers, [question.key]: selected };
    setAnswers(newAnswers);

    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      if (current < questions.length - 1) {
        setCurrent(c => c + 1);
        setSelected(null);
      } else {
        const r = computeResult(newAnswers as Answers);
        localStorage.setItem("quiz_results", JSON.stringify({
          ...newAnswers, track: r.track, startModule: r.startModule,
        }));
        setScreen("result");
      }
    }, 220);
  }

  /* ── INTRO ── */
  if (screen === "intro") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 dot-grid relative" style={{ background: HERO_BG }}>
        <div className="absolute pointer-events-none" style={{ top: "-10%", left: "50%", transform: "translateX(-50%)", width: "700px", height: "500px", background: "radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />
        <div className="relative z-10 max-w-lg w-full text-center fade-up">
          <div className="text-6xl mb-6">🧭</div>
          <h1 className="text-4xl font-extrabold text-white mb-4" style={{ letterSpacing: "-0.035em", lineHeight: "1.1" }}>
            Let's build your personal<br />ecommerce roadmap.
          </h1>
          <p className="text-base mb-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Answer 5 quick questions and we'll create a plan matched to your goal, budget, and experience.
          </p>
          <p className="text-sm font-semibold mb-10" style={{ color: "#a78bfa" }}>No generic advice. Just your next step.</p>

          <button
            onClick={() => setScreen("quiz")}
            className="w-full font-semibold py-4 rounded-xl text-white text-sm mb-4"
            style={{ background: GRAD_BTN, boxShadow: GLOW_BASE, transition: "transform 200ms, box-shadow 200ms" }}
            onMouseEnter={e => { const t = e.currentTarget; t.style.transform = "translateY(-2px)"; t.style.boxShadow = GLOW_HOV; }}
            onMouseLeave={e => { const t = e.currentTarget; t.style.transform = "translateY(0)"; t.style.boxShadow = GLOW_BASE; }}
          >
            Start building my plan →
          </button>

          <p className="text-xs mb-8" style={{ color: "rgba(255,255,255,0.3)" }}>Takes 2 minutes · No account needed yet</p>
          <Link href="/" className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >← Back to home</Link>
        </div>
      </div>
    );
  }

  /* ── RESULT ── */
  if (screen === "result" && result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 dot-grid relative" style={{ background: HERO_BG }}>
        <div className="absolute pointer-events-none" style={{ top: 0, left: "50%", transform: "translateX(-50%)", width: "700px", height: "400px", background: "radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />
        <div className="relative z-10 max-w-md w-full fade-up">
          <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)" }}>
            {/* Gradient header */}
            <div className="px-8 pt-8 pb-6" style={{ background: GRAD_BTN }}>
              <div className="text-4xl mb-3">{result.emoji}</div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-[0.1em] mb-1">Your personalized track</p>
              <h2 className="text-2xl font-extrabold text-white" style={{ letterSpacing: "-0.02em" }}>{result.track}</h2>
              <p className="text-white/70 text-sm mt-1">{result.tagline}</p>
            </div>

            <div className="px-8 py-6 space-y-4">
              <p className="text-gray-500 text-sm leading-relaxed">{result.description}</p>

              {/* Summary */}
              <div className="rounded-2xl p-4 space-y-2.5" style={{ background: "#f7f7fb" }}>
                <p className="text-xs font-bold uppercase tracking-[0.1em] mb-3" style={{ color: "#6366f1" }}>Based on your answers</p>
                {[
                  { label: "Starting point",  value: experienceLabels[finalAnswers.experience] },
                  { label: "Goal",            value: goalLabels[finalAnswers.goal] },
                  { label: "Time available",  value: timeLabels[finalAnswers.time] },
                  { label: "Budget",          value: budgetLabels[finalAnswers.budget] },
                  { label: "Product idea",    value: ideaLabels[finalAnswers.productIdea] },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{row.label}</span>
                    <span className="text-xs font-semibold text-gray-800">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* First step */}
              <div className="rounded-xl p-4" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                <p className="text-xs font-bold uppercase tracking-[0.1em] mb-1" style={{ color: "#6366f1" }}>Your first step</p>
                <p className="text-sm font-semibold text-gray-900">
                  {result.startModule === 1 ? "🎮 Module 1: The Rules of the Game (~20 min)"
                   : result.startModule === 3 ? "🏆 Module 3: Find Your Winning Product (~30 min)"
                   : "⚡ Module 6: Build Your First Sales Funnel (~35 min)"}
                </p>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-1">
                <Link
                  href="/signup"
                  className="block w-full text-center text-white font-semibold py-3.5 rounded-xl text-sm"
                  style={{ background: GRAD_BTN, boxShadow: GLOW_BASE, transition: "transform 200ms, box-shadow 200ms" }}
                  onMouseEnter={e => { const t = e.currentTarget; t.style.transform = "translateY(-2px)"; t.style.boxShadow = GLOW_HOV; }}
                  onMouseLeave={e => { const t = e.currentTarget; t.style.transform = "translateY(0)"; t.style.boxShadow = GLOW_BASE; }}
                  onClick={() => {
                    try { localStorage.setItem("ea_next", `/modules/${result.startModule}`); } catch {}
                  }}
                >
                  Start Module {result.startModule} — create free account →
                </Link>
                <Link
                  href="/login"
                  className="block w-full text-center font-medium py-3.5 rounded-xl text-sm transition-colors"
                  style={{ background: "#f7f7fb", color: "#6b7280", border: "1px solid rgba(0,0,0,0.06)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f0f8")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#f7f7fb")}
                  onClick={() => {
                    try { localStorage.setItem("ea_next", `/modules/${result.startModule}`); } catch {}
                  }}
                >
                  I already have an account — log in
                </Link>
              </div>
              <p className="text-center text-xs text-gray-400 pt-1">Free forever · No credit card needed</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── QUIZ ── */
  return (
    <div className="min-h-screen flex flex-col dot-grid relative" style={{ background: HERO_BG }}>
      <div className="absolute pointer-events-none" style={{ top: 0, left: "50%", transform: "translateX(-50%)", width: "700px", height: "400px", background: "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)" }} />

      {/* Nav */}
      <nav className="relative z-10 px-6 py-5 flex items-center justify-between flex-shrink-0">
        <Link href="/" className="text-base font-bold text-white tracking-tight">First Sale Lab</Link>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {current + 1} / {questions.length}
        </span>
      </nav>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div
          className="w-full max-w-md bg-white rounded-3xl p-8"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)" }}
        >
          {/* Progress dots */}
          <ProgressDots total={questions.length} current={current} />

          {/* Question content — animated */}
          <div
            key={current}
            className={isExiting ? "slide-out" : "slide-in"}
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">{question.emoji}</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ letterSpacing: "-0.015em", lineHeight: "1.3" }}>
                {question.question}
              </h2>
              <p className="text-xs text-gray-400">{question.microcopy}</p>
            </div>

            <div className="space-y-2.5 mb-6">
              {question.options.map(opt => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                  selected={selected === opt.value}
                  onSelect={() => { setSelected(opt.value); setShowError(false); }}
                />
              ))}
            </div>

            {showError && (
              <p className="text-center text-xs text-red-500 mb-3">Please select an option to continue</p>
            )}

            <button
              onClick={handleNext}
              className="w-full font-semibold py-3.5 rounded-xl text-white text-sm"
              style={{
                background: selected ? GRAD_BTN : "rgba(0,0,0,0.08)",
                color: selected ? "white" : "#9ca3af",
                boxShadow: selected ? GLOW_BASE : "none",
                cursor: selected ? "pointer" : "not-allowed",
                transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={e => { if (selected) { const t = e.currentTarget; t.style.transform = "translateY(-2px)"; t.style.boxShadow = GLOW_HOV; } }}
              onMouseLeave={e => { const t = e.currentTarget; t.style.transform = "translateY(0)"; t.style.boxShadow = selected ? GLOW_BASE : "none"; }}
            >
              {current < questions.length - 1 ? "Next →" : "See my results →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
