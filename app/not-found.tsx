import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "linear-gradient(135deg, #08080f 0%, #0f0a2e 55%, #150a2e 100%)" }}
    >
      {/* Radial glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(99,102,241,0.18) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative" }}>
        {/* 404 number */}
        <p style={{
          fontSize: 120, fontWeight: 900, letterSpacing: "-6px", lineHeight: 1,
          background: "linear-gradient(135deg, #6366f1, #7c3aed)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}>
          404
        </p>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", marginBottom: 10 }}>
          Page not found
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 340, lineHeight: 1.65, marginBottom: 32 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Head back and keep building.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #6366f1, #7c3aed)",
              color: "#fff", fontWeight: 700, fontSize: 14,
              padding: "12px 28px", borderRadius: 14, textDecoration: "none",
              boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
            }}
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 14,
              padding: "12px 28px", borderRadius: 14, textDecoration: "none",
            }}
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
