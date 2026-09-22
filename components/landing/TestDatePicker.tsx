"use client";

import { useState } from "react";
import { upcomingSatDates, weeksUntil } from "@/lib/satDates";

// Real urgency from a real date, not a fake countdown -- dates come from
// lib/satDates.ts and past ones filter out automatically each season.
export function TestDatePicker() {
  const dates = upcomingSatDates();
  const [selected, setSelected] = useState<string | null>(null);
  const weeks = selected ? weeksUntil(selected) : null;

  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="max-w-[640px] mx-auto text-center">
        <h2 className="font-display font-semibold text-[26px] sm:text-[30px] text-ink mb-2">When&apos;s your test?</h2>
        <p className="text-sm text-gray-500 mb-7">Pick your test date and see how your plan fits the time you have.</p>

        <div className="flex flex-wrap justify-center gap-2 mb-7">
          {dates.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelected(d.date)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                selected === d.date
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-ink border-[#e0defa] hover:border-[#6d7fd6]"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {weeks !== null && (
          <div className="bg-[#f0eff9] border border-[#e0defa] rounded-xl p-6 text-left sm:text-center animate-pop-in">
            <div className="font-display font-semibold text-[20px] text-ink mb-1.5">
              {weeks} {weeks === 1 ? "week" : "weeks"} until test day
            </div>
            <p className="text-sm text-gray-600">
              Your Oakmont plan automatically compresses to fit — every one of the 29 subskills covered, none
              skipped, just paced to the time you actually have left.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
