"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";

const WHAT_YOU_SEE = [
  "Every study session: when, how long, and what was covered",
  "Accuracy week by week, and on every one of the 29 SAT skills",
  "Mistakes that keep repeating, and how they rate their own confidence",
  "Practice test scores against the goal, and whether the plan is on pace",
  "A summary email every Sunday",
];

function ParentLoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentName, setStudentName] = useState(params.get("name") ?? "");
  const [inviteCode, setInviteCode] = useState(params.get("code") ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgot, setForgot] = useState(false);
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

  const input = "w-full px-3 py-2.5 rounded-lg border border-[#e0defa] text-sm focus:outline-none focus:border-[#6d7fd6]";

  return (
    <div className="mx-auto max-w-[980px] px-6 py-8 font-sans">
      <Link href="/" className="inline-block text-sm text-gray-500 transition-colors hover:text-ink">
        &larr; Back to home
      </Link>
      <div className="mt-6 grid items-start gap-10 md:grid-cols-[1fr_420px]">
        <div className="pt-2">
          <BrandMark size={48} className="mb-4" />
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#4a5bb0]">Oakmont for Parents</div>
          <h1 className="text-balance font-display text-[32px] font-semibold leading-[1.1] text-ink sm:text-[38px]">
            Know exactly how SAT prep is going, without asking.
          </h1>
          <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-gray-600">
            A detailed, read-only report of your student&apos;s studying, updated every time they practice.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {WHAT_YOU_SEE.map((t) => (
              <li key={t} className="flex gap-2.5 text-[14px] leading-snug text-gray-700">
                <span className="mt-[3px] flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[10px] font-bold text-accent">✓</span>
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[48ch] text-[12.5px] leading-relaxed text-gray-500">
            Your student approves the connection and can see that it&apos;s on. Parents can&apos;t change anything in their account.
          </p>
        </div>

        <div className="rounded-xl border border-[#ece9f7] bg-white p-7 shadow-[0_1px_2px_rgba(26,26,46,0.04),0_8px_24px_rgba(26,26,46,0.06)]">
          <div className="mb-6 flex gap-2">
            {(["signup", "login"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium ${mode === m ? "border-ink bg-ink text-white" : "border-[#e0defa] bg-[#f0eff9] text-ink"}`}
              >
                {m === "signup" ? "Create account" : "Log in"}
              </button>
            ))}
          </div>
          {forgot ? (
            <form onSubmit={sendReset} className="flex flex-col gap-3.5">
              <div className="text-[15px] font-semibold text-ink">Set or reset your password</div>
              {forgotSent ? (
                <p className="text-sm leading-relaxed text-gray-600">
                  If there&apos;s a parent account for {email}, we&apos;ve emailed it a link to set a password.
                </p>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-gray-500">
                    We&apos;ll email you a link. This also works if your student created your account for you.
                  </p>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={input} required />
                  {error && <div className="text-sm text-red-700">{error}</div>}
                  <button type="submit" disabled={submitting} className="w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-white disabled:opacity-60">
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
                className="text-xs text-gray-400 hover:text-ink"
              >
                &larr; Back to log in
              </button>
            </form>
          ) : (
          <form onSubmit={submit} className="flex flex-col gap-3.5">
            <div>
              <label className="mb-1 block text-sm text-gray-700">Your email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={input} required />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm text-gray-700">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgot(true);
                      setError("");
                    }}
                    className="text-xs text-gray-400 hover:text-ink"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={input} required minLength={6} />
            </div>
            {mode === "signup" && (
              <>
                <div>
                  <label className="mb-1 block text-sm text-gray-700">Your student&apos;s first name</label>
                  <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Maya" className={input} maxLength={40} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-700">
                    Student code <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="e.g. 7K9QXFRT"
                    className={`${input} uppercase tracking-wide`}
                  />
                  <div className="mt-1 text-xs leading-relaxed text-gray-400">
                    If your student already uses Oakmont, it&apos;s under Settings &rarr; Parent access. No code? Create your account and
                    you&apos;ll get a link to send them.
                  </div>
                </div>
              </>
            )}
            {error && <div className="text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={submitting} className="w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create parent account"}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ParentLoginPage() {
  return (
    <Suspense>
      <ParentLoginContent />
    </Suspense>
  );
}
