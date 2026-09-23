import { TestDatePicker } from "./TestDatePicker";

export function HowItWorks({ subskillCount }: { subskillCount: number }) {
  const steps = [
    {
      title: "Set your test date",
      body: "Add a baseline score if you have one. Your week-by-week timeline is built from there.",
    },
    {
      title: "Follow one week at a time",
      body: "Each week targets specific subskills, in the order that moves your score most — not a fixed syllabus.",
    },
    {
      title: "Learn, practice, review",
      body: `Lessons and a quiz for all ${subskillCount} subskills, then short mixed reviews at SAT pace that keep every skill fresh until test day. Plus 8 full-length practice tests.`,
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-16 bg-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-12 max-w-[620px]">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#4a5bb0]">How it works</div>
          <h2 className="text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[40px]">
            A tutor&apos;s plan, without the hourly rate.
          </h2>
        </div>

        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-[#ece9f7] bg-white p-6">
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f2fc] font-display text-[15px] font-semibold text-[#4a5bb0]">
                {i + 1}
              </div>
              <h3 className="mb-2 font-display text-[18px] font-semibold">{step.title}</h3>
              <p className="text-[14px] leading-relaxed text-gray-600">{step.body}</p>
            </li>
          ))}
        </ol>

        <TestDatePicker subskillCount={subskillCount} />
      </div>
    </section>
  );
}
