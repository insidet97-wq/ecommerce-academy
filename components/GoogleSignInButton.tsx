"use client";

/**
 * Google sign-in button. Uses Supabase's built-in OAuth flow.
 *
 * On click → Supabase redirects to Google's consent screen → Google
 * redirects back to {origin}/auth/callback with auth tokens in the URL hash.
 * The Supabase JS client picks them up automatically; the /auth/callback
 * page then runs first-time-user setup (quiz results, welcome email,
 * referral capture) and forwards to the dashboard.
 *
 * Brand styling follows Google's published guidelines:
 *   - White background, gray border, dark text
 *   - Official multi-colour Google logo (inline SVG, no external request)
 *   - Min height 40px, 8px border radius
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GoogleSignInButton({
  label = "Continue with Google",
  onError,
}: {
  label?: string;
  onError?: (msg: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        onError?.(error.message);
        setLoading(false);
      }
      // Success path: browser redirects to Google. No code runs after this.
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Couldn't connect to Google");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "11px 16px",
        borderRadius: 12,
        border: "1.5px solid #e4e4e7",
        background: loading ? "#f4f4f5" : "#fff",
        color: "#3c4043",
        fontSize: 14,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.15s, border-color 0.15s",
        fontFamily: "inherit",
        letterSpacing: "-0.1px",
      }}
      onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#d4d4d8"; } }}
      onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e4e4e7"; } }}
    >
      <GoogleLogo />
      {loading ? "Redirecting…" : label}
    </button>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
