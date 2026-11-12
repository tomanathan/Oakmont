"use client";

import { useEffect, useState } from "react";
import { PaperCheck } from "@/components/paper/Pencil";
import { useRouter } from "next/navigation";

// The parent's own controls above a report: rename the student, the weekly
// and daily email switches, and (once) saving the browser's time zone so days in the
// report line up with the parent's clock.
export function ParentControls({
  linkId,
  nickname,
  weeklyReport,
  dailyEmails,
  savedTimeZone,
}: {
  linkId: string;
  nickname: string | null;
  weeklyReport: boolean;
  dailyEmails: boolean;
  savedTimeZone: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(nickname ?? "");
  const [weekly, setWeekly] = useState(weeklyReport);
  const [daily, setDaily] = useState(dailyEmails);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/parent/links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: name }),
      });
      // Not saved: keep the editor open with what they typed.
      if (!res.ok) {
        setError("Couldn't save the name. Please try again.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // The switches flip at once and save behind the scenes. If the save
  // doesn't land, the switch goes back to what is actually stored, so it
  // never shows an email as off while it's still on.
  async function saveSwitch(body: object): Promise<boolean> {
    setError("");
    try {
      const res = await fetch("/api/parent/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) return true;
    } catch {
      // Falls through to the same message.
    }
    setError("Couldn't save that. Please try again.");
    return false;
  }

  async function toggleWeekly() {
    const next = !weekly;
    setWeekly(next);
    if (!(await saveSwitch({ weeklyReport: next }))) setWeekly(!next);
  }

  async function toggleDaily() {
    const next = !daily;
    setDaily(next);
    if (!(await saveSwitch({ dailyEmails: next }))) setDaily(!next);
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
            className="w-36 rounded-lg border border-[#b4c5e6] px-2.5 py-1.5 text-sm focus:border-[#4a67a6] focus:outline-none"
          />
          <button type="submit" disabled={saving} className="rounded-lg bg-forest px-3 py-1.5 text-sm font-semibold text-white">
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError("");
            }}
            className="px-1.5 text-sm text-stone-500 hover:text-ink"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button onClick={() => setEditing(true)} className="rounded-lg border border-[#b4c5e6] bg-white px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-[#e9effb]">
          Rename
        </button>
      )}
      <button
        onClick={toggleWeekly}
        role="switch"
        aria-checked={weekly}
        className="flex items-center gap-2 rounded-lg border border-[#b4c5e6] bg-white px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-[#e9effb]"
      >
        <PaperCheck on={weekly} size={16} seed={5} />
        Sunday email
      </button>
      <button
        onClick={toggleDaily}
        role="switch"
        aria-checked={daily}
        className="flex items-center gap-2 rounded-lg border border-[#b4c5e6] bg-white px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-[#e9effb]"
      >
        <PaperCheck on={daily} size={16} seed={8} />
        Daily emails
      </button>
      {error && (
        <div role="alert" className="w-full text-[12.5px] text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
