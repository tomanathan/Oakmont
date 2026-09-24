import { PixelDog } from "@/components/PixelDog";
import { TestDatePicker } from "./TestDatePicker";
import { Highlight } from "./Highlight";

// How the plan works, what else comes with it, and who built it -- one
// section, so the page explains itself once instead of three times.
export function HowItWorks({ subskillCount }: { subskillCount: number }) {
  const steps = [
    {
      title: "Set your test date",
      body: "We recommend six months, but the week-by-week plan sizes itself to the time you have.",
    },
    {
      title: "Follow one week at a time",
      body: "Each week focuses on a few skills, starting with the ones that will raise the score most.",
    },
    {
      title: "Learn, practice, review",
      body: `A short lesson and quiz for each of the ${subskillCount} skills, then quick mixed reviews that keep every skill fresh until test day.`,
    },
  ];

  const extras = [
    {
      title: "Explanations that teach",
      body: "Every wrong answer tells your student why it's wrong, and names the pattern behind the question.",
      icon: "?",
    },
    {
      title: "8 full-length practice tests",
      body: "Scheduled into the plan so test day feels familiar.",
      icon: "8",
    },
    {
      title: "Ozho, the study buddy",
      body: "Streaks keep him happy and earn costumes. It's a small reason to show up every day.",
      dog: true,
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 bg-cream px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-10 max-w-[680px]">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-tint-700">How it works</div>
          <h2 className="text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[40px]">
            A tutor&apos;s plan, <Highlight>without the hourly rate.</Highlight>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
            Built by Aman, who has tutored the SAT for six years, around the same week-by-week plan used with private students.
          </p>
        </div>

        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-2xl bg-gradient-to-b from-white to-tint-50 p-6 shadow-[0_10px_30px_-18px_rgba(74,91,176,0.55)] ring-1 ring-tint-200">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-tint-400 to-tint-700 font-display text-[15px] font-semibold text-white shadow-[0_4px_10px_-4px_rgba(74,91,176,0.8)]">
                {i + 1}
              </div>
              <h3 className="mb-2 font-display text-[18px] font-semibold">{step.title}</h3>
              <p className="text-[14px] leading-relaxed text-gray-700">{step.body}</p>
            </li>
          ))}
        </ol>

        <TestDatePicker subskillCount={subskillCount} />

        <div className="mt-10 grid gap-6 border-t border-tint-200 pt-8 md:grid-cols-3">
          {extras.map((x) => (
            <div key={x.title} className="flex gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-tint-100 to-tint-200 text-tint-800" aria-hidden="true">
                {x.dog ? (
                  <PixelDog size={36} mood="happy" costume="bowtie" shadow={false} />
                ) : (
                  <span className="font-display text-[20px] font-semibold">{x.icon}</span>
                )}
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-ink">{x.title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-gray-600">{x.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
