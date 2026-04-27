"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";

type User = {
  id: string;
  email: string;
  created_at: string;
  first_name: string | null;
  is_pro: boolean;
  streak_days: number;
  last_active: string | null;
  track: string | null;
  goal: string | null;
  stripe_customer_id: string | null;
  completions: number;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysSince(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users,    setUsers]    = useState<User[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<"all" | "pro" | "free" | "active" | "inactive">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user, session } } = await supabase.auth.getUser().then(async ({ data }) => {
        const { data: sessionData } = await supabase.auth.getSession();
        return { data: { user: data.user, session: sessionData.session } };
      });

      if (!user || !isAdmin(user.email)) { router.push("/dashboard"); return; }
      if (!session?.access_token) { setError("No session"); setLoading(false); return; }

      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        setError(`Failed to load users (${res.status})`);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setUsers(json.users ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  /* Filtered + searched view */
  const filteredUsers = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    return users.filter(u => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const hay = `${u.email} ${u.first_name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // Filter
      if (filter === "pro" && !u.is_pro) return false;
      if (filter === "free" && u.is_pro) return false;
      if (filter === "active" && (!u.last_active || u.last_active < weekAgoStr)) return false;
      if (filter === "inactive" && u.last_active && u.last_active >= weekAgoStr) return false;
      // unused but kept to silence the compiler
      void today;
      return true;
    });
  }, [users, search, filter]);

  const stats = useMemo(() => {
    const total = users.length;
    const pro   = users.filter(u => u.is_pro).length;
    const free  = total - pro;
    return { total, pro, free };
  }, [users]);

  async function togglePro(user: User) {
    if (updating) return;
    const next = !user.is_pro;
    const verb = next ? "grant" : "revoke";
    if (!confirm(`Are you sure you want to ${verb} Pro for ${user.email}?`)) return;

    setUpdating(user.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No session");

      const res = await fetch(`/api/admin/users/${user.id}/pro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_pro: next }),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);

      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, is_pro: next } : u)));
    } catch (err) {
      alert(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="text-center"><div className="spinner mx-auto mb-3" /><p style={{ color: "#a1a1aa", fontSize: 14 }}>Loading users…</p></div>
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
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <img src="/logo.png" alt="First Sale Lab" style={{ height: 36, width: "auto" }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.4px" }}>First Sale Lab</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", marginLeft: 4 }}>Admin</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/admin"           style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none" }}>Analytics</Link>
            <Link href="/admin/content"   style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none" }}>Content</Link>
            <Link href="/admin/users"     style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", textDecoration: "none" }}>Users</Link>
            <Link href="/dashboard"       style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}>← Dashboard</Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#09090b", letterSpacing: "-0.6px", marginBottom: 4 }}>Users</h1>
          <p style={{ fontSize: 13, color: "#a1a1aa" }}>{stats.total} total · {stats.pro} Pro · {stats.free} free</p>
        </div>

        {/* Search + filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by email or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: "1 1 280px", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#09090b", outline: "none", background: "#fff" }}
            onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
            onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { v: "all",      label: "All" },
              { v: "pro",      label: "✨ Pro" },
              { v: "free",     label: "Free" },
              { v: "active",   label: "Active 7d" },
              { v: "inactive", label: "Inactive 7d+" },
            ].map(opt => (
              <button key={opt.v}
                onClick={() => setFilter(opt.v as typeof filter)}
                style={{
                  fontSize: 12, fontWeight: 600,
                  padding: "8px 14px", borderRadius: 10,
                  border: "1.5px solid",
                  borderColor: filter === opt.v ? "#6366f1" : "#e5e7eb",
                  background:  filter === opt.v ? "#6366f1" : "#fff",
                  color:       filter === opt.v ? "#fff"    : "#52525b",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(0,0,0,0.06)", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8f8fb", borderBottom: "1.5px solid #e5e7eb" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", whiteSpace: "nowrap" }}>User</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", whiteSpace: "nowrap" }}>Progress</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", whiteSpace: "nowrap" }}>Streak</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", whiteSpace: "nowrap" }}>Last active</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", whiteSpace: "nowrap" }}>Joined</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", whiteSpace: "nowrap" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#a1a1aa", fontSize: 13 }}>
                      No users match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f4f4f5" }}>
                      {/* User */}
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#09090b" }}>{u.first_name || "—"}</p>
                        <p style={{ fontSize: 12, color: "#71717a" }}>{u.email}</p>
                        {u.track && (
                          <p style={{ fontSize: 11, color: "#a1a1aa", marginTop: 2 }}>{u.track}</p>
                        )}
                      </td>
                      {/* Status */}
                      <td style={{ padding: "12px 16px" }}>
                        {u.is_pro ? (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "linear-gradient(135deg, #facc15, #f59e0b)", color: "#1c1917", whiteSpace: "nowrap" }}>
                            ✨ Pro
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: "#f4f4f5", color: "#71717a", whiteSpace: "nowrap" }}>
                            Free
                          </span>
                        )}
                        {u.stripe_customer_id && (
                          <p style={{ fontSize: 10, color: "#a1a1aa", marginTop: 4 }}>Stripe ✓</p>
                        )}
                      </td>
                      {/* Progress */}
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#09090b" }}>{u.completions}/12</p>
                        <div style={{ height: 4, borderRadius: 99, background: "#f4f4f5", marginTop: 4, width: 80 }}>
                          <div style={{ height: 4, borderRadius: 99, background: "linear-gradient(90deg, #6366f1, #7c3aed)", width: `${(u.completions / 12) * 100}%` }} />
                        </div>
                      </td>
                      {/* Streak */}
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        {u.streak_days > 0 ? (
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#ea580c" }}>🔥 {u.streak_days}d</span>
                        ) : (
                          <span style={{ fontSize: 12, color: "#a1a1aa" }}>—</span>
                        )}
                      </td>
                      {/* Last active */}
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#71717a", whiteSpace: "nowrap" }}>{daysSince(u.last_active)}</td>
                      {/* Joined */}
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#71717a", whiteSpace: "nowrap" }}>{formatDate(u.created_at)}</td>
                      {/* Action */}
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => togglePro(u)}
                          disabled={updating === u.id}
                          style={{
                            fontSize: 11, fontWeight: 700,
                            padding: "6px 12px", borderRadius: 8,
                            border: "1.5px solid",
                            borderColor: u.is_pro ? "#fecaca" : "#c4b5fd",
                            background:  u.is_pro ? "#fff5f5" : "#f5f3ff",
                            color:       u.is_pro ? "#dc2626" : "#7c3aed",
                            cursor: updating === u.id ? "not-allowed" : "pointer",
                            opacity: updating === u.id ? 0.5 : 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {updating === u.id ? "…" : u.is_pro ? "Revoke Pro" : "Grant Pro"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ fontSize: 11, color: "#a1a1aa", marginTop: 16, lineHeight: 1.6 }}>
          ⓘ Granting/revoking Pro here does not touch Stripe. If a user has an active Stripe subscription and you revoke Pro, the next webhook will overwrite this. Cancel the subscription in the Stripe dashboard for permanent revoke.
        </p>

      </main>
    </div>
  );
}
