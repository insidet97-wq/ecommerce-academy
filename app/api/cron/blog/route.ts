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
    const post = await generateBlogPost();

    // Ensure slug is unique — append timestamp suffix if collision
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("slug", post.slug)
      .maybeSingle();

    const finalSlug = existing ? `${post.slug}-${Date.now().toString(36).slice(-5)}` : post.slug;

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
