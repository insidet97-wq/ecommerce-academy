import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { analyzeSupplier, type SupplierAnalysisInput } from "@/lib/perplexity";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/supplier-ai-analysis
 *
 * Pro-only endpoint. Takes the supplier inputs the user filled into the
 * SupplierValidator and returns AI-generated red flags, questions to ask,
 * likely issues, and a verification checklist — tailored to those inputs.
 *
 * Auth required (Bearer token). Pro check happens here on the server so
 * a free user can't bypass the UI gate.
 */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Log in to use AI analysis" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  // Pro / admin gate
  const admin = isAdmin(user.email);
  let isPro = false;
  if (!admin) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_pro")
      .eq("id", user.id)
      .single();
    isPro = profile?.is_pro ?? false;
  }
  if (!admin && !isPro) {
    return NextResponse.json({ error: "AI analysis is a Pro feature.", upgrade: true }, { status: 403 });
  }

  // Validate input
  const body = await request.json().catch(() => null);
  if (!body?.supplier_name || typeof body?.total_score !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const input: SupplierAnalysisInput = {
    supplier_name: String(body.supplier_name).slice(0, 200),
    supplier_url:  body.supplier_url ? String(body.supplier_url).slice(0, 500) : null,
    review_rating: Number(body.review_rating) || 0,
    review_count:  Number(body.review_count)  || 0,
    shipping_days: Number(body.shipping_days) || 0,
    communication: Number(body.communication) || 0,
    quality:       Number(body.quality)       || 0,
    margin_pct:    Number(body.margin_pct)    || 0,
    notes:         body.notes ? String(body.notes).slice(0, 500) : null,
    total_score:   Number(body.total_score)   || 0,
    verdict:       String(body.verdict ?? "risky").slice(0, 20),
  };

  try {
    const analysis = await analyzeSupplier(input);
    return NextResponse.json({ success: true, analysis });
  } catch (err) {
    console.error("Supplier AI analysis error:", err);
    return NextResponse.json({ error: "AI analysis failed. Try again in a moment." }, { status: 500 });
  }
}
