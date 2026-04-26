"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import type { Briefing } from "@/lib/perplexity";

function formatMonth(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function ProBriefingsPage() {
  const router = useRouter();
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_pro")
        .eq("id", user.id)
        .single();

      const isPro = profile?.is_pro === true || isAdmin(user.email);
      if (!isPro) { router.push("/upgrade"); return; }

      const { data } = await supabase
        .from("briefings")
        .select("*")
        .eq("status", "published")
        .order("month", { ascending: false })
        .limit(12);

      setBriefings(data ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="text-center"><div className="spinner mx-auto mb-3" /><p style={{ color: "#a1a1aa", fontSize: 14 }}>Loading…</p></div>
      </div>
    );
  }

  const latest  = briefings[0] ?? null;
  const archive = briefings.slice(1);

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <img src="/logo.png" alt="First Sale Lab" style={{ height: 36, width: "auto" }} />
              <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.4px" }}>First Sale Lab</span>
            </Link>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "linear-gradient(135deg, #facc15, #f59e0b)", color: "#1c1917" }}>✨ Pro</span>
          </div>
          <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
            onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
          >← Dashboard</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0c4a6e, #0e7490, #164e63)", padding: "40px 24px 36px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 8 }}>Pro Feature</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.7px", marginBottom: 8 }}>Monthly Ecom Briefing</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", maxWidth: 500 }}>
            What's working right now on Meta and TikTok, one trending niche, one tactic to add, and one to drop — updated every month.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px" }}>

        {briefings.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#a1a1aa" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>First briefing coming soon</p>
            <p style={{ fontSize: 13 }}>Check back at the start of next month.</p>
          </div>
        )}

        {latest && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0891b2" }}>Latest Briefing</span>
              <span style={{ fontSize: 12, color: "#a1a1aa" }}>{formatMonth(latest.month)}</span>
            </div>
            <BriefingView briefing={latest} />
          </div>
        )}

        {archive.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 14 }}>Archive</p>
            {archive.map(b => (
              <details key={b.id} style={{ marginBottom: 12 }}>
                <summary style={{ cursor: "pointer", background: "#fff", borderRadius: 14, border: "1.5px solid rgba(0,0,0,0.06)", padding: "14px 18px", listStyle: "none", userSelect: "none" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#09090b" }}>{formatMonth(b.month)} ›</span>
                </summary>
                <div style={{ paddingTop: 10 }}>
                  <BriefingView briefing={b} />
                </div>
              </details>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BriefingView({ briefing }: { briefing: Briefing }) {
  const c = briefing.content;
  if (!c) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Summary banner */}
      {c.summary && (
        <div style={{ background: "linear-gradient(135deg, #0c4a6e, #0e7490)", borderRadius: 16, padding: "16px 20px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>This Month</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.6, fontStyle: "italic" }}>{c.summary}</p>
        </div>
      )}

      {/* Ads row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Section icon="👥" label="Meta Ads" text={c.meta_ads} accent="#1d4ed8" bg="#eff6ff" border="#bfdbfe" />
        <Section icon="🎵" label="TikTok Ads" text={c.tiktok_ads} accent="#be185d" bg="#fdf2f8" border="#fbcfe8" />
      </div>

      {/* Trending niche */}
      {c.trending_niche && (
        <div style={{ background: "#f0fdf4", borderRadius: 16, padding: "16px 18px", border: "1.5px solid #bbf7d0" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#16a34a", marginBottom: 8 }}>🌱 Trending Niche</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#09090b", marginBottom: 6 }}>{c.trending_niche.name}</p>
          <p style={{ fontSize: 13, color: "#374151", marginBottom: 6, lineHeight: 1.6 }}>{c.trending_niche.why}</p>
          <p style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>📊 {c.trending_niche.signals}</p>
        </div>
      )}

      {/* Add / Drop */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Section icon="✅" label="Add This Month" text={c.add_tactic} accent="#059669" bg="#f0fdf4" border="#a7f3d0" />
        <Section icon="❌" label="Drop This Month" text={c.drop_tactic} accent="#dc2626" bg="#fff1f2" border="#fecdd3" />
      </div>

      {/* Platform changes */}
      {c.platform_changes && (
        <div style={{ background: "#fffbeb", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #fde68a" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b45309", marginBottom: 6 }}>⚠️ Platform Changes</p>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{c.platform_changes}</p>
        </div>
      )}
    </div>
  );
}

function Section({ icon, label, text, accent, bg, border }: {
  icon: string; label: string; text: string; accent: string; bg: string; border: string;
}) {
  return (
    <div style={{ background: bg, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${border}` }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 6 }}>{icon} {label}</p>
      <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.65 }}>{text}</p>
    </div>
  );
}
