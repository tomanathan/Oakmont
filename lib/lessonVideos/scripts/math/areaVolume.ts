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
        say: "The side length is tripled. Three of the little cube's edges fit along the big one, so the scale factor is three.",
        highlight: ["side length is tripled"],
        work: "k = 3",
        note: "side × 3",
        draw: ["e1", "e2", "e3", "three"],
        move: [
          { id: "e1", by: [2.5, 0] },
          { id: "e2", by: [3.5, 0] },
          { id: "e3", by: [4.5, 0] },
        ],
        focus: ["e1", "e2", "e3", "three", "s1"],
      },
      {
        say: "But volume has three dimensions. The front face alone is three by three, nine little squares. That's only the area.",
        highlight: ["volume"],
        work: "volume factor = k³",
        note: "volume → cube it",
        draw: ["frontFill", "frontGrid"],
        focus: ["frontFill", "frontGrid"],
      },
      {
        say: "Now go three layers deep. Three times three times three is twenty-seven little cubes.",
        work: "k³ = 3 × 3 × 3 = 27",
        note: "evaluate",
        draw: ["topFill", "sideFill", "topGrid", "sideGrid"],
        focus: ["frontFill", "frontGrid", "topFill", "sideFill", "topGrid", "sideGrid"],
      },
      {
        say: "Three uses the side's factor as if volume were a length. Nine is the area rule, three squared, just the front face.",
        strike: [1, 2],
        focus: ["frontFill", "frontGrid"],
      },
      {
        say: "And six multiplies three by two. The factor gets raised to a power, not multiplied.",
        strike: [3],
      },
    ],
    answer: "Twenty-seven. Each of the three directions gets three times longer, and those multiply.",
    trap: { point: "Trap: using k for area or volume", say: "Finding the scale factor is the easy part. The slip is forgetting to square it or cube it." },
    recap: { point: "Length k, area k², volume k³", say: "Match the power to the dimensions. Two for area, three for volume." },
    tint: { "3": "yellow", k: "yellow", "27": "green" },
    scene: {
      // Oblique view: one unit of depth draws as (0.5, 0.35). The small
      // cube has side 1; the big one, side 3, is a 3 × 3 × 3 stack of them.
      x: [-0.4, 7.4],
      y: [-1.1, 4.4],
      objects: [
        { id: "small", kind: "poly", open: true, pts: [[0, 1], [0, 0], [1, 0], [1, 1], [0, 1], [0.5, 1.35], [1.5, 1.35], [1, 1], [1.5, 1.35], [1.5, 0.35], [1, 0]] },
        { id: "s1", kind: "seg", from: [0, 0], to: [1, 0], color: "yellow", label: "1", labelOffset: [0, 28] },
        { id: "big", kind: "poly", open: true, pts: [[2.5, 3], [2.5, 0], [5.5, 0], [5.5, 3], [2.5, 3], [4, 4.05], [7, 4.05], [5.5, 3], [7, 4.05], [7, 1.05], [5.5, 0]] },
        { id: "e1", kind: "seg", from: [0.08, 0], to: [0.92, 0], color: "yellow", width: 5 },
        { id: "e2", kind: "seg", from: [0.08, 0], to: [0.92, 0], color: "yellow", width: 5 },
        { id: "e3", kind: "seg", from: [0.08, 0], to: [0.92, 0], color: "yellow", width: 5 },
        { id: "three", kind: "text", at: [4, -0.85], text: "3", color: "yellow" },
        { id: "frontFill", kind: "poly", pts: [[2.5, 0], [5.5, 0], [5.5, 3], [2.5, 3]], color: "blue", fill: true },
        { id: "frontGrid", kind: "poly", open: true, color: "blue", pts: [[3.5, 0], [3.5, 3], [4.5, 3], [4.5, 0], [5.5, 0], [5.5, 1], [2.5, 1], [2.5, 2], [5.5, 2]] },
        { id: "topFill", kind: "poly", pts: [[2.5, 3], [5.5, 3], [7, 4.05], [4, 4.05]], color: "green", fill: true },
        { id: "sideFill", kind: "poly", pts: [[5.5, 0], [7, 1.05], [7, 4.05], [5.5, 3]], color: "green", fill: true },
        { id: "topGrid", kind: "poly", open: true, color: "green", pts: [[3.5, 3], [5, 4.05], [6, 4.05], [4.5, 3], [5.5, 3], [6, 3.35], [3, 3.35], [3.5, 3.7], [6.5, 3.7]] },
        { id: "sideGrid", kind: "poly", open: true, color: "green", pts: [[6, 0.35], [6, 3.35], [6.5, 3.7], [6.5, 0.7], [7, 1.05], [7, 2.05], [5.5, 1], [5.5, 2], [7, 3.05]] },
      ],
    },
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
        focus: ["cyl", "dome"],
      },
      {
        say: "The cylinder is pi times four squared times ten. That's one hundred sixty pi.",
        work: "π(4²)(10) = 160π",
        note: "cylinder",
        focus: ["cyl", "rad", "hgt"],
      },
      {
        say: "Lift off the dome. It's half of four thirds pi r cubed. Four cubed is sixty-four, so it's one hundred twenty-eight thirds pi.",
        work: "(1/2)(4/3)π(64) = (128/3)π",
        note: "hemisphere",
        move: [{ id: "dome", by: [10.5, -4] }],
        focus: ["dome"],
      },
      {
        say: "Set it back on and add. One hundred sixty pi is four hundred eighty thirds pi, so the total is six hundred eight thirds pi.",
        work: "(480/3)π + (128/3)π = (608/3)π",
        note: "common denominator",
        move: [{ id: "dome", by: [-10.5, 4] }],
        focus: ["cyl", "dome"],
      },
      {
        say: "One hundred sixty pi is only the cylinder. One hundred twenty-eight thirds pi is only the hemisphere. You need both.",
        strike: [1, 2],
      },
      {
        say: "Two hundred eighty-eight pi uses one hundred twenty-eight pi for the hemisphere. It forgot to divide by three.",
        strike: [3],
        focus: ["dome"],
      },
    ],
    answer: "Six hundred eight thirds pi. Two shapes, two formulas, one sum.",
    trap: { point: "Trap: mixing up similar formulas", say: "Cones and spheres carry fractions that cylinders don't. Write the formula out, and the fraction won't slip away." },
    recap: { point: "Identify, write the formula, then compute", say: "Name each shape, write its formula, plug in, and add or subtract the pieces." },
    tint: { "160π": "blue", "480/3": "blue", "128/3": "yellow", "608/3": "green" },
    scene: {
      // Side view, radius 4 and height 10 to scale; the rims are ellipses
      // squashed to 0.3 of the radius.
      x: [-7, 16],
      y: [-2.2, 14.8],
      objects: [
        { id: "cylBack", kind: "fn", y: "0.3*sqrt(16 - x^2)", domain: [-4, 4], dash: true, color: "gray" },
        { id: "cyl", kind: "poly", color: "blue", fill: true, pts: [[-4, 10], [-4, 0], [-3.7, -0.456], [-3.2, -0.72], [-2.4, -0.96], [-1.4, -1.124], [0, -1.2], [1.4, -1.124], [2.4, -0.96], [3.2, -0.72], [3.7, -0.456], [4, 0], [4, 10], [3.7, 9.544], [3.2, 9.28], [2.4, 9.04], [1.4, 8.876], [0, 8.8], [-1.4, 8.876], [-2.4, 9.04], [-3.2, 9.28], [-3.7, 9.544]] },
        { id: "dome", kind: "poly", color: "yellow", fill: true, pts: [[4.0, 10.0], [3.864, 11.035], [3.464, 12.0], [2.828, 12.828], [2.0, 13.464], [1.035, 13.864], [0.0, 14.0], [-1.035, 13.864], [-2.0, 13.464], [-2.828, 12.828], [-3.464, 12.0], [-3.864, 11.035], [-4.0, 10.0], [-3.7, 9.544], [-3.2, 9.28], [-2.4, 9.04], [-1.4, 8.876], [0, 8.8], [1.4, 8.876], [2.4, 9.04], [3.2, 9.28], [3.7, 9.544]] },
        { id: "rad", kind: "seg", from: [0, 0], to: [4, 0], dash: true, label: "4" },
        { id: "hgt", kind: "seg", from: [-5.3, 0], to: [-5.3, 10], color: "gray", label: "10" },
      ],
    },
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
        focus: ["box", "hEdge"],
      },
      {
        say: "The length is x, and it's three more than the width. So the width is the length with three cut off, x minus three.",
        highlight: ["x inches, which is 3 inches more than the width"],
        work: "w = x − 3",
        note: "3 less than length",
        draw: ["wBar", "three"],
        focus: ["lenX", "wBar", "three"],
      },
      {
        say: "Swing the width into place. Now all three edges are named: x, times x minus three, times eight.",
        work: "V = x(x − 3)(8)",
        note: "substitute",
        move: [{ id: "wBar", by: [7.665, 3.95], turn: 30 }],
        hide: ["three"],
        focus: ["lenX", "wBar", "hEdge"],
      },
      {
        say: "Move the eight to the front, and that's the function.",
        work: "V(x) = 8x(x − 3)",
        note: "tidy up",
        focus: ["lenX", "wBar", "hEdge"],
      },
      {
        say: "X plus three flips the phrase. The length is bigger, so the width is x minus three.",
        strike: [1],
        focus: ["lenX", "wBar"],
      },
      {
        say: "The last two each drop a dimension. One loses the length x, the other loses the height of eight.",
        strike: [2, 3],
        focus: ["lenX", "hEdge"],
      },
    ],
    answer: "Eight x times the quantity x minus three. All three dimensions, multiplied.",
    trap: { point: "Trap: flipping more than", say: "If the length is three more than the width, the width is three less than the length. Check which one's bigger." },
    recap: { point: "Formula first, then translate each dimension", say: "Write the formula, turn each phrase into algebra, and make sure every dimension shows up." },
    tint: { x: "blue", "8": "green", "3": "orange", w: "yellow" },
    scene: {
      // Drawn with x = 8, so the width is 5. Depth runs back at 30°,
      // full length (one unit of depth draws as (0.866, 0.5)).
      x: [-2.2, 14.2],
      y: [-3.6, 11.4],
      objects: [
        { id: "box", kind: "poly", open: true, pts: [[0, 8], [0, 0], [8, 0], [8, 8], [0, 8], [4.33, 10.5], [12.33, 10.5], [8, 8], [12.33, 10.5], [12.33, 2.5], [8, 0]] },
        { id: "lenX", kind: "seg", from: [0, 0], to: [8, 0], color: "blue", label: "x" },
        { id: "hEdge", kind: "seg", from: [0, 0], to: [0, 8], color: "green", label: "8" },
        { id: "wBar", kind: "seg", from: [0, -2.7], to: [5, -2.7], color: "yellow", width: 5, label: "x − 3", labelOffset: [0, -4] },
        { id: "three", kind: "seg", from: [5.15, -2.7], to: [8, -2.7], color: "orange", width: 5, label: "3", labelOffset: [0, -4] },
      ],
    },
  },
];
