import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // need service role key — not available on edge

export const alt    = "First Sale Lab — Certificate of Completion";
export const size   = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic OG image for /certificate/[userId].
 * Pulls the user's first name + completion date and renders a personalised
 * card. When someone shares their certificate URL on LinkedIn/X, this is
 * what shows up.
 */
export default async function OG({ params }: { params: { userId: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase.from("user_profiles").select("first_name").eq("id", params.userId).single(),
    supabase.from("user_progress").select("module_id, completed_at").eq("user_id", params.userId),
  ]);

  const completedIds = (progress ?? []).map((r: { module_id: number }) => r.module_id);
  const allDone = [1,2,3,4,5,6,7,8,9,10,11,12].every(id => completedIds.includes(id));
  const firstName = profile?.first_name ?? "A First Sale Lab Student";

  const mod12 = (progress ?? []).find((r: { module_id: number; completed_at: string }) => r.module_id === 12);
  const date = mod12?.completed_at
    ? new Date(mod12.completed_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: 350,
            width: 700,
            height: 700,
            background: "radial-gradient(circle, rgba(250,204,21,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Card */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "2px solid rgba(255,255,255,0.12)",
            borderRadius: 36,
            padding: "60px 80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div style={{ fontSize: 88, lineHeight: 1, marginBottom: 16, display: "flex" }}>
            {allDone ? "🏆" : "🎓"}
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(253,224,71,0.9)",
              marginBottom: 24,
              display: "flex",
            }}
          >
            {allDone ? "Certificate of Completion" : "Certificate · In Progress"}
          </div>

          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.55)",
              marginBottom: 14,
              display: "flex",
            }}
          >
            This certifies that
          </div>

          <div
            style={{
              fontSize: 84,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              textAlign: "center",
              marginBottom: 24,
              maxWidth: 1000,
              display: "flex",
              backgroundImage: "linear-gradient(135deg, #fff 0%, #c4b5fd 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {firstName}
          </div>

          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              maxWidth: 900,
              lineHeight: 1.4,
              marginBottom: 32,
              display: "flex",
            }}
          >
            {allDone
              ? "has successfully completed all 12 modules of First Sale Lab"
              : `is working through First Sale Lab — ${completedIds.length} of 12 modules complete`}
          </div>

          {date && (
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.45)", display: "flex" }}>
              Completed {date}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: 30,
              left: 80,
              right: 80,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "flex" }}>
              firstsalelab.com
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#facc15", display: "flex" }}>
              ✨ First Sale Lab
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
