"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import type { LandingShowcase } from "@/lib/landingShowcase";
import { TrackedLink } from "./TrackedLink";

const LETTERS = ["A", "B", "C", "D"];

// The homepage showcase: one problem that looks hard, answered here with no
// login, then taught the way every lesson teaches -- the diagram redraws
// itself with the one extra line that solves it, and three short steps walk
// through why. The only place on the page that talks numbers (how finely
// the test is broken down) sits beside it, since that's what the problem
// is an example of.
//
// Notebook content layer: a plain paper card, Instrument Sans, ink text,
// full-width answer choices. Green and red appear only as answer feedback.
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
    } else {
      window.dispatchEvent(new CustomEvent("landing:wrong"));
    }
  }

  return (
    <section id="try-a-question" className="nb-sec nb-try" aria-labelledby="nb-try-h">
      <div className="nb-try-head">
        <div>
          <span className="nb-kicker">Try a question</span>
          <h2 id="nb-try-h" className="nb-h2 nb-h2--md">
            The SAT, broken down to every kind of question it asks.
          </h2>
          <p className="nb-sec-sub">Each kind gets its own lesson. Answer this one, then see how it&apos;s taught.</p>
        </div>
        <div className="nb-stats">
          <div className="nb-stat-big">
            <b>{questionCount}</b>
            <span>practice questions, every one explained</span>
          </div>
          <ol className="nb-ladder" aria-label="How the SAT breaks down">
            {[
              { n: sectionCount, label: "sections", tone: "cyan" },
              { n: domainCount, label: "subject areas", tone: "lilac" },
              { n: skillCount, label: "skills", tone: "butter" },
              { n: typeCount, label: "question types", tone: "ink" },
            ].map((s) => (
              <li key={s.label} className={`nb-rung nb-rung--${s.tone}`}>
                <b>{s.n}</b>
                <span>{s.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="nb-q">
        <div className="nb-q-grid">
          <ZigzagDiagram revealed={answered} />
          <div>
            <div className="nb-q-meta">
              <span className="nb-q-tag">
                {item.skill} &middot; question type {item.typeIndex + 1} of {item.typeCount}
              </span>
              <span className="nb-q-tag nb-q-tag--hard">Hard</span>
              <span className="nb-q-note">No account needed</span>
            </div>
            <p className="nb-q-stem">{item.q}</p>
            <div className="nb-choices" role="radiogroup" aria-label="Answer choices">
              {item.choices.map((choice, i) => {
                const isAnswer = i === item.answer;
                const isPicked = i === selected;
                const state = !answered ? "" : isAnswer ? "is-right" : isPicked ? "is-wrong" : "is-dim";
                return (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={isPicked}
                    onClick={() => pick(i)}
                    onPointerEnter={() => window.dispatchEvent(new CustomEvent("landing:hover-choice", { detail: i % 2 === 0 ? -1 : 1 }))}
                    disabled={answered}
                    className={`nb-choice ${state}`}
                  >
                    <span className="nb-choice-l" aria-hidden>
                      {answered && isAnswer ? "✓" : answered && isPicked ? "✕" : LETTERS[i]}
                    </span>
                    <span>{choice}</span>
                    {answered && isAnswer && <span className="nb-sr">(correct answer)</span>}
                    {answered && isPicked && !isAnswer && <span className="nb-sr">(your answer, incorrect)</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {answered && (
          <div className="nb-q-teach" role="status">
            {correct ? (
              <p className="nb-fb nb-fb--right">Right: {item.choices[item.answer]}. Here&apos;s why it works.</p>
            ) : (
              <p className="nb-fb nb-fb--wrong">
                <b>Why {LETTERS[selected!]} is wrong: </b>
                {item.why[selected!]}
              </p>
            )}
            <ol className="nb-steps">
              {[
                <>
                  Draw a line through <b>B</b> parallel to <i>p</i> and <i>q</i>. It splits the angle at B into two pieces.
                </>,
                <>
                  The top piece and the <b className="nb-mark-a">35°</b> angle are alternate interior angles, so it&apos;s 35°. The bottom piece pairs
                  with the <b className="nb-mark-b">50°</b> angle the same way.
                </>,
                <>
                  Add the pieces: 35° + 50° = <b>85°</b>.
                </>,
              ].map((step, i) => (
                <li key={i}>
                  <span className="nb-step-n" aria-hidden>
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="nb-remember">
              <b>The move to remember:</b> when a path bends between parallel lines, the angle at the bend equals the two angles at the lines added
              together.
            </p>
            <p className="nb-q-every">Every lesson teaches this way.</p>
            <div className="nb-q-actions">
              <TrackedLink href="/start" event="signup_started" className="nb-cta nb-cta--sm">
                <span className="nb-cta-in">
                  <b>Start your plan</b>
                </span>
                <span className="nb-cta-arrow" aria-hidden>
                  →
                </span>
              </TrackedLink>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  window.dispatchEvent(new CustomEvent("landing:reset"));
                }}
                className="nb-btn"
              >
                Try it again
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ---- The figure --------------------------------------------------------------
// Drawn to scale: A on p, B between the lines, C on q, with the 35° at A
// and the 50° at C as in the problem, so the auxiliary line really does
// split B into those two angles. Before answering: the zigzag and a "?" at
// B. After: the dashed parallel through B, the split pieces colour-matched
// to the angles they equal, and the 85° total.

const INK = "#1F2F5A";
const WEDGE_A = "#8CC6EC";
const WEDGE_B = "#F1B287";

const A: [number, number] = [70, 44];
const B: [number, number] = [184, 124];
const Cpt: [number, number] = [117, 204];

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
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, transition: "opacity 500ms ease 150ms" });
  const t = (p: [number, number], text: string, color: string, size = 13, weight = 700) => (
    <text x={p[0]} y={p[1]} fill={color} fontSize={size} fontWeight={weight} textAnchor="middle" dominantBaseline="middle">
      {text}
    </text>
  );
  const wedge = (d: string, fill: string) => <path d={d} fill={fill} fillOpacity={0.45} stroke={INK} strokeWidth={1.5} />;
  return (
    <figure className="nb-fig">
      <svg viewBox="0 0 340 248" role="img" aria-label="Parallel lines p and q with a zigzag path from A on p, bending at B, to C on q">
        {/* the parallel lines, with their arrow marks */}
        {[A[1], Cpt[1]].map((y) => (
          <g key={y}>
            <line x1={16} y1={y} x2={324} y2={y} stroke={INK} strokeWidth={2} />
            <path d={`M ${292} ${y - 5} l 7 5 l -7 5`} fill="none" stroke={INK} strokeWidth={1.6} />
          </g>
        ))}
        {t([24, A[1] - 12], "p", INK, 14, 600)}
        {t([24, Cpt[1] - 12], "q", INK, 14, 600)}

        {/* the auxiliary line, drawn on reveal */}
        <g style={fade(revealed)}>
          <line x1={16} y1={B[1]} x2={324} y2={B[1]} stroke={INK} strokeWidth={1.5} strokeDasharray="6 5" opacity={0.6} />
        </g>

        {/* the given angles */}
        {wedge(arcPath(A, 30, 0, 35), WEDGE_A)}
        {t(at(A, 48, 17), "35°", INK)}
        {wedge(arcPath(Cpt, 28, -50, 0), WEDGE_B)}
        {t(at(Cpt, 46, -24), "50°", INK)}

        {/* the angle at B: one "?" wedge before, two matched pieces after */}
        <g style={fade(!revealed)}>
          <path d={arcPath(B, 26, 130, 215)} fill={INK} fillOpacity={0.08} stroke={INK} strokeWidth={1.5} />
          {t(at(B, 44, 172), "?", INK, 16)}
        </g>
        <g style={fade(revealed)}>
          {wedge(arcPath(B, 26, 180, 215), WEDGE_A)}
          {wedge(arcPath(B, 26, 130, 180), WEDGE_B)}
          {t(at(B, 47, 199), "35°", INK, 12)}
          {t(at(B, 47, 157), "50°", INK, 12)}
          <rect x={B[0] + 14} y={B[1] - 30} width={48} height={22} rx={6} fill={INK} />
          {t([B[0] + 38, B[1] - 19], "85°", "#ffffff", 13)}
        </g>

        {/* the zigzag itself, on top */}
        <polyline points={`${A.join(",")} ${B.join(",")} ${Cpt.join(",")}`} fill="none" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        {[A, B, Cpt].map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={INK} />
        ))}
        {t([A[0] - 8, A[1] - 12], "A", INK, 12, 600)}
        {t([B[0] + 12, B[1] + 4], "B", INK, 12, 600)}
        {t([Cpt[0] - 10, Cpt[1] + 16], "C", INK, 12, 600)}
      </svg>
    </figure>
  );
}
