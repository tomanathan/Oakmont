"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { LegalFooter } from "@/components/LegalFooter";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="text-sm text-stone-600">
        This reset link is missing its token. Request a new one from the{" "}
        <a href="/login" className="underline">
          login page
        </a>
        .
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      // The route already logged us in (see its own comment) -- straight to
      // the dashboard rather than making someone re-type what they just set.
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label className="block text-sm text-stone-700 mb-1">New password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 6 characters"
        className="w-full px-3 py-2.5 rounded-lg border border-[#d5c8ae] mb-3.5 text-sm focus:outline-none focus:border-[#587356]"
        required
        minLength={6}
      />
      <label className="block text-sm text-stone-700 mb-1">Confirm new password</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Type it again"
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
        {submitting ? "Saving..." : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-[420px] mx-auto px-6 py-12 font-sans">
      <div className="text-center mb-8">
        <BrandMark size={56} className="mx-auto mb-3" />
        <div className="font-display font-semibold text-[28px] text-ink mb-1">Set a new password</div>
      </div>
      <div className="bg-white border border-[#e2d7c1] rounded-xl p-7 shadow-[0_1px_2px_rgba(38,34,24,0.04),0_8px_24px_rgba(38,34,24,0.06)]">
        <Suspense fallback={<div className="text-sm text-stone-500">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
      <LegalFooter className="mt-6" />
    </div>
  );
}
