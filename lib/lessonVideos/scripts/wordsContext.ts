import type { LessonVideoScript } from "../types";

export const WORDS_CONTEXT: LessonVideoScript[] = [
  {
    subskillId: "rw-words-context",
    pattern: "Precise Synonym in Context",
    example: 0,
    hook: "These look like vocab questions. Mostly, they're about finding one clue.",
    idea: [
      { point: "Cover the choices, find the clue", say: "Cover the choices. Look for the clue: a contrast, a restatement, or a cause and its result." },
      { point: "Predict your own plain word", say: "Guess your own plain word for the blank. Then pick the choice that means it, not the fanciest one." },
    ],
    steps: [
      {
        say: "The clue: departments wanted bigger budgets, and they criticized the approach. So spending was tight. My word: strict.",
        highlight: ["drew criticism from departments hoping for expanded budgets"],
      },
      {
        say: "Generous is the opposite. Nobody hoping for more money complains about generosity.",
        strike: [0],
      },
      {
        say: "Confusing and enthusiastic don't explain the complaint. It's about how little got spent.",
        strike: [2, 3],
      },
    ],
    answer: "Austere means strict and bare-bones. That matches my word.",
    trap: { point: "Trap: the fanciest-sounding word", say: "A harder word isn't more likely to be right. Pick the one that means what the sentence needs." },
    recap: { point: "Clue, then your word, then match", say: "Find the clue, predict your word, then match it." },
  },
  {
    subskillId: "rw-words-context",
    pattern: "Multiple-Meaning Word Trap",
    example: 1,
    hook: "Sometimes the right answer looks wrong, because you only know its everyday meaning.",
    idea: [
      { point: "Tests love a word's second meaning", say: "The test likes words with two common meanings, and then it uses the less familiar one." },
      { point: "Looks off? Check the other meaning", say: "If a choice seems too easy, or makes no sense at first, check its other meaning." },
    ],
    steps: [
      {
        say: "The critic recommended the film, but spent three paragraphs on its flaws. So the review was mixed.",
        highlight: ["ultimately recommended the film", "three paragraphs detailing its uneven pacing"],
      },
      {
        say: "Glowing is too positive for all those flaws. Dismissive is too negative, since the critic still recommended it.",
        strike: [0, 2],
      },
      {
        say: "Brief doesn't fit three paragraphs of flaws. And qualified? You probably hear credentials. That's the wrong meaning here.",
        strike: [3],
      },
    ],
    answer: "Qualified also means held back by reservations. Praise with conditions. That's this review.",
    trap: { point: "Trap: stopping at the familiar meaning", say: "Know only one meaning, and you'll cross off the right answer without a second thought." },
    recap: { point: "Weird fit? Try the other meaning", say: "When a choice seems off, try its other meaning. The sentence tells you which one it wants." },
  },
  {
    subskillId: "rw-words-context",
    pattern: "Word Meaning As Used in the Text",
    example: 0,
    hook: "Here, every choice is a real meaning of the word. Only one fits this sentence.",
    idea: [
      { point: "Put your own word in", say: "Cover the choices, reread the sentence, and put your own simple word in its place." },
      { point: "Swap each choice in", say: "Then swap each choice in. Unusual meaning or everyday one, let the sentence decide." },
    ],
    steps: [
      {
        say: "She has a keen eye for small faults. She spots a crooked hem from across the room. My word: sharp-sighted.",
        highlight: ["keen eye for small faults", "spot a crooked hem from across the parlor"],
      },
      {
        say: "Keen can mean eager. But an eager eye wants something. It doesn't spot a crooked hem.",
        strike: [0],
      },
      {
        say: "Sharp-edged is for a blade, and bitterly cold is for a keen wind. Neither describes an eye.",
        strike: [2, 3],
      },
    ],
    answer: "Perceptive. Good at noticing things, which is exactly what she does.",
    trap: { point: "Trap: real meaning, wrong sentence", say: "Every wrong choice is a real meaning of keen. It just breaks when you swap it in." },
    recap: { point: "Paraphrase, then swap each in", say: "Say it in your own words, then keep the choice that says the same thing." },
  },
];
