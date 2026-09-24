"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import { upcomingSatDates, weeksUntil } from "@/lib/satDates";

// Real urgency from a real date, not a fake countdown -- dates come from
// lib/satDates.ts and past ones filter out automatically each season.
export function TestDatePicker({ subskillCount }: { subskillCount: number }) {
  const dates = upcomingSatDates();
  const [selected, setSelected] = useState<string | null>(null);
  const weeks = selected ? weeksUntil(selected) : null;
  if (dates.length === 0) return null;

  return (
    <div className="mt-4 grid items-center gap-6 rounded-2xl bg-ink p-6 text-white sm:p-8 md:grid-cols-[1fr_1.1fr]">
      <div>
        <div className="font-display text-[22px] font-semibold leading-tight">When&apos;s your test?</div>
        <p className="mt-1.5 text-sm text-white/65">Pick a date to see how your plan fits the time you have.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {dates.map((d) => (
            <button
              key={d.date}
              onClick={() => {
                setSelected(d.date);
                // Remembered so onboarding can start with this date picked.
                try {
                  localStorage.setItem("oakmont:test-date", d.date);
                } catch {}
                track("test_date_selected", { date: d.date });
              }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                selected === d.date ? "bg-white text-ink" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-[112px] rounded-xl bg-white/[0.06] p-5 ring-1 ring-white/10" aria-live="polite">
        {weeks === null ? (
          <p className="text-sm leading-relaxed text-white/60">
            Your plan fits itself to whatever time is left, with all {subskillCount} skills covered and
            none skipped.
          </p>
        ) : (
          <div key={selected} className="animate-fade-up">
            <div className="font-display text-[34px] font-semibold leading-none">
              {weeks} <span className="text-[18px] text-white/70">{weeks === 1 ? "week" : "weeks"} to go</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Your plan paces all {subskillCount} skills into exactly that: {weeks <= 4 ? "a sprint, " : weeks <= 8 ? "a faster pace, " : ""}
              nothing skipped.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
