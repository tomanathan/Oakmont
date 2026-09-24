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
    <section className="bg-tint-50 px-4 pb-14 sm:px-6 sm:pb-16">
      <dl className="mx-auto grid max-w-[1120px] grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-gradient-to-b from-white to-tint-100 px-3 py-6 text-center shadow-[0_10px_30px_-18px_rgba(74,91,176,0.55)] ring-1 ring-tint-200 sm:py-7">
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-display text-[30px] font-semibold leading-none tracking-tight text-tint-800 sm:text-[34px]">{s.value}</dd>
            <dd className="mt-2 text-xs text-gray-600">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
