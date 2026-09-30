import type { LessonVideoScript } from "../types";

export const FORM_STRUCTURE: LessonVideoScript[] = [
  {
    subskillId: "rw-form-structure",
    pattern: "Subject-Verb Agreement with Distracting Phrases",
    example: 3,
    hook: "A verb has to match its subject. The trick is that the subject gets buried under extra words.",
    idea: [
      { point: "Cross out the in-between phrases", say: "Mentally cross out any phrase sitting between the subject and its verb." },
      { point: "Match the verb to what's left", say: "Then match the verb to the real subject. One thing, singular verb. More than one, plural." },
    ],
    steps: [
      {
        say: "The phrase of the survey is just describing. Cross it out. Same with conducted across all twelve regions.",
        highlight: ["of the survey", "conducted across all twelve regions"],
      },
      {
        say: "What's left: the results, blank, still being reviewed. Results means more than one. Plural.",
        highlight: ["The results"],
      },
      {
        say: "Is, was, and has been are all singular. They'd match survey, but survey isn't the subject.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Are. Plural subject, plural verb.",
    trap: {
      point: "Trap: the noun in the extra phrase",
      say: "A noun tucked inside an extra phrase is often a decoy. Match the verb to the real subject.",
    },
    recap: {
      point: "Cross out, then match",
      say: "Cross out the extras, find the real subject, then match the verb.",
    },
  },
  {
    subskillId: "rw-form-structure",
    pattern: "Parallel Structure in Lists and Comparisons",
    example: 2,
    hook: "Lists have a rhythm. Every item has to match the ones that came before it.",
    idea: [
      { point: "List items share one form", say: "In a list, every item uses the same grammatical shape. That's called parallel structure." },
      { point: "Copy the first items' form", say: "Look at the first couple of items, notice their form, and make the last one match exactly." },
    ],
    steps: [
      {
        say: "Writing clear emails. Giving effective feedback. Both start with a word that ends the same way, in ing.",
        highlight: ["writing", "giving"],
      },
      {
        say: "The choices to lead and leads switch shapes partway through the list. That breaks the rhythm.",
        strike: [1, 2],
      },
      {
        say: "Having led is closer, but it's still a different form. The list needs the same kind of word, like writing and giving.",
        strike: [3],
      },
    ],
    answer: "Leading meetings efficiently. Writing, giving, leading. All three match.",
    trap: {
      point: "Trap: fine alone, wrong in the list",
      say: "Some choices are perfectly good English on their own. What matters is whether they match the rest of the list.",
    },
    recap: {
      point: "Every item matches the first",
      say: "Spot the form of the first items, then make every item match it.",
    },
  },
  {
    subskillId: "rw-form-structure",
    pattern: "Pronoun Agreement and Reference",
    example: 4,
    hook: "Pronoun questions are two checks in one: who it points to, and what job it's doing.",
    idea: [
      { point: "First: who does it point to?", say: "Find the noun the pronoun points back to. Is it one thing, or more than one?" },
      { point: "Then: owner word or short form?", say: "Then check its job. Right before a noun, you need an owner word, like its or their, with no apostrophe." },
    ],
    steps: [
      {
        say: "Whose theory? Sorensen and Asante's. Two people, so it's plural.",
        highlight: ["Nadia Sorensen and Kwame Asante"],
      },
      {
        say: "Its, with no apostrophe, is singular. It would point to the ship, not two archaeologists.",
        strike: [3],
      },
      {
        say: "The blank sits right before theory, so it needs an owner word. The apostrophe choices just mean it is and they are.",
        highlight: ["______ theory"],
        strike: [0, 2],
      },
    ],
    answer: "Their. Plural, and it shows ownership.",
    trap: {
      point: "Trap: sound-alikes",
      say: "Several choices sound identical out loud. Check the apostrophe. Owner words never have one.",
    },
    recap: {
      point: "Who first, then what job",
      say: "Find who the pronoun means, then check whether the blank needs an owner word.",
    },
  },
  {
    subskillId: "rw-form-structure",
    pattern: "Verb Tense and Form Consistency",
    example: 0,
    hook: "Verb tense questions are really timeline questions. Work out when things happened, then pick the verb.",
    idea: [
      { point: "Map the timeline first", say: "Before the choices, ask: one past event, one before another, or something still going now?" },
      { point: "Earlier past event gets had", say: "When one past event happens before another, the earlier one takes had. Like had finished, or had left." },
    ],
    steps: [
      {
        say: "By the time the store closed. That's a past moment, and the restocking was finished before it.",
        highlight: ["By the time the store closed"],
      },
      {
        say: "Plain restocked blurs the order. We need to show the restocking came first.",
        strike: [1],
      },
      {
        say: "Has restocked ties it to now, but the whole scene is past. Was restocking sounds unfinished, but every shelf twice is done.",
        highlight: ["every shelf twice"],
        strike: [2, 3],
      },
    ],
    answer: "Had restocked. Done before the store closed.",
    trap: {
      point: "Trap: simple past out of habit",
      say: "Plain past tense sounds natural. But when one event comes before another, the earlier one needs had.",
    },
    recap: {
      point: "Timeline first, verb second",
      say: "Map when things happened, then pick the verb that fits that timeline.",
    },
  },
  {
    subskillId: "rw-form-structure",
    pattern: "Modifier Placement and Dangling Modifiers",
    example: 1,
    hook: "An opening phrase describes whatever comes right after the comma. When that's wrong, things get weird.",
    idea: [
      { point: "Opener describes the next noun", say: "A describing phrase at the start of a sentence belongs to the noun right after the comma." },
      { point: "Who's really doing it?", say: "So ask who actually does what the phrase says. If it isn't that noun, the phrase is dangling." },
    ],
    steps: [
      {
        say: "The noun after the blank is the ancient manuscript. So the opener has to describe the manuscript.",
        highlight: ["the ancient manuscript"],
      },
      {
        say: "Discovering it, or having discovered it, makes the manuscript the discoverer. Manuscripts don't go searching.",
        strike: [1, 2],
      },
      {
        say: "To discover it says it was restored in order to discover itself. That makes no sense.",
        strike: [3],
      },
    ],
    answer: "Discovered in a monastery archive. The manuscript was found. It didn't do the finding.",
    trap: {
      point: "Trap: complete, but mismatched",
      say: "Every choice makes a full sentence. The real test is whether the opener fits the noun after it.",
    },
    recap: {
      point: "The next noun does the action",
      say: "Figure out who the opener describes, then make sure that's the noun right after the comma.",
    },
  },
  {
    subskillId: "rw-form-structure",
    pattern: "Finite vs. Non-Finite Verb Forms",
    example: 3,
    hook: "Some verb forms can run a sentence on their own. Others can't. Which kind does the blank need?",
    idea: [
      { point: "A main verb can stand alone", say: "A main verb shows tense and can carry a sentence by itself. Like inspected." },
      { point: "Extras can't stand alone", say: "Any other verb-looking word needs a form that can't stand alone, like finding or to find. So find the main verb first." },
    ],
    steps: [
      {
        say: "The main verb is already here: inspected. The engineer inspected the beams. That's a full sentence.",
        highlight: ["The engineer inspected the bridge's support beams"],
      },
      {
        say: "So the blank starts an add-on. Found would be a second main verb, two sentences glued with just a comma.",
        strike: [1],
      },
      {
        say: "Finds has the same problem. Having find isn't grammatical at all.",
        strike: [2, 3],
      },
    ],
    answer: "Finding. It attaches and tells us what the engineer found.",
    trap: {
      point: "Trap: a second main verb",
      say: "Found looks normal. But with a main verb already there, it makes a run-on.",
    },
    recap: {
      point: "One main verb. The rest attach.",
      say: "Find the one main verb. Everything else that looks like a verb has to attach, not stand alone.",
    },
  },
];
