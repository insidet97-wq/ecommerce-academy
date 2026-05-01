"use client";

/**
 * /auth/callback — landing page after a Google OAuth round-trip.
 *
 * Flow:
 *   1. User clicks "Continue with Google" on /login or /signup
 *   2. Supabase redirects to Google's consent screen
 *   3. Google approves → redirects back HERE with auth tokens in the URL hash
 *   4. Supabase JS auto-parses the hash and stores the session in localStorage
 *   5. This page waits for the session, then runs first-time-user setup if it's
 *      a brand-new account (no user_profiles row yet) and forwards to /dashboard
 *
 * First-time-user setup (only runs once per user):
 *   - Persist quiz_results from localStorage to user_profiles (track + start_module)
 *   - Set first_name from Google profile (given_name → name → empty)
 *   - Capture referral if ea_referral_code in localStorage
 *   - Send welcome email via /api/send-welcome
 *
 * If something goes wrong, we show a clear error and a Try Again button rather
 * than spinning forever — the user always has a way out.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const heroBg = { background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)" };

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function complete() {
      try {
        // Step 1 — Wait for Supabase to finish parsing the auth tokens from the
        // URL hash and surface the session. This usually completes within a tick
        // but can take a moment; we poll via getSession().
        const session = await waitForSession();
        if (cancelled) return;
        if (!session?.user) {
          setErrorMsg("Couldn't complete sign-in. Please try again.");
          setStatus("error");
          return;
        }
        const user = session.user;

        // Step 2 — Detect first-time user. The user_profiles row only exists if
        // they've signed up before (password signup flow upserts it; OAuth path
        // is what we're handling now).
        const { data: existingProfile } = await supabase
          .from("user_profiles")
          .select("id, first_name")
          .eq("id", user.id)
          .maybeSingle();

        const isFirstTime = !existingProfile;

        if (isFirstTime) {
          // Supabase stores OAuth profile fields in two places depending on
          // provider + version: `user.user_metadata` and the per-provider
          // `user.identities[].identity_data`. Try both, with a chain of
          // common name keys, before giving up.
          const meta: Record<string, unknown>  = (user.user_metadata ?? {}) as Record<string, unknown>;
          const ident: Record<string, unknown> = (user.identities?.[0]?.identity_data ?? {}) as Record<string, unknown>;

          const asString  = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
          const firstWord = (v: unknown): string => asString(v).split(/\s+/)[0] ?? "";

          const firstName: string =
            asString (meta.given_name)   ||
            asString (ident.given_name)  ||
            firstWord(meta.full_name)    ||
            firstWord(ident.full_name)   ||
            firstWord(meta.name)         ||
            firstWord(ident.name)        ||
            "";

          // Diagnostic so we can see what Google actually sent if firstName
          // is still empty after all fallbacks. Safe to log — no secrets.
          if (!firstName) {
            console.warn("[auth/callback] empty firstName after fallbacks:", {
              user_metadata: meta,
              identity_data: ident,
            });
          }

          // Pull quiz results from localStorage if the user took the quiz before signing in
          let quizFields: Record<string, unknown> = {};
          try {
            const raw = localStorage.getItem("quiz_results");
            if (raw) {
              const quiz = JSON.parse(raw);
              quizFields = {
                experience:    quiz.experience,
                goal:          quiz.goal,
                time_per_week: quiz.time,
                budget:        quiz.budget,
                product_idea:  quiz.productIdea,
                track:         quiz.track,
                start_module:  quiz.startModule ?? 1,
              };
              localStorage.removeItem("quiz_results");
            }
          } catch { /* swallow — quiz pickup is best-effort */ }

          // Upsert the profile row. Use service-role bypass via the dashboard
          // pattern? No — anon key is fine because RLS allows inserting one's
          // own row (default Supabase policy). If the row exists already
          // (race), the conflict on id will cause the listed fields to update,
          // not create a duplicate.
          await supabase
            .from("user_profiles")
            .upsert({ id: user.id, first_name: firstName, ...quizFields }, { onConflict: "id" });

          // Capture referral if they came in via /quiz?ref=CODE
          try {
            const referralCode = localStorage.getItem("ea_referral_code");
            if (referralCode && session.access_token) {
              fetch("/api/referrals/track", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ referralCode }),
              }).then(() => {
                try { localStorage.removeItem("ea_referral_code"); } catch {}
              }).catch(() => {});
            }
          } catch {}

          // Send welcome email — fire-and-forget, doesn't block the redirect.
          // Surface failures to the console so they don't disappear silently.
          if (user.email && session.access_token) {
            const startModule = (quizFields.start_module as number) ?? 1;
            fetch("/api/send-welcome", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                firstName,
                email: user.email,
                startModule,
                userId: user.id,
              }),
            })
              .then(async res => {
                if (!res.ok) {
                  const body = await res.text().catch(() => "");
                  console.error("[auth/callback] welcome email failed:", res.status, body);
                }
              })
              .catch(err => console.error("[auth/callback] welcome email error:", err));
          }
        }

        // Step 3 — Redirect. Honor `ea_next` if the user was sent here from
        // a deep link (e.g. trying to open /modules/7 while logged out).
        const next = (typeof window !== "undefined" && localStorage.getItem("ea_next")) || null;
        if (next) {
          try { localStorage.removeItem("ea_next"); } catch {}
          router.replace(next);
        } else {
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("auth/callback error:", err);
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : "Sign-in failed");
          setStatus("error");
        }
      }
    }

    complete();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={heroBg}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
          <Link href="/" className="text-lg font-bold text-gray-900">First Sale Lab</Link>

          {status === "working" && (
            <>
              <div className="spinner mx-auto my-6" />
              <h1 className="text-lg font-bold text-gray-900 mb-2">Finishing sign-in…</h1>
              <p className="text-gray-500 text-sm">Just a moment — we&apos;re setting up your account.</p>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ fontSize: 36, marginTop: 14, marginBottom: 8 }}>⚠</div>
              <h1 className="text-lg font-bold text-gray-900 mb-2">Sign-in didn&apos;t complete</h1>
              <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
              <Link href="/login"
                className="inline-block w-full text-center text-white font-bold py-3 rounded-xl shadow-lg"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
              >
                Try again →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Wait up to ~5 seconds for supabase.auth to surface a session. The hash-token
 * parser runs synchronously on init but the session may not be available on
 * the very first read; we poll a few times before giving up.
 */
async function waitForSession() {
  for (let i = 0; i < 25; i++) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session;
    await new Promise(r => setTimeout(r, 200));
  }
  return null;
}
