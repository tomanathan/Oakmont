import { C, Scribble, Tape } from "./art";

const STEPS = [
  {
    t: "Try 5 SAT questions",
    b: "No signup and no card. Five SAT-style questions, each with a clear explanation.",
    c: C.butter,
    r: -2,
    tape: C.cyan,
  },
  {
    t: "Pick your test date",
    b: "You get a week-by-week plan. Six months is recommended, and the plan sizes itself to fit the time you have.",
    c: C.cyan,
    r: 1.5,
    tape: C.tangerine,
  },
  {
    t: "Study, and Ozho eats",
    b: "Lessons and quizzes for every SAT skill, plus full-length practice tests. The more days you study, the more costumes he unlocks.",
    c: C.lilac,
    r: -1,
    tape: C.butter,
  },
];

export function HowItWorks() {
  return (
    <section className="nb-sec nb-how" id="how" aria-labelledby="nb-how-h">
      <div className="nb-sec-head">
        <h2 id="nb-how-h" className="nb-h2">
          How it works
        </h2>
        <Scribble w={250} className="nb-scribble" />
      </div>
      <ol className="nb-notes">
        {STEPS.map((s, i) => (
          <li key={s.t} className="nb-note" style={{ ["--c" as string]: s.c, ["--r" as string]: `${s.r}deg` }}>
            <Tape color={s.tape} pattern="grid" className="nb-note-tape" />
            <span className="nb-note-n" aria-hidden>
              {i + 1}
            </span>
            <h3>{s.t}</h3>
            <p>{s.b}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
