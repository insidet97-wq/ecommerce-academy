"use client";

/**
 * ModuleQA — AI assistant widget for a specific module.
 *
 * Embeds inside the module page. Student types a question, AI answers
 * using ONLY that module's content as context.
 *
 * Rate-limited per tier:
 *   Free:     3 questions per module per 24h
 *   Pro:      10 questions per module per 24h
 *   Growth:   50 questions per module per 24h (effectively unlimited)
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ModuleQA({ moduleId }: { moduleId: number }) {
  const [question,  setQuestion]  = useState("");
  const [answer,    setAnswer]    = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string>("");
  const [used,      setUsed]      = useState<number | null>(null);
  const [limit,     setLimit]     = useState<number | null>(null);

  async function ask() {
    const q = question.trim();
    if (q.length < 5) return;
    setLoading(true);
    setError("");
    setAnswer(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError("Log in to use the module assistant."); return; }

      const res = await fetch("/api/module-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ moduleId, question: q }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to generate an answer.");
        if (typeof data.limit === "number") setLimit(data.limit);
        return;
      }

      setAnswer(data.answer);
      if (typeof data.used  === "number") setUsed(data.used);
      if (typeof data.limit === "number") setLimit(data.limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate an answer.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setQuestion(""); setAnswer(null); setError("");
  }

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(99,102,241,0.18)", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "16px 22px", background: "linear-gradient(135deg, #f5f3ff, #eef2ff)", borderBottom: "1px solid #ede9fe" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#4338ca", letterSpacing: "-0.2px" }}>Ask the module</p>
            <p style={{ fontSize: 11, color: "#6366f1" }}>AI answers using THIS module&apos;s content as context</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 22px" }}>
        {!answer ? (
          <>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. How do I tell if a niche is too saturated to enter?"
              rows={3}
              maxLength={500}
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: "1.5px solid #e4e4e7",
                fontSize: 13,
                color: "#09090b",
                outline: "none",
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.55,
                background: loading ? "#fafafa" : "#fff",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e4e4e7")}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, flexWrap: "wrap", gap: 8 }}>
              <p style={{ fontSize: 11, color: "#a1a1aa" }}>{question.length}/500 characters</p>
              <button
                onClick={ask}
                disabled={loading || question.trim().length < 5}
                style={{
                  background: loading || question.trim().length < 5 ? "#e4e4e7" : "linear-gradient(135deg, #6366f1, #7c3aed)",
                  color:      loading || question.trim().length < 5 ? "#a1a1aa" : "#fff",
                  fontWeight: 700, fontSize: 13,
                  padding: "9px 20px", borderRadius: 10, border: "none",
                  cursor: loading || question.trim().length < 5 ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Thinking…" : "Ask →"}
              </button>
            </div>
            {error && (
              <p style={{ fontSize: 12, color: "#dc2626", marginTop: 10 }}>⚠ {error}</p>
            )}
          </>
        ) : (
          <>
            <div style={{ background: "#f8f8fb", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#71717a", marginBottom: 4 }}>Your question</p>
              <p style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.55 }}>{question}</p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 6 }}>🤖 Answer</p>
              <div style={{ fontSize: 13, color: "#3f3f46", lineHeight: 1.7 }}>
                {answer.split(/\n\n+/).map((para, i) => (
                  <p key={i} style={{ marginBottom: 10 }}>{para}</p>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{ background: "transparent", border: "1.5px solid #e4e4e7", color: "#52525b", fontWeight: 600, fontSize: 12, padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}
              >
                Ask another question
              </button>
              {used !== null && limit !== null && (
                <p style={{ fontSize: 11, color: "#a1a1aa" }}>{used} / {limit} questions today</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
