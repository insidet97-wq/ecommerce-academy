"use client";

import { useState } from "react";
import Link from "next/link";

type Niche = {
  name: string;
  why_fits_you: string;
  ideal_customer: string;
  example_products: string[];
  starter_budget: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  growth_signal: string;
};

const BUDGET_OPTIONS    = ["Under $200", "$200–500", "$500–1000", "$1000+"];
const EXP_OPTIONS       = ["Complete beginner", "Some experience", "Experienced"];
const AUDIENCE_OPTIONS  = ["Gen Z (under 25)", "Millennials", "Parents", "Professionals", "Mixed"];

const DIFF_COLORS: Record<Niche["difficulty"], { bg: string; fg: string; border: string }> = {
  Beginner:     { bg: "#ecfdf5", fg: "#065f46", border: "#a7f3d0" },
  Intermediate: { bg: "#fffbeb", fg: "#92400e", border: "#fde68a" },
  Advanced:     { bg: "#fff1f2", fg: "#9f1239", border: "#fecdd3" },
};

export default function NichePickerPage() {
  const [step,        setStep]        = useState<"form" | "loading" | "results" | "error" | "rate_limited">("form");
  const [interests,   setInterests]   = useState("");
  const [budget,      setBudget]      = useState(BUDGET_OPTIONS[1]);
  const [experience,  setExperience]  = useState(EXP_OPTIONS[0]);
  const [audience,    setAudience]    = useState(AUDIENCE_OPTIONS[4]);
  const [email,       setEmail]       = useState("");
  const [niches,      setNiches]      = useState<Niche[]>([]);
  const [errorMsg,    setErrorMsg]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!interests.trim() || !email.includes("@")) return;

    setStep("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/niche-picker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          input: { interests: interests.trim(), budget, experience, audience },
        }),
      });
      const data = await res.json();
      if (res.status === 429 || data.rateLimited) {
        setErrorMsg(data.error ?? "Slow down — try again later.");
        setStep("rate_limited");
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setNiches(data.niches ?? []);
      setStep("results");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStep("error");
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <img src="/logo.png" alt="First Sale Lab" decoding="async" style={{ height: 36, width: "auto" }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.4px" }}>First Sale Lab</span>
          </Link>
          <Link href="/quiz" style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
            onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
          >Take the full course →</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)", padding: "56px 24px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.4) 0%, transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fde68a", marginBottom: 14, background: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.3)", padding: "5px 14px", borderRadius: 99 }}>
            🎯 Free Tool
          </span>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.8px", marginBottom: 14, lineHeight: 1.1, maxWidth: 600, margin: "0 auto 14px" }}>
            What ecommerce niche should you pick?
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            Answer 4 quick questions — our AI will suggest 3 niches matched to your interests, budget, and experience. Free, no signup required.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 80px" }}>

        {step === "form" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Interests */}
            <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(0,0,0,0.06)", padding: "22px 24px" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>
                What are you into?
              </label>
              <p style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 12 }}>
                3–5 words. Hobbies, passions, things you actually use or care about.
              </p>
              <input
                type="text"
                value={interests}
                onChange={e => setInterests(e.target.value)}
                placeholder="e.g. fitness, dogs, productivity"
                maxLength={200}
                required
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#09090b", outline: "none", boxSizing: "border-box" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </div>

            {/* Budget */}
            <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(0,0,0,0.06)", padding: "22px 24px" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 12 }}>
                Starting budget
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {BUDGET_OPTIONS.map(opt => (
                  <button key={opt} type="button" onClick={() => setBudget(opt)}
                    style={{
                      padding: "10px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                      border: `1.5px solid ${budget === opt ? "#6366f1" : "#e5e7eb"}`,
                      background:    budget === opt ? "#eef2ff" : "#fff",
                      color:         budget === opt ? "#3730a3" : "#52525b",
                      cursor: "pointer",
                    }}
                  >{opt}</button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(0,0,0,0.06)", padding: "22px 24px" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 12 }}>
                Experience level
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {EXP_OPTIONS.map(opt => (
                  <button key={opt} type="button" onClick={() => setExperience(opt)}
                    style={{
                      padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: "left",
                      border: `1.5px solid ${experience === opt ? "#6366f1" : "#e5e7eb"}`,
                      background:    experience === opt ? "#eef2ff" : "#fff",
                      color:         experience === opt ? "#3730a3" : "#52525b",
                      cursor: "pointer",
                    }}
                  >{opt}</button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(0,0,0,0.06)", padding: "22px 24px" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 12 }}>
                Target customer
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {AUDIENCE_OPTIONS.map(opt => (
                  <button key={opt} type="button" onClick={() => setAudience(opt)}
                    style={{
                      padding: "8px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                      border: `1.5px solid ${audience === opt ? "#6366f1" : "#e5e7eb"}`,
                      background:    audience === opt ? "#eef2ff" : "#fff",
                      color:         audience === opt ? "#3730a3" : "#52525b",
                      cursor: "pointer",
                    }}
                  >{opt}</button>
                ))}
              </div>
            </div>

            {/* Email gate + CTA */}
            <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)", borderRadius: 18, padding: "24px", color: "#fff" }}>
              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                Where should we send your niches?
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 14 }}>
                We&apos;ll show them on the next screen and email a copy so you don&apos;t lose them.
              </p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: 12,
                  border: "2px solid rgba(255,255,255,0.25)",
                  background: "#fff",
                  fontSize: 15,
                  color: "#09090b",
                  fontWeight: 500,
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 12,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "#facc15"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(250,204,21,0.3), 0 2px 12px rgba(0,0,0,0.2)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.2)"; }}
              />
              <button
                type="submit"
                disabled={!interests.trim() || !email.includes("@")}
                style={{
                  width: "100%",
                  background: !interests.trim() || !email.includes("@") ? "rgba(255,255,255,0.15)" : "linear-gradient(135deg, #facc15, #f59e0b)",
                  color:      !interests.trim() || !email.includes("@") ? "rgba(255,255,255,0.4)" : "#1c1917",
                  fontWeight: 800, fontSize: 15,
                  padding: "14px", borderRadius: 12, border: "none",
                  cursor: !interests.trim() || !email.includes("@") ? "not-allowed" : "pointer",
                  letterSpacing: "-0.2px",
                }}
              >
                ✨ Pick my niches →
              </button>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 10, textAlign: "center" }}>
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </form>
        )}

        {step === "loading" && (
          <div style={{ background: "#fff", borderRadius: 18, padding: "60px 24px", textAlign: "center", border: "1.5px solid rgba(0,0,0,0.06)" }}>
            <div className="spinner" style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Researching your niches…</p>
            <p style={{ fontSize: 12, color: "#a1a1aa" }}>Takes about 5–10 seconds.</p>
          </div>
        )}

        {step === "error" && (
          <div style={{ background: "#fff7f7", border: "1.5px solid #fecaca", borderRadius: 18, padding: "24px", textAlign: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#9f1239", marginBottom: 8 }}>Something went wrong</p>
            <p style={{ fontSize: 13, color: "#7f1d1d", marginBottom: 16 }}>{errorMsg || "Please try again."}</p>
            <button onClick={() => setStep("form")} style={{ background: "#dc2626", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 10, border: "none", cursor: "pointer" }}>
              Try again
            </button>
          </div>
        )}

        {step === "rate_limited" && (
          <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 18, padding: "28px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 32, marginBottom: 10 }}>⏰</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#92400e", marginBottom: 8 }}>Already used today</p>
            <p style={{ fontSize: 13, color: "#78350f", marginBottom: 22, lineHeight: 1.65, maxWidth: 380, margin: "0 auto 22px" }}>
              {errorMsg}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/quiz" style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", fontWeight: 700, fontSize: 13, padding: "11px 22px", borderRadius: 10, textDecoration: "none" }}>
                Try the full course quiz →
              </Link>
              <button onClick={() => setStep("form")} style={{ background: "#fff", border: "1.5px solid #fde68a", color: "#92400e", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 10, cursor: "pointer" }}>
                Use a different email
              </button>
            </div>
          </div>
        )}

        {step === "results" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <p style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 4 }}>Based on your answers, here are 3 niches worth exploring:</p>
            </div>

            {niches.map((n, i) => {
              const diff = DIFF_COLORS[n.difficulty] ?? DIFF_COLORS.Beginner;
              return (
                <div key={i} style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(0,0,0,0.06)", padding: "24px 26px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 4 }}>
                        Niche {i + 1}
                      </p>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: "#09090b", letterSpacing: "-0.4px", lineHeight: 1.2 }}>{n.name}</h3>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: diff.bg, color: diff.fg, border: `1px solid ${diff.border}`, whiteSpace: "nowrap" }}>
                      {n.difficulty}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: "#52525b", lineHeight: 1.65, marginBottom: 14 }}>
                    {n.why_fits_you}
                  </p>

                  <div style={{ background: "#f8f8fb", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: 4 }}>👤 Ideal customer</p>
                    <p style={{ fontSize: 12, color: "#3f3f46", lineHeight: 1.6 }}>{n.ideal_customer}</p>
                  </div>

                  <div style={{ background: "#f8f8fb", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: 6 }}>📦 Example products</p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                      {n.example_products.map((p, pi) => (
                        <li key={pi} style={{ fontSize: 12, color: "#3f3f46", lineHeight: 1.6 }}>• {p}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 12px", border: "1px solid #bbf7d0" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#16a34a", marginBottom: 2 }}>💰 Starter budget</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>{n.starter_budget}</p>
                    </div>
                    <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 12px", border: "1px solid #bfdbfe" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563eb", marginBottom: 2 }}>📈 Growth signal</p>
                      <p style={{ fontSize: 11, color: "#1e40af", lineHeight: 1.4 }}>{n.growth_signal}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Course pitch */}
            <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)", borderRadius: 20, padding: "28px 26px", color: "#fff", textAlign: "center", marginTop: 8 }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>🎯</p>
              <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.4px", marginBottom: 8 }}>
                Picked a niche? Now build the store.
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: 20, maxWidth: 420, margin: "0 auto 20px" }}>
                First Sale Lab&apos;s 12-module course takes complete beginners from a niche idea to their first Shopify sale. Modules 1–6 are free.
              </p>
              <Link href="/quiz" style={{ display: "inline-block", background: "linear-gradient(135deg, #facc15, #f59e0b)", color: "#1c1917", fontWeight: 800, fontSize: 14, padding: "13px 28px", borderRadius: 13, textDecoration: "none", letterSpacing: "-0.2px" }}>
                Build my free roadmap →
              </Link>
            </div>

            {/* Try again */}
            <button onClick={() => { setStep("form"); setNiches([]); }}
              style={{ background: "transparent", border: "none", color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4, alignSelf: "center" }}
            >
              ↺ Try different inputs
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
