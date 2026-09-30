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
        say: "Here's the equation. X squared minus three x minus ten equals zero. It already equals zero.",
        work: "x² − 3x − 10 = 0",
      },
      {
        say: "Find two numbers that multiply to negative ten and add to negative three. Negative five and two.",
        work: "(x − 5)(x + 2) = 0",
        note: "−5 · 2 = −10, sum −3",
      },
      {
        say: "Two things multiply to zero, so one of them is zero.",
        work: "x − 5 = 0  or  x + 2 = 0",
        note: "zero product",
      },
      {
        say: "So x is five or negative two. Those are where the graph crosses the x-axis.",
        work: "x = 5  or  x = −2",
        note: "solve each",
        spot: ["-2", "5"],
      },
      {
        say: "Negative five and two is the classic sign flip.",
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
        say: "Here's the equation. Three times the absolute value of x plus two, minus four, equals eleven.",
        work: "3|x + 2| − 4 = 11",
      },
      {
        say: "Isolate the bars. Add four to both sides.",
        work: "3|x + 2| = 15",
        note: "+4 both sides",
      },
      {
        say: "Divide by three. The absolute value of x plus two is five.",
        work: "|x + 2| = 5",
        note: "÷3 both sides",
      },
      {
        say: "Now split. X plus two is five, or x plus two is negative five.",
        work: "x + 2 = 5  or  x + 2 = −5",
        note: "split: two cases",
      },
      {
        say: "Subtract two in each case. X is three or negative seven.",
        work: "x = 3  or  x = −7",
        note: "−2 each case",
      },
      {
        say: "Plug in five, negative two, or seven and none of them give eleven.",
        strike: [1, 2, 3],
      },
    ],
    answer: "X equals three or negative seven. Both check out in the original.",
    trap: { point: "Trap: forgetting the negative case", say: "Solve only the positive case and you've found half the answer." },
    recap: { point: "Isolate, split into two, check", say: "Get the bars alone, split into a positive and a negative case, then check your answers." },
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
        say: "Read off the coefficients. A is negative two, b is three, c is negative five. Keep those signs.",
        highlight: ["-2x² + 3x - 5 = 0"],
        work: "a = −2,  b = 3,  c = −5",
        note: "read the coefficients",
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
        say: "That's negative thirty one. Negative means no real solutions. The parabola never reaches the x-axis.",
        work: "= −31",
        note: "negative → none",
        spot: ["No real solutions"],
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
        say: "The square root is already alone, so square both sides. X minus two, squared, is x squared minus four x plus four.",
        work: "2x − 1 = x² − 4x + 4",
        note: "square both sides",
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
        say: "Check one. The root of one is one, but one minus two is negative one. Fake answer.",
        work: "x = 1:  √1 = 1,  1 − 2 = −1",
        note: "1 fails",
        strike: [1, 2],
      },
      {
        say: "Check five. The root of nine is three, and five minus two is three. It works.",
        work: "x = 5:  √9 = 3,  5 − 2 = 3",
        note: "5 works",
      },
      {
        say: "Negative five would put a negative under the square root. Not a real number.",
        strike: [3],
      },
    ],
    answer: "Just five. One solved the squared equation but not the original.",
    trap: { point: "Trap: skipping the final check", say: "Squaring can create an answer that doesn't really work. If you skip the check, you'll pick it." },
    recap: { point: "Square, solve, check every candidate", say: "Isolate the root, square, solve, then check each answer in the original equation." },
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
        say: "Solve the line for y. Y equals ten minus x.",
        highlight: ["x + y = 10"],
        work: "y = 10 − x",
        note: "solve line for y",
      },
      {
        say: "Put ten minus x in for y in the quadratic.",
        work: "10 − x = x² − 4x + 6",
        note: "substitute",
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
        spot: ["x = 4", "x = -1"],
      },
      {
        say: "But the question says x is less than three. That rules out four, alone or in the pair.",
        highlight: ["x < 3"],
        spot: ["x = -1"],
        strike: [1, 2],
      },
      {
        say: "Three doesn't work at all. The line gives seven, the parabola gives three.",
        strike: [3],
      },
    ],
    answer: "Negative one. It's a crossing point, and it's less than three.",
    trap: { point: "Trap: stopping at one solution", say: "A line can cross a parabola twice. Find both, then let the question choose." },
    recap: { point: "Substitute, solve, apply the condition", say: "Solve the line for y, substitute, solve the quadratic, then apply any condition." },
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
        say: "F of two is forty five. So five times b squared equals forty five.",
        highlight: ["f(2) = 45"],
        work: "5b² = 45",
        note: "plug in f(2) = 45",
      },
      {
        say: "Divide by five. B squared is nine.",
        work: "b² = 9",
        note: "÷5 both sides",
      },
      {
        say: "B is positive, so b is three. That's stage one, not the answer.",
        work: "b = 3",
        note: "b is positive",
      },
      {
        say: "Now stage two. They asked for f of three. Five times three cubed.",
        work: "f(3) = 5(3)³",
        note: "the new input",
      },
      {
        say: "Cube first, then multiply. Twenty seven times five is one hundred thirty five.",
        work: "= 5 × 27 = 135",
        note: "cube first, then ×5",
      },
      {
        say: "Three is just b, where we stopped halfway. The two huge ones cube fifteen, or skip the square root.",
        strike: [0, 2, 3],
      },
    ],
    answer: "One hundred thirty five. Find b first, then use it.",
    trap: { point: "Trap: stopping at the constant", say: "Finding b feels like finishing. It isn't. Go back and answer the question they asked." },
    recap: { point: "Plug in, find the constant, evaluate", say: "Use the given point to find the constant, then use the constant to get the real answer." },
  },
];
