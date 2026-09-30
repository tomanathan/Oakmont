import type { LessonVideoScript } from "../../types";

export const M_NONLINEAR_FUNC: LessonVideoScript[] = [
  {
    subskillId: "m-nonlinear-func",
    pattern: "Reading Vertex Form Directly",
    example: 1,
    hook: "Vertex form hands you the vertex for free. You just have to read the signs right.",
    idea: [
      { point: "Vertex form shows (h, k)", say: "In the form a times x minus h, squared, plus k, the vertex is h comma k. No work needed." },
      { point: "Inside sign flips; outside sign stays", say: "The template subtracts h, so the number inside shows up with the opposite sign. The number outside keeps its sign." },
    ],
    steps: [
      {
        say: "Here's our function. Negative two times x plus three, squared, minus one.",
        highlight: ["-2(x + 3)² - 1"],
        work: "f(x) = −2(x + 3)² − 1",
      },
      {
        say: "Plus three is really minus negative three. Match it to the template, and h is negative three.",
        work: "x + 3 = x − (−3), so h = −3",
        note: "inside sign flips",
      },
      {
        say: "Outside, it's minus one, and that sign stays put. So k is negative one.",
        work: "k = −1",
        note: "outside sign stays",
      },
      {
        say: "Put them together: negative three, negative one. That's the peak on the graph.",
        work: "vertex = (−3, −1)",
        note: "(h, k)",
        spot: ["(-3, -1)"],
      },
      {
        say: "Three, negative one is the classic slip: reading plus three as h equals three.",
        strike: [1],
      },
      {
        say: "Negative three, one flips the sign of k. And three, one flips both.",
        strike: [2, 3],
      },
    ],
    answer: "Negative three, negative one. The negative two out front flips the parabola upside down, but it doesn't move the vertex.",
    trap: { point: "Trap: (x + 3) means h = −3", say: "Plus three inside the parentheses means h is negative three, not three. The inside sign always flips." },
    recap: { point: "Inside: flip the sign. Outside: keep it.", say: "Match to the template, flip the inside number, keep the outside one, and the vertex reads itself." },
  },
  {
    subskillId: "m-nonlinear-func",
    pattern: "Modeling Growth and Decay with Exponential Functions",
    example: 0,
    hook: "When something changes by a percent every year, it doesn't lose the same amount each time. That's the whole trick.",
    idea: [
      { point: "Percent per period → exponential", say: "A percent of the current amount, again and again, means multiplying. That's exponential, not linear." },
      { point: "Growth: 1 + r. Decay: 1 − r.", say: "The base is what's left after each period. Growing by a rate, use one plus it. Shrinking, use one minus it." },
    ],
    steps: [
      {
        say: "The car loses twelve percent a year, starting from thirty thousand dollars.",
        highlight: ["decreases by 12% each year", "$30,000"],
        spot: ["$30,000"],
      },
      {
        say: "If it loses twelve percent, it keeps eighty-eight percent. That's the base.",
        work: "1 − 0.12 = 0.88",
        note: "decay: 1 − rate",
      },
      {
        say: "Multiply by point eight eight once for each year. Two years, so square it.",
        work: "value = 30000(0.88)^2",
        note: "one factor per year",
      },
      {
        say: "Point one two is what the car loses, not what it keeps. So that base is wrong.",
        strike: [1],
      },
      {
        say: "Subtracting twelve percent of the original twice is linear. And one point one two would mean the value is growing.",
        strike: [2, 3],
      },
    ],
    answer: "Thirty thousand times point eight eight squared. That's about twenty-three thousand two hundred dollars.",
    trap: { point: "Trap: using the rate as the base", say: "Point one two is the loss. The base is what remains, point eight eight." },
    recap: { point: "Base = what's left each period", say: "Percent change each period means exponential. Build the base from what's left, then raise it to the number of periods." },
  },
  {
    subskillId: "m-nonlinear-func",
    pattern: "Initial Value and Growth Factor in Any Exponential Form",
    example: 1,
    hook: "Every exponential has two numbers that matter: where it starts, and what it multiplies by. A table shows you both.",
    idea: [
      { point: "a = f(0), the starting value", say: "In a times b to the x, a is the value at x equals zero. It's also the y-intercept." },
      { point: "b = next output ÷ previous output", say: "B is the factor. Divide any output by the one before it, and check that it holds every time." },
    ],
    steps: [
      {
        say: "Find the x equals zero row. The output there is three hundred twenty, so that's a.",
        work: "f(0) = 320, so a = 320",
        note: "read the x = 0 row",
        spot: ["320"],
      },
      {
        say: "Now divide each output by the one before it. Eighty over three twenty is one fourth.",
        work: "80/320 = 1/4",
        note: "divide, don't subtract",
        spot: ["80", "320"],
      },
      {
        say: "Twenty over eighty, five over twenty. Every step is one fourth, so that's the base.",
        work: "20/80 = 1/4, 5/20 = 1/4",
        note: "same ratio every row",
        spot: ["20", "5"],
      },
      {
        say: "Put them together: three twenty times one fourth to the x.",
        work: "f(x) = 320(1/4)^x",
        note: "a(b)^x",
      },
      {
        say: "A base of four would make the outputs grow. And eighty is the value at x equals one, not the start.",
        strike: [0, 2],
      },
      {
        say: "One fourth in front with three twenty as the base just swaps the two jobs.",
        strike: [1],
      },
    ],
    answer: "Three hundred twenty times one fourth to the x. Start at three twenty, and multiply by one fourth each step.",
    trap: { point: "Trap: a start value that isn't f(0)", say: "The starting value comes from the x equals zero row, not just whichever row you see first." },
    recap: { point: "a from x = 0, b from dividing", say: "Read a where x is zero. Divide neighboring outputs to get b. Then check it on every row." },
  },
  {
    subskillId: "m-nonlinear-func",
    pattern: "Exponential Models with a Time Period in the Exponent",
    example: 2,
    hook: "Doubling every fifteen years doesn't mean doubling every year. Count the periods first, then do the multiplying.",
    idea: [
      { point: "t/k = number of periods", say: "In a model like two to the t over k, the t over k counts how many full periods have passed." },
      { point: "n doublings: × 2^n, not × 2n", say: "Each period multiplies by the base again. Three doublings is two times two times two, which is eight." },
    ],
    steps: [
      {
        say: "From nineteen eighty to twenty twenty-five is forty-five years.",
        highlight: ["doubled every 15 years", "36,000"],
        work: "2025 − 1980 = 45 years",
        note: "time that passed",
      },
      {
        say: "Fifteen years per doubling, so that's three doublings.",
        work: "45/15 = 3 doublings",
        note: "count the periods",
      },
      {
        say: "Three doublings multiply by two cubed, which is eight. So the old population times eight is thirty-six thousand.",
        work: "P · 2³ = 36,000",
        note: "×2 once per period",
      },
      {
        say: "To go back in time, divide. Thirty-six thousand over eight is four thousand five hundred.",
        work: "P = 36,000/8 = 4,500",
        note: "÷8 both sides",
      },
      {
        say: "Twelve thousand divides by three, as if the town only tripled. Six thousand treats three doublings as times six.",
        strike: [0, 2],
      },
      {
        say: "Two hundred eighty-eight thousand multiplies by eight, which runs forward to twenty seventy instead of back.",
        strike: [3],
      },
    ],
    answer: "Four thousand five hundred. Double it three times and you land right on thirty-six thousand.",
    trap: { point: "Trap: 3 doublings is × 8, not × 6", say: "Repeated doubling multiplies. Three doublings is times eight, never times six." },
    recap: { point: "Count periods, then use base^periods", say: "Divide the time by the period length, then multiply or divide by the base once per period." },
  },
  {
    subskillId: "m-nonlinear-func",
    pattern: "Telling Linear from Exponential Growth (Table, Graph, or Words)",
    example: 5,
    hook: "Linear adds the same amount each step. Exponential multiplies by the same amount. Every one of these comes down to that.",
    idea: [
      { point: "Same difference → linear", say: "If the output changes by the same amount each time x goes up by one, it's linear." },
      { point: "Same ratio → exponential", say: "If it's multiplied by the same factor each time, it's exponential. Check at least two steps before you decide." },
      { point: "Read direction left to right", say: "Then read the graph left to right to decide increasing or decreasing." },
    ],
    steps: [
      {
        say: "The marked points go eight, four, two, one.",
        highlight: ["(0, 8), (1, 4), (2, 2), and (3, 1)"],
        spot: ["8", "4", "2"],
      },
      {
        say: "The drops are four, then two, then one. They're not the same, so it isn't a line.",
        work: "8 − 4 = 4, 4 − 2 = 2, 2 − 1 = 1",
        note: "differences change",
      },
      {
        say: "But each point is half the one before. Same factor every time: that's exponential.",
        work: "4/8 = 2/4 = 1/2",
        note: "constant ratio",
      },
      {
        say: "Left to right, the values fall. So it's decreasing.",
        work: "8 > 4 > 2 > 1",
        note: "falling left to right",
      },
      {
        say: "Both linear choices need a straight line, changing by the same amount every step. This one curves.",
        strike: [0, 1],
      },
      {
        say: "The curve bends upward as it flattens out, but the values keep getting smaller. It isn't increasing.",
        strike: [3],
      },
    ],
    answer: "Decreasing exponential. It halves every step, flattening toward the x axis as it goes.",
    trap: { point: "Trap: calling a flattening curve increasing", say: "A decaying curve bends upward as it levels off. Look at the y values, not the bend." },
    recap: { point: "Differences → linear. Ratios → exponential.", say: "Check the differences and the ratios. Whichever stays constant names the function, and left to right gives the direction." },
  },
  {
    subskillId: "m-nonlinear-func",
    pattern: "Graph Transformations (Shifts)",
    example: 3,
    hook: "A shift moves every point on a graph the same way. Track one point and you've tracked them all.",
    idea: [
      { point: "Outside the function: up or down", say: "A number added outside the function moves the graph up or down, the way the sign says." },
      { point: "Inside: left or right, backwards", say: "A number inside the parentheses moves it sideways, and backwards from how it looks. Minus four goes right." },
    ],
    steps: [
      {
        say: "The maximum of f is at one, nine.",
        highlight: ["maximum point at (1, 9)"],
      },
      {
        say: "Minus four inside the parentheses shifts right by four. Add four to x.",
        highlight: ["f(x - 4)"],
        work: "x: 1 + 4 = 5",
        note: "inside −4: right 4",
      },
      {
        say: "Minus two outside shifts down by two. Subtract two from y.",
        work: "y: 9 − 2 = 7",
        note: "outside −2: down 2",
      },
      {
        say: "So the maximum moves to five, seven.",
        work: "max of g = (5, 7)",
      },
      {
        say: "Negative three, seven shifts left, reading the inside sign at face value.",
        strike: [1],
      },
      {
        say: "The two with eleven add two, when the minus sign outside says go down.",
        strike: [2, 3],
      },
    ],
    answer: "Five, seven. Right four, down two.",
    trap: { point: "Trap: f(x − 4) moving left", say: "Minus inside means right, plus inside means left. It's the one place the sign lies to you." },
    recap: { point: "Inside flips direction; outside doesn't", say: "Move one key point. Inside numbers shift it sideways, opposite the sign. Outside numbers shift it up or down, with the sign." },
  },
  {
    subskillId: "m-nonlinear-func",
    pattern: "Minimum, Maximum, and Asymptote Reasoning for Exponential Functions",
    example: 3,
    hook: "Exponential functions don't have a vertex. They have a level they creep toward and never quite touch.",
    idea: [
      { point: "a·b^x + c levels off at c", say: "In a times b to the x, plus c, the exponential part fades toward zero, so the function levels off at c." },
      { point: "Signs decide floor or ceiling", say: "Whether c is a floor or a ceiling depends on the signs of a and b. The level itself is always c." },
    ],
    steps: [
      {
        say: "The coffee's model is seventy times point nine to the t, plus sixty-eight.",
        highlight: ["T(t) = 70(0.9)^t + 68"],
        work: "T(t) = 70(0.9)^t + 68",
      },
      {
        say: "Point nine is less than one, so every minute that part shrinks. Over time, it heads toward zero.",
        work: "(0.9)^t gets close to 0",
        note: "base under 1: shrinks",
      },
      {
        say: "Seventy times almost nothing is still almost nothing.",
        work: "70(0.9)^t gets close to 0",
        note: "a · (tiny) is tiny",
      },
      {
        say: "What's left is the sixty-eight. That's room temperature, the level it cools toward.",
        work: "T gets close to 0 + 68 = 68",
        note: "only c survives",
      },
      {
        say: "Seventy is the coefficient and point nine is the base. Neither one is where it levels off.",
        strike: [1, 2],
      },
      {
        say: "One thirty-eight is seventy plus sixty-eight. That's the temperature when it was poured, not where it ends up.",
        strike: [3],
      },
    ],
    answer: "Sixty-eight degrees. The coffee cools toward the room and never quite gets there.",
    trap: { point: "Trap: using the coefficient as the limit", say: "The number in front shrinks away. The level comes from the constant added at the end." },
    recap: { point: "Level-off value = the added constant", say: "Let the exponential part fade to zero. Whatever's left over is where the function levels off." },
  },
  {
    subskillId: "m-nonlinear-func",
    pattern: "Finding the Vertex of a Quadratic from Standard or Factored Form",
    example: 0,
    hook: "Standard form hides the vertex. One short formula digs it out.",
    idea: [
      { point: "Vertex x = −b/2a", say: "The vertex's x value is always negative b over two a." },
      { point: "Plug x back in for y", say: "Then plug that x back into the function to get the y value." },
    ],
    steps: [
      {
        say: "Here a is one and b is negative six.",
        highlight: ["x² - 6x + 5"],
        work: "a = 1, b = −6",
        note: "read a and b",
      },
      {
        say: "Negative b over two a. The negative of negative six is positive six, over two. That's three.",
        work: "x = −(−6)/(2 · 1) = 3",
        note: "−b/2a",
      },
      {
        say: "Plug in three. Nine minus eighteen plus five.",
        work: "f(3) = 9 − 18 + 5",
        note: "plug in x = 3",
      },
      {
        say: "That's negative four. So the vertex is three, negative four.",
        work: "f(3) = −4, vertex (3, −4)",
      },
      {
        say: "Negative three is a sign slip in the formula. Positive four is an arithmetic slip.",
        strike: [1, 2],
      },
      {
        say: "Six, five just reads b and c off the equation. Those aren't coordinates.",
        strike: [3],
      },
    ],
    answer: "Three, negative four. The formula gives x, and plugging in gives y.",
    trap: { point: "Trap: double negatives in −b/2a", say: "When b is negative, negative b is positive. That's where most points get lost here." },
    recap: { point: "−b/2a, then plug in", say: "Find x with negative b over two a, then plug it back in. The vertex needs both numbers." },
  },
  {
    subskillId: "m-nonlinear-func",
    pattern: "Evaluating a Function and Interpreting Its Output in Context",
    example: 4,
    hook: "Sometimes they give you the output and ask for the input. Then you're running the function backward.",
    idea: [
      { point: "Output given? Set f(x) equal to it", say: "If they tell you the output, set the function equal to it and solve for the input." },
      { point: "Keep only answers that fit", say: "Then check each solution against the story. A negative width or time gets thrown out." },
    ],
    steps: [
      {
        say: "The area is x times x plus six, and it equals forty.",
        highlight: ["A(x) = x(x + 6)", "40 square feet"],
        work: "x(x + 6) = 40",
        note: "set A(x) = 40",
      },
      {
        say: "Multiply out and move the forty over, so one side is zero.",
        work: "x² + 6x − 40 = 0",
        note: "−40 both sides",
      },
      {
        say: "Two numbers that multiply to negative forty and add to six: ten and negative four.",
        work: "(x + 10)(x − 4) = 0",
        note: "factor",
      },
      {
        say: "So x is negative ten or four.",
        work: "x = −10 or x = 4",
        note: "each factor = 0",
      },
      {
        say: "A garden can't be negative ten feet wide. So it's four, and four times ten is forty.",
        work: "width > 0, so x = 4",
        note: "check the context",
        strike: [0],
      },
      {
        say: "Ten is actually the length, and a width of ten gives one sixty. Thirty-four just subtracts six from forty.",
        strike: [2, 3],
      },
    ],
    answer: "Four feet. Four wide, ten long, forty square feet.",
    trap: { point: "Trap: keeping a root that can't happen", say: "Both roots solve the equation, but only one can be a real width. Check the story." },
    recap: { point: "Set equal, solve, check context", say: "Set the function equal to the output, solve, and keep only the answer that makes sense." },
  },
  {
    subskillId: "m-nonlinear-func",
    pattern: "Reading Key Features from a Nonlinear Graph",
    example: 4,
    hook: "A graph can hand you the coefficients, if you know which feature holds which number.",
    idea: [
      { point: "y-intercept of ax² + bx + c is c", say: "Plug in x equals zero and everything drops out except c. So the y-intercept is c." },
      { point: "Vertex x = −b/(2a)", say: "The vertex sits at x equals negative b over two a. Know a, read the vertex, and solve for b." },
    ],
    steps: [
      {
        say: "The graph crosses the y axis at negative three. That's c.",
        highlight: ["The vertex and the y-intercept are marked"],
        work: "c = −3",
        note: "y-intercept = c",
        spot: ["-3"],
      },
      {
        say: "The vertex is at x equals two. Set negative b over two a equal to two.",
        work: "−b/(2 · 1/2) = 2",
        note: "vertex x = −b/2a",
        spot: ["2"],
      },
      {
        say: "Two times one half is one, so negative b is two, and b is negative two.",
        work: "−b = 2, so b = −2",
        note: "2 · 1/2 = 1",
      },
      {
        say: "Multiply them. Negative two times negative three is positive six.",
        work: "bc = (−2)(−3) = 6",
        note: "multiply",
      },
      {
        say: "Negative six loses the sign on b. Ten uses negative five, the vertex's height, as c.",
        strike: [0, 1],
        spot: ["-5"],
      },
      {
        say: "Twelve drops the a from the formula, which makes b negative four.",
        strike: [2],
      },
    ],
    answer: "Six. The y-intercept gave c, and the vertex gave b.",
    trap: { point: "Trap: using the vertex's height as c", say: "C is where the graph crosses the y axis, not its lowest point. Those are different here." },
    recap: { point: "y-intercept → c. Vertex → b.", say: "Name the feature, then find where it lives. The y-intercept gives c, and the vertex's x value gives b." },
  },
  {
    subskillId: "m-nonlinear-func",
    pattern: "Zeros, Factors, and x-Intercepts of Polynomials",
    example: 0,
    hook: "A zero, an x-intercept, and a factor are the same fact written three ways.",
    idea: [
      { point: "Zero at a → factor (x − a)", say: "If p of a is zero, the graph hits the x axis at a, and x minus a is a factor." },
      { point: "Factor sign is opposite the zero", say: "So the sign in the factor is always the opposite of the zero. A zero at negative two gives x plus two." },
    ],
    steps: [
      {
        say: "The graph crosses the x axis at negative two, one, and four.",
        highlight: ["crosses the x-axis only at the marked points"],
        spot: ["-2", "1", "4"],
      },
      {
        say: "Each crossing is a zero. Write x minus each one.",
        work: "zeros: x = −2, 1, 4",
        note: "read the crossings",
      },
      {
        say: "X minus negative two is x plus two.",
        work: "x − (−2) = x + 2",
        note: "factor: x − zero",
        spot: ["-2"],
      },
      {
        say: "The other two factors are x minus one and x minus four.",
        work: "factors: (x + 2)(x − 1)(x − 4)",
        note: "one per zero",
      },
      {
        say: "X minus two would mean a zero at positive two, and the graph doesn't cross there.",
        strike: [1],
      },
      {
        say: "X plus one and x plus four flip the signs. Those zeros give x minus one and x minus four.",
        strike: [2, 3],
      },
    ],
    answer: "X plus two. The crossing at negative two, with the sign flipped.",
    trap: { point: "Trap: copying the zero's sign into the factor", say: "A zero at negative two means x plus two. The factor and the zero always have opposite signs." },
    recap: { point: "Zero a → factor (x − a)", say: "Read each crossing, then write x minus that number. Watch the double negative." },
  },
];
