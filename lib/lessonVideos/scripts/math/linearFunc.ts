import type { LessonVideoScript } from "../../types";

export const M_LINEAR_FUNC: LessonVideoScript[] = [
  {
    subskillId: "m-linear-func",
    pattern: "Extracting Slope and Intercept from a Real-World Scenario",
    example: 1,
    hook: "Every linear word problem hides two numbers: where you start, and how fast you change.",
    idea: [
      { point: "Start value = y-intercept", say: "The starting amount, or flat fee, is the y-intercept. It's what you have when the input is zero." },
      { point: "\"Per\" = slope", say: "Anything per minute, per mile, or per month is the rate. That's the slope." },
      { point: "Going down? Slope is negative", say: "If the amount is shrinking, like draining or burning, the rate gets a negative sign." },
    ],
    steps: [
      {
        say: "The tank starts with two hundred gallons. That's the amount at zero minutes, so it's the y-intercept.",
        highlight: ["starts with 200 gallons"],
        work: "intercept = 200",
        note: "start value",
        draw: ["start"],
        focus: ["start"],
      },
      {
        say: "It drains fifteen gallons per minute. Per means rate, and draining means going down, so the slope is negative fifteen.",
        highlight: ["drains at a rate of 15 gallons per minute"],
        work: "slope = −15",
        note: "draining → negative",
        draw: ["run", "drop"],
        focus: ["run", "drop"],
      },
      {
        say: "Slope times minutes, plus the start. W equals negative fifteen m plus two hundred.",
        work: "W = −15m + 200",
        note: "rate · m + start",
        draw: ["line", "rider"],
        set: [{ id: "rider", at: [13.33, 0] }],
      },
      {
        say: "Positive fifteen forgets the tank is draining. Negative two hundred makes the starting water negative.",
        strike: [1, 2],
      },
      {
        say: "And two hundred m minus fifteen swaps the roles. Two hundred is the start, not the rate.",
        strike: [3],
      },
    ],
    answer: "W equals negative fifteen m plus two hundred. Start at two hundred, lose fifteen every minute.",
    trap: { point: "Trap: swapping rate and start", say: "Whichever number comes first in the sentence, the per number is the slope and the starting number is the intercept." },
    recap: { point: "Start = intercept, per = slope", say: "Find the starting value, find the per rate, check the sign, then write it as rate times input plus start." },
    tint: { "200": "yellow", "−15": "pink", "-15": "pink", m: "blue" },
    scene: {
      x: [-1.2, 15],
      y: [-25, 235],
      objects: [
        { id: "axes", kind: "axes", xStep: 5, yStep: 50 },
        { id: "start", kind: "point", at: [0, 200], color: "yellow", label: "200" },
        { id: "run", kind: "seg", from: [4, 140], to: [8, 140], color: "blue", dash: true, label: "4 min", labelOffset: [0, 30] },
        { id: "drop", kind: "seg", from: [8, 140], to: [8, 80], color: "pink", label: "−60", labelOffset: [24, 6] },
        { id: "line", kind: "fn", y: "200 - 15x", domain: [0, 13.33], color: "blue" },
        { id: "rider", kind: "point", at: [0, 200], color: "white" },
      ],
    },
  },
  {
    subskillId: "m-linear-func",
    pattern: "Reading Slope and Intercept Directly from a Graph",
    example: 3,
    hook: "When they hand you the graph, the answer's already drawn. You just have to read it right.",
    idea: [
      { point: "y-intercept: where it hits the y-axis", say: "The y-intercept is where the line crosses the y-axis, where x is zero. Read it straight off." },
      { point: "Slope = rise / run", say: "For slope, take two marked points. Change in y over change in x. Rise over run." },
      { point: "Falling line → negative slope", say: "Then sanity check. A line falling left to right has a negative slope." },
    ],
    steps: [
      {
        say: "The line crosses the y-axis at zero comma eight, and the x-axis at four comma zero.",
        highlight: ["(4, 0)", "(0, 8)"],
        spot: ["(0, 8)", "(4, 0)"],
      },
      {
        say: "Rise over run, going from four comma zero to zero comma eight. Eight minus zero, over zero minus four.",
        work: "slope = (8 − 0)/(0 − 4)",
        note: "rise over run",
      },
      {
        say: "The rise is eight, and the run is negative four.",
        work: "slope = 8/(−4)",
        note: "simplify",
      },
      {
        say: "Eight divided by negative four is negative two. And the line falls, so negative makes sense.",
        work: "slope = −2",
        note: "falls → negative",
      },
      {
        say: "Positive two ignores that the line falls. Negative one half is run over rise. And four is where it crosses the x-axis.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Negative two. Down two for every one step right.",
    trap: { point: "Trap: mixing up the two intercepts", say: "The x-intercept is where it crosses the x-axis. Don't hand that in when they want slope or the y-intercept." },
    recap: { point: "Read intercepts, count rise over run", say: "Read the crossing points off the graph, find rise over run, and check the sign against the picture." },
  },
  {
    subskillId: "m-linear-func",
    pattern: "Finding Slope from Two Points or Function Values",
    example: 1,
    hook: "Function notation looks fancy, but g of negative two equals nine is just a point.",
    idea: [
      { point: "f(a) = b means the point (a, b)", say: "The number in the parentheses is the input, x. The value it equals is the output, y." },
      { point: "Slope = Δoutput / Δinput", say: "Slope is always change in output over change in input. Never the other way around." },
    ],
    steps: [
      {
        say: "G of negative two is nine, and g of four is negative three. As points, that's negative two comma nine, and four comma negative three.",
        highlight: ["g(-2) = 9", "g(4) = -3"],
        work: "(−2, 9) and (4, −3)",
        note: "f(a) = b → (a, b)",
        spot: ["(-2, 9)", "(4, -3)"],
      },
      {
        say: "Change in output over change in input. Negative three minus nine, over four minus negative two.",
        work: "slope = (−3 − 9)/(4 − (−2))",
        note: "Δoutput / Δinput",
      },
      {
        say: "On top, negative twelve. On the bottom, subtracting a negative adds, so four plus two is six.",
        work: "slope = −12/6",
        note: "− (−2) is + 2",
      },
      {
        say: "Negative twelve over six is negative two.",
        work: "slope = −2",
        note: "divide",
      },
      {
        say: "Positive two misses that the output drops. Negative twelve is only the top. Negative six uses two for the bottom instead of six.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Negative two. The output falls two for every one the input rises.",
    trap: { point: "Trap: flipping the fraction", say: "Change in input over change in output gives you the upside-down slope. Output always goes on top." },
    recap: { point: "Make points, then output over input", say: "Turn the function values into points, then divide the change in output by the change in input." },
  },
  {
    subskillId: "m-linear-func",
    pattern: "Writing a Line's Equation from Slope, a Point, or a Table",
    example: 2,
    hook: "You've got the slope and one point. That's everything you need for the whole line.",
    idea: [
      { point: "Find m first, then b", say: "Every line here is y equals m x plus b. Pin down the slope first, then the intercept." },
      { point: "Not on the y-axis? Solve for b", say: "If the point isn't on the y-axis, its y-value isn't b. Plug the point in and solve." },
    ],
    steps: [
      {
        say: "Slope of negative three, through the point four comma one. Four isn't zero, so one isn't the intercept.",
        highlight: ["slope of -3", "(4, 1)"],
        work: "y = mx + b",
        note: "the template",
      },
      {
        say: "Put in the slope, and the point's x and y. One equals negative three times four, plus b.",
        work: "1 = −3(4) + b",
        note: "plug in m and (4, 1)",
      },
      {
        say: "Negative three times four is negative twelve.",
        work: "1 = −12 + b",
        note: "multiply",
      },
      {
        say: "Add twelve to both sides. B is thirteen.",
        work: "b = 13",
        note: "+12 both sides",
      },
      {
        say: "Now write the line. Y equals negative three x plus thirteen.",
        work: "y = −3x + 13",
        note: "fill in m and b",
      },
      {
        say: "Plus one uses the point's y-value as b. Minus eleven subtracts twelve instead of adding. And positive three x has the wrong slope.",
        strike: [0, 1, 2],
      },
    ],
    answer: "Y equals negative three x plus thirteen. Plug in four, and you get one back.",
    trap: { point: "Trap: using the point's y as b", say: "A point's y-value is only the intercept when its x is zero. Otherwise, solve for b." },
    recap: { point: "Slope in, point in, solve for b", say: "Put the slope and the point into y equals m x plus b, solve for b, then write the line." },
  },
  {
    subskillId: "m-linear-func",
    pattern: "Evaluating a Function and Solving for Input Given Output",
    example: 4,
    hook: "F of three equals eleven packs two facts into one line. Unpack them in the right slots.",
    idea: [
      { point: "Inside the ( ) = input, x", say: "The number inside the parentheses is the input. It goes wherever x is." },
      { point: "f(x) = output", say: "The number f of x equals is the output. Put both in, and what's left is ordinary algebra." },
    ],
    steps: [
      {
        say: "The rule is k x minus seven, with k unknown. And f of three is eleven.",
        highlight: ["f(x) = kx - 7", "f(3) = 11"],
        work: "f(x) = kx − 7",
      },
      {
        say: "Three is the input, so it replaces x. Eleven is the output, so it replaces f of x.",
        work: "11 = k(3) − 7",
        note: "x = 3, f(x) = 11",
      },
      {
        say: "Add seven to both sides. Eighteen equals three k.",
        work: "18 = 3k",
        note: "+7 both sides",
      },
      {
        say: "Divide by three. K is six. Check it: six times three, minus seven, is eleven.",
        work: "k = 6",
        note: "÷3 both sides",
      },
      {
        say: "Ten elevenths swaps the input and output. Eighteen is three k, one step early. Four thirds subtracts seven instead of adding.",
        strike: [0, 1, 3],
      },
    ],
    answer: "K equals six. The rule is six x minus seven.",
    trap: { point: "Trap: swapping input and output", say: "In f of three equals eleven, three is x and eleven is the output. Swap them and you solve a different problem." },
    recap: { point: "Input for x, output for f(x)", say: "Put the input where x goes and the output where f of x goes, then solve like any equation." },
  },
];
