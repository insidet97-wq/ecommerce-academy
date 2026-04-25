"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

const HERO_BG = "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)";
const INDIGO  = "#6366f1";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");
  const [ready,     setReady]     = useState(false);

  const btnRef = useRef<HTMLButtonElement>(null);

  // Supabase puts the session tokens in the URL hash after redirect.
  // We need to wait for the auth state to pick them up before allowing password update.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
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
              Ecommerce Academy
            </Link>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.5px", marginTop: 16, marginBottom: 6 }}>
              Set a new password
            </h1>
            <p style={{ fontSize: 13, color: "#71717a" }}>
              Choose something strong you&apos;ll remember.
            </p>
          </div>

          {done ? (
            /* ── Success ── */
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#09090b", marginBottom: 6 }}>Password updated!</p>
              <p style={{ fontSize: 13, color: "#71717a" }}>Taking you to your dashboard…</p>
            </div>

          ) : !ready ? (
            /* ── Waiting for token ── */
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div className="spinner mx-auto mb-3" />
              <p style={{ fontSize: 13, color: "#a1a1aa" }}>Verifying your reset link…</p>
              <p style={{ fontSize: 12, color: "#d4d4d8", marginTop: 8 }}>
                If nothing happens,{" "}
                <Link href="/forgot-password" style={{ color: INDIGO, textDecoration: "underline" }}>
                  request a new link
                </Link>.
              </p>
            </div>

          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#52525b", display: "block", marginBottom: 6 }}>
                  New password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={{
                    width: "100%", padding: "11px 14px", fontSize: 14,
                    borderRadius: 12, outline: "none", border: "1.5px solid #e4e4e7",
                    color: "#09090b", boxSizing: "border-box",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = INDIGO)}
                  onBlur={e  => (e.currentTarget.style.borderColor = "#e4e4e7")}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#52525b", display: "block", marginBottom: 6 }}>
                  Confirm new password
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Same password again"
                  style={{
                    width: "100%", padding: "11px 14px", fontSize: 14,
                    borderRadius: 12, outline: "none", border: "1.5px solid #e4e4e7",
                    color: "#09090b", boxSizing: "border-box",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = INDIGO)}
                  onBlur={e  => (e.currentTarget.style.borderColor = "#e4e4e7")}
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
                {loading ? "Saving…" : "Update password →"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
