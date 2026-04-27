"use client";

import { useState } from "react";

export default function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: copied ? "#f0fdf4" : "#fff",
        color: copied ? "#16a34a" : "#09090b",
        fontSize: 13, fontWeight: 700,
        padding: "10px 20px", borderRadius: 10,
        border: copied ? "1.5px solid #bbf7d0" : "1.5px solid #e5e7eb",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {copied ? "✓ Copied!" : "🔗 Copy link"}
    </button>
  );
}
