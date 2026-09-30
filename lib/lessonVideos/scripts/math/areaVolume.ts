import type { LessonVideoScript } from "../../types";

export const M_AREA_VOLUME: LessonVideoScript[] = [
  {
    subskillId: "m-area-volume",
    pattern: "Scale Factor Effects on Area and Volume",
    example: 1,
    hook: "Triple a cube's sides and it doesn't get three times bigger. It gets a lot bigger than that.",
    idea: [
      { point: "Length × k, area × k², volume × k³", say: "Stretch every length by k. Area has two dimensions, so it grows by k squared. Volume has three, so k cubed." },
      { point: "Count the dimensions first", say: "Before you touch the numbers, ask: am I measuring a length, an area, or a volume?" },
    ],
    steps: [
      {
        say: "The side length is tripled, so the linear scale factor is three.",
        highlight: ["side length is tripled"],
        work: "k = 3",
        note: "side × 3",
      },
      {
        say: "The question asks about volume. That's three dimensions, so the factor gets cubed.",
        highlight: ["volume"],
        work: "volume factor = k³",
        note: "volume → cube it",
      },
      {
        say: "Three cubed is three times three times three. Twenty-seven.",
        work: "3³ = 3 × 3 × 3 = 27",
        note: "evaluate",
      },
      {
        say: "Three uses the side's factor as if volume were a length. Nine is the area rule, three squared.",
        strike: [1, 2],
      },
      {
        say: "And six multiplies three by two. The factor gets raised to a power, not multiplied.",
        strike: [3],
      },
    ],
    answer: "Twenty-seven. Each of the three directions gets three times longer, and those multiply.",
    trap: { point: "Trap: using k for area or volume", say: "Finding the scale factor is the easy part. The slip is forgetting to square it or cube it." },
    recap: { point: "Length k, area k², volume k³", say: "Match the power to the dimensions. Two for area, three for volume." },
  },
  {
    subskillId: "m-area-volume",
    pattern: "Composite Figures and Formula Selection",
    example: 3,
    hook: "A silo is just two shapes stacked up. Find each one's volume, then add.",
    idea: [
      { point: "Name the shapes, write the formulas", say: "Figure out exactly which shapes you have, and write each formula down before you plug anything in." },
      { point: "Composite = add the pieces", say: "When shapes are stuck together, add their volumes. When one's cut out of another, subtract." },
    ],
    steps: [
      {
        say: "It's a cylinder with half a sphere on top. Both have radius four, and the cylinder is ten tall.",
        highlight: ["cylinder with a hemisphere on top", "radius of 4 feet", "height of 10 feet"],
        work: "V = πr²h + (1/2)(4/3)πr³",
        note: "cylinder + hemisphere",
        spot: ["4", "10"],
      },
      {
        say: "The cylinder is pi times four squared times ten. That's one hundred sixty pi.",
        work: "π(4²)(10) = 160π",
        note: "cylinder",
        spot: ["4", "10"],
      },
      {
        say: "The hemisphere is half of four thirds pi r cubed. Four cubed is sixty-four, so it's one hundred twenty-eight thirds pi.",
        work: "(1/2)(4/3)π(64) = (128/3)π",
        note: "hemisphere",
        spot: ["4"],
      },
      {
        say: "To add, write one hundred sixty pi as four hundred eighty thirds pi. The total is six hundred eight thirds pi.",
        work: "(480/3)π + (128/3)π = (608/3)π",
        note: "common denominator",
      },
      {
        say: "One hundred sixty pi is only the cylinder. One hundred twenty-eight thirds pi is only the hemisphere. You need both.",
        strike: [1, 2],
      },
      {
        say: "Two hundred eighty-eight pi uses one hundred twenty-eight pi for the hemisphere. It forgot to divide by three.",
        strike: [3],
      },
    ],
    answer: "Six hundred eight thirds pi. Two shapes, two formulas, one sum.",
    trap: { point: "Trap: mixing up similar formulas", say: "Cones and spheres carry fractions that cylinders don't. Write the formula out, and the fraction won't slip away." },
    recap: { point: "Identify, write the formula, then compute", say: "Name each shape, write its formula, plug in, and add or subtract the pieces." },
  },
  {
    subskillId: "m-area-volume",
    pattern: "Building an Area, Surface Area, or Volume Expression from a Description",
    example: 2,
    hook: "No numbers for two of the sides? Fine. You're building a formula, not a number.",
    idea: [
      { point: "Pick the formula first", say: "Start with the shape's formula. For a box, volume is length times width times height." },
      { point: "Translate each phrase into algebra", say: "Then turn every worded dimension into an expression. Phrases like three more than tell you which way to go." },
    ],
    steps: [
      {
        say: "A rectangular prism's volume is length times width times height. The height is eight.",
        highlight: ["height of 8 inches"],
        work: "V = l × w × h",
        note: "box formula",
        spot: ["8"],
      },
      {
        say: "The length is x, and it's three more than the width. So the width is three less than x.",
        highlight: ["x inches, which is 3 inches more than the width"],
        work: "width = x − 3",
        note: "3 less than length",
        spot: ["x", "x-3"],
      },
      {
        say: "Plug all three in. X, times the quantity x minus three, times eight.",
        work: "V = x(x − 3)(8)",
        note: "substitute",
        spot: ["x", "x-3", "8"],
      },
      {
        say: "Move the eight to the front, and that's the function.",
        work: "V(x) = 8x(x − 3)",
        note: "tidy up",
      },
      {
        say: "X plus three flips the phrase. The length is bigger, so the width is x minus three.",
        strike: [1],
      },
      {
        say: "The last two each drop a dimension. One loses the length x, the other loses the height of eight.",
        strike: [2, 3],
      },
    ],
    answer: "Eight x times the quantity x minus three. All three dimensions, multiplied.",
    trap: { point: "Trap: flipping more than", say: "If the length is three more than the width, the width is three less than the length. Check which one's bigger." },
    recap: { point: "Formula first, then translate each dimension", say: "Write the formula, turn each phrase into algebra, and make sure every dimension shows up." },
  },
];
