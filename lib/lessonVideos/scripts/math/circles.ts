import type { LessonVideoScript } from "../../types";

export const M_CIRCLES: LessonVideoScript[] = [
  {
    subskillId: "m-circles",
    pattern: "The Circle Equation (Center-Radius Form)",
    example: 1,
    hook: "A circle's equation is its address and its size, written in one line. You just have to read the signs right.",
    idea: [
      { point: "(x − h)² + (y − k)² = r²", say: "The center is h comma k, and the radius is r. The template subtracts h and k, and squares r." },
      { point: "Subtracting a negative = adding", say: "So a negative coordinate shows up with a plus sign. And the right side is the radius squared, not the radius." },
    ],
    steps: [
      {
        say: "Start from the template, with h and k being subtracted.",
        work: "(x − h)² + (y − k)² = r²",
        note: "center-radius form",
      },
      {
        say: "The center is negative four comma one, and the radius is six. Drop them in exactly as they are.",
        highlight: ["center (-4, 1)", "radius 6"],
        work: "(x − (−4))² + (y − 1)² = 6²",
        note: "h = −4, k = 1, r = 6",
      },
      {
        say: "Minus negative four becomes plus four. And six squared is thirty-six.",
        work: "(x + 4)² + (y − 1)² = 36",
        note: "clean up signs",
      },
      {
        say: "The second choice flips both signs, like the template adds. The fourth flips only the y sign.",
        strike: [1, 3],
      },
      {
        say: "And the third puts six on the right. That's the radius, but the equation needs it squared.",
        strike: [2],
      },
    ],
    answer: "X plus four, squared, plus y minus one, squared, equals thirty-six.",
    trap: { point: "Trap: keeping the center's sign", say: "The equation subtracts the center. So a center at negative four shows up as x plus four." },
    recap: { point: "Flip the center's signs, square r", say: "Write each center coordinate with the opposite sign in the parentheses, and square the radius on the right." },
  },
  {
    subskillId: "m-circles",
    pattern: "Arc Length and Sector Area as Fractions of the Whole Circle",
    example: 1,
    hook: "An arc is just a slice of the circle's edge. Figure out how big a slice.",
    idea: [
      { point: "Fraction = angle / 360°", say: "The central angle over three sixty tells you what fraction of the circle you've got." },
      { point: "Arc: × 2πr. Sector: × πr²", say: "For arc length, take that fraction of the circumference. For sector area, take it of the whole area." },
    ],
    steps: [
      {
        say: "The central angle is one hundred twenty degrees. Out of three sixty, that's one third.",
        highlight: ["central angle of 120°"],
        work: "120/360 = 1/3",
        note: "fraction of circle",
        spot: ["120°"],
      },
      {
        say: "It's asking for arc length, so we need the circumference. Two pi times nine is eighteen pi.",
        highlight: ["radius 9", "arc length"],
        work: "C = 2π(9) = 18π",
        note: "whole circumference",
        spot: ["9"],
      },
      {
        say: "Take one third of eighteen pi. Six pi.",
        work: "arc = (1/3)(18π) = 6π",
        note: "fraction × whole",
      },
      {
        say: "Eighteen pi is the whole circumference, and nine pi is half. We only want a third.",
        strike: [1, 2],
      },
      {
        say: "Two pi is a slip. A third of eighteen pi is six pi, not two.",
        strike: [3],
      },
    ],
    answer: "Six pi. One third of the way around a circle whose edge is eighteen pi.",
    trap: { point: "Trap: skipping the fraction", say: "Turn the angle into a fraction of three sixty first. Otherwise you're working with the whole circle." },
    recap: { point: "Angle over 360°, times the whole", say: "Arc length and sector area are the same move. Find the fraction, then apply it to the circumference or area." },
  },
  {
    subskillId: "m-circles",
    pattern: "Solving the Circle Equation for a Coordinate's Possible Values",
    example: 2,
    hook: "Draw a vertical line through a circle and it usually hits twice. So expect two answers.",
    idea: [
      { point: "Plug in the known coordinate", say: "Put the coordinate you know into its spot in the equation, then solve for the other one." },
      { point: "Square root gives ±", say: "When you undo a square, there's a positive root and a negative root. Keep both." },
    ],
    steps: [
      {
        say: "X is five, so put five in for x.",
        highlight: ["x=5"],
        work: "(5 + 1)² + (y − 4)² = 40",
        note: "plug in x = 5",
      },
      {
        say: "Five plus one is six, and six squared is thirty-six.",
        work: "36 + (y − 4)² = 40",
        note: "simplify",
      },
      {
        say: "Subtract thirty-six from both sides.",
        work: "(y − 4)² = 4",
        note: "−36 both sides",
      },
      {
        say: "Take the square root. Y minus four could be two or negative two.",
        work: "y − 4 = ±2",
        note: "± square root",
      },
      {
        say: "Add four to both. Y is six or two.",
        work: "y = 6 or y = 2",
        note: "+4 both sides",
      },
      {
        say: "Eight or zero doesn't check. Six only drops the negative root. And negative six or negative two is a sign slip.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Y equals six or y equals two. One point above the center, one below.",
    trap: { point: "Trap: forgetting the negative root", say: "Something squared equals four has two answers, two and negative two. Dropping one loses a point on the circle." },
    recap: { point: "Substitute, isolate the square, take ±", say: "Plug in what you know, get the squared piece alone, and take both square roots." },
  },
  {
    subskillId: "m-circles",
    pattern: "Circle Theorems: Central Angles, Arcs, and Tangent Lines",
    example: 2,
    hook: "A tangent line hides a right angle. Find it, and you've got a right triangle.",
    idea: [
      { point: "Radius ⊥ tangent", say: "A radius drawn to the point where a tangent touches always meets it at ninety degrees." },
      { point: "Then use a² + b² = c²", say: "That right angle means the Pythagorean theorem works. Just figure out which side is the hypotenuse first." },
    ],
    steps: [
      {
        say: "P Q touches the circle at Q, and O Q is a radius. So the angle at Q is a right angle.",
        highlight: ["tangent to a circle at point Q"],
        work: "OQ ⊥ PQ",
        note: "radius ⊥ tangent",
        spot: ["5", "?"],
      },
      {
        say: "The side across from that right angle is O P, thirteen. That's the hypotenuse.",
        highlight: ["OQ = 5", "OP = 13"],
        work: "5² + PQ² = 13²",
        note: "OP is hypotenuse",
        spot: ["5", "13"],
      },
      {
        say: "One hundred sixty-nine minus twenty-five is one hundred forty-four.",
        work: "PQ² = 169 − 25 = 144",
        note: "subtract squares",
      },
      {
        say: "Take the square root. P Q is twelve.",
        work: "PQ = 12",
        note: "√ both sides",
        spot: ["?"],
      },
      {
        say: "Eighteen and eight just add or subtract the lengths. The square root of one hundred ninety-four adds the squares, but O P is the hypotenuse.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Twelve. A five, twelve, thirteen right triangle, hiding inside a circle.",
    trap: { point: "Trap: missing the right angle", say: "Nothing in the question says right angle. The tangent says it for you." },
    recap: { point: "Tangent → right angle → Pythagoras", say: "Draw the radius to the point of tangency, mark the right angle, and solve the triangle." },
  },
  {
    subskillId: "m-circles",
    pattern: "Inscribed Figures and Radii as Equal Sides",
    example: 2,
    hook: "Any segment from the center to the circle is a radius. That gives you free sides.",
    idea: [
      { point: "Every radius is the same length", say: "A triangle with one corner at the center and two on the circle has two radii for sides. They're equal." },
      { point: "Count both radii", say: "So when a problem gives you one radius, you actually know two sides." },
    ],
    steps: [
      {
        say: "O is the center, and P and Q are on the circle. So O P and O Q are both radii, nine each.",
        highlight: ["radius of the circle is 9"],
        work: "OP = OQ = 9",
        note: "both are radii",
        spot: ["O", "P", "Q", "9"],
      },
      {
        say: "The perimeter adds all three sides. Nine plus nine plus P Q is thirty-four.",
        highlight: ["perimeter of triangle OPQ is 34"],
        work: "9 + 9 + PQ = 34",
        note: "perimeter",
      },
      {
        say: "Subtract eighteen from both sides. P Q is sixteen.",
        work: "PQ = 34 − 18 = 16",
        note: "−18 both sides",
      },
      {
        say: "Twenty-five subtracts only one radius. Nine assumes the chord equals the radius, which only happens at sixty degrees.",
        strike: [0, 1],
      },
      {
        say: "And eighteen is the diameter. This chord misses the center, so it's shorter.",
        strike: [2],
      },
    ],
    answer: "Sixteen. Thirty-four minus both radii.",
    trap: { point: "Trap: counting only one radius", say: "The problem mentions the radius once, but the triangle uses it twice. Subtract both." },
    recap: { point: "Spot the radii, then use them", say: "Look for sides that run from the center to the circle. They're radii, so they're equal." },
  },
];
