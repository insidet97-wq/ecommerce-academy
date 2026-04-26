"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import type { ProductDrop, Briefing, Product } from "@/lib/perplexity";

/* ─────────────────────────────────────────────────────────────
   Admin Content Page — review AI-generated drafts, regenerate
   individual products, and publish to Pro members.
   ───────────────────────────────────────────────────────────── */

type Tab = "products" | "briefings";

function formatWeek(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatMonth(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function AdminContentPage() {
  const router = useRouter();
  const [tab,             setTab]             = useState<Tab>("products");
  const [token,           setToken]           = useState<string | null>(null);
  const [drops,           setDrops]           = useState<ProductDrop[]>([]);
  const [briefings,       setBriefings]       = useState<Briefing[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [generating,      setGenerating]      = useState<"products" | "briefing" | null>(null);
  const [publishing,      setPublishing]      = useState<string | null>(null);
  const [regenerating,    setRegenerating]    = useState<string | null>(null); // "dropId-index"

  const load = useCallback(async (tok: string) => {
    const adminSupabase = (await import("@supabase/supabase-js")).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    // Use service-role-level reads by fetching via the admin API routes won't work client-side
    // Instead, use authenticated client — RLS allows admin to read all (add policy below)
    // For now: direct Supabase with anon key + auth header trick via RPC won't work.
    // We'll pass the JWT to a dedicated fetch endpoint OR use the regular client.
    // The simplest approach: fetch all drafts + published via a small API route.
    void adminSupabase; // suppress unused warning

    const [dropsRes, briefingsRes] = await Promise.all([
      fetch("/api/admin/content?type=products", {
        headers: { Authorization: `Bearer ${tok}` },
      }),
      fetch("/api/admin/content?type=briefings", {
        headers: { Authorization: `Bearer ${tok}` },
      }),
    ]);

    if (dropsRes.ok)    setDrops(await dropsRes.json());
    if (briefingsRes.ok) setBriefings(await briefingsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user }, } = await supabase.auth.getUser();
      if (!user || !isAdmin(user.email)) { router.push("/dashboard"); return; }
      const { data: { session } } = await supabase.auth.getSession();
      const tok = session?.access_token ?? null;
      setToken(tok);
      if (tok) load(tok);
    }
    init();
  }, [router, load]);

  async function handleGenerate(type: "products" | "briefing") {
    if (!token || generating) return;
    setGenerating(type);
    try {
      const res = await fetch(`/api/admin/generate/${type}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Generation failed: ${err.error}`);
        return;
      }
      await load(token);
    } finally {
      setGenerating(null);
    }
  }

  async function handlePublishDrop(dropId: string) {
    if (!token || publishing) return;
    setPublishing(dropId);
    try {
      const res = await fetch(`/api/admin/products/${dropId}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { alert("Publish failed"); return; }
      setDrops(prev => prev.map(d => d.id === dropId ? { ...d, status: "published" } : d));
    } finally {
      setPublishing(null);
    }
  }

  async function handlePublishBriefing(briefingId: string) {
    if (!token || publishing) return;
    setPublishing(briefingId);
    try {
      const res = await fetch(`/api/admin/briefing/${briefingId}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { alert("Publish failed"); return; }
      setBriefings(prev => prev.map(b => b.id === briefingId ? { ...b, status: "published" } : b));
    } finally {
      setPublishing(null);
    }
  }

  async function handleRegenerate(dropId: string, index: number) {
    if (!token || regenerating) return;
    const key = `${dropId}-${index}`;
    setRegenerating(key);
    try {
      const res = await fetch(`/api/admin/products/${dropId}/regenerate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index }),
      });
      if (!res.ok) { alert("Regenerate failed"); return; }
      const { product } = await res.json() as { product: Product };
      setDrops(prev =>
        prev.map(d => {
          if (d.id !== dropId) return d;
          const updated = [...d.products];
          updated[index] = product;
          return { ...d, products: updated };
        })
      );
    } finally {
      setRegenerating(null);
    }
  }

  const draftDrops      = drops.filter(d => d.status === "draft");
  const publishedDrops  = drops.filter(d => d.status === "published");
  const draftBriefings  = briefings.filter(b => b.status === "draft");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="text-center"><div className="spinner mx-auto mb-3" /><p style={{ color: "#a1a1aa", fontSize: 14 }}>Loading…</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: 15, color: "#09090b", textDecoration: "none", letterSpacing: "-0.3px" }}>First Sale Lab</Link>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/admin" style={{ fontSize: 13, fontWeight: 500, color: "#71717a", textDecoration: "none", padding: "5px 10px", borderRadius: 8 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f4f4f5")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >Analytics</Link>
            <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}
            >← Dashboard</Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#09090b", letterSpacing: "-0.6px", marginBottom: 4 }}>Content</h1>
          <p style={{ fontSize: 13, color: "#a1a1aa" }}>Review and publish AI-generated drops before they go live to Pro members.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "#f4f4f5", borderRadius: 12, padding: 4, width: "fit-content" }}>
          {(["products", "briefings"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontSize: 13, fontWeight: 600, padding: "7px 18px", borderRadius: 9, border: "none", cursor: "pointer",
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#09090b" : "#71717a",
              boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
              textTransform: "capitalize",
            }}>
              {t === "products"
                ? `📦 Products${draftDrops.length > 0 ? ` (${draftDrops.length})` : ""}`
                : `📋 Briefings${draftBriefings.length > 0 ? ` (${draftBriefings.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* ── PRODUCTS TAB ── */}
        {tab === "products" && (
          <div>
            {/* Generate button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
              <button
                onClick={() => handleGenerate("products")}
                disabled={!!generating}
                style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 12, border: "none", cursor: generating ? "not-allowed" : "pointer", opacity: generating ? 0.7 : 1, boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}
              >
                {generating === "products" ? "Generating… (~30s)" : "⚡ Generate New Drop"}
              </button>
            </div>

            {draftDrops.length === 0 && publishedDrops.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 24px", color: "#a1a1aa" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>No drops yet</p>
                <p style={{ fontSize: 13 }}>Click "Generate New Drop" to create your first weekly product list.</p>
              </div>
            )}

            {/* Draft drops */}
            {draftDrops.map(drop => (
              <DropCard
                key={drop.id}
                drop={drop}
                publishing={publishing === drop.id}
                regenerating={regenerating}
                onPublish={() => handlePublishDrop(drop.id)}
                onRegenerate={(i) => handleRegenerate(drop.id, i)}
              />
            ))}

            {/* Published history */}
            {publishedDrops.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 12 }}>Published</p>
                {publishedDrops.map(drop => (
                  <div key={drop.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #d1fae5", padding: "14px 18px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#09090b" }}>Week of {formatWeek(drop.week_start)}</span>
                      <span style={{ fontSize: 12, color: "#a1a1aa", marginLeft: 10 }}>{drop.products.length} products</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", background: "#dcfce7", padding: "3px 10px", borderRadius: 99 }}>✓ Live</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BRIEFINGS TAB ── */}
        {tab === "briefings" && (
          <div>
            {/* Generate button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
              <button
                onClick={() => handleGenerate("briefing")}
                disabled={!!generating}
                style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 12, border: "none", cursor: generating ? "not-allowed" : "pointer", opacity: generating ? 0.7 : 1, boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}
              >
                {generating === "briefing" ? "Generating… (~30s)" : "⚡ Generate New Briefing"}
              </button>
            </div>

            {briefings.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 24px", color: "#a1a1aa" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>No briefings yet</p>
                <p style={{ fontSize: 13 }}>Click "Generate New Briefing" to create your first monthly briefing.</p>
              </div>
            )}

            {briefings.map(b => (
              <BriefingCard
                key={b.id}
                briefing={b}
                publishing={publishing === b.id}
                onPublish={() => handlePublishBriefing(b.id)}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

/* ── Sub-components ── */

function DropCard({
  drop, publishing, regenerating, onPublish, onRegenerate,
}: {
  drop: ProductDrop;
  publishing: boolean;
  regenerating: string | null;
  onPublish: () => void;
  onRegenerate: (index: number) => void;
}) {
  const isDraft = drop.status === "draft";
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: `1.5px solid ${isDraft ? "#e0e7ff" : "#d1fae5"}`, padding: "20px 22px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#09090b" }}>Week of {formatWeek(drop.week_start)}</span>
          {isDraft && <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#fef3c7", color: "#b45309" }}>Draft</span>}
        </div>
        {isDraft && (
          <button
            onClick={onPublish}
            disabled={publishing}
            style={{ background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", fontWeight: 700, fontSize: 12, padding: "8px 18px", borderRadius: 10, border: "none", cursor: publishing ? "not-allowed" : "pointer", opacity: publishing ? 0.7 : 1 }}
          >
            {publishing ? "Publishing…" : "Publish →"}
          </button>
        )}
      </div>

      {/* Product cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {drop.products.map((p, i) => {
          const regKey = `${drop.id}-${i}`;
          const isRegen = regenerating === regKey;
          return (
            <div key={i} style={{ background: "#f8f8fb", borderRadius: 14, padding: "14px 16px", position: "relative", opacity: isRegen ? 0.5 : 1, transition: "opacity 0.2s" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#09090b" }}>{p.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#ede9fe", color: "#7c3aed" }}>{p.category}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.5, marginBottom: 6 }}>{p.why_trending}</p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>Cost: {p.aliexpress_cost}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb" }}>Sell: {p.sell_price}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#d97706" }}>~{p.margin_pct}% margin</span>
                  </div>
                </div>
                {isDraft && (
                  <button
                    onClick={() => onRegenerate(i)}
                    disabled={!!regenerating}
                    title="Replace with a different AI-generated product"
                    style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1.5px solid #c4b5fd", borderRadius: 8, padding: "5px 10px", cursor: regenerating ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
                  >
                    {isRegen ? "…" : "↺ Swap"}
                  </button>
                )}
              </div>
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 8, marginTop: 4 }}>
                <p style={{ fontSize: 12, color: "#52525b", fontStyle: "italic" }}>"{p.ad_hook}"</p>
                <p style={{ fontSize: 11, color: "#a1a1aa", marginTop: 4 }}>🎯 {p.target_audience}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BriefingCard({
  briefing, publishing, onPublish,
}: {
  briefing: Briefing;
  publishing: boolean;
  onPublish: () => void;
}) {
  const c = briefing.content;
  const isDraft = briefing.status === "draft";
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: `1.5px solid ${isDraft ? "#e0e7ff" : "#d1fae5"}`, padding: "20px 22px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#09090b" }}>{formatMonth(briefing.month)}</span>
          {isDraft && <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#fef3c7", color: "#b45309" }}>Draft</span>}
        </div>
        {isDraft && (
          <button
            onClick={onPublish}
            disabled={publishing}
            style={{ background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", fontWeight: 700, fontSize: 12, padding: "8px 18px", borderRadius: 10, border: "none", cursor: publishing ? "not-allowed" : "pointer", opacity: publishing ? 0.7 : 1 }}
          >
            {publishing ? "Publishing…" : "Publish →"}
          </button>
        )}
      </div>

      {c && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {c.summary && (
            <div style={{ background: "#f8f8fb", borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 4 }}>Summary</p>
              <p style={{ fontSize: 13, color: "#09090b", fontStyle: "italic" }}>{c.summary}</p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <BriefSection label="Meta Ads" text={c.meta_ads} />
            <BriefSection label="TikTok Ads" text={c.tiktok_ads} />
          </div>
          {c.trending_niche && (
            <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "12px 14px", border: "1px solid #bbf7d0" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#16a34a", marginBottom: 4 }}>Trending Niche</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 3 }}>{c.trending_niche.name}</p>
              <p style={{ fontSize: 12, color: "#52525b", marginBottom: 3 }}>{c.trending_niche.why}</p>
              <p style={{ fontSize: 11, color: "#71717a" }}>📊 {c.trending_niche.signals}</p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <BriefSection label="✅ Add This Month" text={c.add_tactic} accent="#059669" />
            <BriefSection label="❌ Drop This Month" text={c.drop_tactic} accent="#dc2626" />
          </div>
          {c.platform_changes && <BriefSection label="Platform Changes" text={c.platform_changes} />}
        </div>
      )}
    </div>
  );
}

function BriefSection({ label, text, accent = "#6366f1" }: { label: string; text: string; accent?: string }) {
  return (
    <div style={{ background: "#f8f8fb", borderRadius: 12, padding: "12px 14px" }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: accent, marginBottom: 5 }}>{label}</p>
      <p style={{ fontSize: 12, color: "#52525b", lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}
