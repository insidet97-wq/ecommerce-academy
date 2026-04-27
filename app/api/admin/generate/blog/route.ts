import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateBlogPost } from "@/lib/perplexity";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/generate/blog
 * Body (optional): { topic: string }
 *
 * Manually trigger a new blog draft. Admin-only.
 */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const topic = typeof body.topic === "string" && body.topic.trim().length > 0
      ? body.topic.trim().slice(0, 200)
      : undefined;

    const post = await generateBlogPost(topic);

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
    console.error("Admin generate blog error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
