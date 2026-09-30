import type { LessonVideoScript } from "../../types";

export const M_RIGHT_TRI_TRIG: LessonVideoScript[] = [
  {
    subskillId: "m-right-tri-trig",
    pattern: "SOH-CAH-TOA Setup",
    example: 0,
    hook: "The formula's never the hard part. Knowing which side is which is.",
    idea: [
      { point: "SOH-CAH-TOA", say: "Sine is opposite over hypotenuse. Cosine is adjacent over hypotenuse. Tangent is opposite over adjacent." },
      { point: "Label sides from the angle", say: "Stand at the angle you're using. The side across from you is opposite, the leg touching you is adjacent." },
    ],
    steps: [
      {
        say: "The angle is forty degrees, down at the ground. The fifteen feet runs along the ground, right next to it.",
        highlight: ["15 feet from the base of a pole", "40° angle of elevation"],
        spot: ["40°", "15"],
      },
      {
        say: "The pole's height is across from the angle, so it's opposite. Fifteen is adjacent. No hypotenuse needed.",
        highlight: ["pole's height"],
        work: "opp = h, adj = 15",
        note: "label the sides",
        spot: ["?", "15"],
      },
      {
        say: "Opposite and adjacent means tangent. So tangent of forty degrees equals h over fifteen.",
        work: "tan(40°) = h/15",
        note: "TOA",
        spot: ["40°", "?", "15"],
      },
      {
        say: "Multiply both sides by fifteen to get h alone.",
        work: "h = 15 · tan(40°)",
        note: "×15 both sides",
      },
      {
        say: "Sine and cosine both need the cable, the hypotenuse, which we don't have.",
        strike: [1, 2],
      },
      {
        say: "And fifteen over tangent divides when the equation says multiply.",
        strike: [3],
      },
    ],
    answer: "Fifteen times the tangent of forty degrees. Opposite and adjacent, so tangent.",
    trap: { point: "Trap: mixing up opposite and adjacent", say: "Opposite and adjacent depend on which angle you're standing at. Switch angles, and they switch too." },
    recap: { point: "Label from the angle, then pick the ratio", say: "Find the angle, label the sides from there, and let the two sides you have pick the ratio." },
  },
  {
    subskillId: "m-right-tri-trig",
    pattern: "Special Right Triangles (30-60-90 and 45-45-90)",
    example: 4,
    hook: "See a sixty degree angle in a right triangle? You already know every side.",
    idea: [
      { point: "45-45-90: x, x, x√2", say: "In a forty-five forty-five ninety triangle, the legs are equal and the hypotenuse is a leg times root two." },
      { point: "30-60-90: x, x√3, 2x", say: "In a thirty sixty ninety, the short side is x, the side across from sixty is x root three, and the hypotenuse is two x." },
    ],
    steps: [
      {
        say: "The hypotenuse is sixteen and one angle is sixty. That's a thirty sixty ninety triangle.",
        highlight: ["hypotenuse measures 16", "60°"],
        work: "sides: x, x√3, 2x",
        note: "30-60-90",
        spot: ["16", "60°"],
      },
      {
        say: "The hypotenuse is two x, so two x equals sixteen.",
        work: "2x = 16",
        note: "hypotenuse = 2x",
        spot: ["16"],
      },
      {
        say: "Divide by two. The short side, across from thirty degrees, is eight.",
        work: "x = 8",
        note: "÷2 both sides",
      },
      {
        say: "The side across from sixty is x root three. That's eight root three.",
        work: "opposite 60° = x√3 = 8√3",
        note: "long leg",
        spot: ["?"],
      },
      {
        say: "Eight is the short side, across from thirty. Sixteen root three starts from the hypotenuse instead of the short side.",
        strike: [1, 2],
      },
      {
        say: "And four root three halves one too many times.",
        strike: [3],
      },
    ],
    answer: "Eight root three. Halve the hypotenuse, then multiply by root three.",
    trap: { point: "Trap: mixing up the two ratios", say: "Root two belongs to the forty-five triangle, root three to the thirty sixty. Check the angles before you pick." },
    recap: { point: "Spot the angles, use the ratio", say: "Recognize the special angles and the sides come straight from the ratio. No Pythagorean theorem needed." },
  },
  {
    subskillId: "m-right-tri-trig",
    pattern: "Using the Pythagorean Theorem Before Computing a Trig Ratio",
    example: 3,
    hook: "Sometimes you're handed two sides, and they're the wrong two. So go get the third.",
    idea: [
      { point: "Ratio needs sides you don't have?", say: "A trig ratio uses two specific sides. If one of them is missing, you can't skip ahead." },
      { point: "a² + b² = c² finds it first", say: "Use the Pythagorean theorem to find the missing side, then set up the ratio." },
    ],
    steps: [
      {
        say: "We want the angle that isn't next to the nine, so nine is opposite it. The fifteen is the hypotenuse.",
        highlight: ["one leg measures 9", "hypotenuse measures 15", "NOT adjacent to the leg of length 9"],
        spot: ["9", "15", "θ"],
      },
      {
        say: "Cosine needs the adjacent side, and that's the one that's missing. So find it. Hypotenuse squared minus the known leg squared.",
        work: "b² = 15² − 9²",
        note: "missing leg",
        spot: ["?"],
      },
      {
        say: "Fifteen squared is two hundred twenty-five, nine squared is eighty-one. Subtract, and you get one hundred forty-four.",
        work: "b² = 225 − 81 = 144",
        note: "square and subtract",
      },
      {
        say: "The square root of one hundred forty-four is twelve. That's the adjacent side.",
        work: "b = 12",
        note: "take the root",
      },
      {
        say: "Cosine is adjacent over hypotenuse. Twelve over fifteen, which simplifies to four fifths.",
        work: "cos θ = 12/15 = 4/5",
        note: "CAH, simplify",
        spot: ["θ", "?", "15"],
      },
      {
        say: "Three fifths is the sine. Nine fifteenths treats nine as adjacent, and twelve ninths skips the hypotenuse.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Four fifths. Twelve adjacent, fifteen hypotenuse.",
    trap: { point: "Trap: using the two sides you're given", say: "It's tempting to make a ratio from whatever's on the page. Check that they're the sides the ratio actually needs." },
    recap: { point: "Find the third side, then the ratio", say: "Label the sides from the angle, fill in the missing one with Pythagoras, then build the ratio." },
  },
  {
    subskillId: "m-right-tri-trig",
    pattern: "Radian Measure and Coterminal Angles",
    example: 5,
    hook: "A big negative angle looks scary. Spin it around until it lands somewhere familiar.",
    idea: [
      { point: "Add or subtract 2π until in range", say: "A full turn is two pi. Adding or subtracting full turns lands you in the exact same spot." },
      { point: "Same spot, same trig values", say: "And angles that land in the same spot have the same sine, cosine, and tangent." },
    ],
    steps: [
      {
        say: "Negative eleven pi over three is way outside one turn. Two pi is six thirds pi, so add that.",
        highlight: ["cos(-11π/3)"],
        work: "−11π/3 + 6π/3 = −5π/3",
        note: "+2π",
        spot: ["-11π/3"],
      },
      {
        say: "Still negative. Add another full turn.",
        work: "−5π/3 + 6π/3 = π/3",
        note: "+2π again",
      },
      {
        say: "Pi over three is sixty degrees, and cosine of that is one half. It's in the first quadrant, so it's positive.",
        work: "cos(π/3) = 1/2",
        note: "known value",
      },
      {
        say: "Negative one half comes from stopping after one turn and getting the sign wrong.",
        strike: [1],
      },
      {
        say: "Root three over two is sine of pi over three, not cosine. Negative root three over two is the wrong value and the wrong sign.",
        strike: [2, 3],
      },
    ],
    answer: "One half. Two full turns, and it's just pi over three.",
    trap: { point: "Trap: evaluating the big angle directly", say: "Don't try to picture negative eleven pi over three. Reduce it first, then evaluate." },
    recap: { point: "Reduce by 2π, then evaluate", say: "Add or subtract two pi until the angle's between zero and two pi. Then use the values you know." },
  },
  {
    subskillId: "m-right-tri-trig",
    pattern: "Using the Pythagorean Theorem Alone to Find a Missing Side",
    example: 4,
    hook: "Radical sides look messy, but squaring them cleans them right up.",
    idea: [
      { point: "a² + b² = c², c is the hypotenuse", say: "The two legs squared add up to the hypotenuse squared. The hypotenuse is across from the right angle." },
      { point: "(a√b)² = a² × b", say: "To square something like four root three, square the four and drop the root. Sixteen times three." },
    ],
    steps: [
      {
        say: "The legs are four root three and four. We want the hypotenuse, so add the squares.",
        highlight: ["legs of length 4√3 and 4"],
        work: "c² = (4√3)² + 4²",
        note: "legs squared",
        spot: ["4√3", "4", "?"],
      },
      {
        say: "Four root three squared is sixteen times three, which is forty-eight. Four squared is sixteen.",
        work: "c² = 48 + 16",
        note: "16 × 3 = 48",
        spot: ["4√3"],
      },
      {
        say: "Add them up. Sixty-four.",
        work: "c² = 64",
        note: "add",
      },
      {
        say: "Take the square root. The hypotenuse is eight.",
        work: "c = 8",
        note: "√ both sides",
        spot: ["?"],
      },
      {
        say: "Sixty-four is c squared, one step early. Four root three plus four just adds the legs.",
        strike: [2, 3],
      },
      {
        say: "And four root seven mashes the legs under one root instead of squaring each one.",
        strike: [1],
      },
    ],
    answer: "Eight. Forty-eight plus sixteen is sixty-four, and its root is eight.",
    trap: { point: "Trap: squaring a radical wrong", say: "Four root three squared is sixteen times three. Not sixteen plus three, and not four times three." },
    recap: { point: "Square, add, root", say: "Square each leg carefully, add, and take the square root. Simplify whatever's left." },
  },
  {
    subskillId: "m-right-tri-trig",
    pattern: "The Sine-Cosine Complementary Angle Relationship",
    example: 2,
    hook: "When sine of one angle equals cosine of another, the angles are telling you something.",
    idea: [
      { point: "Acute angles add to 90°", say: "In a right triangle, the two smaller angles always add up to ninety degrees." },
      { point: "sin(x°) = cos(90° − x°)", say: "One angle's opposite side is the other's adjacent side. So sine of one equals cosine of the other." },
    ],
    steps: [
      {
        say: "Sine of three x equals cosine of two x plus fifteen. So those two angles are complementary.",
        highlight: ["sin(3x°) = cos(2x° + 15°)"],
        spot: ["3x°", "(2x+15)°"],
      },
      {
        say: "Complementary means they add to ninety.",
        work: "3x + (2x + 15) = 90",
        note: "sum to 90°",
        spot: ["3x°", "(2x+15)°"],
      },
      {
        say: "Combine the x terms. Five x plus fifteen.",
        work: "5x + 15 = 90",
        note: "combine like terms",
      },
      {
        say: "Subtract fifteen from both sides.",
        work: "5x = 75",
        note: "−15 both sides",
      },
      {
        say: "Divide by five. X is fifteen, so both angles are forty-five degrees.",
        work: "x = 15",
        note: "÷5 both sides",
      },
      {
        say: "Twenty-five makes the angles add to one hundred forty, five makes forty, and thirty-seven point five puts three x over ninety alone.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Fifteen. The angles are forty-five and forty-five, which add to ninety.",
    trap: { point: "Trap: sine and cosine of one angle", say: "The shortcut links sine of one angle to cosine of its partner. Sine and cosine of the same angle usually differ." },
    recap: { point: "sin = cos means sum is 90°", say: "Whenever sine of one angle equals cosine of another, those two angles add up to ninety degrees." },
  },
];
