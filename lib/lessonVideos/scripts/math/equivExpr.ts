import type { LessonVideoScript } from "../../types";

export const M_EQUIV_EXPR: LessonVideoScript[] = [
  {
    subskillId: "m-equiv-expr",
    pattern: "Factoring Out the Greatest Common Factor",
    example: 0,
    hook: "Factoring out the common piece is like pulling the same item out of every bag at once.",
    idea: [
      { point: "Number: biggest one that divides all", say: "Start with the biggest number that divides every coefficient." },
      { point: "Variables: lowest power in any term", say: "Then each variable that's in every term, at its lowest power. You can only take what every term has." },
      { point: "Divide every term, then check", say: "Divide each term by that factor to fill the parentheses, then multiply back out to check." },
    ],
    steps: [
      {
        say: "Here's the expression as two rectangles. Six x squared in blue, fifteen x in yellow.",
        work: "6x² + 15x",
        focus: ["sq", "strip"],
      },
      {
        say: "Three divides six and fifteen. X is in both terms, but the second has only one x. So they share a height of three x.",
        draw: ["h"],
        focus: ["h", "sq", "strip"],
      },
      {
        say: "Divide each term by three x to get its width. Six x squared gives two x, and fifteen x gives five.",
        work: "3x · 2x + 3x · 5",
        note: "÷3x each term",
        draw: ["w1", "w2"],
        focus: ["w1", "w2", "h"],
      },
      {
        say: "One height, one total width. Three x times the quantity two x plus five. Multiply back and you get the original.",
        work: "3x(2x + 5)",
        note: "pull out 3x",
        focus: ["h", "w1", "w2"],
      },
      {
        say: "Three x squared pulls out too many x's. The second choice never divided the fifteen by three.",
        strike: [0, 1],
      },
      {
        say: "And the last one divided out the x but never wrote it in front.",
        strike: [3],
      },
    ],
    answer: "Three x times the quantity two x plus five. Distribute it and you're back to the start.",
    trap: { point: "Trap: highest power instead of lowest", say: "You can only pull out as many x's as the term with the fewest has." },
    recap: { point: "Biggest number, lowest powers, then check", say: "Biggest number, lowest power of each shared variable, divide every term, and multiply back to check." },
    tint: { "3x": "green", "2x": "blue", "6x": "blue", "15x": "yellow", "5": "yellow" },
    // Area model with x = 1.4: height 3x = 4.2, widths 2x = 2.8 and 5.
    scene: {
      x: [-1.6, 8.4],
      y: [-0.7, 5.6],
      objects: [
        { id: "sq", kind: "poly", pts: [[0, 0], [2.8, 0], [2.8, 4.2], [0, 4.2]], fill: true, color: "blue", label: "6x²" },
        { id: "strip", kind: "poly", pts: [[2.8, 0], [7.8, 0], [7.8, 4.2], [2.8, 4.2]], fill: true, color: "yellow", label: "15x" },
        { id: "h", kind: "seg", from: [-0.45, 0], to: [-0.45, 4.2], color: "green", label: "3x" },
        { id: "w1", kind: "seg", from: [0, 4.65], to: [2.8, 4.65], color: "blue", label: "2x" },
        { id: "w2", kind: "seg", from: [2.8, 4.65], to: [7.8, 4.65], color: "yellow", label: "5" },
      ],
    },
  },
  {
    subskillId: "m-equiv-expr",
    pattern: "Recognizing Factoring Patterns Instantly",
    example: 1,
    hook: "A few shapes show up over and over. Spot them on sight and factoring takes seconds.",
    idea: [
      { point: "a² − b² = (a−b)(a+b)", say: "A square minus a square splits into a minus b times a plus b. No middle term." },
      { point: "a² + 2ab + b² = (a+b)²", say: "If the middle term is twice the two square roots multiplied, it's a perfect square." },
      { point: "Otherwise: multiply to c, add to b", say: "If neither shape fits, find two numbers that multiply to the constant and add to the middle." },
    ],
    steps: [
      {
        say: "Here's the expression. Four x squared minus twenty five.",
        work: "4x² − 25",
        focus: ["p1", "p2", "q"],
      },
      {
        say: "Four x squared is a square with side two x. Twenty five is a square with side five. A square minus a square.",
        work: "(2x)² − 5²",
        note: "spot two squares",
        draw: ["sideA", "sideB"],
        focus: ["sideA", "sideB", "q"],
      },
      {
        say: "Cut the small square away. Then swing the leftover strip around to the side, and the L shape becomes one rectangle.",
        hide: ["q", "sideB", "sideA"],
        move: [{ id: "p2", by: [6.5, -3.5], turn: -90 }],
        focus: ["p1", "p2"],
      },
      {
        say: "It's two x plus five long and two x minus five tall. So it factors as two x minus five, times two x plus five.",
        work: "(2x − 5)(2x + 5)",
        note: "a² − b² = (a−b)(a+b)",
        draw: ["len", "ht"],
        focus: ["len", "ht"],
      },
      {
        say: "Multiply out the second and fourth choices and you get a middle x term. The original has none.",
        strike: [1, 3],
      },
      {
        say: "And two x minus five, squared, gives a middle term and a plus twenty five.",
        strike: [2],
      },
    ],
    answer: "Two x minus five, times two x plus five. The middle terms cancel, just like they should.",
    trap: { point: "Trap: not spotting the perfect squares", say: "Know your squares cold. If you don't see that twenty five is five squared, you'll miss the shape." },
    recap: { point: "Check the shape before grinding", say: "Before trial and error, check for a difference of squares or a perfect square. It's faster." },
    tint: { "2x": "blue", "4x": "blue", "5": "yellow", "25": "yellow" },
    // Big square side 2x = 7, small square side 5 = 3. The L is a 7-by-4
    // strip plus a 4-by-3 piece; turned and slid, it makes a 10-by-4.
    scene: {
      x: [-3.4, 11],
      y: [-1.6, 7.8],
      objects: [
        { id: "p1", kind: "poly", pts: [[0, 0], [7, 0], [7, 4], [0, 4]], fill: true, color: "blue" },
        { id: "p2", kind: "poly", pts: [[0, 4], [4, 4], [4, 7], [0, 7]], fill: true, color: "blue" },
        { id: "q", kind: "poly", pts: [[4, 4], [7, 4], [7, 7], [4, 7]], fill: true, color: "yellow", label: "5²" },
        { id: "sideA", kind: "seg", from: [-0.5, 0], to: [-0.5, 7], color: "blue", label: "2x", labelOffset: [-4, 0] },
        { id: "sideB", kind: "seg", from: [7.5, 4], to: [7.5, 7], color: "yellow", label: "5", labelOffset: [24, 0] },
        { id: "len", kind: "seg", from: [0, -0.5], to: [10, -0.5], color: "white", label: "2x + 5", labelOffset: [0, 28] },
        { id: "ht", kind: "seg", from: [-0.5, 0], to: [-0.5, 4], color: "white", label: "2x − 5", labelOffset: [-14, 0] },
      ],
    },
  },
  {
    subskillId: "m-equiv-expr",
    pattern: "Simplifying and Combining Rational Expressions",
    example: 3,
    hook: "Canceling in a fraction feels like magic, until you cancel something you weren't allowed to.",
    idea: [
      { point: "Factor top and bottom first", say: "Factor the top and the bottom completely before you do anything else." },
      { point: "Cancel factors, never terms", say: "Only whole factors that multiply can cancel. Pieces being added or subtracted can't." },
      { point: "Adding? Get one denominator first", say: "To add or subtract fractions, rewrite them over one common denominator first. Never add straight across." },
    ],
    steps: [
      {
        say: "Here's the fraction, graphed. X squared minus nine, over x squared plus x minus six.",
        work: "(x² − 9)/(x² + x − 6)",
        focus: ["curve"],
      },
      {
        say: "The top is a difference of squares. X minus three, times x plus three. The top is zero at three, so the curve crosses there.",
        work: "(x − 3)(x + 3)/(x² + x − 6)",
        note: "difference of squares",
        draw: ["root"],
        focus: ["root", "curve"],
      },
      {
        say: "The bottom needs two numbers that multiply to negative six and add to one. Three and negative two. The bottom is zero at two, a wall.",
        work: "(x − 3)(x + 3)/((x + 3)(x − 2))",
        note: "×−6, +1: 3 and −2",
        draw: ["wall"],
        focus: ["wall", "curve"],
      },
      {
        say: "Now x plus three is a factor on top and bottom. Cancel it. The curve doesn't change, except for one missing point.",
        work: "(x − 3)/(x − 2)",
        note: "cancel (x + 3)",
        draw: ["hole"],
        focus: ["hole", "curve"],
      },
      {
        say: "The second choice cancels the wrong factor. The third gets the bottom factoring wrong.",
        strike: [1, 2],
      },
      {
        say: "And plain x minus three forgets that x minus two is still on the bottom.",
        strike: [3],
      },
    ],
    answer: "X minus three, over x minus two. Factor first, and the cancel is obvious.",
    trap: { point: "Trap: canceling terms, not factors", say: "You can't cross out the x squareds. They're being added and subtracted, not multiplied." },
    recap: { point: "Factor everything, then cancel", say: "Factor the top and bottom all the way, then cancel only matching factors." },
    tint: { x: "blue", "2": "orange" },
    // The canceled factor leaves the same curve with a hole at x = −3,
    // where the simplified form gives (−6)/(−5) = 1.2.
    scene: {
      x: [-6, 6],
      y: [-5, 6],
      objects: [
        { id: "axes", kind: "axes", xStep: 2, yStep: 2 },
        { id: "curve", kind: "fn", y: "(x^2 - 9)/(x^2 + x - 6)", color: "blue" },
        { id: "root", kind: "point", at: [3, 0], color: "green", label: "3", labelOffset: [-2, 26] },
        { id: "wall", kind: "line", through: [[2, -5], [2, 6]], dash: true, color: "orange", label: "x = 2", labelOffset: [52, 14] },
        { id: "hole", kind: "point", at: [-3, 1.2], open: true, color: "white", label: "hole", labelOffset: [-26, -6] },
      ],
    },
  },
  {
    subskillId: "m-equiv-expr",
    pattern: "Applying the Laws of Exponents",
    example: 2,
    hook: "Exponent rules are easy to mix up. Each one matches a different operation, so ask which one you're doing.",
    idea: [
      { point: "Multiply same base: add exponents", say: "Multiplying the same base adds the exponents. Dividing subtracts them." },
      { point: "Power of a power: multiply", say: "A power raised to a power multiplies the exponents." },
      { point: "x^(m/n): n is the root", say: "A fraction exponent is a root. The bottom number is the root, the top is the power." },
    ],
    steps: [
      {
        say: "Here's the expression. Count the x's with the blue bar, three of them, and the y's with the yellow bar, two.",
        work: "(x^3 y^2)^4 / x^2",
        focus: ["xbar", "ybar"],
      },
      {
        say: "The fourth power makes four copies of everything inside. Four threes is twelve x's, four twos is eight y's.",
        work: "x^12 y^8 / x^2",
        note: "power: multiply",
        set: [{ id: "xe", at: [12, 2] }, { id: "ye", at: [8, 0.8] }],
        focus: ["xbar", "ybar", "xe", "ye"],
      },
      {
        say: "Dividing by x squared cancels two of those x's. Same base, so subtract. Twelve minus two.",
        work: "x^(12 − 2) y^8",
        note: "divide: subtract",
        set: [{ id: "xe", at: [10, 2] }],
        focus: ["xbar", "xe"],
      },
      {
        say: "That's ten x's. The y has nothing to cancel with, so it stays at eight.",
        work: "x^10 y^8",
        note: "12 − 2 = 10",
        focus: ["xbar", "ybar", "xe", "ye"],
      },
      {
        say: "X to the twelfth forgot to divide. X to the sixth divided the exponents instead of subtracting.",
        strike: [1, 2],
      },
      {
        say: "And y to the sixth added the exponents when the power rule multiplies them.",
        strike: [3],
      },
    ],
    answer: "X to the tenth, y to the eighth. Multiply for the power, subtract for the division.",
    trap: { point: "Trap: adding when you should multiply", say: "Multiplying powers adds exponents. Raising a power to a power multiplies them. Name the operation first." },
    recap: { point: "Name the operation, then pick the rule", say: "Multiply, add. Divide, subtract. Power of a power, multiply. Say which one before you do it." },
    tint: { x: "blue", y: "yellow" },
    // Each bar's length is that variable's exponent: count the factors.
    scene: {
      x: [-1.6, 13],
      y: [-1.6, 3],
      objects: [
        { id: "ruler", kind: "numline", y: -0.2, min: 0, max: 12, step: 2 },
        { id: "xl", kind: "text", at: [-0.9, 1.85], text: "x", color: "blue", size: 18 },
        { id: "yl", kind: "text", at: [-0.9, 0.65], text: "y", color: "yellow", size: 18 },
        { id: "xe", kind: "point", at: [3, 2], color: "blue" },
        { id: "ye", kind: "point", at: [2, 0.8], color: "yellow" },
        { id: "xbar", kind: "seg", from: [0, 2], to: "xe", width: 14, color: "blue" },
        { id: "ybar", kind: "seg", from: [0, 0.8], to: "ye", width: 14, color: "yellow" },
      ],
    },
  },
  {
    subskillId: "m-equiv-expr",
    pattern: "Expanding and Combining Polynomial Expressions",
    example: 2,
    hook: "Subtracting a polynomial is where the signs go missing. The minus has to reach everything.",
    idea: [
      { point: "Every term times every term", say: "When you multiply, every term in the first part hits every term in the second." },
      { point: "Minus a polynomial: flip every sign", say: "When you subtract a polynomial, the minus flips the sign of every term inside, not just the first." },
      { point: "Combine only matching powers", say: "Then combine like terms. X squared with x squared, x with x, numbers with numbers." },
    ],
    steps: [
      {
        say: "One polynomial minus another. Each term is a bar: blue for the first polynomial, orange for the second, one column per power.",
        work: "(5x² − 3x + 8) − (2x² − 6x + 1)",
        focus: ["a2", "a1", "a0", "b2", "b1", "b0"],
      },
      {
        say: "Drop the parentheses. The minus flips every orange bar, all three. Minus six x becomes plus six x.",
        work: "5x² − 3x + 8 − 2x² + 6x − 1",
        note: "minus hits every term",
        move: [
          { id: "b2", turn: 180, about: [1.18, 0] },
          { id: "b1", turn: 180, about: [2.18, 0] },
          { id: "b0", turn: 180, about: [3.18, 0] },
        ],
        focus: ["b2", "b1", "b0"],
      },
      {
        say: "Now combine matching powers. Each flipped bar lands on its partner and cancels part of it.",
        move: [
          { id: "b2", by: [-0.36, 5] },
          { id: "b1", by: [-0.36, -3] },
          { id: "b0", by: [-0.36, 8] },
        ],
        focus: ["a2", "a1", "a0", "b2", "b1", "b0"],
      },
      {
        say: "What's left is three x squared, plus three x, plus seven.",
        work: "3x² + 3x + 7",
        note: "combine like terms",
        draw: ["r2", "r1", "r0"],
        focus: ["r2", "r1", "r0"],
      },
      {
        say: "Minus nine x never flipped the six x. Plus nine added the one instead of subtracting it.",
        strike: [1, 2],
      },
      {
        say: "And seven x squared added the x squared terms when they subtract.",
        strike: [3],
      },
    ],
    answer: "Three x squared plus three x plus seven.",
    trap: { point: "Trap: flipping only the first sign", say: "The minus in front of the parentheses reaches every term, all the way to the end." },
    recap: { point: "Distribute the minus, then combine", say: "Flip every sign in what you subtract, then combine the terms with matching powers." },
    tint: { "2x": "orange", "6x": "orange", "1": "orange", "7": "green" },
    // Coefficient bars: columns for x², x and the number. Blue is
    // 5, −3, 8; orange is 2, −6, 1, which the minus flips to −2, +6, −1.
    scene: {
      x: [0.3, 3.75],
      y: [-7.5, 9.5],
      objects: [
        { id: "axes", kind: "axes", yStep: 3, grid: false },
        { id: "a2", kind: "poly", pts: [[0.64, 0], [1.0, 0], [1.0, 5], [0.64, 5]], fill: true, color: "blue" },
        { id: "a1", kind: "poly", pts: [[1.64, 0], [2.0, 0], [2.0, -3], [1.64, -3]], fill: true, color: "blue" },
        { id: "a0", kind: "poly", pts: [[2.64, 0], [3.0, 0], [3.0, 8], [2.64, 8]], fill: true, color: "blue" },
        { id: "b2", kind: "poly", pts: [[1.0, 0], [1.36, 0], [1.36, 2], [1.0, 2]], fill: true, color: "orange" },
        { id: "b1", kind: "poly", pts: [[2.0, 0], [2.36, 0], [2.36, -6], [2.0, -6]], fill: true, color: "orange" },
        { id: "b0", kind: "poly", pts: [[3.0, 0], [3.36, 0], [3.36, 1], [3.0, 1]], fill: true, color: "orange" },
        { id: "t2", kind: "text", at: [1.0, -6.9], text: "x²" },
        { id: "t1", kind: "text", at: [2.0, -6.9], text: "x" },
        { id: "t0", kind: "text", at: [3.0, -6.9], text: "1" },
        { id: "r2", kind: "point", at: [0.82, 3], color: "green", label: "3", labelOffset: [-26, 4] },
        { id: "r1", kind: "point", at: [1.82, 3], color: "green", label: "3", labelOffset: [-26, 4] },
        { id: "r0", kind: "point", at: [2.82, 7], color: "green", label: "7", labelOffset: [-26, 4] },
      ],
    },
  },
  {
    subskillId: "m-equiv-expr",
    pattern: "Rearranging a Formula to Isolate a Variable",
    example: 1,
    hook: "A formula full of letters is still just an equation. Pretend the other letters are numbers.",
    idea: [
      { point: "Treat other letters as numbers", say: "Every letter except the one you want is just a number you happen not to know." },
      { point: "Undo in reverse order", say: "Undo what was done last first. Usually that's the adding, then the multiplying." },
      { point: "Check with easy numbers", say: "Then plug in easy numbers to make sure your answer actually works." },
    ],
    steps: [
      {
        say: "Here's the perimeter formula. All the way around is two lengths plus two widths. We want w by itself.",
        highlight: ["P = 2l + 2w"],
        work: "P = 2l + 2w",
        focus: ["l1", "l2", "w1", "w2"],
      },
      {
        say: "The two l is added on, so undo that first. Take both lengths away from the perimeter.",
        work: "P − 2l = 2w",
        note: "−2l both sides",
        hide: ["l1", "l2"],
        focus: ["w1", "w2"],
      },
      {
        say: "Two widths are left. Divide by two to get one, and divide the whole left side, not just the P.",
        work: "w = (P − 2l)/2",
        note: "÷2 both sides",
        hide: ["w2"],
        focus: ["w1"],
      },
      {
        say: "Check it with a five by three rectangle. The perimeter's sixteen, and sixteen minus ten, over two, is three.",
        draw: ["chk", "n5", "n3"],
        focus: ["chk", "n5", "n3", "w1"],
      },
      {
        say: "Multiplying by two goes the wrong way, since undoing times two means dividing. And dividing only the P leaves the two l undivided.",
        strike: [0, 1],
      },
      {
        say: "Plus two l is a sign slip. Moving it across subtracts it.",
        strike: [2],
      },
    ],
    answer: "W equals P minus two l, all over two. The easy numbers confirm it.",
    trap: { point: "Trap: dividing only one term", say: "When you divide a side, divide all of it. Every term on that side gets divided." },
    recap: { point: "Reverse order, then plug in numbers", say: "Undo the last thing first, keep groups together, and check with easy numbers." },
    tint: { l: "yellow", w: "blue" },
    // A 5-by-3 rectangle, its sides coloured by which term they are.
    scene: {
      x: [-1.6, 6.6],
      y: [-1.4, 4.4],
      objects: [
        { id: "l1", kind: "seg", from: [0, 0], to: [5, 0], color: "yellow", width: 4, label: "l" },
        { id: "l2", kind: "seg", from: [5, 3], to: [0, 3], color: "yellow", width: 4, label: "l" },
        { id: "w1", kind: "seg", from: [0, 3], to: [0, 0], color: "blue", width: 4, label: "w" },
        { id: "w2", kind: "seg", from: [5, 0], to: [5, 3], color: "blue", width: 4, label: "w" },
        { id: "chk", kind: "poly", pts: [[0, 0], [5, 0], [5, 3], [0, 3]], dash: true, color: "gray", label: "P = 16" },
        { id: "n5", kind: "text", at: [2.5, -0.8], text: "5", color: "yellow", size: 17 },
        { id: "n3", kind: "text", at: [0.6, 1.3], text: "3", color: "blue", size: 17 },
      ],
    },
  },
];
