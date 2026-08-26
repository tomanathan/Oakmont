"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auth/${mode === "login" ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(mode === "signup" ? "/welcome" : "/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[420px] mx-auto px-6 py-12 font-sans">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6d7fd6] to-accent flex items-center justify-center text-white text-lg font-bold mx-auto mb-3">
          O
        </div>
        <div className="text-[28px] font-bold text-ink mb-1">Oakmont Study Center</div>
        <div className="text-sm text-gray-500">
          A full 6-month SAT curriculum, built around every official subskill.
        </div>
      </div>
      <div className="bg-white border border-[#ece9f7] rounded-xl p-7 shadow-[0_1px_2px_rgba(26,26,46,0.04),0_8px_24px_rgba(26,26,46,0.06)]">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
              mode === "login" ? "bg-ink text-white border-ink" : "bg-[#f0eff9] text-ink border-[#e0defa]"
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
              mode === "signup" ? "bg-ink text-white border-ink" : "bg-[#f0eff9] text-ink border-[#e0defa]"
            }`}
          >
            Sign up
          </button>
        </div>
        <form onSubmit={submit}>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] mb-3.5 text-sm focus:outline-none focus:border-[#6d7fd6]"
            required
          />
          <label className="block text-sm text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] mb-3.5 text-sm focus:outline-none focus:border-[#6d7fd6]"
            required
            minLength={6}
          />
          {error && <div className="text-red-700 text-sm mb-3">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-ink text-white font-semibold text-sm disabled:opacity-60"
          >
            {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>
      <div className="text-center text-xs text-gray-400 mt-4">
        Your progress is saved automatically and syncs whenever you log back in.
      </div>
    </div>
  );
}
