"use client";

import { useState } from "react";

export function UnsubscribeButtons({ token, initialOn }: { token: string; initialOn: boolean }) {
  const [on, setOn] = useState(initialOn);
  const [busy, setBusy] = useState(false);
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState(false);

  async function set(next: boolean) {
    setBusy(true);
    setError(false);
    try {
      const res = await fetch(`/api/email/unsubscribe?t=${encodeURIComponent(token)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on: next }) });
      if (!res.ok) throw new Error();
      setOn(next);
      setChanged(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5">
      <p className="mb-3 text-sm font-semibold" role="status">
        {changed ? (on ? "Turned back on." : "Turned off. You won't get these again.") : on ? "These emails are on." : "These emails are off."}
      </p>
      <button type="button" disabled={busy} onClick={() => set(!on)} className={`w-full rounded-lg py-3 text-sm font-semibold disabled:opacity-60 ${on ? "bg-forest text-white hover:opacity-90" : "border border-forest text-forest hover:bg-[#eef3e9]"}`}>
        {on ? "Turn daily emails off" : "Turn daily emails back on"}
      </button>
      {error && <p className="mt-3 text-sm text-[#b23b2e]">That didn&apos;t save. Please try again.</p>}
    </div>
  );
}
