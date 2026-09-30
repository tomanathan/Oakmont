import type { LessonVideoScript } from "../types";

export const TRANSITIONS: LessonVideoScript[] = [
  {
    subskillId: "rw-transitions",
    pattern: "Identify the Logical Relationship First",
    example: 0,
    hook: "Transitions look like a vocab test. They're really a logic test.",
    idea: [
      { point: "Name the relationship first", say: "Before you read a single choice, decide how the two sentences connect." },
      { point: "Contrast · cause · addition · example", say: "It's almost always one of four: contrast, cause and effect, addition, or example." },
      { point: "Then match a word to it", say: "Only then find the word that signals that relationship. Don't test which one sounds right." },
    ],
    steps: [
      {
        say: "First sentence: the results looked promising.",
        highlight: ["promising initial results"],
      },
      {
        say: "Second sentence: the trials failed to replicate it. Good news, then bad news. That's a contrast.",
        highlight: ["failed to replicate the effect"],
      },
      {
        say: "The word similarly signals a match. The phrase for example signals an illustration. Neither is a contrast.",
        strike: [0, 2],
      },
      {
        say: "As a result would mean the good results caused the failure. They didn't.",
        strike: [3],
      },
    ],
    answer: "The word however is the only contrast here. That's the answer.",
    trap: { point: "Trap: picking what sounds smooth", say: "Every choice can sound fine out loud. Only one matches the logic." },
    recap: { point: "Relationship first, word second", say: "Name the relationship, then pick the word. Every time." },
  },
  {
    subskillId: "rw-transitions",
    pattern: "Contrast vs. Concession",
    example: 1,
    hook: "However and nonetheless both sound like contrast words. They're not quite the same.",
    idea: [
      { point: "However: two opposite sides", say: "The word however sets two opposite ideas side by side. This one, but that one." },
      { point: "Nonetheless: true anyway", say: "The words nonetheless, still, and even so mean: yes, that happened, but this is true anyway." },
      { point: "Ask: opposites, or despite?", say: "So ask: do the ideas clash head on, or does the second hold up despite the first?" },
    ],
    steps: [
      {
        say: "First sentence: the repairs ran months late. A setback.",
        highlight: ["ran three months behind schedule"],
      },
      {
        say: "Then the bridge passed every inspection. Being late doesn't cancel that. It's good news despite bad news.",
        highlight: ["passed every safety inspection without a single issue"],
      },
      {
        say: "The word consequently says the delay caused the clean inspection. It didn't.",
        strike: [0],
      },
      {
        say: "And passing isn't similar to running late, or an example of it.",
        strike: [2, 3],
      },
    ],
    answer: "It's nonetheless. The setback is admitted, and the result still holds.",
    trap: {
      point: "Trap: treating contrast words as twins",
      say: "Contrast words aren't interchangeable. Concession means despite this, still. Not a flat contradiction.",
    },
    recap: {
      point: "Clash, or despite?",
      say: "Opposites side by side? However. True despite a setback? Nonetheless.",
    },
  },
];
