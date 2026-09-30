import type { LessonVideoScript } from "../types";

export const CROSS_TEXT: LessonVideoScript[] = [
  {
    subskillId: "rw-cross-text",
    pattern: "Finding Common Ground Between Disagreeing Authors",
    example: 0,
    excerpt:
      "civic engagement. \n\nPassage 2: Social media platforms have changed how people interact so significantly that many users substitute brief online exchanges for the sustained, in-person relationships that once anchored community life, fostering isolation",
    hook: "Two authors disagree, and you're asked what they'd both still say. Sounds impossible. It isn't.",
    idea: [
      { point: "Split facts from conclusions", say: "Split each passage in two: the facts it starts from, and the conclusion it reaches." },
      { point: "Common ground is a shared fact", say: "Authors who disagree usually share the facts. They're fighting about what those facts mean." },
    ],
    steps: [
      {
        say: "Passage one says social media boosts civic engagement. Passage two says it breeds isolation. B takes passage one's side.",
        highlight: ["civic engagement", "fostering isolation"],
        strike: [1],
      },
      {
        say: "Neither passage mentions regulation. And nobody calls in-person relationships entirely obsolete.",
        strike: [2, 3],
      },
      {
        say: "The fact under both arguments: social media has changed how people interact. Passage one needs that to be true too.",
        highlight: ["have changed how people interact so significantly"],
      },
    ],
    answer: "It's choice A. Same starting fact, opposite conclusions.",
    trap: {
      point: "Trap: one author's conclusion",
      say: "A tempting choice often restates one side. If only one author would sign it, it isn't common ground.",
    },
    recap: {
      point: "Shared facts, not shared conclusions",
      say: "Separate facts from conclusions, then find the fact both authors stand on.",
    },
  },
  {
    subskillId: "rw-cross-text",
    pattern: "Predicting One Author's Response to the Other's Claim",
    example: 2,
    excerpt:
      "Passage 1: A city's new nighttime noise ordinance has measurably reduced late-night disturbances, and residents report sleeping better and feeling calmer in their own neighborhoods as a direct result.",
    hook: "Here you predict a reply. One author hears the other's point. What do they say back?",
    idea: [
      { point: "Find what the author cares about", say: "Every author has one core value driving the argument. Name it in a few words." },
      { point: "Apply it. Reframe, don't reject.", say: "Then let that value answer the new claim. Usually it accepts the facts and argues about what matters more." },
    ],
    steps: [
      {
        say: "Passage one cares about residents: better sleep, calmer neighborhoods. Its value is quality of life.",
        highlight: ["residents report sleeping better and feeling calmer"],
      },
      {
        say: "Calling the ordinance a mistake would flip passage one's whole position. B is out.",
        strike: [1],
      },
      {
        say: "Denying that any business was hurt ignores the real losses passage two describes. And telling businesses to move cities goes way past anything passage one argues.",
        strike: [2, 3],
      },
    ],
    answer: "It's choice A. Sure, businesses feel it, but residents' quality of life matters more.",
    trap: {
      point: "Trap: rejecting the evidence outright",
      say: "Skip replies that deny the other side's facts. A reasonable author admits them and argues about what they mean.",
    },
    recap: {
      point: "Same value, new claim",
      say: "Find what the author cares about, then let that answer the new claim.",
    },
  },
];
