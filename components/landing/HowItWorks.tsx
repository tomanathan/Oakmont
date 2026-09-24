import { PixelDog } from "@/components/PixelDog";
import { TestDatePicker } from "./TestDatePicker";
import { Eyebrow, Highlight } from "./Flourish";

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

  const numerals = ["I", "II", "III"];
  const stripes = ["bg-pastel-sage", "bg-pastel-sky", "bg-pastel-blush"];
  const dots = ["bg-pastel-butter", "bg-pastel-sky", "bg-pastel-sage"];

  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-sage/30 bg-ivory px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-10 max-w-[680px]">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] text-forest-900 sm:text-[42px]">
            A tutor&apos;s plan, <Highlight>without the hourly rate.</Highlight>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-stone-600">
            Built by Aman, who has tutored the SAT for six years, around the same week-by-week plan used with private students.
          </p>
        </div>

        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="overflow-hidden rounded-lg bg-white/80 p-6 pt-0 shadow-[0_12px_30px_-22px_rgba(60,42,15,0.5)] ring-1 ring-sage/25">
              <div className={`-mx-6 mb-5 h-2 ${stripes[i]}`} aria-hidden="true" />
              <div className="mb-3 font-display text-[26px] font-medium italic leading-none text-sage">{numerals[i]}.</div>
              <h3 className="mb-2 font-display text-[19px] font-semibold text-forest-900">{step.title}</h3>
              <p className="text-[14px] leading-relaxed text-stone-600">{step.body}</p>
            </li>
          ))}
        </ol>

        <TestDatePicker subskillCount={subskillCount} />

        <div className="mt-10 grid gap-6 border-t border-sage/30 pt-8 md:grid-cols-3">
          {extras.map((x, i) => (
            <div key={x.title} className="flex gap-3">
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-forest ${dots[i]}`} aria-hidden="true">
                {x.dog ? (
                  <PixelDog size={34} mood="happy" costume="bowtie" shadow={false} />
                ) : (
                  <span className="font-display text-[19px] font-semibold italic">{x.icon}</span>
                )}
              </div>
              <div>
                <h3 className="font-display text-[16px] font-semibold text-forest-900">{x.title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-stone-600">{x.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
