"use client";

import { useState } from "react";

export interface AddedParent {
  id: string;
  linkId?: string;
  email: string;
  pending: boolean;
}

// Add a parent by email: creates their free account (or connects an
// existing one) and emails them. Used in onboarding and Settings.
export function AddParentForm({ onAdded, cta = "Add parent" }: { onAdded: (p: AddedParent) => void; cta?: string }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/account/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Couldn't add them. Please try again.");
        return;
      }
      onAdded(data.parent);
      setEmail("");
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={add}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="parent@example.com"
          aria-label="Parent or guardian's email"
          className="min-w-0 flex-1 rounded-lg border border-[#e0defa] px-3 py-2.5 text-sm focus:border-[#6d7fd6] focus:outline-none"
        />
        <button type="submit" disabled={sending} className="whitespace-nowrap rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {sending ? "Adding..." : cta}
        </button>
      </div>
      {error && <div className="mt-2 text-sm text-red-700">{error}</div>}
    </form>
  );
}

// One added parent, with their setup status and a resend button.
export function ParentRow({ parent, onUnlink }: { parent: AddedParent; onUnlink?: () => void }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | string>("idle");
  async function resend() {
    setState("sending");
    const res = await fetch("/api/account/parents/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId: parent.id }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setState(res?.ok ? "sent" : data.error || "Couldn't send it.");
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f5f4fb] px-3.5 py-2.5">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-ink">{parent.email}</div>
        <div className={`text-[12px] ${parent.pending ? "text-[#9a6a12]" : "text-accent"}`}>
          {parent.pending ? "Invite sent. Waiting for them to set a password." : "Connected. They can see your report."}
        </div>
      </div>
      <div className="flex items-center gap-3">
      {onUnlink && (
        <button onClick={onUnlink} className="text-xs font-semibold text-gray-400 hover:text-red-700">
          Unlink
        </button>
      )}
      {parent.pending && (
        <button onClick={resend} disabled={state === "sending" || state === "sent"} className="text-xs font-semibold text-[#4a5bb0] hover:underline disabled:opacity-60">
          {state === "sending" ? "Sending..." : state === "sent" ? "Sent again" : "Resend email"}
        </button>
      )}
      </div>
      {state !== "idle" && state !== "sending" && state !== "sent" && <div className="w-full text-xs text-red-700">{state}</div>}
    </div>
  );
}
