"use client";

import type { Confidence } from "@/lib/items";

export const CONFIDENCE_OPTIONS: { value: Confidence; label: string }[] = [
  { value: "sure", label: "Sure" },
  { value: "unsure", label: "Not sure" },
  { value: "guessed", label: "Guessed" },
];

/**
 * "How sure were you?" -- the cheapest high-value signal a practice tool
 * can collect. A right answer she wasn't sure of is the one most likely to
 * break on test day, so those come back in mixed review instead of being
 * banked as known.
 */
export function ConfidencePicker({
  value,
  onChange,
  compact = false,
}: {
  value: Confidence | null;
  onChange: (c: Confidence) => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "mt-3"}`}>
      <span className="text-[12px] text-stone-400">How sure?</span>
      <div role="radiogroup" aria-label="How sure are you?" className="inline-flex rounded-lg bg-[#f5f0e5] p-0.5">
        {CONFIDENCE_OPTIONS.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
              value === o.value ? "bg-white text-ink shadow-[0_1px_2px_rgba(38,34,24,0.12)]" : "text-stone-500 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
