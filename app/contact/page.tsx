"use client";

import { useState } from "react";
import Link from "next/link";

const SUBJECT_OPTIONS = [
  { value: "general",  label: "General question" },
  { value: "billing",  label: "Billing or subscription" },
  { value: "bug",      label: "Bug report" },
  { value: "feature",  label: "Feature request or feedback" },
  { value: "press",    label: "Press / partnerships" },
  { value: "other",    label: "Something else" },
] as const;

export default function ContactPage() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [subject, setSubject] = useState<typeof SUBJECT_OPTIONS[number]["value"]>("general");
  const [message, setMessage] = useState("");
  // Honeypot — bots fill it, humans don't see it. Submissions with a non-empty
  // value are silently rejected server-side.
  const [website, setWebsite] = useState("");

  const [sending,   setSending]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");

  const formValid =
    name.trim().length > 1 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) &&
    message.trim().length >= 20;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid || sending) return;
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    name.trim(),
          email:   email.trim(),
          subject,
          message: message.trim(),
          website, // honeypot
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't send. Try again in a moment.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Couldn't send. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #e4e4e7",
    fontSize: 14,
    color: "#09090b",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };
  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "#6366f1");
  const blurBorder  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "#e4e4e7");

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.92)", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/logo.png" alt="First Sale Lab" style={{ height: 32, width: "auto" }} />
            <span style={{ fontWeight: 800, fontSize: 14, color: "#09090b", letterSpacing: "-0.3px" }}>First Sale Lab</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Link href="/about" style={{ fontSize: 13, color: "#52525b", textDecoration: "none", fontWeight: 500 }}>About</Link>
            <Link href="/blog"  style={{ fontSize: 13, color: "#52525b", textDecoration: "none", fontWeight: 500 }}>Blog</Link>
            <Link href="/quiz"  style={{ fontSize: 13, color: "#fff", background: "#6366f1", padding: "8px 16px", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>Start free →</Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6366f1", marginBottom: 12 }}>Contact</p>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#09090b", letterSpacing: "-0.7px", lineHeight: 1.15, marginBottom: 14 }}>
            Got a question, feedback, or a bug to report?
          </h1>
          <p style={{ fontSize: 15, color: "#52525b", lineHeight: 1.65 }}>
            Drop us a message below. We read every submission and reply within 48 hours. If your question is about an active subscription, please use the same email address you used to sign up so we can find your account.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", padding: "32px" }}>

            {/* Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 6 }}>Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={120}
                placeholder="First name is fine"
                required
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                maxLength={200}
                placeholder="you@example.com"
                required
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>

            {/* Subject */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 6 }}>What&apos;s this about?</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value as typeof subject)}
                style={{ ...inputStyle, appearance: "auto" }}
                onFocus={focusBorder}
                onBlur={blurBorder}
              >
                {SUBJECT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 6 }}>Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={3000}
                rows={6}
                placeholder="Tell us what you need. The more specific, the faster we can help."
                required
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
              <p style={{ fontSize: 11, color: "#a1a1aa", marginTop: 6, textAlign: "right" }}>{message.length}/3000 · min 20 chars</p>
            </div>

            {/* Honeypot — hidden from humans, bots fill it */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
              <label>Website (leave blank)</label>
              <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
            </div>

            <button
              type="submit"
              disabled={!formValid || sending}
              style={{
                width: "100%",
                background: !formValid || sending ? "#e4e4e7" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color:      !formValid || sending ? "#a1a1aa" : "#fff",
                fontWeight: 800,
                fontSize: 14,
                padding: "13px 28px",
                borderRadius: 12,
                border: "none",
                cursor: !formValid || sending ? "not-allowed" : "pointer",
                letterSpacing: "-0.2px",
                marginTop: 6,
              }}
            >
              {sending ? "Sending…" : "Send message →"}
            </button>

            {error && (
              <p style={{ fontSize: 12, color: "#dc2626", marginTop: 12, textAlign: "center" }}>⚠ {error}</p>
            )}

            <p style={{ fontSize: 11, color: "#a1a1aa", textAlign: "center", marginTop: 16, lineHeight: 1.55 }}>
              By sending this you agree we can email you back. We don&apos;t share your email or message with anyone outside the team. See our <Link href="/privacy" style={{ color: "#6366f1" }}>privacy policy</Link>.
            </p>
          </form>
        ) : (
          // Success state
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #bbf7d0", padding: "40px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#09090b", letterSpacing: "-0.4px", marginBottom: 10 }}>Message sent</h2>
            <p style={{ fontSize: 14, color: "#52525b", lineHeight: 1.7, marginBottom: 20 }}>
              Thanks — we got it. Someone from the team will get back to you within 48 hours, usually faster. Check the email you submitted (including spam) over the next day or two.
            </p>
            <Link href="/" style={{ display: "inline-block", background: "#f5f3ff", color: "#7c3aed", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, textDecoration: "none" }}>
              ← Back to home
            </Link>
          </div>
        )}

        <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
          <Link href="/about"   style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>About FSL →</Link>
          <Link href="/privacy" style={{ fontSize: 13, color: "#a1a1aa", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms"   style={{ fontSize: 13, color: "#a1a1aa", textDecoration: "none" }}>Terms</Link>
        </div>

      </main>
    </div>
  );
}
