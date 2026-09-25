"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import type { LandingShowcase } from "@/lib/landingShowcase";
import { TrackedLink } from "./TrackedLink";
import { Eyebrow } from "./Flourish";

const LETTERS = ["A", "B", "C", "D"];
const BLUE = "#5f8fb8";
const ORANGE = "#d3805f";

// The homepage showcase: one problem that looks hard, answered here with no
// login, then taught the way every lesson teaches -- the diagram redraws
// itself with the one extra line that solves it, and three short steps walk
// through why. The only place on the page that talks numbers (how finely
// the test is broken down) sits beside it, since that's what the problem
// is an example of.
export function SampleQuestion({
  item,
  questionCount,
  sectionCount,
  domainCount,
  skillCount,
  typeCount,
}: {
  item: LandingShowcase;
  questionCount: number;
  sectionCount: number;
  domainCount: number;
  skillCount: number;
  typeCount: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correct = answered && selected === item.answer;

  function pick(i: number) {
    if (answered) return;
    setSelected(i);
    const isCorrect = i === item.answer;
    track("sample_answered", { correct: isCorrect });
    if (isCorrect) {
      window.dispatchEvent(new CustomEvent("ozho:celebrate", { detail: { tier: "big" } }));
      window.dispatchEvent(new CustomEvent("landing:correct"));
    }
  }

  return (
    <section id="try-a-question" className="scroll-mt-[68px] border-t border-sage/30 bg-parchment px-6 pb-14 pt-8 sm:pb-16">
      <div className="mx-auto max-w-[1120px]">
        {/* Header row: the claim on the left, the numbers on the right, with
            the question count as the headline figure. Kept short so the
            whole problem below fits on one screen. */}
        <div className="mb-5 grid items-end gap-5 lg:grid-cols-[1fr_auto] lg:gap-10">
          <div>
            <Eyebrow>Try a question</Eyebrow>
            <h2 className="text-balance font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.01em] text-forest-900 sm:text-[34px]">
              The SAT, broken down to every kind of question it asks.
            </h2>
            <p className="mt-2 max-w-[520px] text-[14.5px] leading-relaxed text-stone-600">
              Each kind gets its own lesson. Answer this one, then see how it&apos;s taught.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-5">
            <div>
              <div className="font-display text-[48px] font-semibold leading-none tracking-tight text-forest-900 tabular-nums sm:text-[54px]">
                {questionCount}
              </div>
              <div className="mt-1.5 text-[13px] font-semibold text-forest">practice questions, every one explained</div>
            </div>
            <Ladder
              steps={[
                { n: sectionCount, label: "sections", tone: "bg-pastel-sky" },
                { n: domainCount, label: "subject areas", tone: "bg-pastel-sage" },
                { n: skillCount, label: "skills", tone: "bg-pastel-butter" },
                { n: typeCount, label: "question types", tone: "bg-forest text-ivory", last: true },
              ]}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(60,42,15,0.05),0_18px_44px_-24px_rgba(60,42,15,0.45)] ring-1 ring-[#e2d7c1] sm:p-6">
          <div className="grid items-center gap-5 lg:grid-cols-[1fr_1.05fr] lg:gap-7">
            <ZigzagDiagram revealed={answered} />
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-parchment px-2.5 py-1 font-semibold text-forest ring-1 ring-[#e2d7c1]">
                  {item.skill} &middot; question type {item.typeIndex + 1} of {item.typeCount}
                </span>
                <span className="rounded-full bg-[#fbeaea] px-2 py-0.5 font-semibold text-[#b23b3b]">Hard</span>
                <span className="text-stone-500">No account needed</span>
              </div>
              <p className="mb-4 text-[15px] leading-relaxed text-ink">{item.q}</p>
              <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Answer choices">
                {item.choices.map((choice, i) => {
                  const isAnswer = i === item.answer;
                  const isPicked = i === selected;
                  let row = "border-[#d9ceb7] bg-white hover:border-[#587356] hover:bg-[#fbf8f1]";
                  let badge = "bg-[#eef3e9] text-[#2c4c3b]";
                  if (answered && isAnswer) {
                    row = "border-accent bg-[#edf6f0] ring-1 ring-accent";
                    badge = "bg-accent text-white";
                  } else if (answered && isPicked) {
                    row = "border-[#c0524f] bg-[#fcefee] ring-1 ring-[#c0524f]";
                    badge = "bg-[#b23b3b] text-white";
                  } else if (answered) {
                    row = "border-[#e8dfcc] bg-white opacity-60";
                  }
                  return (
                    <button
                      key={i}
                      role="radio"
                      aria-checked={isPicked}
                      onClick={() => pick(i)}
                      disabled={answered}
                      className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[15px] font-medium text-ink transition-colors ${row}`}
                    >
                      <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[12.5px] font-bold ${badge}`}>
                        {answered && isAnswer ? "✓" : answered && isPicked ? "✕" : LETTERS[i]}
                      </span>
                      {choice}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {answered && (
            <div className="mt-6 animate-fade-up border-t border-[#ece4d4] pt-6">
              {correct ? (
                <div className="mb-4 text-[15px] font-semibold text-accent">Right: {item.choices[item.answer]}. Here&apos;s why it works.</div>
              ) : (
                <div className="mb-4 rounded-lg bg-[#fcefee] px-4 py-3 text-[14px] leading-relaxed text-ink ring-1 ring-[#f0d0d0]">
                  <span className="font-semibold text-[#b23b3b]">Why {LETTERS[selected!]} is wrong: </span>
                  {item.why[selected!]}
                </div>
              )}
              <ol className="space-y-3">
                {[
                  <>
                    Draw a line through <b>B</b> parallel to <i>p</i> and <i>q</i>. It splits the angle at B into two pieces.
                  </>,
                  <>
                    The top piece and the <b style={{ color: BLUE }}>35°</b> angle are alternate interior angles, so it&apos;s 35°.
                    The bottom piece pairs with the <b style={{ color: ORANGE }}>50°</b> angle the same way.
                  </>,
                  <>
                    Add the pieces: 35° + 50° = <b>85°</b>.
                  </>,
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-stone-700">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 rounded-lg bg-pastel-butter px-4 py-3 text-[14px] leading-relaxed text-ink">
                <span className="font-semibold">The move to remember:</span> when a path bends between parallel lines, the angle at the
                bend equals the two angles at the lines added together.
              </div>
              <p className="mt-6 text-[14px] text-stone-600">Every lesson teaches this way.</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <TrackedLink
                  href="/login?mode=signup"
                  event="signup_started"
                  className="rounded-md bg-forest px-6 py-3.5 text-center text-sm font-semibold tracking-wide text-ivory transition-colors hover:bg-forest-600"
                >
                  Start your plan &rarr;
                </TrackedLink>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-md px-5 py-3.5 text-sm font-semibold text-forest ring-1 ring-sage/45 transition-colors hover:bg-parchment"
                >
                  Try it again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// The four levels of the breakdown, the last (what Oakmont teaches) in green.
function Ladder({ steps }: { steps: { n: number; label: string; tone: string; last?: boolean }[] }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="How the SAT breaks down">
      {steps.map((s) => (
        <li key={s.label} className={`min-w-[76px] rounded-md px-2.5 py-2 ring-1 ring-sage/25 ${s.tone} ${s.last ? "" : "text-forest"}`}>
          <div className="font-display text-[20px] font-semibold leading-none tabular-nums">{s.n}</div>
          <div className={`mt-1 text-[11px] leading-tight ${s.last ? "text-ivory/75" : "text-stone-600"}`}>{s.label}</div>
        </li>
      ))}
    </ol>
  );
}

// ---- The figure --------------------------------------------------------------
// Drawn to scale: A on p, B between the lines, C on q, with the 35° at A
// and the 50° at C as in the problem, so the auxiliary line really does
// split B into those two angles. Before answering: the zigzag and a "?" at
// B. After: the dashed parallel through B, the split pieces color-matched
// to the angles they equal, and the 85° total.

const A: [number, number] = [70, 44];
const B: [number, number] = [184, 124];
const C: [number, number] = [117, 204];

function arcPath(c: [number, number], r: number, a0: number, a1: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const p0 = [c[0] + r * Math.cos(rad(a0)), c[1] + r * Math.sin(rad(a0))];
  const p1 = [c[0] + r * Math.cos(rad(a1)), c[1] + r * Math.sin(rad(a1))];
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M ${c[0]} ${c[1]} L ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A ${r} ${r} 0 ${large} 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} Z`;
}

function at(c: [number, number], r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [c[0] + r * Math.cos(rad), c[1] + r * Math.sin(rad)];
}

function ZigzagDiagram({ revealed }: { revealed: boolean }) {
  const ink = "#1d2621";
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, transition: "opacity 500ms ease 150ms" });
  const t = (p: [number, number], text: string, color: string, size = 13, weight = 700) => (
    <text x={p[0]} y={p[1]} fill={color} fontSize={size} fontWeight={weight} textAnchor="middle" dominantBaseline="middle">
      {text}
    </text>
  );
  return (
    <figure className="overflow-hidden rounded-xl bg-[#fbf9f4] ring-1 ring-[#ece4d4]">
      <svg viewBox="0 0 340 248" className="mx-auto block h-auto max-h-[272px] w-full" role="img" aria-label="Parallel lines p and q with a zigzag path from A on p, bending at B, to C on q">
        {/* the parallel lines, with their arrow marks */}
        {[A[1], C[1]].map((y) => (
          <g key={y}>
            <line x1={16} y1={y} x2={324} y2={y} stroke={ink} strokeWidth={2} />
            <path d={`M ${292} ${y - 5} l 7 5 l -7 5`} fill="none" stroke={ink} strokeWidth={1.6} />
          </g>
        ))}
        {t([24, A[1] - 12], "p", ink, 14, 600)}
        {t([24, C[1] - 12], "q", ink, 14, 600)}

        {/* the auxiliary line, drawn on reveal */}
        <g style={fade(revealed)}>
          <line x1={16} y1={B[1]} x2={324} y2={B[1]} stroke={ink} strokeWidth={1.5} strokeDasharray="6 5" opacity={0.55} />
        </g>

        {/* the given angles */}
        <path d={arcPath(A, 30, 0, 35)} fill={BLUE} fillOpacity={0.22} stroke={BLUE} strokeWidth={1.5} />
        {t(at(A, 48, 17), "35°", BLUE)}
        <path d={arcPath(C, 28, -50, 0)} fill={ORANGE} fillOpacity={0.22} stroke={ORANGE} strokeWidth={1.5} />
        {t(at(C, 46, -24), "50°", ORANGE)}

        {/* the angle at B: one "?" wedge before, two matched pieces after */}
        <g style={fade(!revealed)}>
          <path d={arcPath(B, 26, 130, 215)} fill={ink} fillOpacity={0.08} stroke={ink} strokeWidth={1.5} />
          {t(at(B, 44, 172), "?", ink, 16)}
        </g>
        <g style={fade(revealed)}>
          <path d={arcPath(B, 26, 180, 215)} fill={BLUE} fillOpacity={0.22} stroke={BLUE} strokeWidth={1.5} />
          <path d={arcPath(B, 26, 130, 180)} fill={ORANGE} fillOpacity={0.22} stroke={ORANGE} strokeWidth={1.5} />
          {t(at(B, 47, 199), "35°", BLUE, 12)}
          {t(at(B, 47, 157), "50°", ORANGE, 12)}
          <rect x={B[0] + 14} y={B[1] - 30} width={48} height={22} rx={6} fill={ink} />
          {t([B[0] + 38, B[1] - 19], "85°", "#ffffff", 13)}
        </g>

        {/* the zigzag itself, on top */}
        <polyline points={`${A.join(",")} ${B.join(",")} ${C.join(",")}`} fill="none" stroke={ink} strokeWidth={2.5} strokeLinejoin="round" />
        {[A, B, C].map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={ink} />
        ))}
        {t([A[0] - 8, A[1] - 12], "A", ink, 12, 600)}
        {t([B[0] + 12, B[1] + 4], "B", ink, 12, 600)}
        {t([C[0] - 10, C[1] + 16], "C", ink, 12, 600)}
      </svg>
    </figure>
  );
}
