"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";

// The actual log in / sign up / forgot-password card -- extracted out of
// app/login/page.tsx (pure move, no behavior change) so the landing page's
// "Start free" and "Log in" CTAs can render this exact same UI without
// duplicating ~150 lines of state and handlers. `initialMode` lets a caller
// land a visitor directly on signup (e.g. /login?mode=signup) instead of
// always starting on the login tab.
// `next`: where to go after logging in or signing up, instead of the usual
// dashboard/welcome -- only ever a parent invite approval page, so it can't
// be used to bounce someone to an arbitrary address.
export function LoginCard({ initialMode = "login", next }: { initialMode?: "login" | "signup" | "forgot"; next?: string | null }) {
  const safeNext = next && /^\/link\/[A-Za-z0-9_-]+$/.test(next) ? next : null;
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);

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
      if (mode === "signup") track("signup_completed");
      router.push(safeNext ?? (mode === "signup" ? "/welcome" : "/dashboard"));
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  async function submitForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Same confirmation either way, on purpose -- see the route's own
      // comment on why it never reveals whether the email matched an
      // account.
      if (res.ok) {
        setResetRequested(true);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function backToLogin() {
    setMode("login");
    setError("");
    setResetRequested(false);
    setPassword("");
  }

  return (
    <div className="bg-white border border-[#ece9f7] rounded-xl p-7 shadow-[0_1px_2px_rgba(26,26,46,0.04),0_8px_24px_rgba(26,26,46,0.06)]">
      {mode === "forgot" ? (
        <>
          <div className="text-[15px] font-semibold text-ink mb-1">Reset your password</div>
          {resetRequested ? (
            <div className="text-sm text-gray-600 mb-4">
              If an account exists for that email, we&apos;ve sent a link to reset your password. It works for 1
              hour.
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 mb-4">
                Enter your email and we&apos;ll send you a link to set a new password.
              </div>
              <form onSubmit={submitForgotPassword}>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] mb-3.5 text-sm focus:outline-none focus:border-[#6d7fd6]"
                  required
                />
                {error && <div className="text-red-700 text-sm mb-3">{error}</div>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-ink text-white font-semibold text-sm disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}
          <button
            onClick={backToLogin}
            className="w-full text-center text-xs text-gray-400 hover:text-ink transition-colors mt-4"
          >
            &larr; Back to log in
          </button>
        </>
      ) : (
        <>
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm text-gray-700">Password</label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                  }}
                  className="text-xs text-gray-400 hover:text-ink transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
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
        </>
      )}
    </div>
  );
}
