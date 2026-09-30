import type { LessonVideoScript } from "../../types";

export const M_LINEAR_EQ_2VAR: LessonVideoScript[] = [
  {
    subskillId: "m-linear-eq-2var",
    pattern: "Reading Slope and Intercepts from Standard Form",
    example: 1,
    hook: "In standard form, the slope is hiding. The number in front of x is not it.",
    idea: [
      { point: "For slope, solve for y first", say: "Get y by itself. Once it's y equals m x plus b, the slope is just the number on x." },
      { point: "Intercepts: set x or y to 0", say: "For intercepts, skip the rearranging. Set y to zero for the x-intercept, and x to zero for the y-intercept." },
    ],
    steps: [
      {
        say: "Six x minus three y equals twelve. They want the slope, so we need y alone.",
        highlight: ["6x - 3y = 12"],
        work: "6x − 3y = 12",
      },
      {
        say: "Subtract six x from both sides. Negative three y equals negative six x plus twelve.",
        work: "−3y = −6x + 12",
        note: "−6x both sides",
      },
      {
        say: "Divide every term by negative three. Negative six x over negative three is positive two x. So y equals two x minus four.",
        work: "y = 2x − 4",
        note: "÷(−3) every term",
        spot: ["slope = 2"],
      },
      {
        say: "Negative two misses that two negatives make a positive. Six is the standard-form coefficient. Negative six forgets to divide by negative three.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Two. Read it off once y is by itself.",
    trap: { point: "Trap: reading slope off Ax + By", say: "The x coefficient in standard form isn't the slope. Solve for y first, and watch the signs when you divide." },
    recap: { point: "Isolate y, then read the slope", say: "Solve for y, then the number on x is the slope. For intercepts, set the other variable to zero." },
  },
  {
    subskillId: "m-linear-eq-2var",
    pattern: "Parallel and Perpendicular Line Relationships",
    example: 3,
    hook: "Parallel or perpendicular comes down to two slopes. Get both, then compare.",
    idea: [
      { point: "Parallel: same slope", say: "Parallel lines have exactly the same slope. They run side by side forever." },
      { point: "Perpendicular: flip it, change the sign", say: "Perpendicular slopes are negative reciprocals. Flip the fraction and change the sign. Multiplied together, they give negative one." },
    ],
    steps: [
      {
        say: "Our line has slope two. The other is two x plus four y equals sixteen, so first we find its slope.",
        highlight: ["slope 2", "2x + 4y = 16"],
        work: "2x + 4y = 16",
      },
      {
        say: "Subtract two x from both sides.",
        work: "4y = −2x + 16",
        note: "−2x both sides",
      },
      {
        say: "Divide everything by four. Its slope is negative one half.",
        work: "y = −(1/2)x + 4",
        note: "÷4 every term",
        spot: ["slope = -1/2"],
      },
      {
        say: "Now compare. Two times negative one half is negative one. Flip negative one half, change the sign, and you get two.",
        work: "2 · (−1/2) = −1",
        note: "product is −1",
        spot: ["perpendicular: slope = 2"],
      },
      {
        say: "Parallel and the same line both need matching slopes, and these don't match. And negative reciprocals are exactly perpendicular, so the neither choice is out.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Perpendicular. Two and negative one half are negative reciprocals.",
    trap: { point: "Trap: flipping without changing sign", say: "Perpendicular takes two moves. Flip the fraction and change the sign. Just flipping gets you the wrong slope." },
    recap: { point: "Find both slopes, then compare", say: "Put each line in slope-intercept form. Same slope is parallel. Negative reciprocals are perpendicular." },
  },
  {
    subskillId: "m-linear-eq-2var",
    pattern: "Interpreting a Constant or Coefficient in a Real-World Equation",
    example: 1,
    hook: "They give you the equation and ask what one number means. Look at what it's attached to.",
    idea: [
      { point: "Attached to a variable = a rate", say: "A number multiplying a variable is a rate. It counts once for each unit of that variable." },
      { point: "Standing alone = fixed amount", say: "A number standing alone is a fixed amount. It's there even when the variables are zero." },
    ],
    steps: [
      {
        say: "Y equals five x plus two hundred, the cost of renting a hall, where x is the number of guests.",
        highlight: ["y = 5x + 200", "x guests"],
        work: "y = 5x + 200",
      },
      {
        say: "The five multiplies x, the guests. So you pay five dollars once for every guest. That's a per-guest cost.",
        work: "5x = $5 × x guests",
        note: "on x → per guest",
      },
      {
        say: "The two hundred stands alone. You pay it even with zero guests, so it's the flat rental fee.",
        work: "200 = flat fee",
        note: "alone → fixed",
      },
      {
        say: "The flat fee is the two hundred, not the five. And x is the guest count, not five.",
        strike: [1, 2],
      },
      {
        say: "Nothing in this equation sets a maximum. The five is just added per guest.",
        strike: [3],
      },
    ],
    answer: "Five is the extra cost, in dollars, for each guest.",
    trap: { point: "Trap: mixing up rate and fixed amount", say: "The coefficient rides along with a variable. The constant doesn't. Keep them straight and most of these answer themselves." },
    recap: { point: "On a variable: rate. Alone: fixed.", say: "Ask what the number is attached to. Tied to a variable, it's a rate. Standing alone, it's a fixed amount." },
  },
  {
    subskillId: "m-linear-eq-2var",
    pattern: "Translating a Word Scenario into a Two-Variable Equation",
    example: 1,
    hook: "Two kinds of things, one total. That's the whole shape of this equation.",
    idea: [
      { point: "Two quantities = two variables", say: "Name each quantity with its own letter, and say in words what it counts." },
      { point: "\"Each\" or \"per\" means multiply", say: "Each or per means multiply that number by its own variable. Then the pieces add up to the total." },
    ],
    steps: [
      {
        say: "Chickens have two legs, cows have four, and there are one hundred seventy-two legs in all.",
        highlight: ["Chickens have 2 legs", "cows have 4 legs", "172 legs"],
      },
      {
        say: "Two legs for each chicken, and there are h chickens. So chicken legs total two h.",
        work: "chicken legs = 2h",
        note: "2 per chicken",
      },
      {
        say: "Four legs for each cow, and w cows. Cow legs total four w.",
        work: "cow legs = 4w",
        note: "4 per cow",
      },
      {
        say: "Together they make the total. Two h plus four w equals one hundred seventy-two.",
        work: "2h + 4w = 172",
        note: "parts add to total",
      },
      {
        say: "Four h plus two w gives chickens four legs. Subtracting h and w means nothing here. And h plus w counts animals, not legs.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Two h plus four w equals one hundred seventy-two. Legs per animal, times animals, added up.",
    trap: { point: "Trap: rate on the wrong variable", say: "Double check which variable each per number belongs to. Four goes with cows, not chickens." },
    recap: { point: "Rate × its variable, then add", say: "Name both quantities, multiply each by its own rate, and set the sum equal to the total." },
  },
  {
    subskillId: "m-linear-eq-2var",
    pattern: "Solving for One Variable Given the Other's Value",
    example: 1,
    hook: "Two variables, but they give you one of them. Now it's just a one-variable equation.",
    idea: [
      { point: "Substitute the known value", say: "Put the known value in for its variable, in parentheses. Make sure it's the right variable." },
      { point: "Then solve like usual", say: "What's left is an ordinary equation. Watch the sign if the variable you want has a minus in front." },
    ],
    steps: [
      {
        say: "Four a minus b equals fifteen, and a is six.",
        highlight: ["4a - b = 15", "a = 6"],
        work: "4a − b = 15",
      },
      {
        say: "Put six in for a.",
        work: "4(6) − b = 15",
        note: "plug in a = 6",
      },
      {
        say: "Four times six is twenty-four.",
        work: "24 − b = 15",
        note: "multiply",
      },
      {
        say: "Subtract twenty-four from both sides. Negative b equals negative nine.",
        work: "−b = −9",
        note: "−24 both sides",
      },
      {
        say: "That's negative b, not b. Multiply both sides by negative one, and b is nine.",
        work: "b = 9",
        note: "×(−1) both sides",
        strike: [1],
      },
      {
        say: "Thirty-nine adds fifteen to twenty-four. And three fails the check: twenty-four minus three is twenty-one.",
        strike: [2, 3],
      },
    ],
    answer: "B equals nine. Twenty-four minus nine is fifteen.",
    trap: { point: "Trap: stopping at negative b", say: "Negative b equals negative nine isn't finished. Flip the sign to get b." },
    recap: { point: "Substitute, then solve for what's left", say: "Plug in the value you're given, then solve the one-variable equation that's left. Check the sign at the end." },
  },
];
