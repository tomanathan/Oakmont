import type { LessonVideoScript } from "../../types";

export const M_PROBABILITY: LessonVideoScript[] = [
  {
    subskillId: "m-probability",
    pattern: "Basic and Compound Probability",
    example: 1,
    hook: "\"And\" and \"or\" look like tiny words. In probability, they change the whole method.",
    idea: [
      { point: "P = favorable / total", say: "Basic probability is favorable outcomes over total outcomes." },
      { point: "Independent \"and\" → multiply", say: "For two independent events both happening, multiply their probabilities." },
      { point: "\"Or\" → add, then subtract overlap", say: "For either one happening, add them, then subtract the chance of both, so you don't count it twice." },
    ],
    steps: [
      {
        say: "Five red, three blue, and the marble goes back in. We want first red, or second blue.",
        highlight: ["5 red marbles and 3 blue marbles", "replaced", "the first marble is red OR the second marble is blue"],
        work: "P(1st red) = 5/8, P(2nd blue) = 3/8",
        note: "favorable / total",
      },
      {
        say: "Both can happen at once. Since the marble's replaced, the draws are independent, so multiply for the overlap.",
        work: "both: 5/8 × 3/8 = 15/64",
        note: "and → multiply",
      },
      {
        say: "Or means add the two, then take away the overlap.",
        work: "5/8 + 3/8 − 15/64",
        note: "add, − overlap",
      },
      {
        say: "Put it all over sixty-four. Forty plus twenty-four minus fifteen is forty-nine.",
        work: "40/64 + 24/64 − 15/64 = 49/64",
        note: "common denominator",
      },
      {
        say: "One comes from adding without subtracting the overlap. It counts the both case twice.",
        strike: [1],
      },
      {
        say: "Five eighths is only the first draw, and fifteen sixty-fourths is only the overlap.",
        strike: [2, 3],
      },
    ],
    answer: "Forty-nine sixty-fourths. Add the two, minus the part you counted twice.",
    trap: { point: "Trap: forgetting to subtract the overlap", say: "If both events can happen together, adding them counts that outcome twice. Take it out once." },
    recap: { point: "And: multiply. Or: add, minus overlap.", say: "Independent and, multiply. Or, add them and subtract the chance of both." },
  },
  {
    subskillId: "m-probability",
    pattern: "Conditional Probability",
    example: 1,
    hook: "\"Given that\" is the most important phrase in the question. It shrinks your world.",
    idea: [
      { point: "\"Given that\" → shrink the group", say: "Given that tells you to ignore everyone outside a certain group." },
      { point: "That group is the new total", say: "The size of that group becomes your denominator, not the whole sample." },
    ],
    steps: [
      {
        say: "Given that they play a sport. So we only look at the one hundred twenty athletes.",
        highlight: ["given that they play a sport", "120 play a sport"],
        work: "given sport → total = 120",
        note: "shrink the total",
      },
      {
        say: "Of those one twenty, forty-five also play an instrument.",
        highlight: ["45 also play a musical instrument"],
        work: "P = 45 / 120",
        note: "favorable / new total",
      },
      {
        say: "Both divide by fifteen. Forty-five over one twenty is three eighths.",
        work: "45/120 = 3/8",
        note: "÷15 top and bottom",
      },
      {
        say: "Forty-five over two hundred uses everyone surveyed. Nine fortieths is that same fraction, reduced.",
        strike: [1, 2],
      },
      {
        say: "And eighty is the number who don't play a sport. The condition says we only want the ones who do.",
        strike: [3],
      },
    ],
    answer: "Three eighths. Forty-five out of the one hundred twenty athletes.",
    trap: { point: "Trap: dividing by the whole sample", say: "The condition cuts the group down. Divide by the size of that smaller group, not everyone." },
    recap: { point: "Find the group, then count inside it", say: "Find the group the condition describes. Then count only inside it." },
  },
];
