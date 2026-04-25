"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { resources, CATEGORIES, type Category } from "@/lib/resources";

const INDIGO = "#6366f1";

/* ── Category counts ── */
const COUNTS: Record<string, number> = { All: resources.length };
for (const r of resources) {
  COUNTS[r.category] = (COUNTS[r.category] ?? 0) + 1;
}

/* ── Resource card ── */
function ResourceCard({ name, description, url, emoji, free, freeTier }: {
  name: string; description: string; url: string;
  emoji: string; free: boolean; freeTier?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  function enter() {
    if (!ref.current) return;
    ref.current.style.transform  = "translateY(-2px)";
    ref.current.style.boxShadow  = "0 10px 28px rgba(0,0,0,0.08)";
    ref.current.style.borderColor = "rgba(99,102,241,0.25)";
  }
  function leave() {
    if (!ref.current) return;
    ref.current.style.transform  = "translateY(0)";
    ref.current.style.boxShadow  = "0 1px 4px rgba(0,0,0,0.04)";
    ref.current.style.borderColor = "rgba(0,0,0,0.06)";
  }

  return (
    <div
      ref={ref}
      onMouseEnter={enter}
      onMouseLeave={leave}
      style={{
        background: "#fff", borderRadius: 18,
        border: "1.5px solid rgba(0,0,0,0.06)",
        padding: "20px 20px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: "#f4f4f5",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>
          {emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#09090b", letterSpacing: "-0.2px" }}>{name}</p>
            {free ? (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                background: "#ecfdf5", color: "#16a34a", border: "1px solid #a7f3d0",
              }}>
                Free
              </span>
            ) : freeTier ? (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99,
                background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a",
              }}>
                {freeTier}
              </span>
            ) : (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99,
                background: "#f4f4f5", color: "#71717a",
              }}>
                Paid
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.65, flex: 1, marginBottom: 14 }}>
        {description}
      </p>

      {/* CTA */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 12, fontWeight: 700, color: INDIGO, textDecoration: "none",
          padding: "7px 14px", borderRadius: 9,
          background: "#eef2ff", border: "1px solid #c7d2fe",
          transition: "background 0.15s",
          alignSelf: "flex-start",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#e0e7ff")}
        onMouseLeave={e => (e.currentTarget.style.background = "#eef2ff")}
      >
        Open ↗
      </a>
    </div>
  );
}

/* ── Main page ── */
export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [showFreeOnly,   setShowFreeOnly]   = useState(false);

  const filtered = resources.filter(r => {
    const catMatch  = activeCategory === "All" || r.category === activeCategory;
    const freeMatch = !showFreeOnly || r.free || !!r.freeTier;
    return catMatch && freeMatch;
  });

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: 15, color: "#09090b", textDecoration: "none", letterSpacing: "-0.3px" }}>
            First Sale Lab
          </Link>
          <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: INDIGO, textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
            onMouseLeave={e => (e.currentTarget.style.color = INDIGO)}
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
        padding: "48px 24px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.35) 0%, transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)", marginBottom: 10, textTransform: "uppercase" }}>
            Resource Library
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.7px", marginBottom: 10, lineHeight: 1.2 }}>
            The Tools Pros Actually Use
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
            {resources.length} hand-picked tools and resources — curated for beginners building their first store.
          </p>
          {/* Stats row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 22 }}>
            {[
              { n: resources.filter(r => r.free).length,          label: "Fully free" },
              { n: resources.filter(r => !!r.freeTier).length,    label: "Free tier" },
              { n: CATEGORIES.length - 1,                          label: "Categories" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>{s.n}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 80px" }}>

        {/* Filter row */}
        <div className="fade-up" style={{ marginBottom: 22 }}>
          {/* Category pills — scrollable */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: "6px 13px", borderRadius: 99,
                    border: `1.5px solid ${isActive ? INDIGO : "rgba(0,0,0,0.08)"}`,
                    background: isActive ? INDIGO : "#fff",
                    color: isActive ? "#fff" : "#52525b",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat}
                  <span style={{ marginLeft: 5, opacity: 0.6, fontWeight: 500 }}>
                    {COUNTS[cat] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Free toggle + result count */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 13, color: "#a1a1aa" }}>
              Showing <strong style={{ color: "#09090b" }}>{filtered.length}</strong> resources
            </p>
            <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
              <div
                onClick={() => setShowFreeOnly(p => !p)}
                style={{
                  width: 36, height: 20, borderRadius: 99, position: "relative",
                  background: showFreeOnly ? INDIGO : "#d4d4d8",
                  transition: "background 0.2s", cursor: "pointer", flexShrink: 0,
                }}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3,
                  left: showFreeOnly ? 19 : 3,
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#52525b", userSelect: "none" }}>
                Free &amp; free-tier only
              </span>
            </label>
          </div>
        </div>

        {/* Resource grid */}
        {filtered.length > 0 ? (
          <div className="fade-up-d1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {filtered.map(r => (
              <ResourceCard key={r.id} {...r} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ fontSize: 32, marginBottom: 10 }}>🔍</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#09090b", marginBottom: 4 }}>No resources found</p>
            <p style={{ fontSize: 13, color: "#a1a1aa" }}>Try changing the category or turning off the free filter.</p>
          </div>
        )}

      </main>
    </div>
  );
}
