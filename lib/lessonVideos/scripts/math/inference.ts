import type { LessonVideoScript } from "../../types";

export const M_INFERENCE: LessonVideoScript[] = [
  {
    subskillId: "m-inference",
    pattern: "Interpreting Confidence Intervals Correctly",
    example: 4,
    hook: "A confidence interval is a range of believable answers. Not a promise, and not a prediction about individuals.",
    idea: [
      { point: "It's about the population mean", say: "The interval gives a plausible range for the true average of the whole population." },
      { point: "Not individuals, not a guarantee", say: "It doesn't say where individual data points fall, and it doesn't guarantee anything." },
      { point: "Inside = plausible; outside = questionable", say: "A claimed value inside the interval is plausible. One outside it isn't well supported." },
    ],
    steps: [
      {
        say: "The claim is twenty-seven minutes. The interval runs from twenty-four to thirty.",
        highlight: ["27 minutes", "(24, 30) minutes"],
      },
      {
        say: "Is twenty-seven between twenty-four and thirty? Yes, so the data doesn't contradict the claim.",
        work: "24 < 27 < 30",
        note: "inside the interval",
      },
      {
        say: "It doesn't have to sit in the exact center. Any value inside the interval counts as plausible.",
        strike: [1],
      },
      {
        say: "Since twenty-seven is inside, the data can't rule it out. But it doesn't prove it either, since other values are just as plausible.",
        strike: [2, 3],
      },
    ],
    answer: "No contradiction. Twenty-seven is inside the interval, so it's a plausible value.",
    trap: { point: "Trap: treating it as proof", say: "An interval makes a value plausible or questionable. It never proves the mean is exactly one number." },
    recap: { point: "Check inside or outside, nothing more", say: "Ask whether the claimed value lands inside the range. Inside is plausible, outside is questionable." },
  },
  {
    subskillId: "m-inference",
    pattern: "Sample Size's Effect on Margin of Error",
    example: 4,
    hook: "Two knobs control how wide a confidence interval is, and they turn in opposite directions.",
    idea: [
      { point: "Bigger sample → narrower interval", say: "A bigger sample gives a smaller margin of error, so the interval gets narrower." },
      { point: "Higher confidence → wider interval", say: "A higher confidence level does the opposite. To be more sure, you need a wider range." },
    ],
    steps: [
      {
        say: "This study turns both knobs at once: bigger sample, and higher confidence level.",
        highlight: ["increases both its sample size and its confidence level"],
      },
      {
        say: "The bigger sample pushes the interval narrower.",
        work: "larger sample → narrower",
        note: "pushes in",
      },
      {
        say: "The higher confidence level pushes it wider.",
        work: "higher confidence → wider",
        note: "pushes out",
      },
      {
        say: "Two pushes in opposite directions. Without their sizes, you can't tell which wins, so the colleague ignored half the story.",
        work: "net effect: can't tell",
        note: "opposite pushes",
      },
      {
        say: "So the colleague isn't fully correct. And a higher confidence level widens an interval; it doesn't narrow it.",
        strike: [1, 2],
      },
      {
        say: "Each change matters on its own. They don't need to happen at the same rate to have an effect.",
        strike: [3],
      },
    ],
    answer: "The reasoning is incomplete. The higher confidence level pushes the other way.",
    trap: { point: "Trap: mixing up the two knobs", say: "Bigger samples narrow the interval. Higher confidence widens it. Don't let one rule stand in for the other." },
    recap: { point: "Sample size in, confidence level out", say: "More data, narrower. More confidence, wider. If both change, check each one." },
  },
  {
    subskillId: "m-inference",
    pattern: "Estimating a Population Count from a Sample Proportion",
    example: 2,
    hook: "A good random sample is a tiny model of the whole population. Scale it up.",
    idea: [
      { point: "Sample proportion = count / sample size", say: "First turn the sample's count into a proportion: the count over the sample size." },
      { point: "Then × the population", say: "Then apply that same proportion to the full population." },
      { point: "Only if the sample was random", say: "This only works if the sample was random. A self-selected sample can't stand in for everyone." },
    ],
    steps: [
      {
        say: "One seventy-five out of two fifty support the measure. But the question asks who does not.",
        highlight: ["175 support a proposed measure", "do NOT support"],
      },
      {
        say: "The supporting proportion is one seventy-five over two fifty. That's zero point seven.",
        work: "175 / 250 = 0.7",
        note: "sample proportion",
      },
      {
        say: "Everyone else doesn't support it. One minus zero point seven is zero point three.",
        work: "1 − 0.7 = 0.3",
        note: "the NOT group",
      },
      {
        say: "Scale up to the district. Zero point three times sixty thousand is eighteen thousand.",
        work: "0.3 × 60,000 = 18,000",
        note: "scale up",
      },
      {
        say: "Forty-two thousand estimates the supporters instead, and one seventy-five is the raw sample count.",
        strike: [1, 2],
      },
      {
        say: "Twelve thousand uses twenty percent. Non-supporters are seventy-five out of two fifty, which is thirty percent.",
        strike: [3],
      },
    ],
    answer: "Eighteen thousand. Thirty percent of the district doesn't support it.",
    trap: { point: "Trap: scaling up the wrong group", say: "Read the question twice. If it asks about who does not, use the other part of the sample." },
    recap: { point: "Proportion first, then scale up", say: "Turn the sample count into a proportion, check that it's the right group, then multiply by the population." },
  },
];
