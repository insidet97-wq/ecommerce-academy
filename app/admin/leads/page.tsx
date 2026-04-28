"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

type Niche = {
  name: string;
  why_fits_you: string;
  ideal_customer: string;
  example_products: string[];
  starter_budget: string;
  difficulty: string;
  growth_signal: string;
};

type Lead = {
  id: string;
  email: string;
  interests: string | null;
  budget: string | null;
  experience: string | null;
  audience: string | null;
  niches: Niche[] | null;
  drip_stage: number;
  created_at: string;
};

const STAGE_LABELS: Record<number, string> = {
  0: "🆕 Just submitted",
  1: "✅ Day 0 sent",
  2: "📨 Day 2 sent",
  3: "📨 Day 5 sent",
  4: "🏁 Drip complete",
};

const STAGE_COLORS: Record<number, string> = {
  0: "#a1a1aa",
  1: "#6366f1",
  2: "#7c3aed",
  3: "#9333ea",
  4: "#16a34a",
};

export default function AdminLeadsPage() {
  const router = useRouter();
  const [leads,    setLeads]    = useState<Lead[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<"all" | "0" | "1" | "2" | "3" | "4">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isAdmin(user.email)) { router.push("/dashboard"); return; }

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/niche-leads", {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (!res.ok) { setError(`Failed to load (${res.status})`); setLoading(false); return; }
      const json = await res.json();
      setLeads(json.leads ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const hay = `${l.email} ${l.interests ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filter !== "all" && String(l.drip_stage) !== filter) return false;
      return true;
    });
  }, [leads, search, filter]);

  const stats = useMemo(() => {
    const byStage: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    leads.forEach(l => { byStage[l.drip_stage] = (byStage[l.drip_stage] ?? 0) + 1; });
    return { total: leads.length, byStage };
  }, [leads]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="text-center"><div className="spinner mx-auto mb-3" /><p style={{ color: "#a1a1aa", fontSize: 14 }}>Loading leads…</p></div>
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
            <Link href="/admin/email"   style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none" }}>Email</Link>
            <Link href="/admin/leads"   style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", textDecoration: "none" }}>Leads</Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#09090b", letterSpacing: "-0.6px", marginBottom: 4 }}>Niche Picker leads</h1>
          <p style={{ fontSize: 13, color: "#a1a1aa" }}>{stats.total} leads · {stats.byStage[1] ?? 0} day-0 · {stats.byStage[2] ?? 0} day-2 · {stats.byStage[3] ?? 0} day-5 · {stats.byStage[4] ?? 0} drip complete</p>
        </div>

        {/* Search + filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input type="text" placeholder="Search by email or interests…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: "1 1 280px", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#09090b", outline: "none", background: "#fff" }}
            onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
            onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { v: "all", label: "All" },
              { v: "0",   label: "🆕 Just submitted" },
              { v: "1",   label: "Day 0" },
              { v: "2",   label: "Day 2" },
              { v: "3",   label: "Day 5" },
              { v: "4",   label: "🏁 Complete" },
            ].map(opt => (
              <button key={opt.v} onClick={() => setFilter(opt.v as typeof filter)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 10,
                  border: `1.5px solid ${filter === opt.v ? "#6366f1" : "#e5e7eb"}`,
                  background: filter === opt.v ? "#6366f1" : "#fff",
                  color:      filter === opt.v ? "#fff"    : "#52525b",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Lead list */}
        {filteredLeads.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(0,0,0,0.06)", padding: "60px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🌱</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>No leads yet</p>
            <p style={{ fontSize: 13, color: "#a1a1aa", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>Visitors who use the Niche Picker at <code>/niche-picker</code> will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredLeads.map(l => {
              const isOpen = expanded === l.id;
              return (
                <div key={l.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", cursor: "pointer" }}
                    onClick={() => setExpanded(isOpen ? null : l.id)}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: `${STAGE_COLORS[l.drip_stage]}22`, color: STAGE_COLORS[l.drip_stage], whiteSpace: "nowrap" }}>
                      {STAGE_LABELS[l.drip_stage] ?? `Stage ${l.drip_stage}`}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#09090b", flex: "1 1 200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.email}</span>
                    <span style={{ fontSize: 12, color: "#71717a", flex: "1 1 200px" }}>{l.interests ?? "—"}</span>
                    <span style={{ fontSize: 11, color: "#a1a1aa", whiteSpace: "nowrap" }}>{new Date(l.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    <span style={{ fontSize: 11, color: "#a1a1aa", whiteSpace: "nowrap" }}>{isOpen ? "▴" : "▾"}</span>
                  </div>

                  {isOpen && (
                    <div style={{ borderTop: "1px solid #f4f4f5", padding: "16px 22px", background: "#fafafa" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 14 }}>
                        <div style={{ background: "#fff", padding: "8px 12px", borderRadius: 8 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 2 }}>Budget</p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#09090b" }}>{l.budget ?? "—"}</p>
                        </div>
                        <div style={{ background: "#fff", padding: "8px 12px", borderRadius: 8 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 2 }}>Experience</p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#09090b" }}>{l.experience ?? "—"}</p>
                        </div>
                        <div style={{ background: "#fff", padding: "8px 12px", borderRadius: 8 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 2 }}>Audience</p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#09090b" }}>{l.audience ?? "—"}</p>
                        </div>
                      </div>
                      {l.niches && l.niches.length > 0 && (
                        <>
                          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>AI-suggested niches</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {l.niches.map((n, i) => (
                              <div key={i} style={{ background: "#fff", padding: "10px 14px", borderRadius: 10, border: "1px solid #e4e4e7" }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>{i + 1}. {n.name}</p>
                                <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.5 }}>{n.why_fits_you}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
