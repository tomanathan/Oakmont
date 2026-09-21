"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";

export default function ParentLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const body: { email: string; password: string; inviteCode?: string } = { email, password };
      if (mode === "signup") body.inviteCode = inviteCode;
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
      router.push("/parent/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[420px] mx-auto px-6 py-12 font-sans">
      <div className="text-center mb-8">
        <BrandMark size={56} className="mx-auto mb-3" />
        <div className="font-display font-semibold text-[28px] text-ink mb-1">Oakmont for Parents</div>
        <div className="text-sm text-gray-500">
          See exactly how your student's SAT prep is going -- pace, mastery, and practice test scores.
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
          {mode === "signup" && (
            <>
              <label className="block text-sm text-gray-700 mb-1">Invite code from your student</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="e.g. 7K9QXFRT"
                className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] mb-1 text-sm uppercase tracking-wide focus:outline-none focus:border-[#6d7fd6]"
                required
              />
              <div className="text-xs text-gray-400 mb-3.5">
                Your student can find this under Settings &rarr; Parent access.
              </div>
            </>
          )}
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
        A read-only view of your student's own dashboard &mdash; nothing here can be changed from your side.
      </div>
    </div>
  );
}
