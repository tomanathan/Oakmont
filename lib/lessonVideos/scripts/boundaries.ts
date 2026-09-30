import type { LessonVideoScript } from "../types";

export const BOUNDARIES: LessonVideoScript[] = [
  {
    subskillId: "rw-boundaries",
    pattern: "Independent Clause Joins (Comma, Semicolon, Period, or Conjunction)",
    example: 0,
    hook: "Two full sentences, one blank between them. There are only a few legal ways to glue them together.",
    idea: [
      { point: "Can each side stand alone?", say: "First question, every time: could each side stand on its own as a full sentence? That's what an independent clause is." },
      { point: "Both full? Period, semicolon, or comma + but", say: "If both sides are full sentences, use a period, a semicolon, or a comma plus a joining word like and or but." },
      { point: "Comma alone = comma splice", say: "A colon works only if the second part explains the first. A comma by itself never works. That's a comma splice." },
    ],
    steps: [
      {
        say: "Left side: the results were surprising. Subject, verb, complete thought. That's a sentence.",
        highlight: ["The results were surprising"],
      },
      {
        say: "Right side: no one had predicted such a sharp decline. Also a full sentence. So a comma alone is a splice.",
        highlight: ["no one had predicted such a sharp decline"],
        strike: [1],
      },
      {
        say: "The word so, with no comma before it, runs them together. And the second part isn't a result of the first anyway.",
        strike: [2],
      },
      {
        say: "Comma plus but is legal punctuation, but there's no contrast here. The second part explains why the results were surprising.",
        strike: [3],
      },
    ],
    answer: "A semicolon joins two related full sentences, no joining word needed. That's the one.",
    trap: { point: "Trap: a lone comma between sentences", say: "A lone comma between two full sentences is the most popular wrong answer. It feels natural. It's still a splice." },
    recap: { point: "Test both sides, then pick the glue", say: "Check both sides first. If they're both full sentences, you already know which choices can work." },
  },
  {
    subskillId: "rw-boundaries",
    pattern: "Punctuating Around Conjunctive Adverbs",
    example: 0,
    hook: "Words like however look like they could glue sentences together. They can't. They need a strong mark on one side.",
    idea: [
      { point: "However is not but", say: "The word however isn't a joining word like but. Commas on both sides of it still leave you with a comma splice." },
      { point: "Semicolon before it, comma after", say: "So one side needs something strong, a semicolon or a period, and the other side just gets a comma." },
      { point: "Which side? Follow the logic", say: "To pick the side, ask which sentence the however belongs to. What is it actually contrasting?" },
    ],
    steps: [
      {
        say: "First sentence: engineers predicted the bridge would sag at forty tons. That's a full sentence.",
        highlight: ["Engineers predicted that the prototype footbridge would begin to sag"],
      },
      {
        say: "Second: it held steady until fifty-five tons. Also full. However marks the contrast between the prediction and what happened.",
        highlight: ["it held steady until the load reached 55 metric tons"],
      },
      {
        say: "So commas on both sides are a splice, and nothing before however runs the two sentences together.",
        strike: [0, 3],
      },
      {
        say: "A semicolon after however ties it to the prediction, where it contrasts with nothing.",
        strike: [2],
      },
    ],
    answer: "Semicolon before however, comma after. However opens the second sentence, right where the contrast happens.",
    trap: { point: "Trap: commas on both sides", say: "Comma, however, comma looks tidy. Between two full sentences, it's still a comma splice." },
    recap: { point: "Find its sentence, then place the semicolon", say: "Figure out which sentence the transition belongs to. The strong mark goes at that sentence's edge, the comma inside it." },
  },
  {
    subskillId: "rw-boundaries",
    pattern: "Semicolon-Separated Lists with Internal Commas",
    example: 1,
    hook: "Some lists already have commas inside the items. Add more commas and nobody can tell who's who.",
    idea: [
      { point: "Simple items: plain commas", say: "When every item is a single word or a short phrase, ordinary commas between them are fine." },
      { point: "Item has a comma? Semicolons between items", say: "But if even one item has its own comma, like a name and a job, switch to semicolons between the items." },
      { point: "A colon introduces the list", say: "And the list itself gets introduced by a colon, right after a full sentence." },
    ],
    steps: [
      {
        say: "Three volunteers organized the event. That's a full sentence announcing a list. A semicolon can't introduce a list. A colon can.",
        highlight: ["Three volunteers organized the event"],
        strike: [3],
      },
      {
        say: "Choice C opens with a comma and drops the commas around each job. Two problems at once.",
        strike: [2],
      },
      {
        say: "Now the colon choices. Each item is a name, a comma, then a job. With commas everywhere, you can't tell where one volunteer ends.",
        strike: [1],
      },
    ],
    answer: "Colon to open, semicolons between people, commas inside each one. Three volunteers, easy to tell apart.",
    trap: { point: "Trap: semicolons in a simple list", say: "Don't overcorrect. Muffins, scones, and croissants don't need semicolons. No commas inside the items, no semicolons." },
    recap: { point: "Inside commas? Semicolons between items", say: "Look inside each item. If any one of them has a comma, the whole list switches to semicolons." },
  },
  {
    subskillId: "rw-boundaries",
    pattern: "Nonessential Appositives and Descriptive Phrases",
    example: 0,
    hook: "Some phrases are just bonus info. Drop them and the sentence still works. Those get boxed off with commas.",
    idea: [
      { point: "Needed to know who? No commas", say: "Ask one thing: do you need this phrase to know who or what the sentence means? If yes, no commas." },
      { point: "Extra detail? Box it off", say: "If it's just extra detail, box it off with commas, like parentheses you could lift right out." },
      { point: "Mid-sentence: a comma on each side", say: "In the middle of a sentence, that means a comma on both sides. At the very start or end, just one." },
    ],
    steps: [
      {
        say: "My uncle Raymond. The name already tells us exactly who this is.",
        highlight: ["My uncle Raymond"],
      },
      {
        say: "So a retired firefighter is extra detail. Lift it out and the sentence still works. It needs commas.",
        highlight: ["still volunteers at the local station"],
        strike: [1],
      },
      {
        say: "It sits mid-sentence, so it needs a comma on each side. One choice opens without closing. The other closes without opening.",
        strike: [2, 3],
      },
    ],
    answer: "Commas on both sides. The extra detail is boxed in, and Raymond still volunteers.",
    trap: { point: "Trap: one comma mid-sentence", say: "The half-boxed version is the sneaky one. One comma looks almost right. In the middle, you need the pair." },
    recap: { point: "Droppable detail gets boxed in", say: "If you can drop it, box it. Commas on both sides in the middle, one at the edges." },
  },
  {
    subskillId: "rw-boundaries",
    pattern: "Introductory Phrases and Single-Boundary Commas",
    example: 0,
    hook: "Not every sentence is two sentences glued together. Sometimes only one side can stand on its own.",
    idea: [
      { point: "Lead-in phrase + full sentence", say: "These start with a lead-in phrase, like despite the storm, followed by a full sentence." },
      { point: "Only one side stands alone", say: "The lead-in can't stand on its own. So a period or a semicolon is wrong. Those need full sentences on both sides." },
      { point: "One comma after the lead-in", say: "The fix is almost always a single comma, right where the lead-in ends and the main sentence starts." },
    ],
    steps: [
      {
        say: "The flight departed on time. That's a full sentence. Now the front part: despite the storm. Could that stand alone?",
        highlight: ["the flight departed on time"],
      },
      {
        say: "Nope. So a semicolon, which needs a full sentence on both sides, is out.",
        strike: [1],
      },
      {
        say: "No comma at all runs the lead-in into the sentence. And a comma after despite splits it from the storm.",
        strike: [2, 3],
      },
    ],
    answer: "One comma, right after the word storm. Lead-in, comma, sentence.",
    trap: { point: "Trap: semicolon when one side can't stand", say: "Once you learn the semicolon rule, it's tempting everywhere. Check both sides first. Here only one side is a sentence." },
    recap: { point: "Lead-in phrase? One comma after it", say: "A lead-in phrase before a full sentence gets one comma. Not a semicolon, not a period." },
  },
  {
    subskillId: "rw-boundaries",
    pattern: "Possessive vs. Plural Noun Forms",
    example: 0,
    hook: "Plural, possessive, plural possessive. Out loud they sound exactly the same, so your ear is no help here.",
    idea: [
      { point: "Does it own the next word?", say: "First ask: does the noun own the word right after it? If nothing's owned, it's a plain plural. No apostrophe." },
      { point: "One owner: 's · Many owners: s'", say: "If it owns something, count the owners. One owner gets apostrophe s. A plural ending in s just gets an apostrophe after the s." },
    ],
    steps: [
      {
        say: "Right after the blank comes identities. Those belong to the ghostwriters. So we need a possessive, not a plain plural.",
        highlight: ["identities"],
        strike: [2],
      },
      {
        say: "And the sentence says two. More than one owner. The apostrophe s version would mean just one ghostwriter.",
        highlight: ["The two"],
        strike: [1],
      },
      {
        say: "The last one adds apostrophe s after the s. That's not a real form. A plural ending in s just takes the apostrophe.",
        strike: [3],
      },
    ],
    answer: "Ghostwriters, with the apostrophe after the s. Two owners, one possessive.",
    trap: { point: "Trap: apostrophes on plain plurals", say: "Don't sprinkle apostrophes on every plural. If nothing after the word belongs to it, there's no apostrophe." },
    recap: { point: "Owned? Then count the owners", say: "Is something owned? If not, plain plural. If so, count the owners, then place the apostrophe." },
  },
  {
    subskillId: "rw-boundaries",
    pattern: "Recognizing When No Punctuation Is Needed",
    example: 1,
    hook: "Here's the sneaky one. Sometimes the right answer adds no punctuation at all.",
    idea: [
      { point: "No punctuation is a real option", say: "When three choices add a comma or a semicolon, it's easy to assume one must be needed. Not always." },
      { point: "Don't split words that belong together", say: "Some words go together with nothing between them: a subject and its verb, a verb and its object, a preposition and its object." },
      { point: "Ask: what's on each side?", say: "Run the same check as always. What's on each side of the mark? If there's no real boundary, leave it clean." },
    ],
    steps: [
      {
        say: "The blank holds the words during the, right before performance. During is a preposition, and the performance is its object.",
        highlight: ["remain seated", "performance"],
      },
      {
        say: "A comma or a semicolon after during splits it from its object. And a semicolon needs full sentences on both sides anyway.",
        strike: [1, 3],
      },
      {
        say: "A comma after the word the cuts it off from performance, breaking one little phrase in half.",
        strike: [2],
      },
    ],
    answer: "During the performance, with no marks inside. It's one unit, so it stays together.",
    trap: { point: "Trap: adding a comma because it's offered", say: "A comma in the choices isn't a hint. Don't add one just because it's on the menu." },
    recap: { point: "No boundary? No punctuation", say: "Check what's on each side. If nothing needs separating, the cleanest choice wins." },
  },
  {
    subskillId: "rw-boundaries",
    pattern: "Using a Colon to Introduce a List, Explanation, or Elaboration",
    example: 1,
    hook: "A colon basically says, here's what I mean. And it's less picky than a semicolon about what comes after it.",
    idea: [
      { point: "Before the colon: a full sentence", say: "The rule lives on the left. Everything before a colon has to stand on its own as a full sentence." },
      { point: "After: a list, phrase, or explanation", say: "After it, you can have a list, a short phrase, or a sentence that explains the first one." },
      { point: "Semicolon: full sentences on both sides", say: "That's the difference from a semicolon, which needs full sentences on both sides." },
    ],
    steps: [
      {
        say: "Left side ends with: the team packed everything they would need. That's a full sentence, and it promises something.",
        highlight: ["the team packed everything they would need"],
      },
      {
        say: "Right side: tents, dried food, water filters, and a satellite phone. That's a list, not a sentence. So no semicolon.",
        highlight: ["tents, dried food, water filters, and a satellite phone"],
        strike: [2],
      },
      {
        say: "A comma doesn't introduce a list after a full sentence. And like would make these just examples, when it's everything they needed.",
        strike: [1, 3],
      },
    ],
    answer: "The colon. A full sentence on the left, and here's what I mean on the right.",
    trap: { point: "Trap: thinking colons need two sentences", say: "Don't treat a colon like a semicolon. Only the left side has to be a full sentence." },
    recap: { point: "Full sentence first, then the colon", say: "Check the left side. If it's a full sentence that sets something up, the colon delivers it." },
  },
  {
    subskillId: "rw-boundaries",
    pattern: "Direct vs. Embedded Questions",
    example: 0,
    hook: "Is this sentence asking a question, or just talking about one? That decides the word order and the ending.",
    idea: [
      { point: "Reported question: statement order + period", say: "If a question is tucked inside a statement, after words like wondered or asked, keep normal order and end with a period." },
      { point: "Direct question: helping verb first + ?", say: "If the text asks the question itself, the helping verb comes before the subject, and it ends with a question mark." },
    ],
    steps: [
      {
        say: "Ines Varga wondered. The sentence is reporting what she wondered, not asking us anything. So it's an embedded question.",
        highlight: ["Geologist Ines Varga wondered"],
      },
      {
        say: "That means statement order: the snow lasted, not did the snow last. Both choices with did are out.",
        strike: [0, 3],
      },
      {
        say: "B has the right order but a question mark. The sentence is a statement, so it ends with a period.",
        strike: [1],
      },
    ],
    answer: "Why the snow lasted so long, with a period. Statement order, statement ending.",
    trap: { point: "Trap: question mark on a reported question", say: "There's a why in it, so a question mark feels right. But she wondered makes the whole thing a statement." },
    recap: { point: "Asking or reporting? Decide first", say: "First decide whether the text asks or reports. The word order and the end mark follow from that." },
  },
];
