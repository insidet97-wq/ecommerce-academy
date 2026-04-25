"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const HERO_BG = "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)";
const INDIGO  = "#6366f1";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const btnRef = useRef<HTMLButtonElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: HERO_BG }}
    >
      <div style={{ maxWidth: 420, width: "100%" }}>
        <div style={{ background: "#fff", borderRadius: 28, padding: "36px 32px", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: 15, color: "#09090b", textDecoration: "none", letterSpacing: "-0.3px" }}>
              First Sale Lab
            </Link>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.5px", marginTop: 16, marginBottom: 6 }}>
              Forgot your password?
            </h1>
            <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6 }}>
              Enter your email and we&apos;ll send you a link to reset it.
            </p>
          </div>

          {sent ? (
            /* ── Success state ── */
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#09090b", marginBottom: 8 }}>Check your inbox</p>
              <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.65, marginBottom: 24 }}>
                We sent a password reset link to <strong style={{ color: "#09090b" }}>{email}</strong>. It may take a minute to arrive — check your spam folder if you don&apos;t see it.
              </p>
              <Link
                href="/login"
                style={{
                  display: "inline-block", fontSize: 13, fontWeight: 700,
                  color: INDIGO, textDecoration: "none",
                  padding: "10px 20px", borderRadius: 10,
                  background: "#eef2ff", border: "1px solid #c7d2fe",
                }}
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#52525b", display: "block", marginBottom: 6 }}>
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: "100%", padding: "11px 14px",
                    fontSize: 14, borderRadius: 12, outline: "none",
                    border: "1.5px solid #e4e4e7", color: "#09090b",
                    boxSizing: "border-box",
                  }}
                  onFocus={e  => (e.currentTarget.style.borderColor = INDIGO)}
                  onBlur={e   => (e.currentTarget.style.borderColor = "#e4e4e7")}
                />
              </div>

              {error && (
                <div style={{ background: "#fff7f7", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
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
                }}
              >
                {loading ? "Sending…" : "Send reset link →"}
              </button>

              <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#a1a1aa" }}>
                Remembered it?{" "}
                <Link href="/login" style={{ color: INDIGO, fontWeight: 600, textDecoration: "none" }}>
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
