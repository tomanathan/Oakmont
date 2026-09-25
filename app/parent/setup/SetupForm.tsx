"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "your student";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function SetupForm({
  token,
  email,
  claimed,
  studentNames,
  startDeclining,
}: {
  token: string;
  email: string;
  claimed: boolean;
  studentNames: string[];
  startDeclining: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [declining, setDeclining] = useState(startDeclining);
  const [declined, setDeclined] = useState(false);
  const who = joinNames(studentNames);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/parent/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      router.push("/parent/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setBusy(false);
    }
  }

  async function decline() {
    setBusy(true);
    const res = await fetch("/api/auth/parent/decline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) setDeclined(true);
    else setError("Couldn't remove the account. Please try again.");
  }

  if (declined) {
    return (
      <>
        <h1 className="font-display text-[28px] font-semibold leading-tight text-ink">Removed</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-stone-600">The account for {email} is deleted. You won&apos;t get any more emails from us.</p>
      </>
    );
  }

  if (declining) {
    return (
      <>
        <h1 className="font-display text-[28px] font-semibold leading-tight text-ink">Not {who}&apos;s parent?</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
          {who} entered {email} as their parent&apos;s email. If that&apos;s a mistake, remove the account and you won&apos;t hear from us again.
        </p>
        {error && <div className="mt-3 text-sm text-red-700">{error}</div>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={decline} disabled={busy} className="rounded-lg bg-[#b23b3b] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "Removing..." : "Remove this account"}
          </button>
          <button onClick={() => setDeclining(false)} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-[#d5c8ae]">
            Actually, I&apos;m their parent
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display text-[28px] font-semibold leading-tight text-ink">
        {claimed ? "Choose a new password" : `Set up your account to follow ${who}`}
      </h1>
      {!claimed && (
        <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
          {who} added you as their parent. Set a password and you&apos;ll go straight to their report: every study session, every skill and
          every practice test score. It&apos;s free.
        </p>
      )}
      <form onSubmit={submit} className="mt-6 rounded-xl border border-[#e2d7c1] bg-white p-6 shadow-[0_1px_2px_rgba(38,34,24,0.04),0_8px_24px_rgba(38,34,24,0.06)]">
        <label className="mb-1 block text-sm text-stone-700">Email</label>
        <div className="mb-4 rounded-lg bg-[#f6f1e6] px-3 py-2.5 text-sm text-ink">{email}</div>
        <label className="mb-1 block text-sm text-stone-700" htmlFor="pw">
          {claimed ? "New password" : "Password"}
        </label>
        <input
          id="pw"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          minLength={6}
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-[#d5c8ae] px-3 py-2.5 text-sm focus:border-[#587356] focus:outline-none"
        />
        {error && <div className="mt-3 text-sm text-red-700">{error}</div>}
        <button type="submit" disabled={busy} className="mt-4 w-full rounded-lg bg-forest py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Saving..." : claimed ? "Save and log in" : "Set password and see the report"}
        </button>
      </form>
      {!claimed && (
        <button onClick={() => setDeclining(true)} className="mt-4 text-[13px] text-stone-500 hover:text-ink">
          Not {who}&apos;s parent?
        </button>
      )}
    </>
  );
}
