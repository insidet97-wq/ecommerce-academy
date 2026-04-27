"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();

  // Profile state
  const [firstName,    setFirstName]    = useState("");
  const [firstNameOg,  setFirstNameOg]  = useState(""); // original value to detect changes
  const [email,        setEmail]        = useState("");
  const [userId,       setUserId]       = useState("");

  // Password state
  const [newPassword,  setNewPassword]  = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");

  // UI state
  const [loading,      setLoading]      = useState(true);
  const [nameLoading,  setNameLoading]  = useState(false);
  const [pwLoading,    setPwLoading]    = useState(false);
  const [nameMsg,      setNameMsg]      = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwMsg,        setPwMsg]        = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      setEmail(user.email ?? "");
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();

      const name = profile?.first_name ?? "";
      setFirstName(name);
      setFirstNameOg(name);
      setLoading(false);
    }
    load();
  }, [router]);

  /* ── Save name ── */
  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) return;
    setNameLoading(true);
    setNameMsg(null);

    const { error } = await supabase
      .from("user_profiles")
      .update({ first_name: firstName.trim() })
      .eq("id", userId);

    setNameLoading(false);
    if (error) {
      setNameMsg({ type: "error", text: "Failed to update name. Please try again." });
    } else {
      setFirstNameOg(firstName.trim());
      setNameMsg({ type: "success", text: "Name updated successfully." });
    }
  }

  /* ── Change password ── */
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);

    if (newPassword.length < 8) {
      setPwMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPw) {
      setPwMsg({ type: "error", text: "Passwords don't match." });
      return;
    }

    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);

    if (error) {
      setPwMsg({ type: "error", text: error.message });
    } else {
      setNewPassword("");
      setConfirmPw("");
      setPwMsg({ type: "success", text: "Password changed successfully." });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="First Sale Lab" style={{ height: 36, width: "auto" }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.3px" }}>First Sale Lab</span>
          </div>
          <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
            onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
          >← Dashboard</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px" }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#09090b", letterSpacing: "-0.6px", marginBottom: 4 }}>Account settings</h1>
          <p style={{ fontSize: 13, color: "#a1a1aa" }}>{email}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── Name ── */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(0,0,0,0.06)", padding: "28px 28px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#09090b", letterSpacing: "-0.3px", marginBottom: 4 }}>Your name</h2>
            <p style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 20 }}>This appears on your certificate and in emails.</p>
            <form onSubmit={handleSaveName} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name"
                required
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb",
                  fontSize: 14, color: "#09090b", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
              {nameMsg && (
                <p style={{ fontSize: 13, color: nameMsg.type === "success" ? "#16a34a" : "#dc2626", fontWeight: 500 }}>
                  {nameMsg.type === "success" ? "✓ " : "⚠ "}{nameMsg.text}
                </p>
              )}
              <div>
                <button
                  type="submit"
                  disabled={nameLoading || firstName.trim() === firstNameOg}
                  style={{
                    background: nameLoading || firstName.trim() === firstNameOg ? "#f4f4f5" : "#6366f1",
                    color: nameLoading || firstName.trim() === firstNameOg ? "#a1a1aa" : "#fff",
                    fontWeight: 700, fontSize: 14, padding: "11px 24px",
                    borderRadius: 12, border: "none",
                    cursor: nameLoading || firstName.trim() === firstNameOg ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  {nameLoading ? "Saving…" : "Save name"}
                </button>
              </div>
            </form>
          </div>

          {/* ── Password ── */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(0,0,0,0.06)", padding: "28px 28px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#09090b", letterSpacing: "-0.3px", marginBottom: 4 }}>Change password</h2>
            <p style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 20 }}>Must be at least 8 characters.</p>
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb",
                  fontSize: 14, color: "#09090b", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                required
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb",
                  fontSize: 14, color: "#09090b", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
              {pwMsg && (
                <p style={{ fontSize: 13, color: pwMsg.type === "success" ? "#16a34a" : "#dc2626", fontWeight: 500 }}>
                  {pwMsg.type === "success" ? "✓ " : "⚠ "}{pwMsg.text}
                </p>
              )}
              <div>
                <button
                  type="submit"
                  disabled={pwLoading}
                  style={{
                    background: pwLoading ? "#f4f4f5" : "#6366f1",
                    color: pwLoading ? "#a1a1aa" : "#fff",
                    fontWeight: 700, fontSize: 14, padding: "11px 24px",
                    borderRadius: 12, border: "none",
                    cursor: pwLoading ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  {pwLoading ? "Updating…" : "Change password"}
                </button>
              </div>
            </form>
          </div>

          {/* ── Danger zone ── */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #fecaca", padding: "28px 28px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#09090b", letterSpacing: "-0.3px", marginBottom: 4 }}>Danger zone</h2>
            <p style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 20 }}>
              To delete your account or cancel your subscription, email us at{" "}
              <a href="mailto:support@firstsalelab.com" style={{ color: "#6366f1", textDecoration: "none" }}>support@firstsalelab.com</a>.
            </p>
            <p style={{ fontSize: 12, color: "#fca5a5" }}>
              Deleting your account is permanent and cannot be undone.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
