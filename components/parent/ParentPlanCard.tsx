"use client";

import { useState } from "react";

// The student's plan, as their parent sees it: how much of the free week is
// left, or which plan is active -- and the way to pay for it, since the
// parent is usually the one who does.
export interface ParentPlanState {
  kind: "trial" | "trialEnded" | "monthly" | "pass" | "pastDue" | "none";
  daysLeft?: number;
  until?: string; // formatted date
}

export function ParentPlanCard({
  studentId,
  name,
  state,
  prices,
}: {
  studentId: string;
  name: string;
  state: ParentPlanState;
  prices: { monthly: number; sixmonth: number };
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function go(endpoint: string, body: object, key: string) {
    setError("");
    setBusy(key);
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Something went wrong. Please try again.");
        setBusy(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setBusy(null);
    }
  }

  const paid = state.kind === "monthly" || state.kind === "pass" || state.kind === "pastDue";
  const headline =
    state.kind === "trial"
      ? `${name}'s free trial: ${state.daysLeft} ${state.daysLeft === 1 ? "day" : "days"} left`
      : state.kind === "trialEnded"
        ? `${name}'s free trial has ended`
        : state.kind === "monthly"
          ? `${name} is on the monthly plan`
          : state.kind === "pass"
            ? `${name} has the 6-month pass${state.until ? `, through ${state.until}` : ""}`
            : state.kind === "pastDue"
              ? `The last payment for ${name}'s plan didn't go through`
              : `Choose a plan for ${name}`;
  const sub =
    state.kind === "trial"
      ? "Choose a plan now and they keep every free day: monthly billing starts when the trial ends, and the 6-month pass counts from then."
      : state.kind === "trialEnded"
        ? "Their progress and plan are saved. Choose a plan to keep them going."
        : state.kind === "pastDue"
          ? "Update the card to keep their access."
          : paid
            ? "Receipts come to you. Cancel or update the card any time."
            : "";

  return (
    <div className="mb-6 rounded-xl border border-[#e2d7c1] bg-white p-5">
      <div className="text-[15px] font-semibold text-ink">{headline}</div>
      {sub && <p className="mt-0.5 text-[13px] leading-relaxed text-stone-600">{sub}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {!paid ? (
          <>
            <button
              onClick={() => go("/api/parent/checkout", { studentId, plan: "sixmonth" }, "sixmonth")}
              disabled={busy !== null}
              className="rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy === "sixmonth" ? "Opening..." : `6-month pass, $${prices.sixmonth} once`}
            </button>
            <button
              onClick={() => go("/api/parent/checkout", { studentId, plan: "monthly" }, "monthly")}
              disabled={busy !== null}
              className="rounded-lg border border-[#d5c8ae] px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
            >
              {busy === "monthly" ? "Opening..." : `Monthly, $${prices.monthly}/month`}
            </button>
          </>
        ) : (
          (state.kind === "monthly" || state.kind === "pastDue") && (
            <button
              onClick={() => go("/api/parent/billing", { studentId }, "billing")}
              disabled={busy !== null}
              className="rounded-lg border border-[#d5c8ae] px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
            >
              {busy === "billing" ? "Opening..." : "Manage billing"}
            </button>
          )
        )}
      </div>
      {error && <div className="mt-2 text-sm text-red-700">{error}</div>}
    </div>
  );
}
