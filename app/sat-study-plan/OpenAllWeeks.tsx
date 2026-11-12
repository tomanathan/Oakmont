"use client";

import { useEffect, useState } from "react";

// Opens or closes every week of a public study plan at once. The weeks are
// native <details>, so their content is in the page for search engines and
// works with no script at all; this only saves a long plan's reader from
// tapping each week. It also opens the closed weeks while the page prints
// (Ctrl+P as well as the Print button) and closes them again after.
export function OpenAllWeeks({ targetId }: { targetId: string }) {
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    const weeks = () => Array.from(document.querySelectorAll<HTMLDetailsElement>(`#${targetId} details`));
    let closedBeforePrint: HTMLDetailsElement[] = [];
    const beforePrint = () => {
      closedBeforePrint = weeks().filter((d) => !d.open);
      for (const d of closedBeforePrint) d.open = true;
    };
    const afterPrint = () => {
      for (const d of closedBeforePrint) d.open = false;
      closedBeforePrint = [];
    };
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, [targetId]);

  function toggle() {
    const next = !allOpen;
    for (const d of Array.from(document.querySelectorAll<HTMLDetailsElement>(`#${targetId} details`))) d.open = next;
    setAllOpen(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-controls={targetId}
      className="plan-print-hide inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#b4c5e6] bg-white px-4 text-[16px] font-semibold text-[#26427e] hover:bg-[#f3f6fc]"
    >
      {allOpen ? "Close all weeks" : "Open all weeks"}
    </button>
  );
}
