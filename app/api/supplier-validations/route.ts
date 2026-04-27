import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * POST /api/supplier-validations
 *
 * Saves a supplier validation for the logged-in user.
 *
 * SQL migration required (run once in Supabase SQL editor):
 *   CREATE TABLE supplier_validations (
 *     id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *     supplier_name text NOT NULL,
 *     supplier_url  text,
 *     inputs        jsonb NOT NULL,
 *     scores        jsonb NOT NULL,
 *     total_score   int NOT NULL,
 *     verdict       text NOT NULL,
 *     notes         text,
 *     created_at    timestamptz NOT NULL DEFAULT now()
 *   );
 *   CREATE INDEX supplier_validations_user_id_idx ON supplier_validations (user_id);
 */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Log in to save" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.supplier_name || !body?.scores || typeof body?.total_score !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabase.from("supplier_validations").insert({
    user_id:       user.id,
    supplier_name: String(body.supplier_name).slice(0, 200),
    supplier_url:  body.supplier_url ? String(body.supplier_url).slice(0, 500) : null,
    inputs:        body.inputs,
    scores:        body.scores,
    total_score:   body.total_score,
    verdict:       String(body.verdict).slice(0, 20),
    notes:         body.notes ? String(body.notes).slice(0, 1000) : null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
