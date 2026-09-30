import type { LessonVideoScript } from "../../types";

export const M_ONE_VAR_DATA: LessonVideoScript[] = [
  {
    subskillId: "m-one-var-data",
    pattern: "Comparing Mean and Median to Detect Skew",
    example: 1,
    hook: "One mansion on the block, and suddenly the average house looks way pricier than it is.",
    idea: [
      { point: "Outliers drag the mean", say: "The mean uses every value, so one extreme value drags it toward itself." },
      { point: "The median barely moves", say: "The median only cares about the middle of the sorted list, so outliers barely touch it." },
      { point: "Mean > median → high outliers", say: "If the mean sits well above the median, a few high values are pulling it up. That's right skew." },
    ],
    steps: [
      {
        say: "Five sale prices, in thousands. One of them, eight ninety, is way off from the rest.",
        highlight: ["240, 210, 890, 230, 225"],
      },
      {
        say: "Sort them first. The median is the middle of the sorted list, not the middle of the list as given.",
        work: "210, 225, 230, 240, 890",
        note: "sort first",
      },
      {
        say: "Five values, so the median is the third one. Two thirty.",
        work: "median = 230",
        note: "middle of five",
      },
      {
        say: "Compare the mean. Everything adds to seventeen ninety-five, divided by five is three fifty-nine. The outlier pulled it way up.",
        work: "mean = 1,795 / 5 = 359",
        note: "pulled up by 890",
      },
      {
        say: "So three fifty-nine is the mean, not the median. And eight ninety is the outlier itself.",
        strike: [1, 2],
      },
      {
        say: "Two twenty-five is second in the sorted list. The middle is one spot over.",
        strike: [3],
      },
    ],
    answer: "Two thirty. The median stays with the typical homes while the mean chases the big sale.",
    trap: { point: "Trap: forgetting to sort", say: "The median is the middle of the sorted list. Pick the middle of the list as given, and you'll land on the wrong value." },
    recap: { point: "Mean follows outliers; median resists", say: "Outliers pull the mean toward them. The median holds steady, so it shows a typical value better." },
  },
  {
    subskillId: "m-one-var-data",
    pattern: "Interpreting Standard Deviation as Spread",
    example: 1,
    hook: "Two classes, same average. Totally different stories.",
    idea: [
      { point: "Standard deviation = spread, not center", say: "Standard deviation measures how far values typically sit from the mean. It says nothing about how big the mean is." },
      { point: "Same mean, different spread: fine", say: "Two data sets can share a mean and still have very different standard deviations." },
    ],
    steps: [
      {
        say: "Both classes have a mean of seventy-eight. So the center is a tie, and the question is all about spread.",
        highlight: ["mean of 78", "same mean of 78"],
        work: "mean A = mean B = 78",
        note: "center: a tie",
      },
      {
        say: "Class A is tightly clustered near seventy-eight. Class B runs all the way from forty to a hundred.",
        highlight: ["tightly clustered", "from 40 to 100"],
        work: "B: 40 to 100; A: close to 78",
        note: "spread decides",
      },
      {
        say: "Wider spread around the same mean means a bigger standard deviation. That's Class B, so the Class A choice has them backwards.",
        strike: [1],
      },
      {
        say: "Sharing a mean doesn't mean sharing a spread. And the descriptions are enough to decide, even without every score.",
        strike: [2, 3],
      },
    ],
    answer: "Class B. Its scores wander much farther from seventy-eight.",
    trap: { point: "Trap: mixing up spread and center", say: "Standard deviation and the mean answer different questions. One is how spread out, the other is where the middle is." },
    recap: { point: "Bigger standard deviation = more spread out", say: "A bigger standard deviation means values sit farther from the mean. That's less consistent, not bigger." },
  },
  {
    subskillId: "m-one-var-data",
    pattern: "Reading Values and Basic Statistics Directly from a Graph or Table",
    example: 4,
    hook: "Two sections, two averages. You can't just average the averages.",
    idea: [
      { point: "Read the exact row you need", say: "Most of these are careful reading. Find the right row or bar, and read its value exactly." },
      { point: "total = count × mean", say: "To combine groups, turn each mean back into a total. The count times the mean gives the total." },
      { point: "Add totals, divide by everyone", say: "Add the totals, then divide by the combined count. Bigger groups count for more." },
    ],
    steps: [
      {
        say: "Section A has eighteen students with a mean of eighty-four. That's fifteen hundred twelve points total.",
        highlight: ["all 30 students"],
        spot: ["A", "18", "84"],
        work: "A: 18 × 84 = 1,512",
        note: "total = count × mean",
      },
      {
        say: "Section B has twelve students with a mean of seventy-nine. Nine hundred forty-eight points.",
        spot: ["B", "12", "79"],
        work: "B: 12 × 79 = 948",
        note: "total = count × mean",
      },
      {
        say: "Add the two totals. Two thousand four hundred sixty points in all.",
        work: "1,512 + 948 = 2,460",
        note: "add the totals",
      },
      {
        say: "Divide by all thirty students. The combined mean is eighty-two.",
        work: "2,460 / 30 = 82",
        note: "÷ all 30 students",
      },
      {
        say: "Eighty-one and a half averages the two means as if the sections were the same size. Section A is bigger, so it counts more.",
        strike: [0],
      },
      {
        say: "Eighty-one swaps the class sizes. And twenty-four sixty is the total before dividing.",
        strike: [2, 3],
      },
    ],
    answer: "Eighty-two. It lands closer to eighty-four, because Section A has more students.",
    trap: { point: "Trap: averaging the two means", say: "That only works when the groups are the same size. Here they aren't, so weight each mean by its count." },
    recap: { point: "Combine totals, not means", say: "Turn each mean into a total, add the totals, and divide by the total count." },
  },
  {
    subskillId: "m-one-var-data",
    pattern: "How Changing a Data Set Changes Its Statistics",
    example: 2,
    hook: "Add one score to a list, and the mean moves. The question is how far.",
    idea: [
      { point: "Shift every value → mean shifts too", say: "Add the same amount to every value, and the mean and median move by that amount. The range stays put." },
      { point: "New point? Rebuild the total", say: "When one new value joins, rebuild the old total from the mean, add the new value, and divide again." },
    ],
    steps: [
      {
        say: "Five scores with a mean of eighty, and a sixth score of ninety-two joins.",
        highlight: ["Five test scores have a mean of 80", "A sixth score of 92"],
      },
      {
        say: "Five scores averaging eighty means they add to four hundred.",
        work: "5 × 80 = 400",
        note: "old total",
      },
      {
        say: "Add the new score. Four hundred plus ninety-two is four ninety-two.",
        work: "400 + 92 = 492",
        note: "add the new score",
      },
      {
        say: "Now there are six scores, so divide by six. The new mean is eighty-two.",
        work: "492 / 6 = 82",
        note: "÷ new count",
      },
      {
        say: "Eighty-six averages eighty and ninety-two as if they counted equally. But eighty stands for five scores.",
        strike: [1],
      },
      {
        say: "Eighty ignores the new score, which is above the mean and pulls it up. Ninety-two is just the new score.",
        strike: [2, 3],
      },
    ],
    answer: "Eighty-two. One high score nudges the mean up, but only a little.",
    trap: { point: "Trap: averaging old mean with new value", say: "The old mean stands for five scores, not one. Rebuild the total before you add anything." },
    recap: { point: "Mean × count = total, then redo it", say: "Turn the mean into a total, add or remove the value, and divide by the new count." },
  },
];
