"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ── Tokens ── */
const HERO_BG   = "linear-gradient(135deg, #08080f 0%, #0f0a2e 55%, #150a2e 100%)";
const GRAD_BTN  = "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)";
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
      { emoji: "🌱", label: "Complete beginner",        sub: "I've never sold anything online",              value: "beginner" },
      { emoji: "🔄", label: "Some experience",          sub: "I've tried but haven't made consistent sales", value: "intermediate" },
      { emoji: "🏪", label: "Already have a store",     sub: "I want to optimise and grow what I have",      value: "advanced" },
    ],
  },
  {
    key: "goal" as keyof Answers,
    emoji: "🏆",
    question: "What would make this worth it for you?",
    microcopy: "This shapes which modules we prioritise for you.",
    options: [
      { emoji: "🎯", label: "My first ever sale",       sub: "Proving to myself it's possible",              value: "first_sale" },
      { emoji: "💵", label: "$500–2,000/month",         sub: "A reliable side income alongside my job",      value: "side_income" },
      { emoji: "💼", label: "Replace my job income",    sub: "Full financial freedom — long term goal",      value: "full_time" },
      { emoji: "📚", label: "Learn how it works",       sub: "Knowledge first, business later",              value: "learn" },
    ],
  },
  {
    key: "time" as keyof Answers,
    emoji: "⏰",
    question: "How much time can you give each week?",
    microcopy: "Be honest — your plan will reflect your real schedule.",
    options: [
      { emoji: "⏱️", label: "1–5 hours",               sub: "Busy life — making it work around everything", value: "low" },
      { emoji: "🕐", label: "5–10 hours",               sub: "A few focused evenings per week",              value: "medium" },
      { emoji: "💪", label: "10–20 hours",              sub: "Treating this seriously",                      value: "high" },
      { emoji: "🔥", label: "20+ hours",                sub: "This is my main priority right now",           value: "full" },
    ],
  },
  {
    key: "budget" as keyof Answers,
    emoji: "💰",
    question: "What budget are you working with?",
    microcopy: "We'll show you how to get the most out of whatever you have.",
    options: [
      { emoji: "💡", label: "Under $100",               sub: "Starting as lean as possible",                 value: "minimal" },
      { emoji: "💰", label: "$100–500",                 sub: "A small budget to invest in tools and ads",    value: "small" },
      { emoji: "📈", label: "$500–2,000",               sub: "Ready to invest to move faster",               value: "medium" },
      { emoji: "🚀", label: "$2,000+",                  sub: "Want to scale quickly from the start",         value: "large" },
    ],
  },
  {
    key: "productIdea" as keyof Answers,
    emoji: "🛍️",
    question: "Do you have a product or niche in mind?",
    microcopy: "Most beginners don't — that's what Modules 2 and 3 are for.",
    options: [
      { emoji: "❓", label: "No idea yet",              sub: "I need help finding one from scratch",         value: "no_idea" },
      { emoji: "💭", label: "Rough idea",               sub: "I have something in mind but haven't validated it", value: "rough_idea" },
      { emoji: "✅", label: "Ready to go",              sub: "I know what I want to sell and who to sell to", value: "ready" },
    ],
  },
];

function computeResult(a: Answers) {
  if (a.experience === "advanced")
    return { track: "Optimization Track", emoji: "📈", tagline: "Skip the basics. Scale what works.", description: "You already have a store — let's focus on funnels, conversion optimisation, and scaling your ads. Jump straight to the growth modules.", startModule: 6 };
  if (a.experience === "intermediate" && a.productIdea === "ready")
    return { track: "Fast-Track Builder", emoji: "⚡", tagline: "You have the idea. Let's execute.", description: "You have experience and a product idea. Let's validate it fast, build your funnel, and get consistent traffic. You can skip ahead of most beginners.", startModule: 3 };
  if (a.goal === "learn")
    return { track: "Explorer Track", emoji: "🔍", tagline: "Learn at your own pace. No pressure.", description: "You're here to understand how ecommerce works first — smart move. Go through every module at your own pace with no pressure to launch yet.", startModule: 1 };
  return { track: "Beginner Fast-Start", emoji: "🚀", tagline: "From zero to first sale — step by step.", description: "You're starting from scratch — and that's perfectly fine. We'll guide you through every step, from picking a product to making your first real sale.", startModule: 1 };
}

const goalLabels: Record<string, string>      = { first_sale: "First ever sale", side_income: "$500–2k/month", full_time: "Replace job income", learn: "Learn how it works" };
const timeLabels: Record<string, string>       = { low: "1–5 hrs/week", medium: "5–10 hrs/week", high: "10–20 hrs/week", full: "20+ hrs/week" };
const budgetLabels: Record<string, string>     = { minimal: "Under $100", small: "$100–500", medium: "$500–2,000", large: "$2,000+" };
const experienceLabels: Record<string, string> = { beginner: "Complete beginner", intermediate: "Some experience", advanced: "Already have a store" };
const ideaLabels: Record<string, string>       = { no_idea: "No idea yet", rough_idea: "Rough idea", ready: "Ready to go" };

type Screen = "intro" | "quiz" | "result";

export default function QuizPage() {
  const [screen,    setScreen]    = useState<Screen>("intro");
  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState<Partial<Answers>>({});
  const [selected,  setSelected]  = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);

  const question     = questions[current];
  const finalAnswers = answers as Answers;
  const result       = screen === "result" ? computeResult(finalAnswers) : null;
  const progress     = ((current) / questions.length) * 100;

  /* ── advance to next question ── */
  const advance = useCallback((newAnswers: Partial<Answers>) => {
    setAnimating(true);
    setDirection("forward");
    setTimeout(() => {
      setAnimating(false);
      if (current < questions.length - 1) {
        setCurrent(c => c + 1);
        setSelected(newAnswers[questions[current + 1]?.key] ?? null);
      } else {
        const r = computeResult(newAnswers as Answers);
        try {
          localStorage.setItem("quiz_results", JSON.stringify({
            ...newAnswers, track: r.track, startModule: r.startModule,
          }));
        } catch {}
        setScreen("result");
      }
    }, 260);
  }, [current]);

  /* ── select an option and auto-advance ── */
  function handleSelect(value: string) {
    if (animating) return;
    setSelected(value);
    const newAnswers = { ...answers, [question.key]: value };
    setAnswers(newAnswers);
    // Auto-advance after brief delay so user sees their selection
    setTimeout(() => advance(newAnswers), 380);
  }

  /* ── go back ── */
  function handleBack() {
    if (animating || current === 0) return;
    setAnimating(true);
    setDirection("back");
    setTimeout(() => {
      setAnimating(false);
      setCurrent(c => c - 1);
      setSelected(answers[questions[current - 1].key] ?? null);
    }, 260);
  }

  /* ── keyboard support ── */
  useEffect(() => {
    if (screen !== "quiz" || animating) return;
    function onKey(e: KeyboardEvent) {
      const n = parseInt(e.key);
      if (n >= 1 && n <= question.options.length) {
        handleSelect(question.options[n - 1].value);
      }
      if (e.key === "Backspace" && current > 0) handleBack();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, current, animating, question]);

  /* ── INTRO ── */
  if (screen === "intro") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 dot-grid relative" style={{ background: HERO_BG }}>
        <div className="absolute pointer-events-none" style={{ top: "-10%", left: "50%", transform: "translateX(-50%)", width: "700px", height: "500px", background: "radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 px-6 py-5 flex items-center justify-between z-20">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <img src="/logo.png" alt="First Sale Lab" style={{ height: 36, width: "auto" }} />
            <span className="text-sm font-bold text-white" style={{ letterSpacing: "-0.3px" }}>First Sale Lab</span>
          </Link>
          <Link href="/login" className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >Already have an account? Log in</Link>
        </div>

        <div className="relative z-10 max-w-lg w-full text-center fade-up">
          <div className="text-6xl mb-6">🧭</div>
          <h1 className="text-4xl font-extrabold text-white mb-4" style={{ letterSpacing: "-0.035em", lineHeight: "1.1" }}>
            Let&apos;s build your personal<br />ecommerce roadmap.
          </h1>
          <p className="text-base mb-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Answer 5 quick questions and get a plan matched to your goal, budget, and experience level.
          </p>
          <p className="text-sm font-semibold mb-10" style={{ color: "#a78bfa" }}>No generic advice. Just your next step.</p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 mb-10">
            {[
              { n: "5", label: "questions" },
              { n: "2 min", label: "to complete" },
              { n: "Free", label: "forever" },
            ].map(s => (
              <div key={s.n} className="text-center">
                <p className="text-xl font-extrabold text-white" style={{ letterSpacing: "-0.04em" }}>{s.n}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setScreen("quiz")}
            className="w-full font-semibold py-4 rounded-xl text-white text-sm mb-4"
            style={{ background: GRAD_BTN, boxShadow: GLOW_BASE, transition: "transform 200ms, box-shadow 200ms" }}
            onMouseEnter={e => { const t = e.currentTarget; t.style.transform = "translateY(-2px)"; t.style.boxShadow = GLOW_HOV; }}
            onMouseLeave={e => { const t = e.currentTarget; t.style.transform = "translateY(0)"; t.style.boxShadow = GLOW_BASE; }}
          >
            Build my free plan →
          </button>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>No account needed yet · Takes 2 minutes</p>
        </div>
      </div>
    );
  }

  /* ── RESULT ── */
  if (screen === "result" && result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 dot-grid relative" style={{ background: HERO_BG }}>
        <div className="absolute pointer-events-none" style={{ top: 0, left: "50%", transform: "translateX(-50%)", width: "700px", height: "400px", background: "radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-md w-full fade-up">
          {/* Card */}
          <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.2)" }}>

            {/* Header */}
            <div className="px-8 pt-8 pb-7 relative overflow-hidden" style={{ background: GRAD_BTN }}>
              <div className="absolute inset-0 dot-grid opacity-20" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">{result.emoji}</div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.12em] mb-1">Your personalised track</p>
                <h2 className="text-2xl font-extrabold text-white mb-1" style={{ letterSpacing: "-0.02em" }}>{result.track}</h2>
                <p className="text-white/70 text-sm italic">&ldquo;{result.tagline}&rdquo;</p>
              </div>
            </div>

            <div className="px-8 py-6 space-y-5">
              <p className="text-gray-500 text-sm leading-relaxed">{result.description}</p>

              {/* Your answers summary */}
              <div className="rounded-2xl p-5 space-y-3" style={{ background: "#f7f7fb" }}>
                <p className="text-xs font-bold uppercase tracking-[0.1em] mb-1" style={{ color: "#6366f1" }}>Your profile</p>
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
              <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(99,102,241,0.06)", border: "1.5px solid rgba(99,102,241,0.15)" }}>
                <span className="text-2xl flex-shrink-0">
                  {result.startModule === 1 ? "🎮" : result.startModule === 3 ? "🏆" : "⚡"}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] mb-0.5" style={{ color: "#6366f1" }}>Your starting module</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {result.startModule === 1 ? "Module 1: The Rules of the Game"
                     : result.startModule === 3 ? "Module 3: Find Your Winning Product"
                     : "Module 6: Build Your First Sales Funnel"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {result.startModule === 1 ? "~20 min" : result.startModule === 3 ? "~30 min" : "~35 min"}
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5">
                <Link
                  href="/signup"
                  className="block w-full text-center text-white font-semibold py-4 rounded-xl text-sm"
                  style={{ background: GRAD_BTN, boxShadow: GLOW_BASE, transition: "transform 200ms, box-shadow 200ms" }}
                  onMouseEnter={e => { const t = e.currentTarget; t.style.transform = "translateY(-2px)"; t.style.boxShadow = GLOW_HOV; }}
                  onMouseLeave={e => { const t = e.currentTarget; t.style.transform = "translateY(0)"; t.style.boxShadow = GLOW_BASE; }}
                  onClick={() => {
                    try { localStorage.setItem("ea_next", `/modules/${result.startModule}`); } catch {}
                  }}
                >
                  Create free account → Start Module {result.startModule}
                </Link>
                <Link
                  href="/login"
                  className="block w-full text-center font-medium py-3.5 rounded-xl text-sm"
                  style={{ background: "#f7f7fb", color: "#6b7280", border: "1px solid rgba(0,0,0,0.06)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#efeffa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#f7f7fb")}
                  onClick={() => {
                    try { localStorage.setItem("ea_next", `/modules/${result.startModule}`); } catch {}
                  }}
                >
                  Already have an account? Log in
                </Link>
              </div>
              <p className="text-center text-xs text-gray-400">Free to start · No credit card needed</p>
            </div>
          </div>

          {/* Redo */}
          <div className="text-center mt-5">
            <button
              onClick={() => { setScreen("quiz"); setCurrent(0); setAnswers({}); setSelected(null); }}
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >
              ← Redo the quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── QUIZ ── */
  const slideClass = animating
    ? (direction === "forward" ? "slide-out" : "slide-out-right")
    : (direction === "forward" ? "slide-in" : "slide-in-left");

  return (
    <div className="min-h-screen flex flex-col dot-grid relative" style={{ background: HERO_BG }}>
      <div className="absolute pointer-events-none" style={{ top: 0, left: "50%", transform: "translateX(-50%)", width: "700px", height: "400px", background: "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)" }} />

      {/* Nav */}
      <nav className="relative z-10 px-6 py-5 flex items-center justify-between flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.png" alt="First Sale Lab" style={{ height: 36, width: "auto" }} />
          <span className="text-sm font-bold text-white" style={{ letterSpacing: "-0.3px" }}>First Sale Lab</span>
        </Link>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {current + 1} of {questions.length}
        </span>
      </nav>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-6 pb-10 relative z-10">
        <div className="w-full max-w-md">

          {/* Progress bar (outside card, above it) */}
          <div className="mb-4 px-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                Question {current + 1}
              </span>
              <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                {Math.round(((current) / questions.length) * 100)}% done
              </span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-1.5 rounded-full"
                style={{ background: GRAD_BTN, width: `${progress}%`, transition: "width 400ms cubic-bezier(0.16,1,0.3,1)" }}
              />
            </div>
          </div>

          <div
            className="bg-white rounded-3xl p-7"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)" }}
          >
            {/* Animated question */}
            <div key={current} className={slideClass}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{question.emoji}</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ letterSpacing: "-0.015em", lineHeight: "1.3" }}>
                  {question.question}
                </h2>
                <p className="text-xs text-gray-400">{question.microcopy}</p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 mb-2">
                {question.options.map((opt, idx) => {
                  const isSelected = selected === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      disabled={animating}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "13px 14px",
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: animating ? "default" : "pointer",
                        background: isSelected ? "rgba(99,102,241,0.06)" : "white",
                        border: isSelected ? "2px solid #6366f1" : "1.5px solid rgba(0,0,0,0.08)",
                        boxShadow: isSelected ? "0 0 0 3px rgba(99,102,241,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
                        transform: isSelected ? "scale(1.01)" : "scale(1)",
                        transition: "all 180ms cubic-bezier(0.16,1,0.3,1)",
                      }}
                      onMouseEnter={e => { if (!isSelected && !animating) { e.currentTarget.style.background = "rgba(0,0,0,0.02)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)"; } }}
                      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; } }}
                    >
                      {/* Keyboard hint + emoji */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-xs font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: isSelected ? "#6366f1" : "rgba(0,0,0,0.06)", color: isSelected ? "white" : "#9ca3af", transition: "all 180ms" }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-lg">{opt.emoji}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight" style={{ color: isSelected ? "#4338ca" : "#111827" }}>{opt.label}</p>
                        <p className="text-xs mt-0.5 leading-tight" style={{ color: isSelected ? "#6366f1" : "#9ca3af" }}>{opt.sub}</p>
                      </div>

                      {/* Checkmark */}
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isSelected ? "#6366f1" : "transparent",
                          border: isSelected ? "none" : "1.5px solid rgba(0,0,0,0.12)",
                          transition: "all 180ms",
                        }}
                      >
                        {isSelected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Back button */}
            {current > 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleBack}
                  disabled={animating}
                  className="text-xs font-medium"
                  style={{ color: "#9ca3af" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#6366f1")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Keyboard hint */}
            <p className="text-center text-xs mt-3" style={{ color: "rgba(0,0,0,0.2)" }}>
              Press <kbd style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: 4 }}>1</kbd>–<kbd style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: 4 }}>{question.options.length}</kbd> to select
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
