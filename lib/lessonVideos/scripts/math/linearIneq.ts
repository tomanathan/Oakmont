import type { LessonVideoScript } from "../../types";

export const M_LINEAR_INEQ: LessonVideoScript[] = [
  {
    subskillId: "m-linear-ineq",
    pattern: "Solving with the Sign-Flip Rule",
    example: 0,
    hook: "Inequalities are equations with one extra rule. Forget it and you get the exact opposite answer.",
    idea: [
      { point: "Same steps as an equation", say: "You isolate x the same way you would in an equation. Add, subtract, multiply, divide." },
      { point: "× or ÷ by a negative: flip it", say: "The one exception: multiply or divide both sides by a negative number, and the sign flips." },
      { point: "Adding and subtracting never flip", say: "Adding or subtracting a negative doesn't count. Only multiplying or dividing by one does." },
    ],
    steps: [
      {
        say: "Here's the inequality. Negative three x plus six is greater than zero.",
        work: "−3x + 6 > 0",
      },
      {
        say: "Subtract six from both sides. No flip here, it's just subtraction.",
        work: "−3x > −6",
        note: "−6 both sides",
      },
      {
        say: "Now divide by negative three. That's a negative, so the greater than turns into less than. X is less than two.",
        work: "x < 2",
        note: "÷(−3): flip the sign",
      },
      {
        say: "X greater than two is what you get if you forget the flip.",
        strike: [1],
      },
      {
        say: "And the boundary is positive two, since negative six over negative three is two. So both negative twos are out.",
        strike: [2, 3],
      },
    ],
    answer: "X is less than two. Try zero: six is greater than zero, so it checks.",
    trap: { point: "Trap: dividing by a negative, no flip", say: "The flip often hides in the last step. Every time you divide by a negative, say flip out loud." },
    recap: { point: "Negative × or ÷ flips the sign", say: "Solve it like an equation. Multiply or divide by a negative, and the sign turns around." },
  },
  {
    subskillId: "m-linear-ineq",
    pattern: "Word Problems with Inequality Language",
    example: 2,
    hook: "In these, the algebra is easy. The hard part is turning the words into the right sign.",
    idea: [
      { point: "At least → ≥   at most → ≤", say: "At least means that number or more. At most, or no more than, means that number or less." },
      { point: "More than → >, no equals", say: "More than, or exceeds, is strict. The number itself doesn't count." },
      { point: "Translate first, then solve", say: "Write the inequality from the words, then solve it just like you normally would." },
    ],
    steps: [
      {
        say: "Four dollars for the first hour, two for each extra hour, and no more than sixteen total.",
        highlight: ["$4 for the first hour", "$2 for each additional hour", "no more than $16"],
      },
      {
        say: "No more than means sixteen is allowed. So four plus two a is less than or equal to sixteen.",
        work: "4 + 2a ≤ 16",
        note: "no more than → ≤",
      },
      {
        say: "Subtract the four dollars for the first hour. That leaves twelve dollars for extra hours.",
        work: "2a ≤ 12",
        note: "−4 both sides",
      },
      {
        say: "Divide by two. A is at most six.",
        work: "a ≤ 6",
        note: "÷2 both sides",
      },
      {
        say: "Eight forgets the first hour's four dollars. Twelve is the money left, not the hours.",
        strike: [1, 3],
      },
      {
        say: "Five works, but six costs exactly sixteen, and that's still no more than sixteen.",
        strike: [2],
      },
    ],
    answer: "Six extra hours. Four plus twelve is sixteen, right at the limit, and that's allowed.",
    trap: { point: "Trap: < when the words mean ≤", say: "At least and at most include the number itself. Using a strict sign throws away the right answer." },
    recap: { point: "Words → sign, then solve", say: "Translate the phrase into the sign first. After that it's the same algebra as always." },
  },
  {
    subskillId: "m-linear-ineq",
    pattern: "Matching a Graph, Table, or Point to an Inequality or System",
    example: 0,
    hook: "Sometimes they hand you the answer and ask if it works. That's the easiest kind of checking.",
    idea: [
      { point: "A point: plug it in", say: "For a single point, plug in its x and y and see if the statement comes out true." },
      { point: "A table: every row must pass", say: "For a table, every row has to pass. One failing row rules it out." },
      { point: "Shading: test a point inside", say: "For a shaded graph, find the line, then test a point clearly inside the shading." },
    ],
    steps: [
      {
        say: "Here's the inequality. Y is greater than two x minus four. The point is three, one.",
        highlight: ["(3, 1)", "y > 2x - 4"],
        work: "y > 2x − 4",
      },
      {
        say: "Put in x equals three and y equals one.",
        work: "1 > 2(3) − 4",
        note: "plug in (3, 1)",
      },
      {
        say: "Two times three is six, minus four is two. So the question is, is one greater than two?",
        work: "1 > 2",
        note: "simplify the right",
      },
      {
        say: "It isn't. So the yes choices are out, and comparing three to one isn't the test anyway.",
        strike: [1, 3],
      },
      {
        say: "And flipping it to one less than two changes the inequality you were asked to check.",
        strike: [2],
      },
    ],
    answer: "No. Plugging in gives one greater than two, which is false.",
    trap: { point: "Trap: checking only some points", say: "With a table or a system, one pass isn't enough. Every point has to satisfy every inequality." },
    recap: { point: "Plug in and check true or false", say: "Given a point, substitute it. True means it works, false means it doesn't." },
  },
];
