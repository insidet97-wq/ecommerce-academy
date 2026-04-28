"use client";

/**
 * ReferralCard — embeds in the dashboard. Shows the user's referral link
 * + how many people they've referred + how many converted.
 *
 * Lazy-fetches code on first render (POST /api/referrals/get-or-create
 * generates one if needed).
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReferralCard() {
  const [code,    setCode]    = useState<string | null>(null);
  const [stats,   setStats]   = useState<{ total: number; converted: number; creditPending: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://www.firstsalelab.com";
  const link = code ? `${SITE_URL}/quiz?ref=${code}` : "";

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setLoading(false); return; }
      try {
        const [codeRes, statsRes] = await Promise.all([
          fetch("/api/referrals/get-or-create", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } }),
          fetch("/api/referrals/stats",          { headers: { Authorization: `Bearer ${session.access_token}` } }),
        ]);
        if (!active) return;
        if (codeRes.ok)  { const j = await codeRes.json();  setCode(j.code); }
        if (statsRes.ok) { const j = await statsRes.json(); setStats({ total: j.total, converted: j.converted, creditPending: j.creditPending }); }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return null;
  if (!code) return null; // no session — silently skip

  return (
    <div style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)", border: "1.5px solid #ede9fe", borderRadius: 18, padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
        <span style={{ fontSize: 18 }}>🎁</span>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#4338ca", letterSpacing: "-0.2px" }}>Refer a friend</p>
      </div>
      <p style={{ fontSize: 12, color: "#6366f1", lineHeight: 1.55, marginBottom: 14 }}>
        Share your link. When a friend signs up and upgrades to Pro or Scale Lab, both of you get a free month — granted manually.
      </p>

      {/* Link + copy */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        <input
          readOnly
          value={link}
          onClick={(e) => e.currentTarget.select()}
          style={{ flex: "1 1 240px", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #c7d2fe", fontSize: 12, color: "#3730a3", outline: "none", background: "#fff", fontFamily: "monospace" }}
        />
        <button
          onClick={copy}
          style={{ background: copied ? "#16a34a" : "#6366f1", color: "#fff", fontWeight: 700, fontSize: 12, padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          {copied ? "✓ Copied" : "Copy link"}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#4338ca", lineHeight: 1 }}>{stats.total}</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", marginTop: 4 }}>Signed up</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#7c3aed", lineHeight: 1 }}>{stats.converted}</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#7c3aed", marginTop: 4 }}>Upgraded</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#d97706", lineHeight: 1 }}>{stats.creditPending}</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#d97706", marginTop: 4 }}>Credit pending</p>
          </div>
        </div>
      )}
    </div>
  );
}
