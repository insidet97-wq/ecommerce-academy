import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { answerModuleQuestion } from "@/lib/perplexity";
import { getModule } from "@/lib/modules";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/module-qa
 * Body: { moduleId: number, question: string }
 *
 * AI assistant that answers a student's question about a specific module
 * using ONLY the module's content as context (concepts, steps, mistakes).
 *
 * Auth required (any logged-in user). Pro/Growth users get higher rate limits;
 * free users get 3 questions per module per 24h to keep Groq quota safe.
 */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Log in to use the module assistant." }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const moduleId = Number(body?.moduleId);
  const question = String(body?.question ?? "").trim();

  if (!Number.isFinite(moduleId) || moduleId < 1 || moduleId > 24) {
    return NextResponse.json({ error: "Invalid moduleId" }, { status: 400 });
  }
  if (question.length < 5 || question.length > 500) {
    return NextResponse.json({ error: "Question must be 5–500 characters" }, { status: 400 });
  }

  // Tier-aware rate limit (per module per 24h):
  //   free: 3 questions
  //   pro:  10 questions
  //   growth/admin: unlimited (capped at 50 to avoid runaway abuse)
  const admin = isAdmin(user.email);
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_pro, is_growth")
    .eq("id", user.id)
    .single();
  const isGrowth = admin || (profile?.is_growth ?? false);
  const isPro    = isGrowth || (profile?.is_pro ?? false);

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("module_qa_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("module_id", moduleId)
    .gte("created_at", dayAgo);

  const usedToday = count ?? 0;
  const limit     = isGrowth ? 50 : isPro ? 10 : 3;
  if (usedToday >= limit) {
    return NextResponse.json({
      error: `You've used your ${limit} ${isGrowth ? "Scale Lab" : isPro ? "Pro" : "free"} questions for this module today. ${isPro ? "Try again tomorrow." : "Upgrade for higher limits."}`,
      rateLimited: true,
      tier: isGrowth ? "growth" : isPro ? "pro" : "free",
      limit,
    }, { status: 429 });
  }

  // Look up the module content
  const mod = getModule(moduleId);
  if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  try {
    const result = await answerModuleQuestion({
      question,
      module_title:     mod.title,
      module_objective: mod.objective,
      module_concepts:  mod.concepts,
      module_steps:     mod.steps,
      module_mistakes:  mod.mistakes,
    });

    // Log the question (for rate-limiting + admin curiosity / future improvement)
    await supabase.from("module_qa_log").insert({
      user_id:   user.id,
      module_id: moduleId,
      question,
      answer:    result.answer,
    });

    return NextResponse.json({ success: true, answer: result.answer, used: usedToday + 1, limit });
  } catch (err) {
    console.error("Module Q&A error:", err);
    return NextResponse.json({ error: "Couldn't generate an answer. Try rephrasing or wait a moment." }, { status: 500 });
  }
}
