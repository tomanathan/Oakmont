"use client";

import type { Confidence } from "@/lib/items";
import { PenLoop } from "./paper/Pencil";

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
      <span className="text-[12px] text-stone-500">How sure?</span>
      <div role="radiogroup" aria-label="How sure are you?" className="inline-flex rounded-lg bg-[#efe8da] p-0.5 ring-1 ring-[#c9d6ee]">
        {CONFIDENCE_OPTIONS.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`relative rounded-md px-2.5 py-1 text-[12px] transition-colors ${
              value === o.value ? "bg-white font-semibold text-ink" : "font-medium text-stone-600 hover:bg-white/70 hover:text-ink"
            }`}
          >
            {o.label}
            {/* circled in pen, like the answer itself */}
            <PenLoop show={value === o.value} seed={o.label.length * 7 + 3} className="-inset-x-1.5 -inset-y-1.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
