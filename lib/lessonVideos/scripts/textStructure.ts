import type { LessonVideoScript } from "../types";

export const TEXT_STRUCTURE: LessonVideoScript[] = [
  {
    subskillId: "rw-text-structure",
    pattern: "Main Purpose of the Whole Text",
    example: 1,
    excerpt:
      "Mira let go of her uncle's hand at the top of the dunes and simply stood there. The water went on and on until it met the sky, and she could not tell where one stopped and the other began.",
    hook: "Main purpose questions don't ask what a text is about. They ask what it's doing.",
    idea: [
      { point: "Sum it up as a verb phrase", say: "Sum up the whole text as a verb phrase, like to explain a discovery, or to show how someone feels." },
      { point: "Stories: what do the details add up to?", say: "In a story, ask what the details add up to. Usually a feeling, a place, or a relationship." },
    ],
    steps: [
      {
        say: "It's Mira's first time at the coast. She stops and stares, and the water seems endless. The rest of the scene keeps building that wonder.",
        highlight: ["simply stood there", "went on and on until it met the sky"],
      },
      {
        say: "Scared? Nothing says so. She lets go of her uncle's hand to stand and stare. That's awe.",
        strike: [2],
      },
      {
        say: "The text never says why the family came. And the pictures she'd seen get one line, just to show the real ocean beats them.",
        strike: [1, 3],
      },
    ],
    answer: "To convey Mira's amazement at seeing the ocean for the first time.",
    trap: { point: "Trap: the purpose of just one part", say: "A choice that fits one detail isn't the purpose. It has to cover the whole text." },
    recap: { point: "What is the whole text doing?", say: "Name what the whole text is doing, then match the verb and the aim." },
  },
  {
    subskillId: "rw-text-structure",
    pattern: "Function of a Sentence Within a Paragraph",
    example: 0,
    excerpt:
      "Traffic engineers have increasingly championed narrow city streets as a straightforward way to improve pedestrian safety, since narrower lanes naturally slow drivers down. However, narrow streets without clear sightlines at intersections can actually increase collision risk.",
    hook: "Some questions don't care what a sentence says. They care what job it's doing.",
    idea: [
      { point: "Name the sentence's job", say: "A sentence might introduce a claim, give an example, or qualify one, meaning limit it without rejecting it." },
      { point: "Ask: what breaks if I delete it?", say: "The best test: delete it in your head. What would the passage lose?" },
    ],
    steps: [
      {
        say: "The claim: narrow streets slow drivers, so they're safer. Then our sentence, starting with however.",
        highlight: ["improve pedestrian safety", "However, narrow streets without clear sightlines at intersections can actually increase collision risk."],
      },
      {
        say: "Delete it, and narrow streets sound safer no matter what. It adds a condition: no clear sightlines, more risk.",
      },
      {
        say: "It never says narrow streets are always more dangerous. There's no statistic. And sightlines aren't a new topic.",
        strike: [1, 2, 3],
      },
    ],
    answer: "It qualifies the main claim. It limits it without throwing it out.",
    trap: { point: "Trap: calling a limit a reversal", say: "A however sentence often just limits a claim. Don't read it as a full contradiction." },
    recap: { point: "Ask what the sentence does", say: "Don't restate the sentence. Ask what the passage would lose without it." },
  },
  {
    subskillId: "rw-text-structure",
    pattern: "Function of an Entire Paragraph",
    example: 2,
    excerpt:
      "Many people assume a lightning rod works by attracting a strike to itself and drawing it away from a building, like a decoy.\n\nIn reality, a lightning rod works by providing a low-resistance path",
    hook: "Same idea as a sentence's job, just bigger. What is this paragraph there to do?",
    idea: [
      { point: "Background, opposing view, evidence, or conclusion", say: "A paragraph usually gives background, raises an opposing view, offers evidence, or draws a conclusion." },
      { point: "Signal words give it away", say: "Look at the paragraphs around it. Words like however and for example are big clues." },
    ],
    steps: [
      {
        say: "Paragraph one starts with: many people assume. Paragraph two starts with: in reality. Belief, then correction.",
        highlight: ["Many people assume", "In reality"],
      },
      {
        say: "No invention history here. And the passage never says rods don't work, just not like a decoy.",
        strike: [1, 2],
      },
      {
        say: "It's not a rare exception either. It's a belief lots of people share.",
        strike: [3],
      },
    ],
    answer: "It presents a common misconception, and sets up the real explanation that follows.",
    trap: { point: "Trap: skimming past the signal words", say: "Skim past a phrase like in reality, and you can miss the paragraph's whole job." },
    recap: { point: "What does it do for its neighbors?", say: "Ask what the paragraph does for the ones around it." },
  },
  {
    subskillId: "rw-text-structure",
    pattern: "Describing the Structure of an Entire Passage",
    example: 0,
    excerpt:
      "Most migratory songbirds that breed in the Arctic follow strikingly similar north-south routes each year, funneling through the same narrow corridors as their ancestors. The Arctic tern, however, breaks from this pattern entirely",
    hook: "This one zooms all the way out. Not one sentence, but the shape of the whole passage.",
    idea: [
      { point: "Sketch the shape first", say: "Before the choices, sketch the shape. Claim, then example. Problem, then solution." },
      { point: "Same moves, same order", say: "Then find the choice with the same moves in the same order. The right topic isn't enough." },
    ],
    steps: [
      {
        say: "First, a general pattern: most Arctic songbirds take the same routes. Then the tern breaks it. Pattern, then exception.",
        highlight: ["follow strikingly similar north-south routes", "The Arctic tern, however, breaks from this pattern entirely"],
      },
      {
        say: "No hypothesis gets tested with experiments. And it's not told from one bird's point of view.",
        strike: [1, 3],
      },
      {
        say: "It does end on a debate, but about the tern's route. Not two theories of why birds migrate.",
        strike: [2],
      },
    ],
    answer: "A general pattern, then one species as the exception.",
    trap: { point: "Trap: right topic, wrong order", say: "A choice can name the right ideas and still get the order backwards." },
    recap: { point: "Sketch the shape, then match it", say: "Sketch the shape first, then match the moves in order." },
  },
];
