"use client";

import { useState } from "react";

// "Email my parent an invite": sends them a signup link with this
// student's code filled in. Used in onboarding and in Settings.
export function EmailParentInvite({
  onSent,
  compact = false,
}: {
  onSent?: (info: { email: string; code: string }) => void;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/account/parent-invite/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Couldn't send it. Please try again.");
        return;
      }
      setSentTo(email.trim());
      onSent?.({ email: email.trim(), code: data.code });
      setEmail("");
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={send}>
      <div className={`flex gap-2 ${compact ? "" : "flex-col sm:flex-row"}`}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="parent@example.com"
          aria-label="Parent's email"
          className="min-w-0 flex-1 rounded-lg border border-[#e0defa] px-3 py-2.5 text-sm focus:border-[#6d7fd6] focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending}
          className="whitespace-nowrap rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {sending ? "Sending..." : sentTo ? "Send another" : "Send invite"}
        </button>
      </div>
      {error && <div className="mt-2 text-sm text-red-700">{error}</div>}
      {sentTo && !error && (
        <div className="mt-2 text-sm text-accent">
          Sent to {sentTo}. They&apos;ll get a link to create a free parent account, already connected to yours.
        </div>
      )}
    </form>
  );
}
