"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";

const MODULE_TITLES: Record<number, { emoji: string; title: string }> = {
  1:  { emoji: "🎮", title: "The Rules of the Game"         },
  2:  { emoji: "🎯", title: "Find Your Niche"               },
  3:  { emoji: "🏆", title: "Find Your Winning Product"     },
  4:  { emoji: "🧠", title: "Know Your Customer"            },
  5:  { emoji: "🛒", title: "Build Your Shopify Store"      },
  6:  { emoji: "⚡", title: "Build Your First Sales Funnel" },
  7:  { emoji: "📱", title: "Drive Traffic: TikTok Organic" },
  8:  { emoji: "📣", title: "Run Your First Paid Ad"        },
  9:  { emoji: "📈", title: "Conversion Optimisation"       },
  10: { emoji: "📧", title: "Build Your Email List"         },
  11: { emoji: "💰", title: "Make Your First Sale"          },
  12: { emoji: "🚀", title: "Scale and Grow"                },
};

type AnalyticsData = {
  totalUsers: number;
  activeToday: number;
  activeThisWeek: number;
  signupsThisWeek: number;
  maxStreak: number;
  perModule: Record<number, number>;
  totalCompletions: number;
};

function StatCard({ label, value, sub, color = "#6366f1" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(0,0,0,0.06)", padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 900, color, letterSpacing: "-0.8px", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

type BizMetrics = {
  totalUsers: number;
  tierCounts: { free: number; pro: number; growth: number };
  mrr: { pro: number; growth: number; total: number };
  activeStripeSubs: number;
  signups: { last7Days: number; last30Days: number };
  activity: { activeToday: number; active7d: number };
  funnel: { signups: number; completedModule1: number; completedModule6: number; completedModule12: number; completedModule24: number };
  churnRiskCount: number;
  recentSignups: { id: string; email: string; created_at: string; tier: string }[];
};

export default function AdminPage() {
  const router = useRouter();
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [biz,     setBiz]     = useState<BizMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user, session } } = await supabase.auth.getUser().then(async ({ data }) => {
        const { data: sessionData } = await supabase.auth.getSession();
        return { data: { user: data.user, session: sessionData.session } };
      });
      if (!user || !isAdmin(user.email)) { router.push("/dashboard"); return; }

      const [analyticsRes, metricsRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/admin/metrics", { headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {} }),
      ]);
      if (!analyticsRes.ok) { setError("Failed to load analytics"); setLoading(false); return; }
      setData(await analyticsRes.json());
      if (metricsRes.ok) setBiz(await metricsRes.json());
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="text-center"><div className="spinner mx-auto mb-3" /><p style={{ color: "#a1a1aa", fontSize: 14 }}>Loading analytics…</p></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <p style={{ color: "#ef4444" }}>{error || "Something went wrong"}</p>
      </div>
    );
  }

  const maxCompletions = Math.max(1, ...Object.values(data.perModule));
  const completionRate = data.totalUsers > 0
    ? Math.round((data.perModule[1] / data.totalUsers) * 100)
    : 0;

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: 15, color: "#09090b", textDecoration: "none", letterSpacing: "-0.3px" }}>First Sale Lab</Link>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/admin/content" style={{ fontSize: 13, fontWeight: 500, color: "#71717a", textDecoration: "none", padding: "5px 10px", borderRadius: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#09090b"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
            >Content</Link>
            <Link href="/admin/users" style={{ fontSize: 13, fontWeight: 500, color: "#71717a", textDecoration: "none", padding: "5px 10px", borderRadius: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#09090b"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
            >Users</Link>
            <Link href="/admin/blog" style={{ fontSize: 13, fontWeight: 500, color: "#71717a", textDecoration: "none", padding: "5px 10px", borderRadius: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#09090b"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
            >Blog</Link>
            <Link href="/admin/email" style={{ fontSize: 13, fontWeight: 500, color: "#71717a", textDecoration: "none", padding: "5px 10px", borderRadius: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#09090b"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
            >Email</Link>
            <Link href="/admin/leads" style={{ fontSize: 13, fontWeight: 500, color: "#71717a", textDecoration: "none", padding: "5px 10px", borderRadius: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#09090b"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#71717a"; }}
            >Leads</Link>
            <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
            >← Dashboard</Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "36px 24px 80px" }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#09090b", letterSpacing: "-0.6px", marginBottom: 4 }}>Analytics</h1>
          <p style={{ fontSize: 13, color: "#a1a1aa" }}>Live overview of how learners are progressing through the course.</p>
        </div>

        {/* ── Business metrics (MRR, tier breakdown) ── */}
        {biz && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#71717a", marginBottom: 10 }}>💰 Business</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 14 }}>
              <StatCard label="Total MRR"      value={`$${biz.mrr.total.toLocaleString()}`}  sub={`$${biz.mrr.pro} Pro · $${biz.mrr.growth} Growth`} color="#16a34a" />
              <StatCard label="🚀 Scale Lab"   value={biz.tierCounts.growth} sub={`× $49 = $${biz.mrr.growth}/mo`}    color="#0c0a09" />
              <StatCard label="✨ Pro"         value={biz.tierCounts.pro}    sub={`× $19 = $${biz.mrr.pro}/mo`}       color="#7c3aed" />
              <StatCard label="Free"           value={biz.tierCounts.free}   sub="not yet upgraded" color="#a1a1aa" />
              <StatCard label="Active subs"    value={biz.activeStripeSubs}  sub="in Stripe" color="#0891b2" />
              <StatCard label="Churn risk"     value={biz.churnRiskCount}    sub="paid · inactive 14d+" color={biz.churnRiskCount > 0 ? "#dc2626" : "#a1a1aa"} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
              <StatCard label="New (7 days)"   value={biz.signups.last7Days}  sub="signups" color="#6366f1" />
              <StatCard label="New (30 days)"  value={biz.signups.last30Days} sub="signups" color="#7c3aed" />
              <StatCard label="Active today"   value={biz.activity.activeToday} sub="completed a module" color="#059669" />
              <StatCard label="Active 7d"      value={biz.activity.active7d}  sub="completed a module" color="#16a34a" />
            </div>
          </div>
        )}

        {/* ── Conversion funnel ── */}
        {biz && (
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(0,0,0,0.06)", padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#71717a", marginBottom: 14 }}>🎯 Conversion funnel</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 6 }}>
              {[
                { label: "Signups",        value: biz.funnel.signups,           color: "#6366f1", emoji: "👋" },
                { label: "Started M1",     value: biz.funnel.completedModule1,  color: "#4f46e5", emoji: "▶️" },
                { label: "Free done (M6)", value: biz.funnel.completedModule6,  color: "#7c3aed", emoji: "✅" },
                { label: "Pro done (M12)", value: biz.funnel.completedModule12, color: "#a855f7", emoji: "🏆" },
                { label: "Scale done (M24)", value: biz.funnel.completedModule24, color: "#0c0a09", emoji: "🚀" },
              ].map((step, i, arr) => {
                const pctOfSignups = biz.funnel.signups > 0 ? Math.round((step.value / biz.funnel.signups) * 100) : 0;
                const prev = i > 0 ? arr[i - 1].value : null;
                const dropPct = prev !== null && prev > 0 ? Math.round(((prev - step.value) / prev) * 100) : null;
                return (
                  <div key={step.label} style={{ background: "#f8f8fb", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                    <p style={{ fontSize: 16, marginBottom: 4 }}>{step.emoji}</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: step.color, letterSpacing: "-0.4px", lineHeight: 1 }}>{step.value}</p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#71717a", marginTop: 4 }}>{step.label}</p>
                    <p style={{ fontSize: 10, color: "#a1a1aa", marginTop: 2 }}>{pctOfSignups}% of signups</p>
                    {dropPct !== null && dropPct > 0 && (
                      <p style={{ fontSize: 9, color: "#dc2626", marginTop: 2 }}>−{dropPct}% drop</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stat cards (legacy course-side metrics) */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#71717a", marginBottom: 10 }}>📚 Course activity</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 28 }}>
          <StatCard label="Total users"       value={data.totalUsers}       color="#6366f1" />
          <StatCard label="Active this week"  value={data.activeThisWeek}   sub="completed a module" color="#7c3aed" />
          <StatCard label="New this week"     value={data.signupsThisWeek}  sub="signed up" color="#0891b2" />
          <StatCard label="Active today"      value={data.activeToday}      sub="completed a module" color="#059669" />
          <StatCard label="Total completions" value={data.totalCompletions} sub="across all modules" color="#d97706" />
          <StatCard label="Longest streak"    value={`🔥 ${data.maxStreak}`} sub="days in a row" color="#ea580c" />
        </div>

        {/* Module funnel */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(0,0,0,0.06)", padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#09090b", letterSpacing: "-0.3px" }}>Module completion funnel</h2>
            <span style={{ fontSize: 12, color: "#a1a1aa" }}>{completionRate}% of users started Module 1</span>
          </div>
          <p style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 24 }}>Shows how many unique learners completed each module — narrowing bars = drop-off.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 24 }, (_, i) => i + 1).map(id => {
              const count = data.perModule[id] ?? 0;
              const pct   = Math.round((count / maxCompletions) * 100);
              const dropPct = id > 1 ? Math.round(((data.perModule[id-1] - count) / Math.max(1, data.perModule[id-1])) * 100) : 0;
              const mod   = MODULE_TITLES[id];
              const barColor = pct > 60 ? "#6366f1" : pct > 35 ? "#7c3aed" : pct > 15 ? "#a855f7" : "#d8b4fe";

              return (
                <div key={id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#a1a1aa", fontWeight: 600, width: 22, textAlign: "right", flexShrink: 0 }}>{id}</span>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{mod.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#09090b", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mod.title}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#09090b", flexShrink: 0 }}>{count}</span>
                    {id > 1 && dropPct > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", flexShrink: 0 }}>−{dropPct}%</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 22, flexShrink: 0 }} />
                    <div style={{ width: 14, flexShrink: 0 }} />
                    <div style={{ flex: 1, height: 8, borderRadius: 99, background: "#f4f4f5" }}>
                      <div style={{ height: 8, borderRadius: 99, background: barColor, width: `${pct}%`, transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f4f4f5", display: "flex", gap: 20 }}>
            {[
              { color: "#6366f1", label: "> 60% of max" },
              { color: "#a855f7", label: "15–60%" },
              { color: "#d8b4fe", label: "< 15% — drop-off zone" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#a1a1aa" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent signups ── */}
        {biz && biz.recentSignups.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(0,0,0,0.06)", padding: "24px 28px", marginTop: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#71717a", marginBottom: 14 }}>👋 Recent signups (last 10)</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {biz.recentSignups.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 12px", background: "#f8f8fb", borderRadius: 10, fontSize: 12 }}>
                  <span style={{ color: "#09090b", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: s.tier === "growth" ? "#0c0a09" : s.tier === "pro" ? "#7c3aed" : "#f4f4f5", color: s.tier === "growth" ? "#fde68a" : s.tier === "pro" ? "#fff" : "#71717a", whiteSpace: "nowrap" }}>
                    {s.tier === "growth" ? "🚀 Scale Lab" : s.tier === "pro" ? "✨ Pro" : "Free"}
                  </span>
                  <span style={{ fontSize: 11, color: "#a1a1aa", whiteSpace: "nowrap" }}>{new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
