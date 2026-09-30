import type { LessonVideoScript } from "../../types";

export const M_RATIOS_RATES: LessonVideoScript[] = [
  {
    subskillId: "m-ratios-rates",
    pattern: "Setting Up Proportions Correctly",
    example: 0,
    hook: "Proportion problems are rarely hard to compute. They're just easy to set up wrong.",
    idea: [
      { point: "Match units in matching spots", say: "Put the same kind of thing on top of both fractions, and the same kind on the bottom." },
      { point: "Then cross-multiply", say: "Once the units line up, cross-multiply and solve. The arithmetic is the easy part." },
    ],
    steps: [
      {
        say: "Cups over cookies on both sides. Two over twelve equals x over thirty.",
        highlight: ["2 cups of flour for 12 cookies", "30 cookies"],
        work: "2/12 = x/30",
        note: "cups/cookies twice",
      },
      {
        say: "Cross-multiply. Twelve x equals two times thirty, which is sixty.",
        work: "12x = 60",
        note: "cross-multiply",
      },
      {
        say: "Divide both sides by twelve. X is five.",
        work: "x = 5",
        note: "÷12 both sides",
      },
      {
        say: "Point eight goes the wrong way. More cookies need more than two cups, not less.",
        strike: [2],
      },
      {
        say: "One eighty flips one side, putting cookies on top. And twenty fails a quick check: one cup per six cookies means thirty cookies need five.",
        strike: [1, 3],
      },
    ],
    answer: "Five cups. One cup for every six cookies, and thirty cookies is five sixes.",
    trap: { point: "Trap: cups/cookies = cookies/cups", say: "If one fraction has cups on top and the other has cookies on top, the answer comes out confidently wrong." },
    recap: { point: "Same units, same positions", say: "Line up the units first, then cross-multiply. If the units match, the math follows." },
  },
  {
    subskillId: "m-ratios-rates",
    pattern: "Unit Conversion Chains",
    example: 0,
    hook: "Don't guess whether to multiply or divide. Line up the units and let them cancel.",
    idea: [
      { point: "Chain factors so units cancel", say: "Write each conversion as a fraction, so the unit you don't want sits once on top and once on the bottom." },
      { point: "What's left is the answer's unit", say: "Cancel them, and whatever units survive should be exactly what the question asks for." },
    ],
    steps: [
      {
        say: "Start with sixty miles per hour. We want feet per minute.",
        highlight: ["60 miles per hour", "feet per minute"],
        work: "60 mi/hr",
        note: "start here",
      },
      {
        say: "Multiply by five thousand two hundred eighty feet per mile. Miles cancel.",
        work: "60 mi/hr × 5,280 ft/mi",
        note: "miles cancel",
      },
      {
        say: "Multiply by one hour over sixty minutes. Hours cancel, leaving feet per minute.",
        work: "× 1 hr/60 min",
        note: "hours cancel",
      },
      {
        say: "Sixty over sixty is one, so it's five thousand two hundred eighty feet per minute.",
        work: "= 5,280 ft/min",
        note: "60/60 = 1",
      },
      {
        say: "Three hundred sixteen thousand eight hundred skips the hours step. That's feet per hour.",
        strike: [1],
      },
      {
        say: "Eighty-eight is feet per second, and sixty-three thousand three hundred sixty is the inches in a mile.",
        strike: [2, 3],
      },
    ],
    answer: "Five thousand two hundred eighty feet per minute. Sixty miles an hour is exactly a mile a minute.",
    trap: { point: "Trap: a conversion factor upside down", say: "If a unit doesn't cancel, that fraction is flipped. Fix it before you touch the numbers." },
    recap: { point: "Chain it, cancel it, check the units", say: "Build the chain so every unwanted unit cancels. If what's left matches the question, the setup is right." },
  },
  {
    subskillId: "m-ratios-rates",
    pattern: "Expressing One Quantity as an Algebraic Ratio Expression",
    example: 4,
    hook: "A ratio question with letters is still just multiplying. The hard part is which way.",
    idea: [
      { point: "Write the ratio as a fraction", say: "Turn the ratio into a fraction exactly as it's stated, then multiply the known quantity by it." },
      { point: "Check the direction", say: "Then sanity-check. If there are more of one thing, its expression should come out bigger." },
    ],
    steps: [
      {
        say: "One manager for every six engineers, so engineers are six times managers.",
        highlight: ["managers to engineers is 1 to 6"],
        work: "engineers = 6m",
        note: "1 to 6: × 6",
      },
      {
        say: "Three engineers for every ten interns, so interns are ten thirds of the engineers.",
        highlight: ["engineers to interns is 3 to 10"],
        work: "interns = (10/3) × engineers",
        note: "3 to 10: × 10/3",
      },
      {
        say: "Swap in six m for the engineers.",
        work: "interns = (10/3)(6m)",
        note: "substitute",
      },
      {
        say: "Ten thirds of six is twenty. So the interns are twenty m.",
        work: "interns = 20m",
        note: "(10/3)(6) = 20",
      },
      {
        say: "Eighteen m multiplies six by three, and sixty m multiplies six by ten. Neither one divides by three.",
        strike: [1, 3],
      },
      {
        say: "M over twenty flips it. There are more interns than managers, not fewer.",
        strike: [2],
      },
    ],
    answer: "Twenty m. Every manager comes with six engineers, and those six engineers come with twenty interns.",
    trap: { point: "Trap: flipping the ratio's fraction", say: "Three to ten means interns are ten thirds of the engineers, not three tenths. More interns, bigger fraction." },
    recap: { point: "Ratio → fraction → multiply, then check", say: "Chain one ratio at a time, as fractions, and check that the bigger group gets the bigger expression." },
  },
];
