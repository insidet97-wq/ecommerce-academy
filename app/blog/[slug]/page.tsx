import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { BlogPostContent } from "@/lib/perplexity";

export const dynamic = "force-dynamic";
export const revalidate = 300;

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: BlogPostContent;
  published_at: string | null;
};

async function getPost(slug: string): Promise<BlogPostRow | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, content, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };

  const url = `https://firstsalelab.com/blog/${post.slug}`;
  return {
    title: `${post.title} | First Sale Lab`,
    description: post.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url,
      type: "article",
      publishedTime: post.published_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
    },
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/* Render a paragraph block — splits by double newlines into <p> tags */
function Paragraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} style={{ fontSize: 16, color: "#3f3f46", lineHeight: 1.75, marginBottom: 18 }}>{p}</p>
      ))}
    </>
  );
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const c = post.content;

  // BlogPosting JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.published_at,
    "author": { "@type": "Organization", "name": "First Sale Lab", "url": "https://firstsalelab.com" },
    "publisher": { "@type": "Organization", "name": "First Sale Lab", "url": "https://firstsalelab.com" },
    "mainEntityOfPage": `https://firstsalelab.com/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <img src="/logo.png" alt="First Sale Lab" decoding="async" style={{ height: 36, width: "auto" }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.4px" }}>First Sale Lab</span>
          </Link>
          <Link href="/blog" style={{ fontSize: 13, fontWeight: 500, color: "#6366f1", textDecoration: "none" }}>← Blog</Link>
        </div>
      </nav>

      <article style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 64px" }}>

        {/* Header */}
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6366f1", marginBottom: 14 }}>
          {formatDate(post.published_at)} · ~6 min read
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900, color: "#09090b", letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: 16 }}>
          {post.title}
        </h1>
        {post.excerpt && (
          <p style={{ fontSize: 17, color: "#52525b", lineHeight: 1.6, marginBottom: 32, fontWeight: 400 }}>
            {post.excerpt}
          </p>
        )}

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #e4e4e7, transparent)", marginBottom: 32 }} />

        {/* Body */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(0,0,0,0.06)", padding: "36px 36px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>

          {/* Intro */}
          <Paragraphs text={c.intro} />

          {/* Sections */}
          {c.sections?.map((s, i) => (
            <section key={i} style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#09090b", letterSpacing: "-0.4px", marginBottom: 14, lineHeight: 1.25 }}>
                {s.heading}
              </h2>
              <Paragraphs text={s.body} />
            </section>
          ))}

          {/* Conclusion */}
          {c.conclusion && (
            <section style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #f4f4f5" }}>
              <Paragraphs text={c.conclusion} />
            </section>
          )}
        </div>

        {/* CTA */}
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)", borderRadius: 20, padding: "28px 30px", color: "#fff", marginTop: 24, position: "relative", overflow: "hidden" }}>
          <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fde68a", marginBottom: 10 }}>Ready to start?</p>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 10, letterSpacing: "-0.4px", lineHeight: 1.2 }}>
              Get your personalised ecommerce roadmap.
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 18 }}>
              {c.cta}
            </p>
            <Link href="/quiz" style={{ display: "inline-block", background: "linear-gradient(135deg, #facc15, #f59e0b)", color: "#1c1917", fontWeight: 800, fontSize: 14, padding: "12px 26px", borderRadius: 12, textDecoration: "none", letterSpacing: "-0.2px" }}>
              Build my free plan →
            </Link>
          </div>
        </div>

        {/* Back to blog */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/blog" style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", textDecoration: "none" }}>← More articles</Link>
        </div>

      </article>
    </div>
  );
}
