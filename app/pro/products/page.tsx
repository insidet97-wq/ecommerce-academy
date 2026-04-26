"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import type { ProductDrop } from "@/lib/perplexity";

function formatWeek(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function ProProductsPage() {
  const router = useRouter();
  const [drops,   setDrops]   = useState<ProductDrop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Check Pro or Admin
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_pro")
        .eq("id", user.id)
        .single();

      const isPro = profile?.is_pro === true || isAdmin(user.email);
      if (!isPro) { router.push("/upgrade"); return; }

      const { data } = await supabase
        .from("product_drops")
        .select("*")
        .eq("status", "published")
        .order("week_start", { ascending: false })
        .limit(12);

      setDrops(data ?? []);
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

  const latest  = drops[0] ?? null;
  const archive = drops.slice(1);

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
      <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)", padding: "40px 24px 36px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 8 }}>Pro Feature</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.7px", marginBottom: 8 }}>Weekly Product Picks</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", maxWidth: 500 }}>
            5 AI-researched products every week — with real margin math, trending signals, and a ready-to-use ad hook.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px" }}>

        {drops.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#a1a1aa" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>First drop coming soon</p>
            <p style={{ fontSize: 13 }}>Check back Monday — your first weekly product list will be here.</p>
          </div>
        )}

        {latest && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6366f1" }}>Latest Drop</span>
              <span style={{ fontSize: 12, color: "#a1a1aa" }}>Week of {formatWeek(latest.week_start)}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {latest.products.map((p, i) => (
                <ProductCard key={i} product={p} rank={i + 1} />
              ))}
            </div>
          </div>
        )}

        {archive.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 14 }}>Archive</p>
            {archive.map(drop => (
              <details key={drop.id} style={{ marginBottom: 12 }}>
                <summary style={{ cursor: "pointer", background: "#fff", borderRadius: 14, border: "1.5px solid rgba(0,0,0,0.06)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", listStyle: "none", userSelect: "none" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#09090b" }}>Week of {formatWeek(drop.week_start)}</span>
                  <span style={{ fontSize: 12, color: "#a1a1aa" }}>{drop.products.length} products ›</span>
                </summary>
                <div style={{ paddingTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                  {drop.products.map((p, i) => <ProductCard key={i} product={p} rank={i + 1} />)}
                </div>
              </details>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProductCard({ product: p, rank }: { product: ProductDrop["products"][0]; rank: number }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(0,0,0,0.06)", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Rank */}
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{rank}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#09090b" }}>{p.name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#ede9fe", color: "#7c3aed" }}>{p.category}</span>
          </div>
          <p style={{ fontSize: 13, color: "#52525b", lineHeight: 1.6, marginBottom: 10 }}>{p.why_trending}</p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <Stat label="Cost" value={p.aliexpress_cost} color="#16a34a" bg="#f0fdf4" />
            <Stat label="Sell for" value={p.sell_price} color="#2563eb" bg="#eff6ff" />
            <Stat label="Margin" value={`~${p.margin_pct}%`} color="#d97706" bg="#fffbeb" />
          </div>

          {/* Ad hook */}
          <div style={{ background: "#f8f8fb", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Ad Hook</p>
            <p style={{ fontSize: 13, color: "#09090b", fontStyle: "italic" }}>"{p.ad_hook}"</p>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 12, color: "#71717a" }}>🎯 {p.target_audience}</p>
            <a
              href={`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(p.aliexpress_search)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", textDecoration: "none", padding: "5px 12px", borderRadius: 8, background: "#eef2ff", border: "1px solid #c7d2fe" }}
            >
              Find on AliExpress →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, borderRadius: 8, padding: "5px 10px", display: "flex", gap: 5, alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "#a1a1aa", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color }}>{value}</span>
    </div>
  );
}
