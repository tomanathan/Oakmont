import type { LessonVideoScript } from "../../types";

export const M_LINES_ANGLES_TRI: LessonVideoScript[] = [
  {
    subskillId: "m-lines-angles-tri",
    pattern: "Triangle Angle Sum and Exterior Angles",
    example: 0,
    hook: "There's a shortcut for exterior angles that saves you a whole step.",
    idea: [
      { point: "Inside angles add to 180°", say: "The three angles inside any triangle add up to one hundred eighty degrees." },
      { point: "Exterior = the two far angles", say: "And an exterior angle equals the two inside angles that aren't next to it, added together." },
    ],
    steps: [
      {
        say: "The exterior angle is one hundred ten degrees, and one far angle is forty.",
        highlight: ["exterior angle measures 110°", "40°"],
        focus: ["ext", "angB"],
      },
      {
        say: "The exterior angle equals the two far angles together. So forty plus x equals one hundred ten.",
        work: "40 + x = 110",
        note: "exterior = far + far",
        draw: ["copyB", "copyA"],
        move: [
          { id: "copyB", by: [5, 0] },
          { id: "copyA", by: [1.17, -3.214], turn: 180 },
        ],
        focus: ["ext", "copyA", "copyB"],
      },
      {
        say: "Subtract forty from both sides. X is seventy degrees.",
        work: "x = 70°",
        note: "−40 both sides",
        focus: ["angA"],
      },
      {
        say: "One hundred ten is the exterior angle itself, and forty is the angle we were given.",
        strike: [1, 2],
      },
      {
        say: "And one fifty adds them. The exterior angle is already the sum, so subtract.",
        strike: [3],
      },
    ],
    answer: "Seventy degrees. One step, no need to find the angle next to it first.",
    trap: { point: "Trap: adding when you should subtract", say: "The exterior angle is already the total. Take away the angle you know." },
    recap: { point: "Exterior = sum of the two far angles", say: "An exterior angle equals the two far inside angles added together. Use it to skip a step." },
    tint: { x: "blue", "40": "yellow", "110": "pink" },
    scene: {
      x: [-0.6, 8],
      y: [-0.6, 3.9],
      pts: { B: [0, 0], C: [5, 0], A: [3.83, 3.214], D: [7.6, 0] },
      objects: [
        { id: "tri", kind: "poly", pts: ["A", "B", "C"] },
        { id: "ext-line", kind: "seg", from: "C", to: "D", dash: true, color: "gray" },
        { id: "angB", kind: "angle", at: "B", from: "C", to: "A", r: 34, color: "yellow", label: "40°" },
        { id: "angA", kind: "angle", at: "A", from: "B", to: "C", r: 26, color: "blue", label: "x" },
        { id: "ext", kind: "angle", at: "C", from: "D", to: "A", r: 48, color: "pink", label: "110°", labelOffset: [8, -4] },
        { id: "copyB", kind: "angle", at: "B", from: "C", to: "A", r: 34, color: "yellow" },
        { id: "copyA", kind: "angle", at: "A", from: "B", to: "C", r: 34, color: "blue" },
      ],
    },
  },
  {
    subskillId: "m-lines-angles-tri",
    pattern: "Parallel Lines Cut by a Transversal",
    example: 0,
    hook: "Parallel lines give you a bunch of angles for free. You just have to know which pairs match.",
    idea: [
      { point: "Corresponding, alternate: equal", say: "Corresponding angles and alternate interior angles are equal. Same spot, or a clean zigzag across." },
      { point: "Same-side interior: add to 180°", say: "But two angles between the lines, on the same side of the transversal, add up to one hundred eighty." },
      { point: "Name the pair before you calculate", say: "So before any math, name which kind of pair you're looking at. That decides everything." },
    ],
    steps: [
      {
        say: "One angle is sixty-five degrees, and we want its same-side interior partner.",
        highlight: ["65°", "co-interior (same-side interior) angle"],
        spot: ["65°", "?"],
      },
      {
        say: "Same-side interior angles are supplementary. So sixty-five plus the unknown makes one hundred eighty.",
        work: "65 + x = 180",
        note: "same-side → sum 180°",
        spot: ["65°", "?"],
      },
      {
        say: "Subtract sixty-five from both sides. The angle is one hundred fifteen degrees.",
        work: "x = 115°",
        note: "−65 both sides",
      },
      {
        say: "Sixty-five treats the pair as equal, which only works for corresponding or alternate angles.",
        strike: [1],
      },
      {
        say: "Twenty-five uses ninety instead of one eighty, and one eighty is the total, not the missing angle.",
        strike: [2, 3],
      },
    ],
    answer: "One hundred fifteen degrees. One sharp angle, one wide one, adding to a straight line.",
    trap: { point: "Trap: calling same-side angles equal", say: "Same-side interior angles look like partners, so it's tempting to make them equal. They add to one eighty instead." },
    recap: { point: "Name the pair, then equal or 180°", say: "Figure out the pair type first. Equal for corresponding and alternate, one eighty for same-side interior." },
  },
  {
    subskillId: "m-lines-angles-tri",
    pattern: "Similar and Congruent Triangles: Corresponding Parts",
    example: 2,
    hook: "The letters in a similarity statement are a map. Follow the order, not the picture.",
    idea: [
      { point: "Vertex order = matching parts", say: "Triangle ABC similar to EFD means A matches E, B matches F, and C matches D, in that order." },
      { point: "New side = k × old side", say: "Matching sides all share one ratio, the scale factor. Find it from one known pair, then use it." },
    ],
    steps: [
      {
        say: "Read the letters in order. A goes with E, B with F, C with D.",
        highlight: ["triangle EFD (note the vertex order)"],
        work: "A↔E, B↔F, C↔D",
        note: "match in order",
        spot: ["A", "E", "B", "F", "C", "D"],
      },
      {
        say: "A B matches E F, and those are both given. Fifteen over ten is one and a half.",
        highlight: ["AB = 10", "EF = 15"],
        work: "k = EF/AB = 15/10 = 1.5",
        note: "scale factor",
        spot: ["10", "15"],
      },
      {
        say: "Now D E. D goes with C and E goes with A, so D E matches C A, which is eight.",
        highlight: ["CA = 8"],
        work: "DE ↔ CA = 8",
        note: "find the partner",
        spot: ["8", "?"],
      },
      {
        say: "Multiply by the scale factor. Eight times one and a half is twelve.",
        work: "DE = 1.5 × 8 = 12",
        note: "× k",
        spot: ["?"],
      },
      {
        say: "Eight is C A itself, and ten is A B. Neither one got scaled.",
        strike: [1, 2],
      },
      {
        say: "And five point three three divides by the scale factor. DE is on the bigger triangle, so multiply.",
        strike: [3],
      },
    ],
    answer: "Twelve. The bigger triangle's side should be bigger, and it is.",
    trap: { point: "Trap: matching sides by position", say: "Don't pair sides because they look alike or sit near each other. The vertex order tells you who matches whom." },
    recap: { point: "Match by letters, then multiply by k", say: "Use the vertex order to find each side's partner, get the scale factor from a known pair, and apply it." },
  },
  {
    subskillId: "m-lines-angles-tri",
    pattern: "Vertical Angles and Basic Angle Relationships",
    example: 2,
    hook: "Two lines cross, and you get two facts that crack almost every one of these.",
    idea: [
      { point: "Vertical angles are equal", say: "Angles straight across from each other at a crossing are vertical angles, and they're always equal." },
      { point: "Side by side on a line: 180°", say: "Angles next to each other along one line add to one hundred eighty, since a line is straight." },
    ],
    steps: [
      {
        say: "These two angles are vertical, straight across from each other. So their expressions are equal.",
        highlight: ["its vertical angle"],
        work: "3x + 15 = 5x − 25",
        note: "vertical angles equal",
        spot: ["(3x+15)°", "(5x-25)°"],
      },
      {
        say: "Subtract three x from both sides to get the x terms together.",
        work: "15 = 2x − 25",
        note: "−3x both sides",
      },
      {
        say: "Add twenty-five to both sides.",
        work: "40 = 2x",
        note: "+25 both sides",
      },
      {
        say: "Divide by two. X is twenty, and both angles come out to seventy-five degrees.",
        work: "x = 20",
        note: "÷2 both sides",
      },
      {
        say: "Forty is two x, one step early. Five doesn't check out, and negative twenty is a sign slip.",
        strike: [1, 2, 3],
      },
    ],
    answer: "X equals twenty. Plug it in and both angles are seventy-five degrees, as vertical angles should be.",
    trap: { point: "Trap: vertical vs. side-by-side", say: "Across the crossing means equal. Next to each other on a line means they add to one eighty. Don't swap them." },
    recap: { point: "Across = equal, beside = 180°", say: "Spot where the angles sit, write the equation that matches, and solve." },
  },
];
