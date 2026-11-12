"use client";

// The browser's own print dialog. The print styles in globals.css (the
// "Printing a public study plan" block) open every week and drop the site
// chrome; OpenAllWeeks opens the closed weeks just before printing.
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="plan-print-hide inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#b4c5e6] bg-white px-4 text-[16px] font-semibold text-[#26427e] hover:bg-[#f3f6fc]"
    >
      Print this plan
    </button>
  );
}
