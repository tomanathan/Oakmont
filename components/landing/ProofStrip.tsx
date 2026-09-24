// Real numbers only, counted from the curriculum and question bank at render
// time (see LandingPage) so they can't drift from what's actually inside.
export function ProofStrip({ questionCount, subskillCount }: { questionCount: number; subskillCount: number }) {
  const stats = [
    { value: String(subskillCount), label: "SAT skills, every one covered", tone: "bg-pastel-lilac text-pastelInk-lilac" },
    { value: String(questionCount), label: "original practice questions", tone: "bg-pastel-sky text-pastelInk-sky" },
    { value: "8", label: "full-length practice tests", tone: "bg-pastel-mint text-pastelInk-mint" },
    { value: "6 yrs", label: "of SAT tutoring behind the plan", tone: "bg-pastel-peach text-pastelInk-peach" },
  ];
  return (
    <section className="bg-white px-4 pb-4 sm:px-6">
      <dl className="mx-auto grid max-w-[1120px] grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl px-3 py-6 text-center sm:py-7 ${s.tone}`}>
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-display text-[30px] font-semibold leading-none tracking-tight sm:text-[34px]">{s.value}</dd>
            <dd className="mt-2 text-xs text-gray-600">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
