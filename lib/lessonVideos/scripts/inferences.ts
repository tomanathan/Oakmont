import type { LessonVideoScript } from "../types";

export const INFERENCES: LessonVideoScript[] = [
  {
    subskillId: "rw-inferences",
    pattern: "Logical Completion (Fill-in-the-Blank Style)",
    example: 0,
    hook: "Fill-in-the-blank inferences reward the careful answer, not the exciting one.",
    idea: [
      { point: "Use only what's stated", say: "The answer has to follow from the text alone. No outside knowledge, no creative leaps." },
      { point: "Ask what must come next", say: "Ask what must be true next, given only what's here. Not what would be interesting." },
    ],
    steps: [
      {
        say: "The key fact: these results contradicted decades of research. That's surprising, and surprising results need checking.",
        highlight: ["contradicted decades of prior research"],
      },
      {
        say: "Abandoning the whole question overreacts. And publishing right away skips the checking.",
        strike: [0, 2],
      },
      {
        say: "One result can't show decades of research were done wrong. The text never makes that leap.",
        strike: [3],
      },
    ],
    answer: "Replicating the experiment. It's the cautious next step, straight from the text.",
    trap: { point: "Trap: the most dramatic ending", say: "Breakthroughs and big reversals sound exciting. The right answer is the one the text forces." },
    recap: { point: "Only what's stated, nothing more", say: "Stick to the text, and pick the smallest step it supports." },
  },
  {
    subskillId: "rw-inferences",
    pattern: "Multi-Step and Conditional Inferences",
    example: 1,
    hook: "Some inference questions hand you two facts and quietly expect you to use both.",
    idea: [
      { point: "Track each fact, then combine", say: "Keep each fact separate, then ask what they add up to together." },
      { point: "Narrowest conclusion they all support", say: "The answer is the narrowest conclusion all the facts support. Not a sweeping one." },
    ],
    steps: [
      {
        say: "Fact one: three times as many loaves per batch. Fact two: it heats up in half the time.",
        highlight: ["three times as many loaves per batch", "reaches baking temperature in half the time"],
      },
      {
        say: "More bread per batch, less waiting per batch. So output dropping, or staying the same, goes against both facts.",
        strike: [1, 2],
      },
      {
        say: "And customers never come up. The question is how much bread the bakery can make.",
        strike: [3],
      },
    ],
    answer: "Output could go up a lot, without necessarily hiring more staff. Both facts, nothing extra.",
    trap: { point: "Trap: using only the first fact", say: "Stop after fact one, and extra choices start to look fine. The second fact is there for a reason." },
    recap: { point: "Stack the facts, then stay narrow", say: "Line up every fact, and claim no more than they show together." },
  },
];
