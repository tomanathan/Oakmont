import { SubskillMap } from "./SubskillMap";

const STEPS = [
  {
    title: "Diagnose",
    body: "Set a baseline score and test date. Oakmont builds your personal week-by-week timeline from there.",
  },
  {
    title: "Follow your weekly plan",
    body: "Every week targets specific subskills, in the order that actually helps you most, not a fixed syllabus.",
  },
  {
    title: "Master every subskill",
    body: "Lessons, worked examples, and a practice quiz for each of the 29 official subskills — Reading & Writing and Math.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-16 sm:py-20 bg-white border-y border-[#ece9f7]">
      <div className="max-w-[880px] mx-auto">
        <h2 className="font-display font-semibold text-[26px] sm:text-[30px] text-ink text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center sm:text-left">
              <div className="w-8 h-8 rounded-full bg-ink text-white text-sm font-semibold flex items-center justify-center mb-3 mx-auto sm:mx-0">
                {i + 1}
              </div>
              <div className="font-display font-semibold text-[16px] text-ink mb-1.5">{step.title}</div>
              <p className="text-sm text-gray-600">{step.body}</p>
            </div>
          ))}
        </div>
        <SubskillMap />
      </div>
    </section>
  );
}
