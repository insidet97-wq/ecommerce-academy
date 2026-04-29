"use client";

/**
 * GettingStartedChecklist — onboarding checklist that lives on the dashboard.
 *
 * Auto-completes from existing data (no new DB columns):
 *   1. Account created     — always true (you're logged in to see this)
 *   2. Take the quiz       — profile.track !== null
 *   3. Complete Module 1   — progress.includes(1)
 *   4. Reach 3-day streak  — streak_days >= 3
 *   5. Try a tool          — has any ai_tool_log OR supplier_validations row
 *   6. Finish Module 6     — progress.includes(6) (end of free track)
 *
 * Hides itself once 5+ of 6 are done so it doesn't linger after you've
 * graduated past the early-momentum phase.
 */

import Link from "next/link";
import { Icon } from "./Icon";

type Props = {
  hasQuiz:        boolean;
  hasModule1:     boolean;
  hasStreak3:     boolean;
  hasUsedTool:    boolean;
  hasModule6:     boolean;
  /** Total modules completed — used to auto-hide for users past early-momentum. */
  completedCount: number;
  /** Admin flag — admins never see the onboarding checklist. */
  isAdmin?:       boolean;
  trackColor?:    string;
};

type Item = {
  id:          string;
  done:        boolean;
  label:       string;
  description: string;
  cta?:        { text: string; href: string };
};

export default function GettingStartedChecklist(props: Props) {
  const trackColor = props.trackColor ?? "#7c3aed";

  // Hide for admins (internal users, not learners) and for anyone who's
  // already past the early-momentum phase (3+ modules done means they
  // don't need an onboarding nudge anymore — the dashboard's normal
  // "Up next" card is doing that job).
  if (props.isAdmin)              return null;
  if (props.completedCount >= 3)  return null;

  const items: Item[] = [
    {
      id: "account",
      done: true,
      label: "Create your account",
      description: "Welcome — you're all set up.",
    },
    {
      id: "quiz",
      // If they've already completed Module 1, the quiz CTA is moot — they're
      // clearly using the system. Only nudge them about the quiz if they
      // haven't started any module yet.
      done: props.hasQuiz || props.hasModule1,
      label: "Take the quiz",
      description: "Personalises your roadmap and unlocks a starting module.",
      cta: (props.hasQuiz || props.hasModule1) ? undefined : { text: "Start →", href: "/quiz" },
    },
    {
      id: "mod1",
      done: props.hasModule1,
      label: "Complete Module 1",
      description: "20–30 min · sets the foundation for everything after.",
      cta: props.hasModule1 ? undefined : { text: "Open →", href: "/modules/1" },
    },
    {
      id: "streak3",
      done: props.hasStreak3,
      label: "Reach a 3-day streak",
      description: "Log in tomorrow and the day after — momentum compounds.",
    },
    {
      id: "tool",
      done: props.hasUsedTool,
      label: "Try a tool",
      description: "Validate a supplier, write ad copy, or audit a competitor.",
      cta: props.hasUsedTool ? undefined : { text: "Browse →", href: "/tools" },
    },
    {
      id: "mod6",
      done: props.hasModule6,
      label: "Finish Module 6",
      description: "End of the free tier — your store is live with a real product.",
      cta: props.hasModule6 ? undefined : { text: "View modules →", href: "/dashboard#modules" },
    },
  ];

  const doneCount = items.filter(i => i.done).length;
  const total     = items.length;

  // Hide once you're 5/6 done — at that point the checklist has served its purpose.
  if (doneCount >= total - 1) return null;

  const progressPct = Math.round((doneCount / total) * 100);
  const nextItem    = items.find(i => !i.done);

  return (
    <div className="fade-up" style={{ marginBottom: 28 }}>
      <div style={{
        background: "#fff",
        border: `1.5px solid ${trackColor}25`,
        borderRadius: 20,
        padding: "20px 22px",
        boxShadow: `0 2px 14px ${trackColor}10`,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: trackColor, marginBottom: 4, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="target" size={11} strokeWidth={2.5} /> Your first 7 days
            </p>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#09090b", letterSpacing: "-0.3px" }}>
              {nextItem ? `Next up: ${nextItem.label.toLowerCase()}` : "Almost there"}
            </h3>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: trackColor }}>
            {doneCount} / {total}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 99, background: "#f4f4f5", marginBottom: 16 }}>
          <div style={{
            height: 6,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${trackColor}, #7c3aed)`,
            width: `${progressPct}%`,
            transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
          }} />
        </div>

        {/* Items */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((item, i) => (
            <li key={item.id} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "10px 0",
              borderTop: i === 0 ? "none" : "1px solid #f4f4f5",
              opacity: item.done ? 0.6 : 1,
            }}>
              {/* Checkbox icon */}
              <div style={{
                width: 22, height: 22, borderRadius: 99, flexShrink: 0,
                background: item.done ? "#16a34a" : "#fff",
                border: item.done ? "none" : "1.5px solid #e4e4e7",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: 1,
              }}>
                {item.done && <span style={{ color: "#fff", fontSize: 12, fontWeight: 800, lineHeight: 1 }}>✓</span>}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#09090b",
                  marginBottom: 2,
                  textDecoration: item.done ? "line-through" : "none",
                  textDecorationColor: "#a1a1aa",
                }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 11, color: "#a1a1aa", lineHeight: 1.5 }}>
                  {item.description}
                </p>
              </div>

              {/* CTA */}
              {item.cta && (
                <Link href={item.cta.href} style={{
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 10px",
                  borderRadius: 8,
                  textDecoration: "none",
                  background: `${trackColor}15`,
                  color: trackColor,
                  alignSelf: "center",
                }}>
                  {item.cta.text}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
