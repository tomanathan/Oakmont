"use client";

// A deliberately small, single-purpose nudge -- not the full analysis
// section itself (that stays collapsed further down the page; see
// AnalysisClient's own dueTestNumber prop, which independently expands it
// and opens its form using this exact same number). This just exists to
// catch the eye at the top of the page, right where the roadmap -- now the
// actual main content of /plan -- begins, and hand off to that section
// with one click instead of asking a student to go find it.
export function TestDuePrompt({ testNumber }: { testNumber: number }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-[#fffaf0] border border-[#f0e0b0] rounded-xl px-5 py-3.5 mb-5 flex-wrap">
      <div className="text-sm text-ink">
        <span className="font-semibold">🎯 Practice test {testNumber} of 8 is on your schedule this week.</span>{" "}
        <span className="text-gray-500">Log your results and the plan below adjusts to fit.</span>
      </div>
      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent("plan:log-test"));
          document.getElementById("practice-tests")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="px-3.5 py-2 rounded-lg bg-ink text-white text-xs font-semibold hover:bg-[#2a2a42] transition-colors flex-shrink-0"
      >
        Log your results &darr;
      </button>
    </div>
  );
}
