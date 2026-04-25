"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

const HERO_BG = "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)";
const INDIGO  = "#6366f1";

async function saveQuizResults(userId: string, firstName: string) {
  try {
    const raw = localStorage.getItem("quiz_results");
    const quiz = raw ? JSON.parse(raw) : {};
    await supabase.from("user_profiles").upsert({
      id:           userId,
      first_name:   firstName,
      experience:   quiz.experience,
      goal:         quiz.goal,
      time_per_week: quiz.time,
      budget:       quiz.budget,
      product_idea: quiz.productIdea,
      track:        quiz.track,
      start_module: quiz.startModule ?? 1,
    });
    if (raw) localStorage.removeItem("quiz_results");
  } catch {}
}

export default function SignupPage() {
  const router   = useRouter();
  const btnRef   = useRef<HTMLButtonElement>(null);
  const [firstName, setFirstName] = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data.user) await saveQuizResults(data.user.id, firstName.trim());

      // Send welcome email (fire and forget)
      try {
        const quizRaw = localStorage.getItem("quiz_results");
        const startModule = quizRaw ? (JSON.parse(quizRaw).startModule ?? 1) : 1;
        fetch("/api/send-welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName: firstName.trim(), email, startModule }),
        });
      } catch {}

      const next = localStorage.getItem("ea_next");
      if (next) { localStorage.removeItem("ea_next"); router.push(next); return; }
      // Fall back to quiz start module if available
      try {
        const quizRaw = localStorage.getItem("quiz_results");
        if (quizRaw) {
          const q = JSON.parse(quizRaw);
          if (q.startModule) { router.push(`/modules/${q.startModule}`); return; }
        }
      } catch {}
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: HERO_BG }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <div style={{ background: "#fff", borderRadius: 28, padding: "36px 32px", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: 15, color: "#09090b", textDecoration: "none", letterSpacing: "-0.3px" }}>
              Ecommerce Academy
            </Link>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.5px", marginTop: 16, marginBottom: 6 }}>
              Create your free account
            </h1>
            <p style={{ fontSize: 13, color: "#71717a" }}>Your personalised roadmap is waiting.</p>
          </div>

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* First name */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#52525b", display: "block", marginBottom: 6 }}>
                First name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="e.g. Alex"
                style={{
                  width: "100%", padding: "11px 14px", fontSize: 14, borderRadius: 12,
                  outline: "none", border: "1.5px solid #e4e4e7", color: "#09090b",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = INDIGO)}
                onBlur={e  => (e.currentTarget.style.borderColor = "#e4e4e7")}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#52525b", display: "block", marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%", padding: "11px 14px", fontSize: 14, borderRadius: 12,
                  outline: "none", border: "1.5px solid #e4e4e7", color: "#09090b",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = INDIGO)}
                onBlur={e  => (e.currentTarget.style.borderColor = "#e4e4e7")}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#52525b", display: "block", marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{
                  width: "100%", padding: "11px 14px", fontSize: 14, borderRadius: 12,
                  outline: "none", border: "1.5px solid #e4e4e7", color: "#09090b",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = INDIGO)}
                onBlur={e  => (e.currentTarget.style.borderColor = "#e4e4e7")}
              />
            </div>

            {error && (
              <div style={{ background: "#fff7f7", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ fontSize: 13, color: "#dc2626" }}>{error}</p>
              </div>
            )}

            <button
              ref={btnRef}
              type="submit"
              disabled={loading}
              onMouseEnter={() => { if (btnRef.current && !loading) { btnRef.current.style.boxShadow = "0 8px 28px rgba(99,102,241,0.45)"; btnRef.current.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={() => { if (btnRef.current) { btnRef.current.style.boxShadow = "0 4px 16px rgba(99,102,241,0.28)"; btnRef.current.style.transform = "translateY(0)"; } }}
              style={{
                width: "100%", padding: "13px",
                background: loading ? "#e4e4e7" : "linear-gradient(135deg, #6366f1, #7c3aed)",
                color: loading ? "#a1a1aa" : "#fff",
                fontWeight: 700, fontSize: 14, borderRadius: 14, border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.28)",
                transition: "box-shadow 0.2s, transform 0.2s",
                marginTop: 4,
              }}
            >
              {loading ? "Creating account…" : "Create my free account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#a1a1aa" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: INDIGO, fontWeight: 600, textDecoration: "none" }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
