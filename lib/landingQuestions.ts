// A small, hand-picked set of real questions from data/questions.ts (not
// fabricated placeholder content) for the landing page's ungated "try one
// right now" section. No API call, no auth -- this ships as static data so
// the section is fast and fully crawlable. Each one already exists in the
// real product's question bank; picked here for variety across
// Reading & Writing and Math, and for how cleanly the `pattern` maps to one
// reusable rule (exactly the "here's the pattern that solves every one of
// these" pitch the landing page makes).
export interface LandingQuestion {
  subskillName: string;
  domain: string;
  q: string;
  choices: string[];
  answer: number;
  explain: string;
  pattern: string;
}

export const LANDING_QUESTIONS: LandingQuestion[] = [
  {
    subskillName: "Transitions",
    domain: "Reading and Writing",
    q: "Which choice completes the text with the most logical transition? 'The experiment produced promising initial results. ______, further trials failed to replicate the effect.'",
    choices: ["Similarly", "However", "For example", "As a result"],
    answer: 1,
    explain:
      "The sentence shows a contrast (promising results vs. failed replication), which calls for 'however.'",
    pattern: "Identify the Logical Relationship First",
  },
  {
    subskillName: "Words in Context",
    domain: "Reading and Writing",
    q: "As used in the text, 'the negotiations reached an impasse' most nearly means the negotiations:",
    choices: ["concluded successfully", "were temporarily halted by disagreement", "began for the first time", "were made public"],
    answer: 1,
    explain: "An 'impasse' is a point where progress becomes impossible due to disagreement -- a standstill.",
    pattern: "Precise Synonym in Context",
  },
  {
    subskillName: "Central Ideas and Details",
    domain: "Reading and Writing",
    q: "Over the past decade, a city has converted more than sixty vacant lots into small neighborhood parks. The initiative never had a large budget to work with; what it had instead was a core group of volunteers who showed up, month after month, to plan and maintain each new site. Which choice best states the main idea of the text?",
    choices: [
      "Vacant lots are a common problem in most cities.",
      "Consistent volunteer coordination, not large budgets, drove the initiative's success.",
      "Pocket parks are more popular than large parks.",
      "The report took ten years to complete.",
    ],
    answer: 1,
    explain:
      "The text's central claim is about what caused success (volunteer coordination over funding), not the incidental facts about lots or duration.",
    pattern: "Whole-Passage Main Idea",
  },
  {
    subskillName: "Linear Equations in One Variable",
    domain: "Math",
    q: "A rental company charges a flat fee of $25 plus $0.20 per mile. If a customer's bill is $61, how many miles did they drive?",
    choices: ["120", "150", "180", "200"],
    answer: 2,
    explain: "25 + 0.2m = 61 → 0.2m = 36 → m = 180.",
    pattern: "Standard Isolate-the-Variable Equations",
  },
];
