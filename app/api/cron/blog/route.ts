import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/email-helpers";
import { generateBlogPost } from "@/lib/perplexity";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/blog
 *
 * Weekly cron — drafts a new blog post via Groq (admin reviews + publishes).
 * Schedule: every Wednesday at 07:00 UTC.
 *
 * Duplicate prevention: fetches the last 30 titles (drafts + published) and
 * passes them to generateBlogPost as the "avoid this list". The LLM picks a
 * genuinely fresh angle. If somehow the slug still collides (rare), we fall
 * back to a timestamp-suffixed slug to keep the unique constraint satisfied.
 *
 * SQL migration required (run once):
 *   CREATE TABLE blog_posts (
 *     id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     slug         text NOT NULL UNIQUE,
 *     title        text NOT NULL,
 *     excerpt      text,
 *     content      jsonb NOT NULL,
 *     status       text NOT NULL DEFAULT 'draft',
 *     published_at timestamptz,
 *     created_at   timestamptz NOT NULL DEFAULT now()
 *   );
 *   CREATE INDEX blog_posts_status_idx ON blog_posts (status);
 *   CREATE INDEX blog_posts_slug_idx   ON blog_posts (slug);
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();

  try {
    // Fetch existing titles (newest first). The generator uses these as a
    // "do not repeat" list. Both drafts and published posts count — a draft
    // sitting in the queue still represents a topic the team has spoken to.
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("title, slug")
      .order("created_at", { ascending: false })
      .limit(30);

    const existingTitles = (existing ?? []).map(p => p.title).filter(Boolean);
    const existingSlugs  = new Set((existing ?? []).map(p => p.slug));

    const post = await generateBlogPost(undefined, existingTitles);

    // Final defense: if the LLM's slug somehow collides with an existing
    // one, append a short timestamp suffix so the UNIQUE constraint passes.
    const finalSlug = existingSlugs.has(post.slug)
      ? `${post.slug}-${Date.now().toString(36).slice(-5)}`
      : post.slug;

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        slug:    finalSlug,
        title:   post.title,
        excerpt: post.excerpt,
        content: post.content,
        status:  "draft",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, post: data });
  } catch (err) {
    console.error("Cron blog error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
