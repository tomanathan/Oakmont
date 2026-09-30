import type { LessonVideoScript } from "../../types";

export const M_LINEAR_EQ_1VAR: LessonVideoScript[] = [
  {
    subskillId: "m-linear-eq-1var",
    pattern: "Standard Isolate-the-Variable Equations",
    example: 0,
    hook: "Solving for x is unwrapping a present. Take off the outside layers first.",
    idea: [
      { point: "Clear parentheses first", say: "If there are parentheses, multiply them out first, and hit every term inside." },
      { point: "Undo + and − before × and ÷", say: "Then undo adding and subtracting, and only after that, undo multiplying and dividing." },
      { point: "One move per line", say: "Write one move per line. Almost every mistake here is a sign slip done in your head." },
    ],
    steps: [
      {
        say: "Here's the equation. Five times the quantity x plus two equals three x plus eighteen.",
        work: "5(x + 2) = 3x + 18",
      },
      {
        say: "Distribute the five to both terms. Five x plus ten.",
        work: "5x + 10 = 3x + 18",
        note: "distribute the 5",
      },
      {
        say: "Get the x terms on one side. Subtract three x from both sides.",
        work: "2x + 10 = 18",
        note: "−3x both sides",
      },
      {
        say: "Now undo the plus ten. Subtract ten from both sides.",
        work: "2x = 8",
        note: "−10 both sides",
      },
      {
        say: "Last layer: divide both sides by two. X equals four.",
        work: "x = 4",
        note: "÷2 both sides",
      },
      {
        say: "Eight is what you get if you forget to multiply the two by five. One and negative four are sign slips.",
        strike: [1, 2, 3],
      },
    ],
    answer: "X equals four. Plug it back in and both sides come out to thirty.",
    trap: { point: "Trap: distributing to only one term", say: "The five multiplies everything in the parentheses, not just the x." },
    recap: { point: "Outside in, one move per line", say: "Clear the parentheses, undo plus and minus, then times and divide. One move per line." },
  },
  {
    subskillId: "m-linear-eq-1var",
    pattern: "No-Solution and Infinite-Solution Equations",
    example: 3,
    hook: "Sometimes x just vanishes from the equation. That's not a mistake. That's the answer showing up.",
    idea: [
      { point: "Simplify both sides first", say: "Distribute and combine on each side first. The x terms often only match once everything's cleaned up." },
      { point: "x-terms cancel? Check what's left", say: "If the x terms cancel, stop solving. There's no x left to find. Look at the leftover numbers." },
      { point: "False → none. True → infinite.", say: "A false statement like five equals seven means no solution. A true one like five equals five means every number works." },
    ],
    steps: [
      {
        say: "Here's the equation. Five x minus three times the quantity x plus four equals two x plus three.",
        highlight: ["5x - 3(x + 4) = 2x + 3"],
        work: "5x − 3(x + 4) = 2x + 3",
      },
      {
        say: "Distribute the negative three to both terms. Negative three x, and negative twelve.",
        work: "5x − 3x − 12 = 2x + 3",
        note: "distribute the −3",
      },
      {
        say: "Combine the x terms on the left. Five x minus three x is two x.",
        work: "2x − 12 = 2x + 3",
        note: "combine like terms",
      },
      {
        say: "Now subtract two x from both sides. The x terms cancel completely, and we're left with negative twelve equals three.",
        work: "−12 = 3",
        note: "−2x both sides",
      },
      {
        say: "That's false for every x. So it isn't exactly one solution, and it can't be infinitely many, since that needs a true statement.",
        strike: [1, 2],
      },
      {
        say: "And exactly two is out on principle. A linear equation has none, one, or infinitely many solutions. Never two.",
        strike: [3],
      },
    ],
    answer: "No solution. Negative twelve never equals three, no matter what x is.",
    trap: { point: "Trap: mixing up false and true", say: "A false leftover means no solution. A true leftover means infinitely many. Don't swap them." },
    recap: { point: "x cancels? Judge the leftover", say: "When the x terms cancel, don't hunt for x. Check if what's left is true or false." },
  },
  {
    subskillId: "m-linear-eq-1var",
    pattern: "Solving for a Related Expression Without Fully Isolating x",
    example: 0,
    hook: "Read the question before you start solving. Sometimes they don't even want x.",
    idea: [
      { point: "Find what they're asking for", say: "If the question asks for x minus seven, or two x, that's your target. Not x itself." },
      { point: "Reshape the equation to hit it", say: "Divide, add, or combine the whole equation so the exact target lands on one side. Usually one move." },
    ],
    steps: [
      {
        say: "Four x minus twenty-eight equals negative twenty-four, and they want x minus seven.",
        highlight: ["4x - 28 = -24", "x - 7"],
        work: "4x − 28 = −24",
      },
      {
        say: "Notice four x divided by four is x, and twenty-eight divided by four is seven. So divide every term by four.",
        work: "(4x − 28)/4 = −24/4",
        note: "÷4 every term",
      },
      {
        say: "That lands right on the target. X minus seven equals negative six. No need to find x first.",
        work: "x − 7 = −6",
        note: "exactly the target",
      },
      {
        say: "One is x itself, which they didn't ask for. Positive six is a sign slip on negative twenty-four divided by four.",
        strike: [2, 3],
      },
      {
        say: "And negative one isn't what you get when every term is divided by four.",
        strike: [1],
      },
    ],
    answer: "Negative six. One division, and you're done.",
    trap: { point: "Trap: answering with x", say: "Solving all the way to x out of habit hands you the wrong answer, and it's always a choice." },
    recap: { point: "Aim for the expression, not x", say: "Find the expression they asked for, then reshape the whole equation to land on it." },
  },
  {
    subskillId: "m-linear-eq-1var",
    pattern: "Translating a Word Problem into an Equation",
    example: 3,
    hook: "Word problems are a translation job. Go phrase by phrase, and watch out for less than.",
    idea: [
      { point: "Name the unknown", say: "Pick a letter for the unknown, and say in plain words what it stands for." },
      { point: "Translate one phrase at a time", say: "More than means add. Times means multiply. Is means equals. Do it piece by piece, not all at once." },
      { point: "\"Less than\" flips the order", say: "Less than is the sneaky one. It's written in the opposite order from how you say it." },
    ],
    steps: [
      {
        say: "Twelve less than a number is forty-five. The number is n.",
        highlight: ["12 less than a number", "is 45"],
      },
      {
        say: "Twelve less than a number means start with the number, then take twelve away. So n minus twelve, not twelve minus n.",
        work: "n − 12",
        note: "less than: flip it",
      },
      {
        say: "The word is becomes the equals sign. N minus twelve equals forty-five.",
        work: "n − 12 = 45",
        note: "\"is\" means =",
      },
      {
        say: "Twelve minus n reverses the order. N plus twelve adds when it should subtract, and twelve n multiplies.",
        strike: [1, 2, 3],
      },
    ],
    answer: "N minus twelve equals forty-five. The number comes first, then twelve comes off.",
    trap: { point: "Trap: writing less than in spoken order", say: "Twelve less than n is n minus twelve. Writing it in the order you hear it flips the meaning." },
    recap: { point: "Phrase by phrase, flip less than", say: "Name your variable, translate one phrase at a time, and flip the order for less than." },
  },
];
