"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

type Stats = {
  email_type: string;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
};

type Response = {
  days: number;
  totalEvents: number;
  summary: Stats[];
  topClicks: { url: string; count: number }[];
};

const RANGES = [
  { v: 7,   label: "7 days" },
  { v: 30,  label: "30 days" },
  { v: 90,  label: "90 days" },
  { v: 365, label: "All time" },
];

function rateColor(rate: number, kind: "open" | "click" | "bounce") {
  // Industry benchmarks for transactional + drip
  if (kind === "open")   return rate >= 30 ? "#16a34a" : rate >= 15 ? "#d97706" : "#dc2626";
  if (kind === "click")  return rate >= 5  ? "#16a34a" : rate >= 2  ? "#d97706" : "#dc2626";
  if (kind === "bounce") return rate <= 2  ? "#16a34a" : rate <= 5  ? "#d97706" : "#dc2626";
  return "#52525b";
}

const TYPE_LABELS: Record<string, string> = {
  welcome:           "👋 Welcome",
  completion:        "✅ Module completion",
  completion_final:  "🏆 Course complete",
  pro_welcome:       "✨ Pro welcome",
  growth_welcome:    "🚀 Growth welcome",
  weekly_digest:     "📅 Weekly digest",
  reengagement:      "💤 Re-engagement",
  streak_save:       "🔥 Streak save",
  niche_day0:        "🎯 Niche · day 0",
  niche_day2:        "🎯 Niche · day 2",
  niche_day5:        "🎯 Niche · day 5",
  niche_day7:        "🎯 Niche · day 7",
  untagged:          "❓ Untagged",
};

export default function AdminEmailPage() {
  const router = useRouter();
  const [data,    setData]    = useState<Response | null>(null);
  const [days,    setDays]    = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isAdmin(user.email)) { router.push("/dashboard"); return; }

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/email-stats?days=${days}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (!res.ok) { setError(`Failed to load (${res.status})`); setLoading(false); return; }
      setData(await res.json());
      setLoading(false);
    }
    load();
  }, [router, days]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="text-center"><div className="spinner mx-auto mb-3" /><p style={{ color: "#a1a1aa", fontSize: 14 }}>Loading email stats…</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <p style={{ color: "#ef4444" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <img src="/logo.png" alt="First Sale Lab" decoding="async" style={{ height: 36, width: "auto" }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.4px" }}>First Sale Lab</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", marginLeft: 4 }}>Admin</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/admin"         style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none" }}>Analytics</Link>
            <Link href="/admin/content" style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none" }}>Content</Link>
            <Link href="/admin/users"   style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none" }}>Users</Link>
            <Link href="/admin/blog"    style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none" }}>Blog</Link>
            <Link href="/admin/email"   style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", textDecoration: "none" }}>Email</Link>
            <Link href="/admin/leads"   style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none" }}>Leads</Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>

        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#09090b", letterSpacing: "-0.6px", marginBottom: 4 }}>Email performance</h1>
            <p style={{ fontSize: 13, color: "#a1a1aa" }}>{data?.totalEvents ?? 0} events tracked over the last {days} days</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {RANGES.map(r => (
              <button key={r.v} onClick={() => setDays(r.v)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 10,
                  border: `1.5px solid ${days === r.v ? "#6366f1" : "#e5e7eb"}`,
                  background: days === r.v ? "#6366f1" : "#fff",
                  color:      days === r.v ? "#fff"    : "#52525b",
                  cursor: "pointer",
                }}
              >{r.label}</button>
            ))}
          </div>
        </div>

        {/* ── Summary table ── */}
        {data && data.summary.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(0,0,0,0.06)", padding: "60px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>No email events yet</p>
            <p style={{ fontSize: 13, color: "#a1a1aa", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
              Once Resend webhook events start flowing into <code>email_events</code>, they&apos;ll appear here. If you&apos;ve sent emails but see nothing, verify the webhook secret in Vercel and the endpoint in Resend.
            </p>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(0,0,0,0.06)", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 24 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8f8fb", borderBottom: "1.5px solid #e5e7eb" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa" }}>Email type</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa" }}>Delivered</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa" }}>Open rate</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa" }}>Click rate</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa" }}>Bounce</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa" }}>Complaints</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.summary.map(s => (
                    <tr key={s.email_type} style={{ borderBottom: "1px solid #f4f4f5" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#09090b" }}>{TYPE_LABELS[s.email_type] ?? s.email_type}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, color: "#52525b" }}>{s.delivered}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: rateColor(s.open_rate, "open") }}>{s.open_rate}%</span>
                        <span style={{ fontSize: 11, color: "#a1a1aa", marginLeft: 6 }}>{s.opened}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: rateColor(s.click_rate, "click") }}>{s.click_rate}%</span>
                        <span style={{ fontSize: 11, color: "#a1a1aa", marginLeft: 6 }}>{s.clicked}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, color: rateColor(s.bounce_rate, "bounce") }}>{s.bounce_rate}%</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 13, color: s.complained > 0 ? "#dc2626" : "#a1a1aa" }}>{s.complained}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Top clicked URLs ── */}
        {data && data.topClicks.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(0,0,0,0.06)", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#71717a", marginBottom: 12 }}>🔗 Most-clicked links</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.topClicks.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f8f8fb", borderRadius: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", minWidth: 24 }}>#{i + 1}</span>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 12, color: "#3f3f46", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.url}</a>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", whiteSpace: "nowrap" }}>{c.count} clicks</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <p style={{ fontSize: 11, color: "#a1a1aa", marginTop: 18, lineHeight: 1.6 }}>
          ⓘ Open / click rates use unique events per Resend email ID — opening the same email 3 times only counts once. Bounce rate is bounced ÷ (delivered + bounced). Open rate above 30% / click rate above 5% / bounce below 2% are considered healthy for transactional + drip emails.
        </p>

      </main>
    </div>
  );
}
