import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import type { Metadata } from "next";
import CopyButton from "./CopyButton";

const SITE_URL = "https://firstsalelab.com";

/* ── Server-side Supabase (service role — bypasses RLS safely) ── */
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/* ── Fetch certificate data ── */
async function getCertificateData(userId: string) {
  const supabase = getAdminSupabase();

  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("first_name")
      .eq("id", userId)
      .single(),
    supabase
      .from("user_progress")
      .select("module_id, completed_at")
      .eq("user_id", userId),
  ]);

  if (!profile) return null;

  const completedIds = (progress ?? []).map((r: { module_id: number }) => r.module_id);
  const allDone = [1,2,3,4,5,6,7,8,9,10,11,12].every(id => completedIds.includes(id));

  const mod12 = (progress ?? []).find(
    (r: { module_id: number; completed_at: string }) => r.module_id === 12
  );
  const completedAt = mod12?.completed_at
    ? new Date(mod12.completed_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return {
    firstName: profile.first_name ?? "A First Sale Lab Student",
    allDone,
    completedAt,
  };
}

/* ── Dynamic OG metadata ── */
export async function generateMetadata(
  { params }: { params: Promise<{ userId: string }> }
): Promise<Metadata> {
  const { userId } = await params;
  const data = await getCertificateData(userId);

  if (!data?.allDone) {
    return { title: "Certificate — First Sale Lab" };
  }

  return {
    title: `${data.firstName}'s Certificate — First Sale Lab`,
    description: `${data.firstName} has completed all 12 modules of First Sale Lab — the complete ecommerce roadmap from zero to first sale.`,
    openGraph: {
      title: `${data.firstName} completed First Sale Lab 🎓`,
      description: "12 modules. Real tasks. One first sale. Certificate of completion.",
      url: `${SITE_URL}/certificate/${userId}`,
      siteName: "First Sale Lab",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${data.firstName} completed First Sale Lab 🎓`,
      description: "12 modules. Real tasks. One first sale.",
    },
  };
}

/* ── Page ── */
export default async function CertificatePage(
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const data = await getCertificateData(userId);
  const certUrl = `${SITE_URL}/certificate/${userId}`;
  const certId  = userId.slice(0, 8).toUpperCase();

  /* ── User not found ── */
  if (!data) {
    return (
      <Shell>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#09090b", marginBottom: 8 }}>Certificate not found</h1>
          <p style={{ fontSize: 14, color: "#a1a1aa", marginBottom: 28 }}>This link may be invalid or the account no longer exists.</p>
          <Link href="/" style={{ fontSize: 14, color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>← Back to First Sale Lab</Link>
        </div>
      </Shell>
    );
  }

  /* ── Not yet earned ── */
  if (!data.allDone) {
    return (
      <Shell>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🔒</p>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#09090b", marginBottom: 8 }}>Not yet earned</h1>
          <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.7, marginBottom: 28 }}>
            {data.firstName} is still working through the course. This certificate will be available once all 12 modules are complete.
          </p>
          <Link href="/" style={{ fontSize: 14, color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>← Back to First Sale Lab</Link>
        </div>
      </Shell>
    );
  }

  /* ── Certificate earned ── */
  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>

      {/* Certificate card */}
      <div style={{
        background: "#fff",
        borderRadius: 24,
        border: "1px solid #e5e7eb",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        maxWidth: 680,
        width: "100%",
        overflow: "hidden",
      }}>

        {/* Top accent bar */}
        <div style={{ height: 6, background: "#6366f1" }} />

        <div style={{ padding: "52px 56px 44px" }}>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 52, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/logo.png" alt="First Sale Lab" style={{ height: 36, width: "auto" }} />
              <span style={{ fontWeight: 800, fontSize: 15, color: "#09090b", letterSpacing: "-0.3px" }}>First Sale Lab</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a1a1aa" }}>
              Certificate of Completion
            </span>
          </div>

          {/* Main content */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 56, marginBottom: 24 }}>🎓</div>

            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6366f1", marginBottom: 18 }}>
              This certifies that
            </p>

            <h1 style={{
              fontSize: 42,
              fontWeight: 900,
              color: "#09090b",
              letterSpacing: "-1px",
              lineHeight: 1.1,
              marginBottom: 24,
            }}>
              {data.firstName}
            </h1>

            <p style={{ fontSize: 16, color: "#52525b", lineHeight: 1.7, maxWidth: 420, margin: "0 auto 6px" }}>
              has successfully completed all 12 modules of
            </p>
            <p style={{ fontSize: 19, fontWeight: 800, color: "#09090b", letterSpacing: "-0.3px", marginBottom: 16 }}>
              First Sale Lab
            </p>
            <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.65, maxWidth: 400, margin: "0 auto" }}>
              The complete ecommerce roadmap — from niche selection and store setup to traffic, paid ads, conversions, and a first sale.
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#f0f0f0", marginBottom: 32 }} />

          {/* Footer details */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 5 }}>Date issued</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#09090b" }}>{data.completedAt}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "#f5f3ff",
                border: "2px solid #ddd6fe",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 6px",
                fontSize: 24,
              }}>
                ✅
              </div>
              <p style={{ fontSize: 10, color: "#a1a1aa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Verified</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 5 }}>Certificate ID</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#09090b", fontFamily: "monospace", letterSpacing: "0.05em" }}>{certId}</p>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div style={{ height: 4, background: "#f5f3ff" }} />
      </div>

      {/* Share section */}
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 14 }}>Share this certificate</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <CopyButton url={certUrl} />
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#0a66c2", color: "#fff",
              fontSize: 13, fontWeight: 700,
              padding: "10px 20px", borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Share on LinkedIn →
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just completed all 12 modules of First Sale Lab 🎓 The complete ecommerce roadmap from zero to first sale.`)}&url=${encodeURIComponent(certUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#09090b", color: "#fff",
              fontSize: 13, fontWeight: 700,
              padding: "10px 20px", borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Share on X →
          </a>
        </div>
      </div>

      <Link href="/" style={{ marginTop: 28, fontSize: 13, color: "#a1a1aa", textDecoration: "none" }}>
        ← firstsalelab.com
      </Link>
    </div>
  );
}

/* ── Shared shell for error states ── */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8fb", padding: "24px" }}>
      {children}
    </div>
  );
}
