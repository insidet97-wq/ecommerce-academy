import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import UserAdBanner from "@/components/UserAdBanner";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 min ISR

export const metadata: Metadata = {
  title: "Blog — First Sale Lab",
  description: "Practical, no-fluff articles on dropshipping, niche selection, ads, and turning ecommerce learners into ecommerce sellers.",
  alternates: { canonical: "https://firstsalelab.com/blog" },
};

type BlogListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
};

async function getPublishedPosts(): Promise<BlogListItem[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <img src="/logo.png" alt="First Sale Lab" decoding="async" style={{ height: 36, width: "auto" }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.4px" }}>First Sale Lab</span>
          </Link>
          <Link href="/quiz" style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", textDecoration: "none" }}>Get started →</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)", padding: "56px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.4) 0%, transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(167,139,250,0.85)", marginBottom: 10 }}>
            First Sale Lab Blog
          </p>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.8px", marginBottom: 12, lineHeight: 1.1, maxWidth: 600, margin: "0 auto 12px" }}>
            Real ecommerce, plainly explained.
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
            Practical articles for complete beginners — niche picking, ads, suppliers, and the math behind a profitable store.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 80px" }}>

        {posts.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 18, padding: "60px 24px", textAlign: "center", border: "1.5px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>📝</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#09090b", marginBottom: 4 }}>Articles coming soon.</p>
            <p style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 22 }}>New posts go up every Wednesday. In the meantime, the course is already live.</p>
            <Link href="/quiz" style={{ display: "inline-block", background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "#fff", fontWeight: 700, fontSize: 13, padding: "11px 24px", borderRadius: 12, textDecoration: "none" }}>
              Build my free roadmap →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(0,0,0,0.06)", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", textDecoration: "none", display: "block", transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.07)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6366f1", marginBottom: 6 }}>
                  {formatDate(post.published_at)}
                </p>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#09090b", letterSpacing: "-0.4px", marginBottom: 6, lineHeight: 1.25 }}>
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6 }}>{post.excerpt}</p>
                )}
                <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", marginTop: 12 }}>Read article →</p>
              </Link>
            ))}
          </div>
        )}

        {/* Ad — shown to free / anonymous users only */}
        <UserAdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT ?? ""} />

      </main>
    </div>
  );
}
