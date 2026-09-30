import type { LessonVideoScript } from "../types";

export const RHETORICAL_SYNTHESIS: LessonVideoScript[] = [
  {
    subskillId: "rw-rhetorical-synthesis",
    pattern: "Goal-Filtered Selection",
    example: 1,
    excerpt:
      "(3) Staff reported spending more time helping patrons find books. The student wants to emphasize the impact of the kiosks on staff work, not on patron convenience.",
    hook: "You get some notes and a goal. Here's the secret: almost every choice is true.",
    idea: [
      { point: "Ask: does it hit the goal?", say: "So don't ask which sentence is accurate. Ask which one does the exact job the goal names." },
      { point: "Read the goal twice", say: "Goals are specific. One small phrase can rule out half the choices." },
    ],
    steps: [
      {
        say: "The goal: impact on staff work. Not patron convenience. That second part matters.",
        highlight: ["impact of the kiosks on staff work", "not on patron convenience"],
      },
      {
        say: "Shorter wait times help patrons, not staff. So A and C, built on wait times, miss the goal.",
        strike: [0, 2],
      },
      {
        say: "D calls the kiosks a technology investment. True enough, but it says nothing about staff.",
        strike: [3],
      },
      {
        say: "Here's the staff note: more time helping patrons find books.",
        highlight: ["Staff reported spending more time helping patrons find books"],
      },
    ],
    answer: "B pairs the kiosks with the staff note. Exactly what the goal asks.",
    trap: {
      point: "Trap: true, but off the goal",
      say: "Accurate isn't enough. The wrong choices here are true. They just serve a different goal.",
    },
    recap: {
      point: "Goal first, facts second",
      say: "Read the goal closely, then pick the sentence that does that exact job.",
    },
  },
];
