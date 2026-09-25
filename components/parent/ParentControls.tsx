"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// The parent's own controls above a report: rename the student, the weekly
// email switch, and (once) saving the browser's time zone so days in the
// report line up with the parent's clock.
export function ParentControls({
  linkId,
  nickname,
  weeklyReport,
  savedTimeZone,
}: {
  linkId: string;
  nickname: string | null;
  weeklyReport: boolean;
  savedTimeZone: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(nickname ?? "");
  const [weekly, setWeekly] = useState(weeklyReport);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== savedTimeZone) {
      fetch("/api/parent/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeZone: tz }),
      })
        .then((r) => {
          if (r.ok) router.refresh();
        })
        .catch(() => {});
    }
    // Once per mount is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/parent/links/${linkId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: name }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function toggleWeekly() {
    const next = !weekly;
    setWeekly(next);
    const res = await fetch("/api/parent/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyReport: next }),
    });
    if (!res.ok) setWeekly(!next);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {editing ? (
        <form onSubmit={saveName} className="flex items-center gap-1.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="First name"
            className="w-36 rounded-lg border border-[#d5c8ae] px-2.5 py-1.5 text-sm focus:border-[#587356] focus:outline-none"
          />
          <button type="submit" disabled={saving} className="rounded-lg bg-forest px-3 py-1.5 text-sm font-semibold text-white">
            Save
          </button>
          <button type="button" onClick={() => setEditing(false)} className="px-1.5 text-sm text-stone-500 hover:text-ink">
            Cancel
          </button>
        </form>
      ) : (
        <button onClick={() => setEditing(true)} className="rounded-lg border border-[#d5c8ae] bg-white px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-[#eef3e9]">
          Rename
        </button>
      )}
      <button
        onClick={toggleWeekly}
        role="switch"
        aria-checked={weekly}
        className="flex items-center gap-2 rounded-lg border border-[#d5c8ae] bg-white px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-[#eef3e9]"
      >
        <span className={`relative inline-block h-4 w-7 rounded-full transition-colors ${weekly ? "bg-accent" : "bg-stone-300"}`}>
          <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${weekly ? "left-3.5" : "left-0.5"}`} />
        </span>
        Sunday email
      </button>
    </div>
  );
}
