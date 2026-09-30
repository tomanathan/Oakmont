import type { LessonVideoScript } from "../types";

export const EVIDENCE: LessonVideoScript[] = [
  {
    subskillId: "rw-evidence",
    pattern: "Direct Quantitative Support",
    example: 1,
    hook: "Which choice best supports this claim? It's an easy question to ask, and a sneaky one to answer.",
    idea: [
      { point: "Pin down what the claim says", say: "Before the choices, pin down what the claim is actually about. That's the thing your evidence has to measure." },
      { point: "Cross out general statements", say: "Fast filter: cross out anything that's just a general statement about the topic. That's bait." },
      { point: "Keep the number that measures it", say: "Of what's left, pick the specific number that measures the claim's exact outcome. Related isn't enough." },
    ],
    steps: [
      {
        say: "The claim: the bike lanes reduced traffic congestion. So we need a number about congestion.",
        highlight: ["reduced downtown traffic congestion"],
      },
      {
        say: "Cyclists feeling safer is a feeling, not a traffic measurement. That one's out.",
        strike: [3],
      },
      {
        say: "Twelve million dollars and forty miles are real numbers. But one measures spending, the other measures size. Neither is congestion.",
        strike: [0, 2],
      },
    ],
    answer: "Commute times fell fifteen percent. That's a number about congestion, tied to the bike lanes.",
    trap: { point: "Trap: impressive numbers, wrong thing", say: "A big, specific number feels like strong evidence. It isn't, unless it measures what the claim is about." },
    recap: { point: "Match the number to the claim", say: "Find what the claim says changed. Then pick the number that measures that change." },
  },
  {
    subskillId: "rw-evidence",
    pattern: "Ruling Out Alternative Explanations",
    example: 1,
    hook: "Some claims say one thing caused another. Those need tougher evidence than a nice number.",
    idea: [
      { point: "Caused or led to? Rule out other causes", say: "When a claim says caused or led to, the evidence has to rule out other explanations." },
      { point: "Look for a comparison group", say: "The best way is a comparison: a similar group that didn't get the change, and didn't see the result." },
      { point: "Before and after alone isn't enough", say: "Something dropping after a change doesn't prove the change did it. Something else could have happened at the same time." },
    ],
    steps: [
      {
        say: "The claim: the training reduced injuries. That's a cause, so we need to rule out other causes.",
        highlight: ["reduced workplace injuries"],
      },
      {
        say: "A two-hour session and a helpful rating don't measure injuries at all. Those go first.",
        strike: [2, 3],
      },
      {
        say: "Injuries fell eighteen percent. Sounds good. But maybe production just slowed down that year. This choice can't rule that out.",
        strike: [0],
      },
    ],
    answer: "Same eighteen percent drop, plus a sister factory without the training that saw no change. That rules out a company-wide slowdown.",
    trap: { point: "Trap: a drop with no comparison", say: "A clean before-and-after number is tempting. For a cause claim, it only shows two things happened around the same time." },
    recap: { point: "Cause claim? Find the comparison", say: "When the claim says caused, look for the choice with a comparison group. It's the one that rules things out." },
  },
  {
    subskillId: "rw-evidence",
    pattern: "Reading Data from a Graph or Table",
    example: 1,
    hook: "Graph questions don't need tricks. They need you to read the numbers slowly.",
    idea: [
      { point: "Find the exact part asked about", say: "Find the exact category or time period the question points to before you look at the choices." },
      { point: "Check every number in every choice", say: "Then check each choice against the data. Don't stop at the first one that sounds plausible." },
      { point: "Wrong: swapped, flipped, or overstated", say: "Wrong answers swap a label, flip a direction, or stretch one small change into a whole trend." },
    ],
    steps: [
      {
        say: "We need what happened after quarter two. Revenue went from five point one down to four point eight. A small dip.",
        highlight: ["Q2, 5.1", "Q3, 4.8"],
      },
      {
        say: "Then quarter four jumps to six point three. So it dipped, then rose again.",
        highlight: ["Q4, 6.3"],
      },
      {
        say: "Rose in every quarter misses the dip. Remained flat ignores that anything changed at all.",
        strike: [2, 3],
      },
      {
        say: "Fell in every quarter takes one dip and stretches it through the whole year. Quarter four went up.",
        strike: [1],
      },
    ],
    answer: "Fell slightly, then rose again. That's exactly what the numbers do.",
    trap: { point: "Trap: one dip becomes a trend", say: "One small drop can get stretched into a claim that it fell every quarter. Check each number before you believe a pattern." },
    recap: { point: "Read the numbers, check every choice", say: "Find the part the question asks about, read the actual numbers, and match them one by one." },
  },
  {
    subskillId: "rw-evidence",
    pattern: "Selecting the Best Supporting Quotation",
    example: 1,
    hook: "Picking the best quote isn't about finding the most dramatic line. It's about finding the most exact one.",
    idea: [
      { point: "Name the exact quality in the claim", say: "First, figure out exactly what the claim names. Not just a feeling, but the specific kind of feeling." },
      { point: "Find the quote that shows it", say: "Then find the quote that actually shows that thing, not one that just mentions the same person or scene." },
    ],
    steps: [
      {
        say: "The claim isn't just pride. It's quiet pride. That word quiet is doing a lot of work.",
        highlight: ["quiet pride"],
      },
      {
        say: "Eleven hours on beadwork is a fact with no feeling in it. And wondering if anyone will notice? That's doubt.",
        strike: [2, 3],
      },
      {
        say: "Telling the whole shop it's her finest dress is pride, sure. But it's loud. The claim says quiet.",
        strike: [0],
      },
    ],
    answer: "Holding it up, saying nothing, smoothing one seam. That's pride, and it's quiet.",
    trap: { point: "Trap: dramatic over precise", say: "The loudest quote grabs your attention first. Often the quieter one matches the claim better." },
    recap: { point: "Match every word of the claim", say: "Pin down exactly what the claim describes, then pick the quote that shows that, not just something close." },
  },
  {
    subskillId: "rw-evidence",
    pattern: "Evaluating a Hypothetical Finding's Effect on a Claim",
    example: 1,
    hook: "Some evidence questions give you findings that don't exist yet. Your job is to judge which one would matter.",
    idea: [
      { point: "Turn the claim into a prediction", say: "Ask yourself: if this claim is true, what would we expect to see? Say it in your own words first." },
      { point: "Pick the finding that matches it", say: "Then pick the finding that matches that prediction exactly. Being about the same topic doesn't count." },
      { point: "Weaken: the opposite, or it happens anyway", say: "If the question says weaken, look for the opposite of your prediction, or the same result without the cause." },
    ],
    steps: [
      {
        say: "The claim: the new line means fewer people drive downtown for work. So we'd expect less downtown driving after it opened.",
        highlight: ["reduced the number of people driving downtown for work"],
      },
      {
        say: "Three years to build, and riders liking the comfort. Neither one tells us anything about driving.",
        strike: [2, 3],
      },
      {
        say: "Forty thousand riders a day sounds huge. But they could be new commuters who never drove. It doesn't show driving dropped.",
        strike: [0],
      },
    ],
    answer: "Downtown parking permits dropped after the line opened. Fewer permits means fewer people driving in. That's the prediction.",
    trap: { point: "Trap: related, but not the prediction", say: "Ridership is about the train, so it feels relevant. But the claim is about driving. Match the prediction, not the topic." },
    recap: { point: "Predict first, then match", say: "Turn the claim into what you'd expect to see. Then pick the finding that shows exactly that." },
  },
];
