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
        say: "Here's the expression. Six x squared plus fifteen x.",
        work: "6x² + 15x",
      },
      {
        say: "Three divides six and fifteen. X is in both terms, but the second has only one x. So the factor is three x.",
        work: "GCF = 3x",
        note: "3, and lowest power x",
      },
      {
        say: "Divide each term by three x. Six x squared becomes two x, and fifteen x becomes five.",
        work: "6x² ÷ 3x = 2x,  15x ÷ 3x = 5",
        note: "divide every term",
      },
      {
        say: "So it's three x times the quantity two x plus five. Multiply back and you get the original.",
        work: "3x(2x + 5)",
        note: "check: distribute back",
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
      },
      {
        say: "Four x squared is two x, squared. Twenty five is five squared. A square minus a square.",
        work: "(2x)² − 5²",
        note: "spot two squares",
      },
      {
        say: "That's the difference of squares shape, with a as two x and b as five.",
        work: "(a − b)(a + b)",
        note: "a = 2x, b = 5",
      },
      {
        say: "Fill them in. Two x minus five, times two x plus five.",
        work: "(2x − 5)(2x + 5)",
        note: "difference of squares",
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
        say: "Here's the fraction. X squared minus nine, over x squared plus x minus six.",
        work: "(x² − 9)/(x² + x − 6)",
      },
      {
        say: "The top is a difference of squares. X minus three, times x plus three.",
        work: "(x − 3)(x + 3)/(x² + x − 6)",
        note: "difference of squares",
      },
      {
        say: "The bottom needs two numbers that multiply to negative six and add to one. Three and negative two.",
        work: "(x − 3)(x + 3)/((x + 3)(x − 2))",
        note: "×−6, +1: 3 and −2",
      },
      {
        say: "Now x plus three is a factor on top and bottom. Cancel it.",
        work: "(x − 3)/(x − 2)",
        note: "cancel (x + 3)",
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
        say: "Here's the expression. X cubed y squared, all to the fourth, over x squared.",
        work: "(x³y²)⁴ / x²",
      },
      {
        say: "The fourth power hits each factor inside. Three times four is twelve, two times four is eight.",
        work: "x¹²y⁸ / x²",
        note: "power: multiply",
      },
      {
        say: "Now divide by x squared. Same base, so subtract. Twelve minus two is ten. The y has nothing to cancel with.",
        work: "x¹⁰y⁸",
        note: "divide: subtract",
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
        say: "Here's the problem. One polynomial minus another.",
        work: "(5x² − 3x + 8) − (2x² − 6x + 1)",
      },
      {
        say: "Drop the parentheses. The minus flips all three signs, so minus six x becomes plus six x.",
        work: "5x² − 3x + 8 − 2x² + 6x − 1",
        note: "minus hits every term",
      },
      {
        say: "Group the matching powers together.",
        work: "(5x² − 2x²) + (−3x + 6x) + (8 − 1)",
        note: "group like terms",
      },
      {
        say: "Combine them. Three x squared, plus three x, plus seven.",
        work: "3x² + 3x + 7",
        note: "combine",
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
        say: "Here's the perimeter formula. We want w by itself.",
        highlight: ["P = 2l + 2w"],
        work: "P = 2l + 2w",
      },
      {
        say: "The two l is added on, so undo that first. Subtract two l from both sides.",
        work: "P − 2l = 2w",
        note: "−2l both sides",
      },
      {
        say: "Now divide by two. The whole left side, not just the P.",
        work: "w = (P − 2l)/2",
        note: "÷2 the whole side",
      },
      {
        say: "Check it with a five by three rectangle. The perimeter's sixteen, and sixteen minus ten, over two, is three.",
        work: "(16 − 10)/2 = 3",
        note: "check: 5-by-3",
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
  },
];
