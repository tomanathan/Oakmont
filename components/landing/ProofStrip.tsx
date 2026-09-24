// Real numbers only, counted from the curriculum and question bank at render
// time (see LandingPage) so they can't drift from what's actually inside.
export function ProofStrip({ questionCount, subskillCount }: { questionCount: number; subskillCount: number }) {
  const stats = [
    { value: String(subskillCount), label: "SAT skills, every one covered" },
    { value: String(questionCount), label: "original practice questions" },
    { value: "8", label: "full-length practice tests" },
    { value: "6 yrs", label: "of SAT tutoring behind the plan" },
  ];
  return (
    <section className="border-y border-brass/30 bg-parchment px-4 sm:px-6">
      <dl className="mx-auto grid max-w-[1120px] grid-cols-2 sm:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-3 py-7 text-center sm:py-8 ${i % 2 === 1 ? "border-l border-brass/30" : ""} ${
              i >= 2 ? "border-t border-brass/30 sm:border-t-0" : ""
            } ${i === 2 ? "sm:border-l" : ""}`}
          >
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-display text-[32px] font-semibold leading-none tracking-tight text-forest sm:text-[38px]">{s.value}</dd>
            <dd className="mt-2 text-[11px] uppercase tracking-[0.16em] text-stone-500">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
