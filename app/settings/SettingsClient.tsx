"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsClient({
  email,
  baselineScore,
  goalScore,
  targetTestDate,
}: {
  email: string;
  baselineScore: number | null;
  goalScore: number | null;
  targetTestDate: string | null;
}) {
  const router = useRouter();
  const [baseline, setBaseline] = useState(baselineScore?.toString() ?? "");
  const [goal, setGoal] = useState(goalScore?.toString() ?? "");
  const [testDate, setTestDate] = useState(targetTestDate ?? "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function saveGoals(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    setSaveMsg("");
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baselineScore: baseline ? Number(baseline) : null,
          goalScore: goal ? Number(goal) : null,
          targetTestDate: testDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Couldn't save. Please try again.");
        return;
      }
      setSaveMsg("Saved.");
      router.refresh();
    } catch {
      setSaveError("Couldn't reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    setDeleteError("");
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Couldn't delete your account. Please try again.");
        setDeleting(false);
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      setDeleteError("Couldn't reach the server. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-[560px]">
      <div className="text-xl font-bold text-ink mb-1.5">Settings</div>
      <div className="text-sm text-gray-500 mb-6">{email}</div>

      <form
        onSubmit={saveGoals}
        className="bg-white border border-[#ece9f7] rounded-xl p-6 mb-6"
      >
        <div className="text-[15px] font-semibold text-ink mb-1">Study goals</div>
        <div className="text-xs text-gray-500 mb-4">
          Set a baseline score, a goal score, and your SAT test date, and your 6-month plan will
          resize to fit the time you actually have.
        </div>

        <label className="block text-sm text-gray-700 mb-1">Baseline score (400-1600)</label>
        <input
          type="number"
          min={400}
          max={1600}
          value={baseline}
          onChange={(e) => setBaseline(e.target.value)}
          placeholder="e.g. 1180"
          className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] mb-3.5 text-sm focus:outline-none focus:border-[#6d7fd6]"
        />

        <label className="block text-sm text-gray-700 mb-1">Goal score (400-1600)</label>
        <input
          type="number"
          min={400}
          max={1600}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. 1450"
          className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] mb-3.5 text-sm focus:outline-none focus:border-[#6d7fd6]"
        />

        <label className="block text-sm text-gray-700 mb-1">Target SAT test date</label>
        <input
          type="date"
          value={testDate}
          onChange={(e) => setTestDate(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] mb-4 text-sm focus:outline-none focus:border-[#6d7fd6]"
        />

        {saveError && <div className="text-red-700 text-sm mb-3">{saveError}</div>}
        {saveMsg && !saveError && <div className="text-accent text-sm mb-3">{saveMsg}</div>}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2.5 rounded-lg bg-ink text-white font-semibold text-sm disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>

      <div className="bg-white border border-red-100 rounded-xl p-6">
        <div className="text-[15px] font-semibold text-red-700 mb-1">Danger zone</div>
        <div className="text-xs text-gray-500 mb-4">
          Permanently deletes your account, all progress, and all practice test results. This
          cannot be undone.
        </div>

        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="px-4 py-2.5 rounded-lg border border-red-200 text-red-700 font-semibold text-sm hover:bg-red-50"
          >
            Delete account
          </button>
        ) : (
          <div>
            <div className="text-sm text-gray-700 mb-2">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm.
            </div>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-red-200 mb-3 text-sm focus:outline-none focus:border-red-400"
            />
            {deleteError && <div className="text-red-700 text-sm mb-3">{deleteError}</div>}
            <div className="flex gap-2">
              <button
                onClick={deleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="px-4 py-2.5 rounded-lg bg-red-700 text-white font-semibold text-sm disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Permanently delete my account"}
              </button>
              <button
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeleteConfirmText("");
                  setDeleteError("");
                }}
                className="px-4 py-2.5 rounded-lg border border-[#e0defa] text-gray-600 font-semibold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
