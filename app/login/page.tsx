"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const heroBg = { background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)" };

async function saveQuizResults(userId: string) {
  try {
    const raw = localStorage.getItem("quiz_results");
    if (!raw) return;
    const quiz = JSON.parse(raw);
    await supabase.from("user_profiles").upsert({
      id: userId,
      experience: quiz.experience,
      goal: quiz.goal,
      time_per_week: quiz.time,
      budget: quiz.budget,
      product_idea: quiz.productIdea,
      track: quiz.track,
      start_module: quiz.startModule ?? 1,
    });
    localStorage.removeItem("quiz_results");
  } catch {}
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data.user) await saveQuizResults(data.user.id);
      const next = localStorage.getItem("ea_next");
      if (next) { localStorage.removeItem("ea_next"); router.push(next); }
      else router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={heroBg}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <Link href="/" className="text-lg font-bold text-gray-900">First Sale Lab</Link>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-gray-500 text-sm">Continue your journey to your first sale.</p>
          </div>

          {/* Google sign-in — primary path for new and returning users alike. */}
          <div className="mb-5">
            <GoogleSignInButton label="Continue with Google" onError={msg => setError(msg)} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: "#6366f1" }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-3 rounded-xl transition-opacity disabled:opacity-50 shadow-lg"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
            >
              {loading ? "Logging in…" : "Log in →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/quiz" className="font-semibold hover:underline" style={{ color: "#6366f1" }}>Take the quiz first</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
