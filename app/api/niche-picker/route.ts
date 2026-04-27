import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateNiches, type NichePickerInput } from "@/lib/perplexity";
import { getAdminSupabase, nichePickerDay0HTML } from "@/lib/email-helpers";

export const dynamic = "force-dynamic";

/* Pull a friendly first name from the local part of the email address.
   "abdellah.smith@gmail.com" → "Abdellah" */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || "there";
  const cleaned = local.split(/[._+-]/)[0] || local;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

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
    const cleanedEmail = email.toLowerCase().trim();
    const firstName = nameFromEmail(cleanedEmail);

    // Capture lead with drip_stage = 1 (day-0 email being sent right now)
    const supabase = getAdminSupabase();
    supabase.from("niche_leads").insert({
      email: cleanedEmail,
      interests:  cleaned.interests,
      budget:     cleaned.budget,
      experience: cleaned.experience,
      audience:   cleaned.audience,
      niches,
      drip_stage: 1,
    }).then(({ error }) => {
      if (error) console.error("niche_leads insert error:", error);
    });

    // Send Day-0 email with the niches — fire and forget so we don't block the UI
    const resend = new Resend(process.env.RESEND_API_KEY);
    resend.emails.send({
      from: "First Sale Lab <hello@firstsalelab.com>",
      to: cleanedEmail,
      subject: `${firstName}, here are your 3 ecommerce niches 🎯`,
      html: nichePickerDay0HTML(firstName, niches),
      tags: [
        { name: "type",      value: "niche_day0" },
        { name: "drip_stage", value: "0" },
      ],
    }).catch(err => console.error("Niche day-0 email error:", err));

    return NextResponse.json({ niches });
  } catch (err) {
    console.error("Niche picker error:", err);
    return NextResponse.json({ error: "Failed to generate niches. Please try again." }, { status: 500 });
  }
}
