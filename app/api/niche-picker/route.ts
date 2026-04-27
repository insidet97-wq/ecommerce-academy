import { NextResponse } from "next/server";
import { generateNiches, type NichePickerInput } from "@/lib/perplexity";
import { getAdminSupabase } from "@/lib/email-helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/niche-picker
 * Body: { input: NichePickerInput, email: string }
 *
 * Public endpoint — no auth. Captures the email into `niche_leads` and
 * returns 3 AI-generated niche suggestions tailored to the user's input.
 *
 * SQL migration required:
 *   CREATE TABLE niche_leads (
 *     id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     email       text NOT NULL,
 *     interests   text,
 *     budget      text,
 *     experience  text,
 *     audience    text,
 *     niches      jsonb,
 *     created_at  timestamptz NOT NULL DEFAULT now()
 *   );
 *   CREATE INDEX niche_leads_email_idx ON niche_leads (email);
 *
 * Rate-limit-style guard: trims input lengths to prevent prompt injection / spam.
 */
export async function POST(req: Request) {
  try {
    const { input, email } = await req.json() as { input: NichePickerInput; email: string };

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!input?.interests || input.interests.length < 2) {
      return NextResponse.json({ error: "Tell us your interests" }, { status: 400 });
    }

    // Trim inputs hard
    const cleaned: NichePickerInput = {
      interests:  String(input.interests).slice(0, 200),
      budget:     String(input.budget    ?? "Under $500").slice(0, 50),
      experience: String(input.experience ?? "Complete beginner").slice(0, 50),
      audience:   String(input.audience   ?? "Mixed").slice(0, 50),
    };

    const niches = await generateNiches(cleaned);

    // Capture lead — fire and forget, don't block the response if Supabase has issues
    const supabase = getAdminSupabase();
    supabase.from("niche_leads").insert({
      email: email.toLowerCase().trim(),
      interests:  cleaned.interests,
      budget:     cleaned.budget,
      experience: cleaned.experience,
      audience:   cleaned.audience,
      niches,
    }).then(({ error }) => {
      if (error) console.error("niche_leads insert error:", error);
    });

    return NextResponse.json({ niches });
  } catch (err) {
    console.error("Niche picker error:", err);
    return NextResponse.json({ error: "Failed to generate niches. Please try again." }, { status: 500 });
  }
}
