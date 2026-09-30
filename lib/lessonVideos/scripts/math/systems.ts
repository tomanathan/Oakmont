import type { LessonVideoScript } from "../../types";

export const M_SYSTEMS: LessonVideoScript[] = [
  {
    subskillId: "m-systems",
    pattern: "Solving by Substitution and Setting Up Systems from Words",
    example: 3,
    hook: "A word problem with two unknowns is really two equations wearing a trench coat.",
    idea: [
      { point: "Name both unknowns, translate each fact", say: "Give each unknown a letter. Then turn each fact into its own equation, one phrase at a time." },
      { point: "Already solved for one? Substitute", say: "If one equation already says L equals something, swap that whole expression into the other, in parentheses." },
      { point: "Answer what they asked", say: "Before you pick, check which unknown they want. The other one's always sitting in the choices." },
    ],
    steps: [
      {
        say: "A fifty-one foot rope, cut in two. The longer piece plus the shorter piece is the whole rope.",
        highlight: ["51-foot rope"],
        work: "L + S = 51",
        note: "two pieces, one rope",
      },
      {
        say: "Six more than twice the shorter. Twice S first, then add six. L equals two S plus six.",
        highlight: ["6 feet more than twice the length of the shorter piece"],
        work: "L = 2S + 6",
        note: "6 more than twice S",
      },
      {
        say: "The second equation is already solved for L, so swap it into the first.",
        work: "(2S + 6) + S = 51",
        note: "substitute for L",
      },
      {
        say: "Combine to get three S plus six, then subtract six from both sides. Three S equals forty-five.",
        work: "3S = 45",
        note: "combine, then −6",
      },
      {
        say: "Divide by three. S is fifteen. That's the shorter piece, and it's sitting in the choices as bait.",
        work: "S = 15",
        note: "÷3 both sides",
        strike: [1],
      },
      {
        say: "Plug back in. The longer piece is thirty-six. Thirty-eight comes from setting it up with the six doubled, and thirty-two with it subtracted.",
        work: "L = 2(15) + 6 = 36",
        note: "plug back in",
        strike: [2, 3],
      },
    ],
    answer: "Thirty-six feet. And thirty-six plus fifteen is fifty-one, so it checks out.",
    trap: { point: "Trap: answering with the other unknown", say: "You solved for the short piece first, but they asked for the long one. Read the question again before choosing." },
    recap: { point: "Translate, substitute, answer the question", say: "Turn each fact into an equation, substitute the one that's already solved, and give them the unknown they asked for." },
  },
  {
    subskillId: "m-systems",
    pattern: "Solving for a Specific Value via Elimination",
    example: 1,
    hook: "If two equations share a term, you can make it disappear in one move.",
    idea: [
      { point: "Line up the terms", say: "When both equations look like a x plus b y equals c, stack them and compare the terms." },
      { point: "Add or subtract to cancel one", say: "If a term matches, subtract. If it's opposite, add. Otherwise, multiply one equation first." },
    ],
    steps: [
      {
        say: "Three x plus two y equals sixteen.",
        highlight: ["3x + 2y = 16"],
        work: "3x + 2y = 16",
      },
      {
        say: "And three x minus five y equals negative twelve. Both start with three x, so subtracting will cancel it.",
        highlight: ["3x - 5y = -12"],
        work: "3x − 5y = −12",
        note: "same 3x: subtract",
      },
      {
        say: "Subtract the whole second equation from the first. Every term in it gets a minus, including the negative twelve.",
        work: "(3x + 2y) − (3x − 5y) = 16 − (−12)",
        note: "subtract everything",
      },
      {
        say: "Three x minus three x is zero. Two y minus negative five y is seven y. Sixteen minus negative twelve is twenty-eight.",
        work: "7y = 28",
        note: "3x cancels",
      },
      {
        say: "Divide by seven. Y is four.",
        work: "y = 4",
        note: "÷7 both sides",
      },
      {
        say: "Negative four is a sign slip in the subtraction. Twenty-eight is seven y, and seven is just the coefficient.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Y equals four. One subtraction and x was gone.",
    trap: { point: "Trap: dropping signs when subtracting", say: "Subtracting an equation means subtracting every term. Minus a negative becomes plus, on both sides." },
    recap: { point: "Match a term, cancel it", say: "Line the equations up, add or subtract to cancel one variable, and solve for the one that's left." },
  },
  {
    subskillId: "m-systems",
    pattern: "Determining the Number of Solutions Without Fully Solving",
    example: 1,
    hook: "How many solutions? You don't have to solve anything. Just compare the lines.",
    idea: [
      { point: "Different slopes → exactly one", say: "Different slopes means the lines cross once. Exactly one solution." },
      { point: "Same slope, different b → none", say: "Same slope with different intercepts means parallel lines. They never meet, so no solution." },
      { point: "Same slope, same b → infinite", say: "Same slope and same intercept means it's the same line twice. Every point on it works." },
    ],
    steps: [
      {
        say: "Two x plus y equals five, and four x plus two y equals ten. Put both in y equals m x plus b form.",
        highlight: ["2x + y = 5", "4x + 2y = 10"],
      },
      {
        say: "First one: subtract two x. Y equals negative two x plus five.",
        work: "y = −2x + 5",
        note: "−2x both sides",
      },
      {
        say: "Second one: subtract four x first. Two y equals negative four x plus ten.",
        work: "2y = −4x + 10",
        note: "−4x both sides",
      },
      {
        say: "Divide by two. Y equals negative two x plus five. Same slope, same intercept. It's the first line again.",
        work: "y = −2x + 5",
        note: "÷2 every term",
      },
      {
        say: "No solution needs different intercepts. Exactly one needs different slopes. And it can be determined: we just did it.",
        strike: [1, 2, 3],
      },
    ],
    answer: "Infinitely many. It's one line written two ways, so every point on it works.",
    trap: { point: "Trap: comparing before converting", say: "Two equations can look different and still be the same line. Put both in the same form before you compare." },
    recap: { point: "Compare slopes, then intercepts", say: "Different slopes, one solution. Same slope, different intercept, none. Same slope and intercept, infinitely many." },
  },
  {
    subskillId: "m-systems",
    pattern: "Reading the Solution Directly from a Graph",
    example: 2,
    hook: "When the lines are drawn for you, the solution is just the spot where they cross.",
    idea: [
      { point: "Solution = where the lines cross", say: "A system's solution is the point on both lines at once. On a graph, that's the crossing." },
      { point: "Read x first, then y", say: "Read the crossing point's x, then its y, and write them in that order." },
    ],
    steps: [
      {
        say: "One line crosses the y-axis at zero comma six, the other at zero comma one.",
        highlight: ["(0, 6)", "(0, 1)"],
        work: "(0, 6), (0, 1): y-intercepts",
        note: "each line on its own",
      },
      {
        say: "Those are where each line meets the y-axis. Neither is on both lines, so neither is the solution.",
        strike: [1, 2],
      },
      {
        say: "The two lines cross each other at two comma four. That point is on both lines.",
        highlight: ["cross each other at the point (2, 4)"],
        work: "(2, 4): on both lines",
        note: "where they cross",
        spot: ["(2, 4)"],
      },
      {
        say: "And six comma one just glues the two intercept values together. It isn't on the graph at all.",
        strike: [3],
      },
    ],
    answer: "Two comma four. The one point both lines share.",
    trap: { point: "Trap: picking an intercept", say: "Each y-intercept belongs to one line only. The solution has to be on both, so it's the crossing." },
    recap: { point: "Find the crossing, read x then y", say: "Find where the lines cross, then read its x and y in order. That's the solution." },
  },
];
