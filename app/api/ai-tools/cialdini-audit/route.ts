import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auditCialdini } from "@/lib/perplexity";
import { gateAITool, logAITool } from "@/lib/ai-tool-gate";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai-tools/cialdini-audit
 * Body: { url: string }
 *
 * Growth-tier exclusive (Module 19 fit). Fetches the user's URL via Gemini's
 * url_context tool and scores it against Cialdini's 6 principles.
 *
 * URL validation mirrors /api/store-autopsy: blocks non-http(s) and private
 * IP ranges so the tool can never be used to probe internal networks even
 * if Gemini's behaviour changes.
 */
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const gate  = await gateAITool(supabase, token, "cialdini_audit");
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, upgrade: gate.upgrade, rateLimited: gate.rateLimited, tier: gate.tier, limit: gate.limit },
      { status: gate.status },
    );
  }

  if (gate.tier !== "growth") {
    return NextResponse.json(
      { error: "Cialdini Audit is a Scale Lab exclusive. Upgrade from Pro to Scale Lab to unlock.", upgrade: true, tier: gate.tier },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body?.url) {
    return NextResponse.json({ error: "Paste the URL of your product or landing page" }, { status: 400 });
  }

  const rawUrl = String(body.url).trim();
  // URL validation — same defensive checks as Store Autopsy
  try {
    const u = new URL(rawUrl);
    if (!["http:", "https:"].includes(u.protocol)) throw new Error("bad protocol");

    const host = u.hostname.toLowerCase();
    const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254", "metadata.google.internal"];
    if (blocked.includes(host)) throw new Error("private host");

    const ipv4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (ipv4) {
      const [, a, b] = ipv4.map(Number);
      const isPrivate =
        a === 10 ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        a === 127 || a === 0 ||
        a >= 224;
      if (isPrivate) throw new Error("private IPv4 range");
    }
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid public URL (must start with https:// and point to a public domain)" }, { status: 400 });
  }

  const input = { url: rawUrl.slice(0, 500) };

  try {
    const audit = await auditCialdini(input);
    await logAITool(supabase, gate.user.id, "cialdini_audit", input, audit);
    return NextResponse.json({ success: true, audit, used: gate.used + 1, limit: gate.limit, tier: gate.tier });
  } catch (err) {
    console.error("Cialdini audit error:", err);
    return NextResponse.json({ error: "Couldn't audit page. Try again in a moment." }, { status: 500 });
  }
}
