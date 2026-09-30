import type { LessonVideoScript } from "../../types";

export const M_TWO_VAR_DATA: LessonVideoScript[] = [
  {
    subskillId: "m-two-var-data",
    pattern: "Choosing the Right Model Shape from a Scatterplot's Pattern",
    example: 1,
    hook: "Lots of scatterplots go up and to the right. What matters is how they go up.",
    idea: [
      { point: "Constant rate → linear", say: "If the points climb by the same amount each step, that's a straight line. Linear." },
      { point: "Rate keeps growing → exponential", say: "If each jump is bigger than the last, and it never turns around, that's exponential." },
      { point: "One peak or low point → quadratic", say: "If the points rise and then fall, or fall and then rise, that's a quadratic." },
    ],
    steps: [
      {
        say: "Slow at first, then steeper and steeper. Each step's jump is bigger than the one before.",
        highlight: ["rising slowly at first, then increasingly steeply", "each step producing a noticeably bigger jump than the last"],
      },
      {
        say: "The rate itself is changing, so it can't be a straight line. Linear's out.",
        work: "jumps grow → rate isn't constant",
        note: "not linear",
        strike: [1],
      },
      {
        say: "It curves up, which might tempt you toward quadratic. But a quadratic turns around at its vertex, and this never does.",
        work: "never turns → not a parabola",
        note: "not quadratic",
        strike: [2],
      },
      {
        say: "Speeding up in one direction forever is exactly what exponential growth looks like. So one of these models definitely fits.",
        work: "keeps accelerating → exponential",
        note: "match the shape",
        strike: [3],
      },
    ],
    answer: "Exponential. The rate of increase keeps increasing.",
    trap: { point: "Trap: \"curves up\" means quadratic", say: "Curving isn't enough. Ask whether it ever turns around. Quadratics do. Exponentials just keep speeding up." },
    recap: { point: "Watch how the rate behaves", say: "Steady rate, linear. Growing rate, exponential. A rate that flips direction, quadratic." },
  },
  {
    subskillId: "m-two-var-data",
    pattern: "Using a Line of Best Fit",
    example: 0,
    hook: "When there's a line drawn through the dots, work from the line, not the dots.",
    idea: [
      { point: "Sign first: falling line, negative slope", say: "Start with the sign. A line that falls from left to right has a negative slope." },
      { point: "Intercept: where it meets the y-axis", say: "The y-intercept is where the line meets the y-axis, at x equals zero." },
      { point: "Slope = change in y / change in x", say: "Then slope is the change in y over the change in x, read off the axis numbers." },
    ],
    steps: [
      {
        say: "Snow melting over the days after a storm. The line falls, so the slope is negative.",
        spot: ["Days after storm", "Snow depth (inches)"],
        highlight: ["line of best fit"],
      },
      {
        say: "The line meets the y-axis at twenty-four inches, and hits zero on day twelve. Rise over run.",
        spot: ["24", "12"],
        work: "slope = (0 − 24) / (12 − 0)",
        note: "rise over run",
      },
      {
        say: "Negative twenty-four over twelve is negative two. It loses about two inches a day.",
        work: "slope = −24 / 12 = −2",
        note: "simplify",
      },
      {
        say: "Put the slope and intercept together. Y equals negative two x plus twenty-four.",
        work: "y = −2x + 24",
        note: "b = 24",
        spot: ["24"],
      },
      {
        say: "A positive two would make the line rise. And twelve is where it meets the x-axis, not the y-axis.",
        strike: [0, 1],
      },
      {
        say: "Negative one half is the slope upside down: the change in x over the change in y.",
        strike: [3],
      },
    ],
    answer: "Y equals negative two x plus twenty-four. Right sign, right intercept, right steepness.",
    trap: { point: "Trap: slope upside down", say: "Slope is change in y over change in x. Flip it and you get the wrong steepness." },
    recap: { point: "Sign, then intercept, then steepness", say: "Check the sign, find where it meets the y-axis, then work out rise over run." },
  },
  {
    subskillId: "m-two-var-data",
    pattern: "Interpreting Residuals",
    example: 1,
    hook: "A residual tells you how far off the model was, and in which direction.",
    idea: [
      { point: "Residual = actual − predicted", say: "A residual is the actual value minus the predicted value. Always in that order." },
      { point: "Negative → came in below prediction", say: "A negative residual means the real value came in below what the model predicted." },
    ],
    steps: [
      {
        say: "The model predicted twenty-four centimeters. The plant actually measured nineteen.",
        highlight: ["predicts a plant will be 24 cm tall", "actual measured height is 19 cm"],
      },
      {
        say: "Residual is actual minus predicted.",
        work: "residual = actual − predicted",
        note: "always this order",
      },
      {
        say: "Nineteen minus twenty-four is negative five.",
        work: "19 − 24 = −5",
        note: "plug in",
      },
      {
        say: "Negative means the plant came in under the prediction. It grew less than expected.",
        work: "negative → below prediction",
        note: "read the sign",
      },
      {
        say: "The positive fives flip the subtraction. And negative five meaning grew more gets the sign backwards.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Negative five, and the plant grew less than predicted.",
    trap: { point: "Trap: predicted minus actual", say: "Subtract in the wrong order and the sign flips, and so does the meaning." },
    recap: { point: "Actual minus predicted, then read the sign", say: "Actual minus predicted. Positive means above the model, negative means below it." },
  },
];
