"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { GoogleButton, OrWithEmail } from "@/components/GoogleButton";

const WHAT_YOU_SEE = [
  "Every study session: when, how long, and what was covered",
  "Accuracy week by week, and on every one of the 29 SAT skills",
  "Mistakes that keep repeating, and how they rate their own confidence",
  "Practice test scores against the goal, and whether the plan is on pace",
  "A summary email every Sunday",
];

// What the Google callback's ?error= codes mean on this page.
const GOOGLE_ERRORS: Record<string, string> = {
  google: "Google sign-in didn't work. Please try again, or use your email and password.",
  google_other_account: "That account is already linked to a different Google account. Sign in with that one, or use your password.",
  google_setup_expired: "That setup link has expired. Use \"Forgot password?\" below to get a new one.",
  parent_code: "That student code doesn't match any student account. Double-check it and try again.",
};

function ParentLoginContent({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentName, setStudentName] = useState(params.get("name") ?? "");
  const [inviteCode, setInviteCode] = useState(params.get("code") ?? "");
  const [error, setError] = useState(GOOGLE_ERRORS[params.get("error") ?? ""] ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [forgot, setForgot] = useState(false);

  // Google carries what the signup form collected through to the account it creates.
  function googleHref(): string {
    const q = new URLSearchParams({ as: "parent" });
    if (mode === "signup") {
      if (inviteCode.trim()) q.set("code", inviteCode.trim());
      if (studentName.trim()) q.set("name", studentName.trim());
      q.set("tz", Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
    return `/api/auth/google?${q}`;
  }
  const [forgotSent, setForgotSent] = useState(false);

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/auth/parent/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setSubmitting(false);
    if (res?.ok) setForgotSent(true);
    else setError("Couldn't send it. Check the email and try again.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const body: Record<string, string> = { email, password };
      if (mode === "signup") {
        body.inviteCode = inviteCode;
        body.nickname = studentName;
        body.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      const res = await fetch(`/api/auth/parent/${mode === "login" ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      const next = new URLSearchParams();
      if (mode === "signup" && !inviteCode.trim() && studentName.trim()) next.set("name", studentName.trim());
      router.push(`/parent/dashboard${next.toString() ? `?${next}` : ""}`);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  const input = "w-full px-3 py-2.5 rounded-lg border border-[#d5c8ae] text-sm focus:outline-none focus:border-[#587356]";

  return (
    <div className="mx-auto max-w-[980px] px-6 py-8 font-sans">
      <Link href="/" className="inline-block text-sm text-stone-500 transition-colors hover:text-ink">
        &larr; Back to home
      </Link>
      <div className="mt-6 grid items-start gap-10 md:grid-cols-[1fr_420px]">
        <div className="pt-2">
          <BrandMark size={48} className="mb-4" />
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#2c4c3b]">Oakmont for Parents</div>
          <h1 className="text-balance font-display text-[32px] font-semibold leading-[1.1] text-ink sm:text-[38px]">
            Know exactly how SAT prep is going, without asking.
          </h1>
          <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-stone-600">
            A detailed report of your student&apos;s studying, updated every time they practice.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {WHAT_YOU_SEE.map((t) => (
              <li key={t} className="flex gap-2.5 text-[14px] leading-snug text-stone-700">
                <span className="mt-[3px] flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[10px] font-bold text-accent">✓</span>
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[48ch] text-[12.5px] leading-relaxed text-stone-600">
            Parent accounts are free with your student&apos;s plan, and one account can follow more than one student.
          </p>
        </div>

        <div className="rounded-xl border border-[#e2d7c1] bg-white p-7 shadow-[0_1px_2px_rgba(38,34,24,0.04),0_8px_24px_rgba(38,34,24,0.06)]">
          <div className="mb-6 flex gap-2">
            {(["signup", "login"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium ${mode === m ? "border-ink bg-forest text-white" : "border-[#d5c8ae] bg-[#eef3e9] text-ink"}`}
              >
                {m === "signup" ? "Create account" : "Log in"}
              </button>
            ))}
          </div>
          {forgot ? (
            <form onSubmit={sendReset} className="flex flex-col gap-3.5">
              <div className="text-[15px] font-semibold text-ink">Set or reset your password</div>
              {forgotSent ? (
                <p className="text-sm leading-relaxed text-stone-600">
                  If there&apos;s a parent account for {email}, we&apos;ve emailed it a link to set a password.
                </p>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-stone-600">
                    We&apos;ll email you a link. This also works if your student created your account for you.
                  </p>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={input} required />
                  {error && <div className="text-sm text-red-700">{error}</div>}
                  <button type="submit" disabled={submitting} className="w-full rounded-lg bg-forest py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                    {submitting ? "Sending..." : "Email me a link"}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setForgot(false);
                  setForgotSent(false);
                  setError("");
                }}
                className="text-xs text-stone-500 hover:text-ink"
              >
                &larr; Back to log in
              </button>
            </form>
          ) : (
          <form onSubmit={submit} className="flex flex-col gap-3.5">
            {mode === "signup" && (
              <>
                <div>
                  <label className="mb-1 block text-sm text-stone-700">Your student&apos;s first name</label>
                  <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Maya" className={input} maxLength={40} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-stone-700">
                    Student code <span className="text-stone-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="e.g. 7K9QXFRT"
                    className={`${input} uppercase tracking-wide`}
                  />
                  <div className="mt-1 text-xs leading-relaxed text-stone-600">
                    If your student already uses Oakmont, it&apos;s under Settings &rarr; Parent access. No code? Create your account and
                    you&apos;ll get a link to send them.
                  </div>
                </div>
              </>
            )}
            {googleEnabled && (
              <>
                <GoogleButton href={googleHref()} />
                <OrWithEmail className="my-1" />
              </>
            )}
            <div>
              <label className="mb-1 block text-sm text-stone-700">Your email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={input} required />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm text-stone-700">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgot(true);
                      setError("");
                    }}
                    className="text-xs text-stone-500 hover:text-ink"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={input} required minLength={6} />
            </div>
            {error && <div className="text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={submitting} className="w-full rounded-lg bg-forest py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create parent account"}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function ParentLoginView({ googleEnabled }: { googleEnabled: boolean }) {
  return (
    <Suspense>
      <ParentLoginContent googleEnabled={googleEnabled} />
    </Suspense>
  );
}
