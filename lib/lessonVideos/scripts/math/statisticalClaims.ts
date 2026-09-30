import type { LessonVideoScript } from "../../types";

export const M_STATISTICAL_CLAIMS: LessonVideoScript[] = [
  {
    subskillId: "m-statistical-claims",
    pattern: "Distinguishing Correlation from Causation",
    example: 2,
    hook: "Two things rising together doesn't mean one is pushing the other.",
    idea: [
      { point: "Observational study → correlation only", say: "If nobody was randomly assigned to groups, the study can only show that two things go together." },
      { point: "Look for a hidden third factor", say: "Some hidden factor, a confounding variable, might be driving both at once." },
      { point: "Causation needs random assignment", say: "Only a randomized experiment can back up a claim that one thing causes another." },
    ],
    steps: [
      {
        say: "This is an observational study. Nobody assigned who eats breakfast. The students chose.",
        highlight: ["An observational study", "students who eat breakfast tend to have higher test scores"],
        work: "observational → correlation only",
        note: "check the design",
      },
      {
        say: "So what else could drive both? A steady family routine, or income, could shape breakfast habits and test scores.",
        work: "family routine → breakfast AND scores",
        note: "hidden third factor",
      },
      {
        say: "Breakfast directly causing higher scores is exactly the leap an observational study can't make.",
        strike: [1],
      },
      {
        say: "Scores causing breakfast doesn't make sense either. And the study did find a relationship, so none at all is wrong.",
        strike: [2, 3],
      },
    ],
    answer: "A confounding variable most likely explains both. The study shows a link, not a cause.",
    trap: { point: "Trap: reading a correlation as a cause", say: "An observational study can say two things go together. It can't say one causes the other." },
    recap: { point: "No random assignment, no causal claim", say: "Check the design first. No random assignment means correlation only, and look for the hidden third factor." },
  },
  {
    subskillId: "m-statistical-claims",
    pattern: "Evaluating Study Design for Causal Claims",
    example: 2,
    hook: "Before you trust a result, check how the study was built.",
    idea: [
      { point: "Was there random assignment?", say: "First question: were the subjects randomly assigned to the treatment or the comparison?" },
      { point: "Was there a control group?", say: "Second question: is there a comparison group, under the same conditions, that didn't get the treatment?" },
      { point: "Missing either → association only", say: "If either one is missing, the honest conclusion is association only, however good the result looks." },
    ],
    steps: [
      {
        say: "The fertilized field this year gets compared to the same field last year, with no fertilizer.",
        highlight: ["apply the fertilizer to one field", "that same field's yield from the previous year"],
      },
      {
        say: "Is there a comparison group grown at the same time? No. The comparison is a different year.",
        work: "same-time control? no",
        note: "checklist",
      },
      {
        say: "And between two years, lots changes. Weather, rain, the soil itself. Any of those could explain the difference.",
        work: "weather, rain, soil all changed",
        note: "can't rule them out",
      },
      {
        say: "Using just one field isn't the core flaw. And yield comparisons do work, with a proper control grown alongside.",
        strike: [1, 2],
      },
      {
        say: "Random assignment would help, but the more direct problem is the missing same-time comparison.",
        strike: [3],
      },
    ],
    answer: "The missing same-time control. Year-to-year changes like weather can't be ruled out.",
    trap: { point: "Trap: blaming the wrong flaw", say: "Sample size is the tempting answer. Look for the specific thing the design is missing." },
    recap: { point: "Random assignment + control, or no cause", say: "Check for random assignment and a control group tested at the same time. Miss either, and it's association only." },
  },
];
