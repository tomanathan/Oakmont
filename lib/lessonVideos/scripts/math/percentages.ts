import type { LessonVideoScript } from "../../types";

export const M_PERCENTAGES: LessonVideoScript[] = [
  {
    subskillId: "m-percentages",
    pattern: "Straightforward Percent Change and Discount Problems",
    example: 3,
    hook: "Going forward with a discount is easy. Going backward is where people slip.",
    idea: [
      { point: "25% off → pay 75%: × 0.75", say: "Think in multipliers. Twenty-five percent off means you pay seventy-five percent, so multiply by zero point seven five." },
      { point: "To undo a change, divide", say: "To get back to the original, divide by that multiplier. Don't just add the percent back on." },
    ],
    steps: [
      {
        say: "The jacket is twenty percent off, and it now costs sixty-four dollars. We want the price before the sale.",
        highlight: ["After a 20% discount", "$64"],
      },
      {
        say: "Twenty percent off means the sale price is eighty percent of the original. So zero point eight times the original is sixty-four.",
        work: "0.80 × original = 64",
        note: "pay 80%",
      },
      {
        say: "Undo the multiply by dividing both sides by zero point eight.",
        work: "original = 64 / 0.80",
        note: "÷0.80 both sides",
      },
      {
        say: "Sixty-four divided by zero point eight is eighty. The original was eighty dollars.",
        work: "original = 80",
      },
      {
        say: "Seventy-six dollars and eighty cents adds twenty percent of sixty-four. But the twenty percent came off the original, not off sixty-four.",
        strike: [1],
      },
      {
        say: "Fifty-one dollars and twenty cents takes the discount off a second time. And eighty-four just adds twenty dollars back.",
        strike: [2, 3],
      },
    ],
    answer: "Eighty dollars. Check it: twenty percent of eighty is sixteen, and eighty minus sixteen is sixty-four.",
    trap: { point: "Trap: adding the percent back on", say: "The percent was taken from the original price. Adding it to the sale price uses the wrong base." },
    recap: { point: "Forward: multiply. Backward: divide.", say: "Turn the percent into a multiplier. Multiply to go forward, and divide by it to go back." },
  },
  {
    subskillId: "m-percentages",
    pattern: "Successive Percent Changes (Compounding, Not Additive)",
    example: 0,
    hook: "Up twenty percent, then down twenty percent. Back where you started? Nope.",
    idea: [
      { point: "Changes multiply, they don't add", say: "Percent changes stack by multiplying. Each one is taken from whatever the value is at that moment." },
      { point: "Start at 100 and follow it", say: "The easy way to see it: start with a price of one hundred and apply each change in order." },
    ],
    steps: [
      {
        say: "The price goes up twenty percent, then down twenty percent.",
        highlight: ["increases by 20%", "decreases by 20%"],
      },
      {
        say: "Start at one hundred. Up twenty percent means times one point two. That's one hundred twenty.",
        work: "100 × 1.20 = 120",
        note: "+20% → × 1.20",
      },
      {
        say: "Now down twenty percent, but from one hundred twenty. Times zero point eight gives ninety-six.",
        work: "120 × 0.80 = 96",
        note: "−20% → × 0.80",
      },
      {
        say: "Ninety-six is four less than where we started. On a start of one hundred, that's four percent lower.",
        work: "100 − 96 = 4, so 4% lower",
        note: "compare to start",
      },
      {
        say: "So it's not the same. The drop was taken from a bigger number, so it took away more.",
        strike: [1],
      },
      {
        say: "Four percent higher gets the direction wrong, and forty percent lower adds the two percents together.",
        strike: [2, 3],
      },
    ],
    answer: "Four percent lower. One hundred, then one twenty, then ninety-six.",
    trap: { point: "Trap: +20% and −20% cancel", say: "They don't cancel. The second twenty percent is taken from a new, bigger base." },
    recap: { point: "Apply changes in order, as multipliers", say: "Turn each change into a multiplier and apply them one after another. Starting at one hundred makes it easy." },
  },
  {
    subskillId: "m-percentages",
    pattern: "Percent, Part, and Whole: Solving for the Missing One",
    example: 5,
    hook: "Every one of these is the same three numbers: a part, a whole, and a percent.",
    idea: [
      { point: "part = percent × whole", say: "The part equals the percent times the whole. You're given two of them, and you find the third." },
      { point: "Percent = part / whole", say: "To find a percent, divide the part by the whole. The whole is what you're comparing to." },
      { point: "Make sure you have the right part", say: "Sometimes the part isn't given directly, and you have to subtract to find it first." },
    ],
    steps: [
      {
        say: "Sixty-three out of one eighty picked option A. But the question asks about option B.",
        highlight: ["63 out of 180 respondents preferred option A", "option B"],
      },
      {
        say: "Everyone else picked B. One eighty minus sixty-three is one hundred seventeen.",
        work: "B = 180 − 63 = 117",
        note: "the rest",
      },
      {
        say: "Now it's part over whole. B's part is one seventeen, and the whole is all one eighty.",
        work: "percent = 117 / 180",
        note: "part over whole",
      },
      {
        say: "One seventeen over one eighty is zero point six five. That's sixty-five percent.",
        work: "117 / 180 = 0.65 = 65%",
        note: "× 100",
      },
      {
        say: "Thirty-five percent is option A's share. Sixty-three is a count of people, not a percent.",
        strike: [1, 2],
      },
      {
        say: "And thirty-one and a half doesn't match any split here. B's share really is sixty-five.",
        strike: [3],
      },
    ],
    answer: "Sixty-five percent. And A's thirty-five plus B's sixty-five makes a hundred, so it checks out.",
    trap: { point: "Trap: using the given count as the part", say: "The number in the question belongs to option A. Subtract first to get B's part." },
    recap: { point: "Label part and whole, then divide", say: "Figure out which number is the part and which is the whole. Then the percent is part over whole." },
  },
];
