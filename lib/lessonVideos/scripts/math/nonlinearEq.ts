import type { LessonVideoScript } from "../../types";

export const M_NONLINEAR_EQ: LessonVideoScript[] = [
  {
    subskillId: "m-nonlinear-eq",
    pattern: "Solving a Quadratic by Factoring or the Quadratic Formula",
    example: 0,
    hook: "A quadratic usually has two answers. The trick is setting it up so they fall right out.",
    idea: [
      { point: "Get it to equal zero", say: "First move everything to one side, so the equation equals zero." },
      { point: "Factor: (x − p)(x − q) = 0", say: "Then factor. If two things multiply to zero, one of them has to be zero." },
      { point: "Won't factor? Quadratic formula", say: "If no nice numbers work after a few tries, switch to the quadratic formula. It always works." },
    ],
    steps: [
      {
        say: "Here's the equation. X squared minus three x minus ten equals zero. Solving it means finding where this parabola hits zero height.",
        work: "x² − 3x − 10 = 0",
        focus: ["para"],
      },
      {
        say: "Find two numbers that multiply to negative ten and add to negative three. Negative five and two.",
        work: "(x − 5)(x + 2) = 0",
        note: "−5 · 2 = −10, sum −3",
        focus: ["para"],
      },
      {
        say: "Two things multiply to zero, so one of them is zero. Either factor can do the job.",
        work: "x − 5 = 0  or  x + 2 = 0",
        note: "zero product",
        draw: ["r5", "r2"],
        focus: ["r5", "r2"],
      },
      {
        say: "So x is five or negative two. Exactly where the curve crosses the x-axis, balanced around its middle.",
        work: "x = 5  or  x = −2",
        note: "solve each",
        draw: ["axis"],
        focus: ["r5", "r2", "axis"],
      },
      {
        say: "Negative five and two is the classic sign flip. The curve is nowhere near zero at those.",
        draw: ["w5", "w2"],
        focus: ["w5", "w2", "para"],
        strike: [1],
      },
      {
        say: "And two, or negative five, don't make it zero when you plug them in.",
        strike: [2, 3],
      },
    ],
    answer: "X equals five or negative two. Plug either one in and you get zero.",
    trap: { point: "Trap: dividing both sides by x", say: "Never divide by x to simplify. You'll throw away the answer x equals zero. Factor it out instead." },
    recap: { point: "Equals zero, factor, split", say: "Get it equal to zero, factor, and set each factor to zero. Formula if it won't factor." },
    tint: { x: "blue", "5": "green", "2": "yellow" },
    // y = x² − 3x − 10: roots −2 and 5, axis x = 1.5, vertex (1.5, −12.25).
    scene: {
      x: [-6, 7.5],
      y: [-14, 9],
      objects: [
        { id: "axes", kind: "axes", xStep: 1, yStep: 5, numbers: false },
        { id: "para", kind: "fn", y: "x^2 - 3x - 10", color: "blue" },
        { id: "r5", kind: "point", at: [5, 0], color: "green", label: "5", labelOffset: [4, 0] },
        { id: "r2", kind: "point", at: [-2, 0], color: "yellow", label: "−2", labelOffset: [-30, 0] },
        { id: "axis", kind: "seg", from: [1.5, -13], to: [1.5, 8], dash: true, color: "gray" },
        { id: "w5", kind: "point", at: [-5, 0], open: true, color: "gray", label: "−5", labelOffset: [-14, 26] },
        { id: "w2", kind: "point", at: [2, 0], open: true, color: "gray", label: "2", labelOffset: [-4, 26] },
      ],
    },
  },
  {
    subskillId: "m-nonlinear-eq",
    pattern: "Solving Absolute Value Equations",
    example: 3,
    hook: "Absolute value hides a sign. So you have to ask what's inside the bars both ways.",
    idea: [
      { point: "Two cases: inside = k or −k", say: "If the absolute value of something equals k, that something is k or negative k. Two cases." },
      { point: "Isolate the bars first", say: "Get the absolute value alone before you split. Anything outside the bars has to go first." },
      { point: "Equals a negative? No solution", say: "And if it equals a negative number, stop. An absolute value can never be negative." },
    ],
    steps: [
      {
        say: "Here's the equation, graphed. The left side is a blue V, the right side is a yellow line at eleven. Watch where they cross.",
        work: "3|x + 2| − 4 = 11",
        focus: ["vee", "level"],
      },
      {
        say: "Isolate the bars. Add four to both sides. Both graphs rise together, so the crossings don't move sideways.",
        work: "3|x + 2| = 15",
        note: "+4 both sides",
        set: [{ id: "vee", params: { c: 0 } }, { id: "level", params: { k: 15 } }],
      },
      {
        say: "Divide by three. The absolute value of x plus two is five. Squashed, but the crossings stay put.",
        work: "|x + 2| = 5",
        note: "÷3 both sides",
        set: [{ id: "vee", params: { a: 1 } }, { id: "level", params: { k: 5 } }],
      },
      {
        say: "Now split. The V has two arms. On one, x plus two is five. On the other, it's negative five.",
        work: "x + 2 = 5  or  x + 2 = −5",
        note: "split: two cases",
        set: [{ id: "view", y: [-3, 9] }],
        focus: ["vee"],
      },
      {
        say: "Subtract two in each case. X is three or negative seven, the two crossings.",
        work: "x = 3  or  x = −7",
        note: "−2 each case",
        draw: ["p3", "p7"],
        focus: ["p3", "p7"],
      },
      {
        say: "Plug in five, negative two, or seven and none of them give eleven.",
        strike: [1, 2, 3],
      },
    ],
    answer: "X equals three or negative seven. Both check out in the original.",
    trap: { point: "Trap: forgetting the negative case", say: "Solve only the positive case and you've found half the answer." },
    recap: { point: "Isolate, split into two, check", say: "Get the bars alone, split into a positive and a negative case, then check your answers." },
    tint: { x: "blue", "11": "yellow", "15": "yellow", "5": "yellow" },
    // y = a|x + 2| + c against y = k; the crossings stay at x = 3 and −7
    // as both sides get +4 and then ÷3.
    scene: {
      x: [-10, 6],
      y: [-6, 18],
      objects: [
        { id: "axes", kind: "axes", xStep: 5, yStep: 5 },
        { id: "vee", kind: "fn", y: "a*abs(x + 2) + c", params: { a: 3, c: -4 }, color: "blue" },
        { id: "level", kind: "fn", y: "k + 0x", params: { k: 11 }, color: "yellow" },
        { id: "p3", kind: "point", at: [3, 5], color: "green", label: "3", labelOffset: [-6, 28] },
        { id: "p7", kind: "point", at: [-7, 5], color: "green", label: "−7", labelOffset: [-18, 28] },
      ],
    },
  },
  {
    subskillId: "m-nonlinear-eq",
    pattern: "Determining the Number of Solutions via the Discriminant",
    example: 3,
    hook: "When they only ask how many solutions, don't solve. One small calculation tells you.",
    idea: [
      { point: "Discriminant: b² − 4ac", say: "The discriminant is b squared minus four a c. It's the part under the root in the quadratic formula." },
      { point: "+ two, 0 one, − none", say: "Positive means two real solutions, zero means one, negative means none." },
    ],
    steps: [
      {
        say: "Read off the coefficients. A is negative two, so the parabola opens down. B is three, c is negative five.",
        highlight: ["-2x² + 3x - 5 = 0"],
        work: "a = −2,  b = 3,  c = −5",
        note: "read the coefficients",
        focus: ["para"],
      },
      {
        say: "Plug into b squared minus four a c.",
        work: "b² − 4ac = 9 − 4(−2)(−5)",
        note: "discriminant",
      },
      {
        say: "Negative two times negative five is positive ten, times four is forty. So nine minus forty.",
        work: "= 9 − 40",
        note: "(−2)(−5) = +10",
      },
      {
        say: "That's negative thirty one. Negative means no real solutions. Even the top of the parabola sits below the x-axis.",
        work: "= −31 < 0",
        note: "negative → none",
        draw: ["top", "gap"],
        focus: ["top", "gap", "para"],
      },
      {
        say: "One solution needs exactly zero, and two needs a positive number. Neither fits.",
        strike: [1, 2],
      },
      {
        say: "And it can be determined. We just did it.",
        strike: [3],
      },
    ],
    answer: "No real solutions. The discriminant is negative thirty one.",
    trap: { point: "Trap: sign slips in −4ac", say: "When a or c is negative, write the multiplication out. That minus four a c is where the signs go wrong." },
    recap: { point: "How many? Just check b² − 4ac", say: "Only asked how many? Compute b squared minus four a c and read the sign." },
    tint: { "31": "orange", "40": "orange" },
    // y = −2x² + 3x − 5 peaks at (0.75, −3.875): it never reaches y = 0.
    scene: {
      x: [-2.5, 4],
      y: [-9, 2],
      objects: [
        { id: "axes", kind: "axes", xStep: 2, yStep: 2 },
        { id: "para", kind: "fn", y: "-2x^2 + 3x - 5", color: "blue" },
        { id: "gap", kind: "seg", from: [0.75, 0], to: [0.75, -3.875], dash: true, color: "orange" },
        { id: "top", kind: "point", at: [0.75, -3.875], color: "orange", label: "peak", labelOffset: [-22, 30] },
      ],
    },
  },
  {
    subskillId: "m-nonlinear-eq",
    pattern: "Solving Radical and Rational Equations (Checking for Extraneous Solutions)",
    example: 1,
    hook: "Squaring both sides can sneak in a fake answer. It solves the new equation, not the original.",
    idea: [
      { point: "Isolate the root, then square", say: "Get the square root alone, then square both sides to get rid of it." },
      { point: "Denominator = 0? Throw it out", say: "With fractions, any value that makes a denominator zero gets thrown out." },
      { point: "Check in the original. Always.", say: "Then plug every answer into the original equation. This step isn't optional." },
    ],
    steps: [
      {
        say: "Blue is the square root side, yellow is x minus two. Square both sides, and the root's mirror image sneaks in too.",
        work: "2x − 1 = x² − 4x + 4",
        note: "square both sides",
        draw: ["mirror"],
        focus: ["mirror", "root", "line"],
      },
      {
        say: "Move everything to one side.",
        work: "x² − 6x + 5 = 0",
        note: "all on one side",
      },
      {
        say: "Factor. So x is one or five. Those are candidates, not answers yet.",
        work: "(x − 1)(x − 5) = 0",
        note: "factor",
      },
      {
        say: "Check one. The root of one is one, but one minus two is negative one. The line meets the mirror there, not the root. Fake.",
        work: "x = 1:  √1 ≠ 1 − 2",
        note: "1 fails",
        draw: ["fake"],
        focus: ["fake", "mirror", "line"],
        strike: [1, 2],
      },
      {
        say: "Check five. The root of nine is three, and five minus two is three. It works, a real crossing.",
        work: "x = 5:  √9 = 5 − 2",
        note: "5 works",
        draw: ["real"],
        focus: ["real", "root", "line"],
      },
      {
        say: "Negative five would put a negative under the square root. The blue curve doesn't even exist there.",
        focus: ["root"],
        strike: [3],
      },
    ],
    answer: "Just five. One solved the squared equation but not the original.",
    trap: { point: "Trap: skipping the final check", say: "Squaring can create an answer that doesn't really work. If you skip the check, you'll pick it." },
    recap: { point: "Square, solve, check every candidate", say: "Isolate the root, square, solve, then check each answer in the original equation." },
    // y = √(2x − 1) meets y = x − 2 only at (5, 3). Squaring also counts
    // the mirror y = −√(2x − 1), which meets the line at (1, −1).
    scene: {
      x: [-1, 7],
      y: [-4, 5],
      objects: [
        { id: "axes", kind: "axes", xStep: 2, yStep: 2 },
        { id: "root", kind: "fn", y: "sqrt(2x - 1)", domain: [0.5, 7], color: "blue" },
        { id: "line", kind: "fn", y: "x - 2", color: "yellow" },
        { id: "mirror", kind: "fn", y: "-sqrt(2x - 1)", domain: [0.5, 7], dash: true, color: "gray" },
        { id: "fake", kind: "point", at: [1, -1], open: true, color: "orange", label: "x = 1", labelOffset: [-58, -6] },
        { id: "real", kind: "point", at: [5, 3], color: "green", label: "x = 5", labelOffset: [0, 30] },
      ],
    },
  },
  {
    subskillId: "m-nonlinear-eq",
    pattern: "Solving a Linear-Quadratic System by Substitution",
    example: 3,
    hook: "A line and a parabola can cross twice. So expect two answers, then see which ones the question wants.",
    idea: [
      { point: "Solve the line for y", say: "Get the linear equation into y equals form." },
      { point: "Substitute into the quadratic", say: "Put that into the quadratic. Now there's one variable, and you solve it like any quadratic." },
      { point: "Up to two crossings", say: "Don't stop at one answer. Find both, then use any condition in the question." },
    ],
    steps: [
      {
        say: "Solve the line for y. Y equals ten minus x, the yellow line falling across the parabola.",
        highlight: ["x + y = 10"],
        work: "y = 10 − x",
        note: "solve line for y",
        draw: ["line"],
        focus: ["line"],
      },
      {
        say: "Put ten minus x in for y in the quadratic. Same height on both graphs, which is exactly where they cross.",
        work: "10 − x = x² − 4x + 6",
        note: "substitute",
        focus: ["line", "para"],
      },
      {
        say: "Move everything to one side.",
        work: "0 = x² − 3x − 4",
        note: "all on one side",
      },
      {
        say: "Factor. So x is four or negative one. Those are the two crossing points.",
        work: "0 = (x − 4)(x + 1)",
        note: "factor",
        draw: ["c4", "c1"],
        focus: ["c4", "c1"],
      },
      {
        say: "But the question says x is less than three. That rules out four, alone or in the pair.",
        highlight: ["x < 3"],
        draw: ["zone"],
        focus: ["zone", "c1"],
        strike: [1, 2],
      },
      {
        say: "Three doesn't work at all. The line gives seven, the parabola gives three. They don't meet there.",
        draw: ["m7", "m3"],
        focus: ["m7", "m3"],
        strike: [3],
      },
    ],
    answer: "Negative one. It's a crossing point, and it's less than three.",
    trap: { point: "Trap: stopping at one solution", say: "A line can cross a parabola twice. Find both, then let the question choose." },
    recap: { point: "Substitute, solve, apply the condition", say: "Solve the line for y, substitute, solve the quadratic, then apply any condition." },
    tint: { x: "blue", "10": "yellow", "4": "orange", "1": "green" },
    // y = x² − 4x + 6 and y = 10 − x cross at (−1, 11) and (4, 6).
    scene: {
      x: [-3, 6],
      y: [-1, 14],
      objects: [
        { id: "axes", kind: "axes", xStep: 2, yStep: 4 },
        { id: "para", kind: "fn", y: "x^2 - 4x + 6", color: "blue" },
        { id: "line", kind: "fn", y: "10 - x", color: "yellow" },
        { id: "c4", kind: "point", at: [4, 6], color: "orange", label: "x = 4", labelOffset: [8, 12] },
        { id: "c1", kind: "point", at: [-1, 11], color: "green", label: "x = −1", labelOffset: [-4, 30] },
        { id: "zone", kind: "poly", pts: [[-3, -1], [3, -1], [3, 14], [-3, 14]], fill: true, dash: true, color: "green", label: "x < 3", labelOffset: [30, 40] },
        { id: "m7", kind: "point", at: [3, 7], open: true, color: "yellow", label: "7", labelOffset: [0, 0] },
        { id: "m3", kind: "point", at: [3, 3], open: true, color: "blue", label: "3", labelOffset: [0, 0] },
      ],
    },
  },
  {
    subskillId: "m-nonlinear-eq",
    pattern: "Finding an Unknown Constant from a Given Point or Root, Then Evaluating",
    example: 4,
    hook: "These are two questions in one. Find the missing number, then actually answer what they asked.",
    idea: [
      { point: "Stage one: plug in the given point", say: "Plug the given point into the function and solve for the unknown constant." },
      { point: "Stage two: use it at the new input", say: "Then put that constant back in and evaluate at the new input." },
      { point: "Initial value means x = 0", say: "Watch the wording. Passes through a point means that input gives that output. Initial means x is zero." },
    ],
    steps: [
      {
        say: "F of two is forty five, so the curve must pass through that yellow point. Five times b squared equals forty five.",
        highlight: ["f(2) = 45"],
        work: "5b² = 45",
        note: "plug in f(2) = 45",
        focus: ["given", "curve"],
      },
      {
        say: "Divide by five. B squared is nine.",
        work: "b² = 9",
        note: "÷5 both sides",
      },
      {
        say: "B is positive, so b is three. Turn b up to three and the curve swings right through the point. Stage one, done.",
        work: "b = 3",
        note: "b is positive",
        set: [{ id: "curve", params: { b: 3 } }],
        focus: ["curve", "given"],
      },
      {
        say: "Now stage two. They asked for f of three. Five times three cubed.",
        work: "f(3) = 5(3)³",
        note: "the new input",
        draw: ["up"],
        focus: ["up", "curve"],
      },
      {
        say: "Cube first, then multiply. Twenty seven times five is one hundred thirty five.",
        work: "= 5 × 27 = 135",
        note: "cube first, then ×5",
        draw: ["ans"],
        focus: ["ans", "curve"],
      },
      {
        say: "Three is just b, where we stopped halfway. The two huge ones cube fifteen, or skip the square root.",
        strike: [0, 2, 3],
      },
    ],
    answer: "One hundred thirty five. Find b first, then use it.",
    trap: { point: "Trap: stopping at the constant", say: "Finding b feels like finishing. It isn't. Go back and answer the question they asked." },
    recap: { point: "Plug in, find the constant, evaluate", say: "Use the given point to find the constant, then use the constant to get the real answer." },
    tint: { b: "orange", "3": "orange", "45": "yellow", "135": "green" },
    // y = 5b^x, starting with a wrong guess b = 2 that misses (2, 45);
    // b = 3 hits it and gives f(3) = 135.
    scene: {
      x: [-0.6, 3.8],
      y: [-12, 160],
      objects: [
        { id: "axes", kind: "axes", xStep: 1, yStep: 50 },
        { id: "curve", kind: "fn", y: "5 * b^x", params: { b: 2 }, color: "orange" },
        { id: "given", kind: "point", at: [2, 45], color: "yellow", label: "(2, 45)", labelOffset: [8, 10] },
        { id: "up", kind: "seg", from: [3, 0], to: [3, 135], dash: true, color: "gray" },
        { id: "ans", kind: "point", at: [3, 135], color: "green", label: "135", labelOffset: [-46, 4] },
      ],
    },
  },
];
