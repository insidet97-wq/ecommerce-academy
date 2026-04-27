"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: { intro: string; sections: { heading: string; body: string }[]; conclusion: string; cta: string };
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts,      setPosts]      = useState<Post[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error,      setError]      = useState("");
  const [topic,      setTopic]      = useState("");
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [busy,       setBusy]       = useState<string | null>(null);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdmin(user.email)) { router.push("/dashboard"); return; }

    // Use admin API endpoint (service role) — anon key is blocked by RLS on blog_posts
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { setLoading(false); return; }

    const res = await fetch("/api/admin/blog", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const json = await res.json();
      setPosts(json.posts ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No session");

      const res = await fetch("/api/admin/generate/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(topic.trim() ? { topic: topic.trim() } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generate failed");
      setTopic("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setGenerating(false);
    }
  }

  async function publish(post: Post) {
    if (!confirm(`Publish "${post.title}"?\nIt will appear at /blog/${post.slug}.`)) return;
    setBusy(post.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/blog/${post.id}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Publish failed");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(null);
    }
  }

  async function discard(post: Post) {
    if (!confirm(`Permanently delete "${post.title}"?`)) return;
    setBusy(post.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/blog/${post.id}/publish`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="text-center"><div className="spinner mx-auto mb-3" /><p style={{ color: "#a1a1aa", fontSize: 14 }}>Loading blog…</p></div>
      </div>
    );
  }

  const drafts    = posts.filter(p => p.status === "draft");
  const published = posts.filter(p => p.status === "published");

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <img src="/logo.png" alt="First Sale Lab" decoding="async" style={{ height: 36, width: "auto" }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.4px" }}>First Sale Lab</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", marginLeft: 4 }}>Admin</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/admin"         style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none" }}>Analytics</Link>
            <Link href="/admin/content" style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none" }}>Content</Link>
            <Link href="/admin/users"   style={{ fontSize: 13, fontWeight: 500, color: "#52525b", textDecoration: "none" }}>Users</Link>
            <Link href="/admin/blog"    style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", textDecoration: "none" }}>Blog</Link>
            <Link href="/dashboard"     style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}>← Dashboard</Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#09090b", letterSpacing: "-0.6px", marginBottom: 4 }}>Blog</h1>
          <p style={{ fontSize: 13, color: "#a1a1aa" }}>{drafts.length} draft{drafts.length === 1 ? "" : "s"} · {published.length} published · auto-drafts every Wednesday</p>
        </div>

        {/* Generate */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(0,0,0,0.06)", padding: "20px 22px", marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>⚡ Generate a new draft</p>
          <p style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 12 }}>Optionally suggest a topic. Leave blank to let AI pick from the topic pool.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Optional topic — e.g. 'How to validate a product in one weekend'"
              style={{ flex: "1 1 280px", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, color: "#09090b", outline: "none" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
            <button
              onClick={generate}
              disabled={generating}
              style={{ background: generating ? "#e4e4e7" : "linear-gradient(135deg, #6366f1, #7c3aed)", color: generating ? "#a1a1aa" : "#fff", fontWeight: 700, fontSize: 13, padding: "11px 22px", borderRadius: 10, border: "none", cursor: generating ? "not-allowed" : "pointer" }}
            >
              {generating ? "Generating…" : "⚡ Generate Now"}
            </button>
          </div>
          {error && (
            <p style={{ fontSize: 12, color: "#dc2626", marginTop: 10 }}>⚠ {error}</p>
          )}
        </div>

        {/* Drafts */}
        <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 10 }}>
          Drafts ({drafts.length})
        </h2>
        {drafts.length === 0 ? (
          <p style={{ fontSize: 13, color: "#a1a1aa", padding: "20px 24px", background: "#fff", borderRadius: 14, border: "1.5px solid rgba(0,0,0,0.06)", marginBottom: 28 }}>
            No drafts. Click &ldquo;⚡ Generate Now&rdquo; above or wait for Wednesday&apos;s cron.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {drafts.map(post => {
              const isOpen = expanded === post.id;
              return (
                <div key={post.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(99,102,241,0.2)", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 4 }}>Draft · created {formatDate(post.created_at)}</p>
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#09090b", letterSpacing: "-0.3px", marginBottom: 4 }}>{post.title}</p>
                        {post.excerpt && <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.5 }}>{post.excerpt}</p>}
                        <p style={{ fontSize: 11, color: "#a1a1aa", marginTop: 4 }}>/blog/{post.slug}</p>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={() => setExpanded(isOpen ? null : post.id)}
                          style={{ fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", color: "#52525b", cursor: "pointer", whiteSpace: "nowrap" }}
                        >{isOpen ? "Hide" : "Preview"}</button>
                        <button onClick={() => discard(post)} disabled={busy === post.id}
                          style={{ fontSize: 12, fontWeight: 700, padding: "7px 12px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fff5f5", color: "#dc2626", cursor: busy === post.id ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: busy === post.id ? 0.5 : 1 }}
                        >Discard</button>
                        <button onClick={() => publish(post)} disabled={busy === post.id}
                          style={{ fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #16a34a, #059669)", color: "#fff", cursor: busy === post.id ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: busy === post.id ? 0.5 : 1 }}
                        >{busy === post.id ? "…" : "Publish →"}</button>
                      </div>
                    </div>
                  </div>

                  {/* Preview body */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid #f4f4f5", padding: "16px 22px", background: "#fafafa", maxHeight: 480, overflowY: "auto" }}>
                      <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.7, marginBottom: 14, whiteSpace: "pre-wrap" }}>{post.content.intro}</p>
                      {post.content.sections?.map((s, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#09090b", marginBottom: 6 }}>{s.heading}</p>
                          <p style={{ fontSize: 13, color: "#52525b", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{s.body}</p>
                        </div>
                      ))}
                      {post.content.conclusion && (
                        <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.65, fontStyle: "italic", paddingTop: 10, borderTop: "1px solid #e4e4e7" }}>{post.content.conclusion}</p>
                      )}
                      {post.content.cta && (
                        <div style={{ marginTop: 12, padding: 12, background: "#eef2ff", borderRadius: 8, border: "1px solid #c7d2fe" }}>
                          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4338ca", marginBottom: 4 }}>CTA</p>
                          <p style={{ fontSize: 12, color: "#3730a3", lineHeight: 1.6 }}>{post.content.cta}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Published */}
        <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 10 }}>
          Published ({published.length})
        </h2>
        {published.length === 0 ? (
          <p style={{ fontSize: 13, color: "#a1a1aa", padding: "20px 24px", background: "#fff", borderRadius: 14, border: "1.5px solid rgba(0,0,0,0.06)" }}>
            No published posts yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {published.map(post => (
              <div key={post.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(0,0,0,0.06)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#09090b" }}>{post.title}</p>
                  <p style={{ fontSize: 11, color: "#a1a1aa" }}>Published {formatDate(post.published_at)} · /blog/{post.slug}</p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Link href={`/blog/${post.slug}`} target="_blank"
                    style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", color: "#52525b", textDecoration: "none", whiteSpace: "nowrap" }}
                  >View ↗</Link>
                  <button onClick={() => discard(post)} disabled={busy === post.id}
                    style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fff5f5", color: "#dc2626", cursor: busy === post.id ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
                  >Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
