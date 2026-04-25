"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data.user) await saveQuizResults(data.user.id);
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={heroBg}>
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and access your personalized roadmap.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={heroBg}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <Link href="/" className="text-lg font-bold text-gray-900">Ecommerce Academy</Link>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Create your free account</h1>
            <p className="mt-2 text-gray-500 text-sm">Your personalized roadmap is waiting.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "#6366f1" } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
              {loading ? "Creating account…" : "Create my free account →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "#6366f1" }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
