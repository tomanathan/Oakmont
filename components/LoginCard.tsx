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
// `googleEnabled`: show "Continue with Google" (hidden until its keys are
// configured). `initialError`: the reason code the Google callback sends
// back when sign-in didn't work.
const GOOGLE_ERRORS: Record<string, string> = {
  google: "Google sign-in didn't work. Please try again, or use your email and password.",
  google_other_account: "This email is already linked to a different Google account. Sign in with that one, or use your password.",
};

export function LoginCard({
  initialMode = "login",
  next,
  googleEnabled = false,
  initialError = null,
}: {
  initialMode?: "login" | "signup" | "forgot";
  next?: string | null;
  googleEnabled?: boolean;
  initialError?: string | null;
}) {
  const safeNext = next && /^\/link\/[A-Za-z0-9_-]+$/.test(next) ? next : null;
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(initialMode);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState((initialError && GOOGLE_ERRORS[initialError]) || "");
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
        body: JSON.stringify(mode === "signup" ? { email, password, firstName } : { email, password }),
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
    <div className="bg-white border border-[#e2d7c1] rounded-xl p-7 shadow-[0_1px_2px_rgba(38,34,24,0.04),0_8px_24px_rgba(38,34,24,0.06)]">
      {mode === "forgot" ? (
        <>
          <div className="text-[15px] font-semibold text-ink mb-1">Reset your password</div>
          {resetRequested ? (
            <div className="text-sm text-stone-600 mb-4">
              If an account exists for that email, we&apos;ve sent a link to reset your password. It works for 1
              hour.
            </div>
          ) : (
            <>
              <div className="text-sm text-stone-500 mb-4">
                Enter your email and we&apos;ll send you a link to set a new password.
              </div>
              <form onSubmit={submitForgotPassword}>
                <label className="block text-sm text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#d5c8ae] mb-3.5 text-sm focus:outline-none focus:border-[#587356]"
                  required
                />
                {error && <div className="text-red-700 text-sm mb-3">{error}</div>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-forest text-white font-semibold text-sm disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}
          <button
            onClick={backToLogin}
            className="w-full text-center text-xs text-stone-500 hover:text-ink transition-colors mt-4"
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
                mode === "login" ? "bg-forest text-white border-ink" : "bg-[#eef3e9] text-ink border-[#d5c8ae]"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
                mode === "signup" ? "bg-forest text-white border-ink" : "bg-[#eef3e9] text-ink border-[#d5c8ae]"
              }`}
            >
              Sign up
            </button>
          </div>
          {googleEnabled && (
            <>
              <a
                href={`/api/auth/google${safeNext ? `?next=${encodeURIComponent(safeNext)}` : ""}`}
                onClick={() => track("google_signin_clicked", { mode })}
                className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#d5c8ae] bg-white py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[#faf6ec]"
              >
                <GoogleG />
                Continue with Google
              </a>
              <div className="my-5 flex items-center gap-3 text-xs text-stone-500" aria-hidden>
                <span className="h-px flex-1 bg-[#e2d7c1]" />
                or with email
                <span className="h-px flex-1 bg-[#e2d7c1]" />
              </div>
            </>
          )}
          <form onSubmit={submit}>
            {mode === "signup" && (
              <>
                <label className="block text-sm text-stone-700 mb-1">First name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="What should we call you?"
                  autoComplete="given-name"
                  maxLength={40}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#d5c8ae] mb-3.5 text-sm focus:outline-none focus:border-[#587356]"
                  required
                />
              </>
            )}
            <label className="block text-sm text-stone-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2.5 rounded-lg border border-[#d5c8ae] mb-3.5 text-sm focus:outline-none focus:border-[#587356]"
              required
            />
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm text-stone-700">Password</label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                  }}
                  className="text-xs text-stone-500 hover:text-ink transition-colors"
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
              className="w-full px-3 py-2.5 rounded-lg border border-[#d5c8ae] mb-3.5 text-sm focus:outline-none focus:border-[#587356]"
              required
              minLength={6}
            />
            {error && <div className="text-red-700 text-sm mb-3">{error}</div>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-forest text-white font-semibold text-sm disabled:opacity-60"
            >
              {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

// Google's own multicolor "G", as its sign-in branding guidelines ask.
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
