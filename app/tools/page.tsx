"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SupplierValidator from "@/components/SupplierValidator";

/* ── Design tokens ── */
const INDIGO = "#6366f1";
const GRAD   = "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)";

type Tool = "profit" | "validation" | "roas" | "checklist" | "supplier";

/* ════════════════════════════════════════════
   Shared UI primitives
════════════════════════════════════════════ */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, fontWeight: 600, color: "#52525b", marginBottom: 6, letterSpacing: "0.1px" }}>
      {children}
    </p>
  );
}

function NumInput({ label, prefix = "$", value, onChange, placeholder = "0" }: {
  label: string; prefix?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <Label>{label}</Label>
      <div style={{
        display: "flex", alignItems: "center",
        border: `1.5px solid ${focused ? INDIGO : "#e4e4e7"}`,
        borderRadius: 12, overflow: "hidden", background: "#fff",
        transition: "border-color 0.15s",
        boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
      }}>
        <span style={{
          padding: "10px 12px", background: "#f8f8fb",
          fontSize: 13, color: "#71717a", borderRight: "1px solid #e4e4e7", userSelect: "none",
        }}>
          {prefix}
        </span>
        <input
          type="number" min="0" value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            flex: 1, padding: "10px 12px", fontSize: 14, fontWeight: 500,
            border: "none", outline: "none", color: "#09090b", background: "transparent",
          }}
        />
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight = false, positive, negative }: {
  label: string; value: string;
  highlight?: boolean; positive?: boolean; negative?: boolean;
}) {
  const color = positive ? "#16a34a" : negative ? "#dc2626" : highlight ? INDIGO : "#09090b";
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: highlight ? "12px 0" : "9px 0",
      borderBottom: "1px solid #f4f4f5",
    }}>
      <span style={{ fontSize: 13, color: "#71717a" }}>{label}</span>
      <span style={{
        fontSize: highlight ? 19 : 14, fontWeight: highlight ? 800 : 600,
        color, letterSpacing: highlight ? "-0.5px" : "0",
      }}>
        {value}
      </span>
    </div>
  );
}

function CalcButton({ onClick, children, disabled }: {
  onClick: () => void; children: React.ReactNode; disabled?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => {
        if (disabled || !ref.current) return;
        ref.current.style.boxShadow = "0 8px 32px rgba(99,102,241,0.45)";
        ref.current.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={() => {
        if (!ref.current) return;
        ref.current.style.boxShadow = "0 4px 20px rgba(99,102,241,0.28)";
        ref.current.style.transform = "translateY(0)";
      }}
      style={{
        background: disabled ? "#e4e4e7" : GRAD,
        color: disabled ? "#a1a1aa" : "#fff",
        fontWeight: 700, fontSize: 14, width: "100%",
        padding: "13px 28px", borderRadius: 14, border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 4px 20px rgba(99,102,241,0.28)",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
    >
      {children}
    </button>
  );
}

function Verdict({ bg, border, color, children }: {
  bg: string; border: string; color: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 14, padding: "13px 16px", borderRadius: 12, background: bg, border: `1px solid ${border}` }}>
      <p style={{ fontSize: 13, fontWeight: 600, color, lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

/* ════════════════════════════════════════════
   Tool 1 — Profit Calculator
════════════════════════════════════════════ */
function ProfitCalculator() {
  const [cost,     setCost]     = useState("");
  const [price,    setPrice]    = useState("");
  const [shipping, setShipping] = useState("");
  const [fees,     setFees]     = useState("2.9");
  const [units,    setUnits]    = useState("");
  const [result,   setResult]   = useState<{
    profit: number; margin: number; passes3x: boolean;
    revenue: number; monthly: number | null;
  } | null>(null);

  function calculate() {
    const c = parseFloat(cost)  || 0;
    const p = parseFloat(price) || 0;
    const s = parseFloat(shipping) || 0;
    const f = (parseFloat(fees) || 0) / 100;
    const u = parseFloat(units) || 0;
    if (p <= 0) return;
    const totalCost = c + s + p * f;
    const profit    = p - totalCost;
    const margin    = (profit / p) * 100;
    setResult({ profit, margin, passes3x: p >= c * 3, revenue: p, monthly: u > 0 ? profit * u : null });
  }

  return (
    <div>
      <div className="calc-grid" style={{ display: "grid", gap: 12, marginBottom: 12 }}>
        <NumInput label="Product cost (what you pay)" value={cost} onChange={setCost} />
        <NumInput label="Selling price (what you charge)" value={price} onChange={setPrice} />
        <NumInput label="Shipping cost per unit" value={shipping} onChange={setShipping} />
        <NumInput label="Transaction fee" prefix="%" value={fees} onChange={setFees} placeholder="2.9" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <NumInput label="Units per month — optional (for monthly estimate)" prefix="#" value={units} onChange={setUnits} placeholder="50" />
      </div>
      <CalcButton onClick={calculate}>Calculate Profit →</CalcButton>

      {result && (
        <div style={{ marginTop: 20, background: "#f8f8fb", borderRadius: 16, padding: "18px 20px" }}>
          <ResultRow label="Revenue per unit" value={`$${result.revenue.toFixed(2)}`} />
          <ResultRow label="Profit per unit" value={`$${result.profit.toFixed(2)}`} highlight positive={result.profit > 0} negative={result.profit <= 0} />
          <ResultRow label="Profit margin" value={`${result.margin.toFixed(1)}%`} positive={result.margin >= 30} negative={result.margin < 15} />
          <ResultRow label="3X markup rule" value={result.passes3x ? "✅ Passes" : "❌ Fails"} positive={result.passes3x} negative={!result.passes3x} />
          {result.monthly !== null && (
            <ResultRow label="Monthly profit estimate" value={`$${result.monthly.toFixed(0)}`} highlight positive={result.monthly > 0} negative={result.monthly <= 0} />
          )}
          {result.passes3x && result.margin >= 25 ? (
            <Verdict bg="#ecfdf5" border="#a7f3d0" color="#065f46">
              🟢 Solid margin — passes the 3X rule and leaves room to cover ad costs.
            </Verdict>
          ) : result.profit > 0 && result.margin >= 15 ? (
            <Verdict bg="#fffbeb" border="#fde68a" color="#92400e">
              🟡 Marginal — profitable but tight. Reduce costs or raise price before running paid ads.
            </Verdict>
          ) : result.profit > 0 ? (
            <Verdict bg="#fff7ed" border="#fed7aa" color="#9a3412">
              🟠 Too thin — your margin won&apos;t survive ad costs. Renegotiate or reprice first.
            </Verdict>
          ) : (
            <Verdict bg="#fff7f7" border="#fecaca" color="#7f1d1d">
              🔴 Losing money — your costs exceed your selling price. Do not run ads on this yet.
            </Verdict>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   Tool 2 — Product Validation Score
════════════════════════════════════════════ */
const VAL_Q = [
  {
    q: "Is there existing demand? (people already buy similar products)",
    opts: [
      { label: "Yes — I can see competitors selling it", pts: 15 },
      { label: "Maybe — hard to tell",                   pts: 7  },
      { label: "No — I'd be the first",                  pts: 0  },
    ],
  },
  {
    q: "Can you achieve a 3X markup on this product?",
    opts: [
      { label: "Yes — easily",                         pts: 20 },
      { label: "Maybe — with the right supplier",      pts: 10 },
      { label: "No — margins are too tight",           pts: 0  },
    ],
  },
  {
    q: "Is it easy to ship? (under 500g, not fragile, not regulated)",
    opts: [
      { label: "Yes — small, light, simple",              pts: 10 },
      { label: "Somewhat — minor shipping complications", pts: 5  },
      { label: "No — heavy, fragile or restricted",       pts: 0  },
    ],
  },
  {
    q: "Does it solve a real problem or serve a strong passion or hobby?",
    opts: [
      { label: "Strong — obvious pain point or identity purchase", pts: 15 },
      { label: "Somewhat — people want it but don't need it",      pts: 7  },
      { label: "Not really — it's generic",                         pts: 0  },
    ],
  },
  {
    q: "Is your target audience easy to reach on social media?",
    opts: [
      { label: "Yes — active, engaged, easy to target", pts: 15 },
      { label: "Somewhat — takes creativity",            pts: 8  },
      { label: "No — hard to find or not on social",    pts: 0  },
    ],
  },
  {
    q: "Can you make compelling content about this product?",
    opts: [
      { label: "Yes — lots of angles, easy to film/photograph", pts: 15 },
      { label: "Maybe — needs creative work",                    pts: 8  },
      { label: "No — boring or visual content won't work",      pts: 0  },
    ],
  },
  {
    q: "Are there successful competitors already making sales?",
    opts: [
      { label: "Yes — validated market with room to compete", pts: 10 },
      { label: "Unsure — hard to tell",                        pts: 5  },
      { label: "No competitors at all",                        pts: 0  },
    ],
  },
];
const MAX_SCORE = VAL_Q.reduce((s, q) => s + q.opts[0].pts, 0); // 100

function ValidationScore() {
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(VAL_Q.length).fill(null));
  const [score,   setScore]   = useState<number | null>(null);

  function pick(qi: number, pts: number) {
    setAnswers(prev => { const n = [...prev]; n[qi] = pts; return n; });
    setScore(null);
  }

  function calculate() {
    if (answers.some(a => a === null)) return;
    setScore(answers.reduce<number>((s, a) => s + (a ?? 0), 0));
  }

  const allAnswered = answers.every(a => a !== null);

  const verdict = score === null ? null
    : score >= 80 ? { dot: "🟢", label: "Strong product idea",       color: "#065f46",  bg: "#ecfdf5", border: "#a7f3d0", tip: "Your idea checks most boxes. Next step: order a sample and validate with real buyers before buying bulk stock." }
    : score >= 60 ? { dot: "🟡", label: "Promising — dig deeper",    color: "#92400e",  bg: "#fffbeb", border: "#fde68a", tip: "Good foundation, but gaps exist. Address the weak areas before spending money on ads or inventory." }
    : score >= 40 ? { dot: "🟠", label: "Risky — major concerns",    color: "#9a3412",  bg: "#fff7ed", border: "#fed7aa", tip: "Too many unknowns. Consider pivoting to a different product before investing time and money." }
    :               { dot: "🔴", label: "Too many red flags — avoid", color: "#7f1d1d",  bg: "#fff7f7", border: "#fecaca", tip: "This product has critical flaws. Start fresh with a different idea in a different niche." };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 20 }}>
        {VAL_Q.map((q, qi) => (
          <div key={qi}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#09090b", marginBottom: 8, lineHeight: 1.5 }}>
              <span style={{ color: INDIGO, marginRight: 6 }}>{qi + 1}.</span>{q.q}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {q.opts.map((opt, oi) => {
                const sel = answers[qi] === opt.pts;
                return (
                  <button
                    key={oi}
                    onClick={() => pick(qi, opt.pts)}
                    style={{
                      textAlign: "left", padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                      border: `1.5px solid ${sel ? INDIGO : "#e4e4e7"}`,
                      background: sel ? "#eef2ff" : "#fff",
                      fontSize: 13, color: sel ? "#3730a3" : "#3f3f46",
                      fontWeight: sel ? 600 : 400,
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <CalcButton onClick={calculate} disabled={!allAnswered}>
        {allAnswered ? "Get My Score →" : `Answer all ${VAL_Q.length} questions to score`}
      </CalcButton>

      {score !== null && verdict && (
        <div style={{ marginTop: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 100, height: 100, borderRadius: "50%",
              border: `4px solid ${verdict.color}`,
              boxShadow: `0 0 0 8px ${verdict.bg}`,
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 34, fontWeight: 800, color: verdict.color, letterSpacing: "-2px" }}>{score}</span>
            </div>
            <p style={{ fontSize: 11, color: "#a1a1aa" }}>out of {MAX_SCORE}</p>
          </div>
          <div style={{ background: verdict.bg, border: `1.5px solid ${verdict.border}`, borderRadius: 14, padding: "16px 18px" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: verdict.color, marginBottom: 6 }}>{verdict.dot} {verdict.label}</p>
            <p style={{ fontSize: 13, color: verdict.color, opacity: 0.85, lineHeight: 1.65 }}>{verdict.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   Tool 3 — Break-Even ROAS Calculator
════════════════════════════════════════════ */
function ROASCalculator() {
  const [price,    setPrice]    = useState("");
  const [cost,     setCost]     = useState("");
  const [shipping, setShipping] = useState("");
  const [fees,     setFees]     = useState("2.9");
  const [result,   setResult]   = useState<{
    profitPerOrder: number; margin: number; beRoas: number; targetRoas: number;
  } | null>(null);

  function calculate() {
    const p = parseFloat(price) || 0;
    const c = parseFloat(cost)  || 0;
    const s = parseFloat(shipping) || 0;
    const f = (parseFloat(fees) || 0) / 100;
    if (p <= 0) return;
    const totalCosts     = c + s + p * f;
    const profitPerOrder = p - totalCosts;
    const margin         = (profitPerOrder / p) * 100;
    const beRoas         = margin > 0 ? 100 / margin : Infinity;
    setResult({ profitPerOrder, margin, beRoas, targetRoas: beRoas * 1.3 });
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.65, marginBottom: 18, padding: "12px 14px", background: "#f8f8fb", borderRadius: 10 }}>
        <strong style={{ color: "#09090b" }}>ROAS = Revenue ÷ Ad Spend.</strong> Your break-even ROAS is the minimum you need to not lose money on ads. Your <em>target</em> ROAS must be higher — ideally 30%+ above break-even to build real profit.
      </p>

      <div className="calc-grid" style={{ display: "grid", gap: 12, marginBottom: 12 }}>
        <NumInput label="Selling price" value={price} onChange={setPrice} />
        <NumInput label="Product cost (what you pay)" value={cost} onChange={setCost} />
        <NumInput label="Shipping cost per unit" value={shipping} onChange={setShipping} />
        <NumInput label="Transaction fee" prefix="%" value={fees} onChange={setFees} placeholder="2.9" />
      </div>
      <CalcButton onClick={calculate}>Calculate Break-Even ROAS →</CalcButton>

      {result && (
        <div style={{ marginTop: 20, background: "#f8f8fb", borderRadius: 16, padding: "18px 20px" }}>
          <ResultRow label="Profit per order (before ads)" value={`$${result.profitPerOrder.toFixed(2)}`} positive={result.profitPerOrder > 0} negative={result.profitPerOrder <= 0} />
          <ResultRow label="Profit margin" value={`${result.margin.toFixed(1)}%`} />
          <ResultRow label="Break-even ROAS" value={result.beRoas === Infinity ? "N/A" : `${result.beRoas.toFixed(2)}×`} highlight />
          <ResultRow label="Target ROAS (30% above break-even)" value={result.targetRoas === Infinity ? "N/A" : `${result.targetRoas.toFixed(2)}×`} positive />

          {result.beRoas !== Infinity && (
            result.beRoas <= 2 ? (
              <Verdict bg="#ecfdf5" border="#a7f3d0" color="#065f46">
                🟢 Healthy margins. You break even at {result.beRoas.toFixed(2)}× ROAS — achievable on most platforms. Aim for {result.targetRoas.toFixed(2)}× to build meaningful profit.
              </Verdict>
            ) : result.beRoas <= 3 ? (
              <Verdict bg="#fffbeb" border="#fde68a" color="#92400e">
                🟡 Tight margins. You need {result.beRoas.toFixed(2)}× ROAS just to break even. Achievable but leaves little room for error. Focus on strong ad creatives.
              </Verdict>
            ) : (
              <Verdict bg="#fff7f7" border="#fecaca" color="#7f1d1d">
                🔴 Too thin for ads. You&apos;d need {result.beRoas.toFixed(2)}× ROAS to break even — very hard to hit consistently. Reduce product cost or raise your price first.
              </Verdict>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   Tool 4 — Launch Checklist
════════════════════════════════════════════ */
const CL_SECTIONS = [
  {
    title: "Product & Sourcing", emoji: "📦",
    items: [
      "Found at least 2–3 suppliers and compared prices",
      "Product achieves a 3X markup (selling price ÷ cost ≥ 3)",
      "Ordered a sample and verified quality in person",
      "Know my fulfilment method (dropship / 3PL / self-ship)",
      "Calculated all unit costs including shipping and transaction fees",
    ],
  },
  {
    title: "Store Setup", emoji: "🛒",
    items: [
      "Shopify store is live with a custom domain",
      "Homepage, product page and checkout look professional",
      "Product photos are high quality — no blurry or stock images",
      "Have at least 5 reviews or social proof elements",
      "Return and refund policy is written and published",
      "Contact page or support method is set up",
    ],
  },
  {
    title: "Trust & Legal", emoji: "⚖️",
    items: [
      "Privacy policy is published (legally required in most countries)",
      "Terms of service page is live",
      "SSL certificate is active (padlock shows in browser bar)",
      "Business email is set up (not a personal Gmail address)",
    ],
  },
  {
    title: "Marketing Ready", emoji: "📣",
    items: [
      "Dedicated hero product landing page built (not just a listing)",
      "At least 3 pieces of content (video or image) ready to post",
      "Email capture is set up — pop-up or embedded form",
      "Facebook Pixel or TikTok Pixel installed and verified firing",
      "Target customer avatar defined in writing",
    ],
  },
  {
    title: "First Ad Ready", emoji: "📈",
    items: [
      "Ad creative is ready — video or image plus written copy",
      "Target audience researched and defined in ad manager",
      "Daily budget set — can sustain it for at least 7 days",
      "Know my target CPA (cost per acquisition) before launching",
    ],
  },
];
const TOTAL_ITEMS = CL_SECTIONS.reduce((s, sec) => s + sec.items.length, 0);
const CL_KEY = "ea_launch_checklist";

function LaunchChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CL_KEY);
      if (saved) setChecked(JSON.parse(saved));
    } catch { /* noop */ }
  }, []);

  function toggle(key: string) {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(CL_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }

  function reset() {
    setChecked({});
    try { localStorage.removeItem(CL_KEY); } catch { /* noop */ }
  }

  const doneCount = Object.values(checked).filter(Boolean).length;
  const percent   = Math.round((doneCount / TOTAL_ITEMS) * 100);

  return (
    <div>
      {/* Header progress bar */}
      <div style={{ background: "#f8f8fb", borderRadius: 16, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#09090b" }}>
            {doneCount} of {TOTAL_ITEMS} items complete
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: percent === 100 ? "#16a34a" : INDIGO, letterSpacing: "-0.3px" }}>
            {percent === 100 ? "🎉 Done!" : `${percent}%`}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: "#e4e4e7" }}>
          <div style={{
            height: 6, borderRadius: 99,
            background: percent === 100 ? "linear-gradient(90deg, #16a34a, #059669)" : GRAD,
            width: `${percent}%`,
            transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
          }} />
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CL_SECTIONS.map(section => {
          const secDone = section.items.filter((_, i) => checked[`${section.title}-${i}`]).length;
          const secFull = secDone === section.items.length;
          return (
            <div key={section.title} style={{
              background: "#fff", borderRadius: 18,
              border: `1.5px solid ${secFull ? "#a7f3d0" : "rgba(0,0,0,0.06)"}`,
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}>
              <div style={{
                padding: "13px 20px", borderBottom: "1px solid #f4f4f5",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{section.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#09090b" }}>{section.title}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: secFull ? "#16a34a" : "#a1a1aa" }}>
                  {secFull ? "✓ Done" : `${secDone}/${section.items.length}`}
                </span>
              </div>
              <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {section.items.map((item, i) => {
                  const key  = `${section.title}-${i}`;
                  const done = !!checked[key];
                  return (
                    <label key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                      <input
                        type="checkbox" checked={done} onChange={() => toggle(key)}
                        style={{ width: 16, height: 16, marginTop: 2, accentColor: INDIGO, cursor: "pointer", flexShrink: 0 }}
                      />
                      <span style={{
                        fontSize: 13, lineHeight: 1.6,
                        color: done ? "#a1a1aa" : "#3f3f46",
                        textDecoration: done ? "line-through" : "none",
                        transition: "color 0.15s",
                      }}>
                        {item}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {doneCount > 0 && (
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button
            onClick={reset}
            style={{ fontSize: 12, color: "#a1a1aa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Reset checklist
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   Main page
════════════════════════════════════════════ */
const TOOLS_META: { id: Tool; emoji: string; label: string; tagline: string }[] = [
  { id: "profit",     emoji: "💰", label: "Profit Calculator",  tagline: "Is your margin healthy?" },
  { id: "validation", emoji: "🎯", label: "Validation Score",   tagline: "Score your product idea /100" },
  { id: "roas",       emoji: "📈", label: "Break-Even ROAS",    tagline: "Find your ad profit threshold" },
  { id: "checklist",  emoji: "✅", label: "Launch Checklist",   tagline: "24 items before going live" },
  { id: "supplier",   emoji: "🏭", label: "Supplier Validator", tagline: "Score any supplier 0–100" },
];

const VALID_TOOLS: Tool[] = ["profit", "validation", "roas", "checklist", "supplier"];

// useSearchParams must be wrapped in a Suspense boundary in Next.js App Router,
// otherwise the build fails with "useSearchParams() should be wrapped in a
// suspense boundary at page /tools". The wrapper at the bottom of the file
// renders this inner component inside <Suspense>.
function ToolsPageInner() {
  const params = useSearchParams();
  const initial = (params.get("tool") as Tool | null);
  const [active, setActive] = useState<Tool>(
    initial && VALID_TOOLS.includes(initial) ? initial : "profit"
  );
  const meta = TOOLS_META.find(t => t.id === active)!;

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: 15, color: "#09090b", textDecoration: "none", letterSpacing: "-0.3px" }}>
            First Sale Lab
          </Link>
          <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: INDIGO, textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#4338ca")}
            onMouseLeave={e => (e.currentTarget.style.color = INDIGO)}
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
        padding: "48px 24px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.35) 0%, transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)", marginBottom: 10, textTransform: "uppercase" }}>
            Free Tools
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.7px", marginBottom: 10, lineHeight: 1.2 }}>
            Seller Toolkit
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
            Free calculators to validate your product, vet suppliers, price right, and launch with confidence.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "28px 24px 80px" }}>

        {/* Tool selector */}
        <div className="fade-up tool-selector" style={{ display: "grid", gap: 10, marginBottom: 24 }}>
          {TOOLS_META.map(tool => {
            const isActive = active === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActive(tool.id)}
                style={{
                  padding: "13px 8px", borderRadius: 16, cursor: "pointer", textAlign: "center",
                  border: `1.5px solid ${isActive ? INDIGO : "rgba(0,0,0,0.06)"}`,
                  background: isActive ? "#eef2ff" : "#fff",
                  boxShadow: isActive ? "0 0 0 3px rgba(99,102,241,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 5 }}>{tool.emoji}</div>
                <p style={{ fontSize: 12, fontWeight: 700, color: isActive ? "#3730a3" : "#09090b", marginBottom: 2 }}>
                  {tool.label}
                </p>
                <p style={{ fontSize: 10, color: isActive ? "#6366f1" : "#a1a1aa", lineHeight: 1.4 }}>
                  {tool.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Tool panel */}
        <div
          key={active}
          className="fade-up slide-in"
          style={{
            background: "#fff", borderRadius: 22,
            border: "1.5px solid rgba(0,0,0,0.06)",
            padding: "26px 28px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          {/* Panel header */}
          <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: "1px solid #f4f4f5", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{meta.emoji}</span>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#09090b", letterSpacing: "-0.4px" }}>{meta.label}</h2>
              <p style={{ fontSize: 12, color: "#a1a1aa" }}>{meta.tagline}</p>
            </div>
          </div>

          {active === "profit"     && <ProfitCalculator />}
          {active === "validation" && <ValidationScore />}
          {active === "roas"       && <ROASCalculator />}
          {active === "checklist"  && <LaunchChecklist />}
          {active === "supplier"   && <SupplierValidator />}
        </div>

      </main>
    </div>
  );
}

/* Default export: wrap the page in <Suspense> so useSearchParams works
   during static generation. The fallback is a minimal loading state. */
export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fb" }}>
        <div className="spinner" />
      </div>
    }>
      <ToolsPageInner />
    </Suspense>
  );
}
