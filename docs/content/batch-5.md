# Content batch 5 — review

All seven Problem-Solving and Data Analysis subskills (about 15% of the Math section): ratios and units, percentages, one- and two-variable data, probability, inference from samples, and evaluating statistical claims.

- **Figures.** Questions can now carry a table, scatterplot, bar graph, histogram, or dot plot. Figures are drawn to scale from the question's own data, so a figure can't disagree with the answer key. The build checks that every value fits its axes, that axis steps divide evenly, and that two-way table totals add up, and answer checks are computed from the figure data. 18 new items use figures; the data for each is listed below.
- Every existing item (70) was re-checked. Two had two correct answers, one stem contradicted itself, one confidence-interval key used the standard misreading, and several offered non-answers ('Range' as a measure of center). All fixed (listed below).
- Eight items gave the answer away by length (Statistical Claims especially). Rebalanced.
- Difficulty labels corrected where one-step problems were marked hard.
- 15 new original items per subskill (105), with 59 automatic answer checks. New coverage: unit-conversion chains, ratio expressions, successive percent changes, two-way tables, residuals, margin of error, and random sampling vs. random assignment.

Please flag anything that reads wrong. Choices are listed in authored order (students see them shuffled each sitting); ✓ marks the answer, and the trap tag follows each wrong choice.

## Ratios, Rates, Proportions, and Units (`m-ratios-rates`): 12 → 27 items

### New items

**1. Unit Conversion Chains · medium**

> A car travels at a constant speed of 66 feet per second. What is its speed in miles per hour? (1 mile = 5,280 feet)

- **A. 45** ✓
- B. 96.8 — *trap: Multiplying by a conversion factor upside-down (e.g., using feet/mile when you needed mile/feet to cancel the existing units).*
- C. 0.75 — *trap: Losing track of units partway through a multi-step conversion and guessing whether to multiply or divide at the end.*
- D. 4.5

*Explanation:* 66 ft/s × 3,600 s/h = 237,600 ft/h, and 237,600 ÷ 5,280 = 45 mph. Multiplying by 5,280 instead of dividing gives 96.8; converting seconds to minutes but not to hours gives 0.75.

**2. Unit Conversion Chains · easy**

> A recipe calls for 750 milliliters of broth. About how many cups of broth is this? (1 cup ≈ 240 milliliters)

- **A. 3.125** ✓
- B. 180,000 — *trap: Multiplying by a conversion factor upside-down (e.g., using feet/mile when you needed mile/feet to cancel the existing units).*
- C. 510
- D. 0.32 — *trap: Multiplying by a conversion factor upside-down (e.g., using feet/mile when you needed mile/feet to cancel the existing units).*

*Explanation:* 750 ÷ 240 = 3.125 cups. Multiplying by 240 turns the conversion factor upside down; 240 ÷ 750 = 0.32 divides the wrong way.

**3. Unit Conversion Chains · easy**

> A printer prints 18 pages per minute. At this rate, how many pages can it print in 2.5 hours?

- **A. 2,700** ✓
- B. 45 — *trap: Losing track of units partway through a multi-step conversion and guessing whether to multiply or divide at the end.*
- C. 1,080 — *trap: Losing track of units partway through a multi-step conversion and guessing whether to multiply or divide at the end.*
- D. 7.2 — *trap: Multiplying by a conversion factor upside-down (e.g., using feet/mile when you needed mile/feet to cancel the existing units).*

*Explanation:* 2.5 hours is 150 minutes, and 18 × 150 = 2,700. Multiplying 18 by 2.5 skips the hours-to-minutes step; 1,080 is one hour's worth.

**4. Unit Conversion Chains · medium**

> A machine uses 3.6 kilograms of plastic per hour. How many grams of plastic does it use per minute? (1 kilogram = 1,000 grams)

- **A. 60** ✓
- B. 216,000 — *trap: Multiplying by a conversion factor upside-down (e.g., using feet/mile when you needed mile/feet to cancel the existing units).*
- C. 0.06 — *trap: Losing track of units partway through a multi-step conversion and guessing whether to multiply or divide at the end.*
- D. 3,600 — *trap: Losing track of units partway through a multi-step conversion and guessing whether to multiply or divide at the end.*

*Explanation:* 3.6 kg/h = 3,600 g/h, and 3,600 ÷ 60 = 60 g/min. 216,000 multiplies by 60 instead of dividing; 3,600 is still grams per hour.

**5. Unit Conversion Chains · medium**

> A snail moves at 0.5 inch per second. At this rate, how many feet does it travel in 4 minutes?

- **A. 10** ✓
- B. 1,440 — *trap: Multiplying by a conversion factor upside-down (e.g., using feet/mile when you needed mile/feet to cancel the existing units).*
- C. 2 — *trap: Losing track of units partway through a multi-step conversion and guessing whether to multiply or divide at the end.*
- D. 120 — *trap: Losing track of units partway through a multi-step conversion and guessing whether to multiply or divide at the end.*

*Explanation:* 4 minutes is 240 seconds, so it moves 0.5 × 240 = 120 inches, which is 120 ÷ 12 = 10 feet. 120 stops at inches; 1,440 multiplies by 12 instead of dividing.

**6. Unit Conversion Chains · hard**

> A metal has a density of 7.8 grams per cubic centimeter. What is the mass, in kilograms, of a block of this metal with a volume of 500 cubic centimeters?

- **A. 3.9** ✓
- B. 3,900 — *trap: Losing track of units partway through a multi-step conversion and guessing whether to multiply or divide at the end.*
- C. 64.1 — *trap: Multiplying by a conversion factor upside-down (e.g., using feet/mile when you needed mile/feet to cancel the existing units).*
- D. 0.064 — *trap: Multiplying by a conversion factor upside-down (e.g., using feet/mile when you needed mile/feet to cancel the existing units).*

*Explanation:* Mass = 7.8 × 500 = 3,900 grams = 3.9 kilograms. 3,900 leaves the answer in grams; 500 ÷ 7.8 ≈ 64.1 divides where it should multiply.

**7. Setting Up Proportions Correctly · easy**

> On a scale drawing, 2 centimeters represent 5 meters. A wall in the drawing is 7 centimeters long. How long is the actual wall, in meters?

- **A. 17.5** ✓
- B. 2.8 — *trap: Setting up the proportion with mismatched units (e.g., cups over cookies on one side, cookies over cups on the other).*
- C. 14
- D. 35 — *trap: Cross-multiplying correctly but from an incorrectly set-up proportion, producing a confidently wrong answer.*

*Explanation:* 2/5 = 7/x, so x = 35/2 = 17.5 meters. Setting up 5/2 = 7/x mismatches the units and gives 2.8; 35 multiplies 7 by 5 without dividing by 2.

**8. Setting Up Proportions Correctly · medium**

> A basketball player made 21 of her first 35 free throws. If she continues at the same rate, how many of her next 60 free throws is she expected to make?

- **A. 36** ✓
- B. 100 — *trap: Setting up the proportion with mismatched units (e.g., cups over cookies on one side, cookies over cups on the other).*
- C. 46
- D. 24 — *trap: Cross-multiplying correctly but from an incorrectly set-up proportion, producing a confidently wrong answer.*

*Explanation:* 21/35 = 0.6, and 0.6 × 60 = 36. 100 comes from 35/21 × 60, a flipped rate; 24 is the number she'd be expected to miss.

**9. Setting Up Proportions Correctly · hard**

> At a museum, the ratio of adults to children is 4 to 7. There are 21 more children than adults. How many people are at the museum?

- **A. 77** ✓
- B. 33
- C. 49
- D. 28

*Explanation:* The difference is 7 - 4 = 3 parts, so each part is 21 ÷ 3 = 7 people. The total is 11 parts: 11 × 7 = 77. 49 and 28 are the children and the adults.

**10. Setting Up Proportions Correctly · easy**

> The quantities x and y are directly proportional, and y = 12 when x = 8. What is the value of y when x = 20?

- **A. 30** ✓
- B. 13.3 — *trap: Setting up the proportion with mismatched units (e.g., cups over cookies on one side, cookies over cups on the other).*
- C. 24 — *trap: Cross-multiplying correctly but from an incorrectly set-up proportion, producing a confidently wrong answer.*
- D. 18

*Explanation:* y/x stays 12/8 = 1.5, so y = 1.5 × 20 = 30. 24 treats the change as additive (x rose by 12, so y rises by 12), and 13.3 uses the ratio 8/12 upside down.

**11. Expressing One Quantity as an Algebraic Ratio Expression · medium**

> At a school, the ratio of teachers to students is 1 to 18. If the school has s students, which expression represents the number of teachers?

- **A. s/18** ✓
- B. 18s — *trap: Multiplying by the ratio when division was needed, or vice versa, especially across similar-looking problems where the given variable's role changes.*
- C. s/19 — *trap: Confusing a part-to-part ratio (like judges to teams) with a part-to-whole ratio (like blue marbles to all marbles), which require different expressions.*
- D. 18/s — *trap: Flipping the ratio's fraction upside down, expressing the reciprocal relationship instead of the one actually described.*

*Explanation:* There is 1 teacher for every 18 students, so the number of teachers is s ÷ 18. 18s multiplies instead of dividing, s/19 treats the ratio as part-to-whole, and 18/s flips it.

**12. Expressing One Quantity as an Algebraic Ratio Expression · medium**

> A jar contains only red and blue marbles, in a ratio of 3 to 5. If the jar contains m marbles in all, which expression gives the number of red marbles?

- **A. 3m/8** ✓
- B. 3m/5 — *trap: Confusing a part-to-part ratio (like judges to teams) with a part-to-whole ratio (like blue marbles to all marbles), which require different expressions.*
- C. 5m/8
- D. 8m/3 — *trap: Flipping the ratio's fraction upside down, expressing the reciprocal relationship instead of the one actually described.*

*Explanation:* Red is 3 of every 3 + 5 = 8 marbles, so there are 3m/8 red marbles. 3m/5 uses the part-to-part ratio as if it were part-to-whole; 5m/8 is the blue marbles.

**13. Expressing One Quantity as an Algebraic Ratio Expression · hard**

> A mixture contains water and juice concentrate in a ratio of w to c. If the mixture contains 12 liters of concentrate, which expression gives the number of liters of water?

- **A. 12w/c** ✓
- B. 12c/w — *trap: Flipping the ratio's fraction upside down, expressing the reciprocal relationship instead of the one actually described.*
- C. 12w/(w + c) — *trap: Confusing a part-to-part ratio (like judges to teams) with a part-to-whole ratio (like blue marbles to all marbles), which require different expressions.*
- D. w/(12c) — *trap: Multiplying by the ratio when division was needed, or vice versa, especially across similar-looking problems where the given variable's role changes.*

*Explanation:* water/concentrate = w/c, so water = 12 × w/c. 12c/w flips the ratio; 12w/(w + c) treats 12 as the whole mixture.

**14. Expressing One Quantity as an Algebraic Ratio Expression · hard**

> A car uses g gallons of gas to travel 240 miles. At this rate, how many gallons will it use to travel d miles?

- **A. gd/240** ✓
- B. 240d/g — *trap: Flipping the ratio's fraction upside down, expressing the reciprocal relationship instead of the one actually described.*
- C. 240g/d — *trap: Multiplying by the ratio when division was needed, or vice versa, especially across similar-looking problems where the given variable's role changes.*
- D. d/(240g) — *trap: Flipping the ratio's fraction upside down, expressing the reciprocal relationship instead of the one actually described.*

*Explanation:* The car uses g/240 gallons per mile, so d miles take gd/240 gallons. The other choices divide where they should multiply or flip the rate.

**15. Expressing One Quantity as an Algebraic Ratio Expression · medium**

> In a club, the ratio of juniors to seniors is 2 to 3. If there are j juniors, which expression gives the total number of members?

- **A. 5j/2** ✓
- B. 3j/2 — *trap: Confusing a part-to-part ratio (like judges to teams) with a part-to-whole ratio (like blue marbles to all marbles), which require different expressions.*
- C. 2j/3 — *trap: Flipping the ratio's fraction upside down, expressing the reciprocal relationship instead of the one actually described.*
- D. 5j/3

*Explanation:* There are 3/2 seniors per junior, so seniors = 3j/2 and the total is j + 3j/2 = 5j/2. 3j/2 counts only the seniors; 2j/3 flips the ratio.

## Percentages (`m-percentages`): 12 → 27 items

### Fixed

- **Item 12.** The key trap for compound growth (adding 5% twice: 264,000) wasn't among the choices. Added.

### New items

**1. Straightforward Percent Change and Discount Problems · easy**

> A jacket costs $80. During a sale, its price is reduced by 15%. What is the sale price?

- **A. $68** ✓
- B. $12 — *trap: Calculating the discount amount correctly but then forgetting to subtract it from the original price (reporting the discount amount itself as the final answer).*
- C. $65
- D. $92

*Explanation:* 15% of 80 is 12, so the sale price is 80 - 12 = $68. $12 is the discount, not the price.

**2. Straightforward Percent Change and Discount Problems · medium**

> After a 20% discount, a lamp costs $36. What was the original price of the lamp?

- **A. $45** ✓
- B. $43.20
- C. $28.80
- D. $180 — *trap: Confusing 'the price is 25% off' with 'the price is 25% of the original' — these produce very different final prices.*

*Explanation:* The sale price is 80% of the original: 0.8p = 36, so p = 45. Adding 20% of $36 gives $43.20, but the 20% was taken from the original price, not the sale price. $180 treats $36 as 20% of the original.

**3. Straightforward Percent Change and Discount Problems · easy**

> A town's population increased from 12,500 to 14,000. By what percent did the population increase?

- **A. 12%** ✓
- B. 10.7%
- C. 15%
- D. 1.5%

*Explanation:* The increase is 1,500, and 1,500 ÷ 12,500 = 0.12 = 12%. Dividing by the new population, 14,000, gives about 10.7%.

**4. Straightforward Percent Change and Discount Problems · hard**

> A restaurant adds 6% sales tax to a $45 meal. The customer also leaves a tip of 20% of the $45 pre-tax price. What is the total amount the customer pays?

- **A. $56.70** ✓
- B. $57.24
- C. $11.70 — *trap: Calculating the discount amount correctly but then forgetting to subtract it from the original price (reporting the discount amount itself as the final answer).*
- D. $47.70

*Explanation:* Tax is 0.06 × 45 = 2.70 and the tip is 0.20 × 45 = 9, so the total is 45 + 2.70 + 9 = $56.70. $57.24 figures the tip on the taxed amount; $11.70 is just the tax and tip.

**5. Straightforward Percent Change and Discount Problems · easy**

> A sample of 60 people found that 45% of them preferred Brand A. How many people in the sample preferred Brand A?

- **A. 27** ✓
- B. 45
- C. 33
- D. 133

*Explanation:* 45% of 60 is 0.45 × 60 = 27. 33 is the number who did not prefer Brand A, and 133 divides 60 by 0.45.

**6. Successive Percent Changes (Compounding, Not Additive) · hard**

> A store raises the price of a coat by 25%, then puts the coat on sale for 20% off the new price. The sale price is what percent of the original price?

- **A. 100%** ✓
- B. 105% — *trap: Adding or subtracting percentages directly (20% + (-20%) = 0%) instead of applying them as sequential multipliers.*
- C. 95%
- D. 80%

*Explanation:* 1.25 × 0.80 = 1.00, so the sale price equals the original price. Subtracting 20% from 25% gives 105%, but the 20% is taken from a larger price.

**7. Successive Percent Changes (Compounding, Not Additive) · medium**

> A car's value decreases by 15% each year. If the car is worth $20,000 now, what will it be worth in 2 years?

- **A. $14,450** ✓
- B. $14,000 — *trap: Adding or subtracting percentages directly (20% + (-20%) = 0%) instead of applying them as sequential multipliers.*
- C. $17,000
- D. $14,750

*Explanation:* 20,000 × 0.85 × 0.85 = $14,450. Taking 30% off at once gives $14,000, but the second year's 15% comes off a smaller value. $17,000 is one year.

**8. Successive Percent Changes (Compounding, Not Additive) · hard**

> A population of bacteria increases by 40% every hour. By what percent has the population increased after 2 hours?

- **A. 96%** ✓
- B. 80% — *trap: Adding or subtracting percentages directly (20% + (-20%) = 0%) instead of applying them as sequential multipliers.*
- C. 196%
- D. 140%

*Explanation:* Two hours multiply the population by 1.4 × 1.4 = 1.96, a 96% increase. Adding 40% twice gives 80%; 196% is the new population as a percent of the old one, not the increase.

**9. Successive Percent Changes (Compounding, Not Additive) · medium**

> The price of a ticket increased by 10% in 2022 and by 10% again in 2023. The 2023 price is what percent greater than the price before both increases?

- **A. 21%** ✓
- B. 20% — *trap: Adding or subtracting percentages directly (20% + (-20%) = 0%) instead of applying them as sequential multipliers.*
- C. 110%
- D. 121%

*Explanation:* 1.1 × 1.1 = 1.21, so the price is 21% greater. 20% adds the two increases; 121% is the new price as a percent of the old one.

**10. Successive Percent Changes (Compounding, Not Additive) · medium**

> A quantity q is increased by 30%, and the result is then decreased by 30%. Which expression represents the final quantity?

- **A. 0.91q** ✓
- B. q — *trap: Assuming a percentage increase and an equal percentage decrease cancel out to no net change — they don't, because the second percentage is applied to a different (already changed) base value.*
- C. 0.7q
- D. 1.09q

*Explanation:* q × 1.3 × 0.7 = 0.91q. An increase and an equal-percent decrease don't cancel, because the decrease applies to a larger number.

**11. Finding What Percent One Number Is of Another · easy**

> What percent of 250 is 40?

- **A. 16%** ✓
- B. 625% — *trap: Reversing the part and the whole — dividing the whole by the part instead of the part by the whole.*
- C. 160%
- D. 84%

*Explanation:* 40 ÷ 250 = 0.16 = 16%. 625% divides 250 by 40, reversing the part and the whole.

**12. Finding What Percent One Number Is of Another · medium**

> A school has 480 students, and 132 of them walk to school. The rest arrive by bus or car. What percent of the students do not walk to school?

- **A. 72.5%** ✓
- B. 27.5% — *trap: Using the wrong quantity as the 'part' when the question requires an extra subtraction step to find it first (like a 'remaining' or 'the rest' amount).*
- C. 37.9%
- D. 36.4%

*Explanation:* 480 - 132 = 348 students don't walk, and 348 ÷ 480 = 0.725 = 72.5%. 27.5% is the percent who do walk.

**13. Finding What Percent One Number Is of Another · medium**

> Last year a farm harvested 800 bushels of corn. This year it harvested 1,000 bushels. This year's harvest is what percent of last year's harvest?

- **A. 125%** ✓
- B. 80% — *trap: Reversing the part and the whole — dividing the whole by the part instead of the part by the whole.*
- C. 25% — *trap: Treating a result over 100% as a sign of a mistake, when it's a completely valid outcome whenever the 'part' is actually larger than the 'whole.'*
- D. 20%

*Explanation:* 1,000 ÷ 800 = 1.25 = 125%. A result over 100% is expected here, since this year's harvest is larger. 80% reverses the part and whole; 25% is the percent increase, a different question.

**14. Finding What Percent One Number Is of Another · hard**

> If x is 150% of y, then y is what percent of x?

- **A. About 66.7%** ✓
- B. 150% — *trap: Reversing the part and the whole — dividing the whole by the part instead of the part by the whole.*
- C. 50%
- D. About 33.3%

*Explanation:* x = 1.5y, so y = x/1.5 = (2/3)x, or about 66.7% of x. 150% just repeats the given relationship in the wrong direction.

**15. Finding What Percent One Number Is of Another · medium**

> A store buys a phone for $240 and sells it for $300. The store's profit is what percent of the price it paid?

- **A. 25%** ✓
- B. 20% — *trap: Reversing the part and the whole — dividing the whole by the part instead of the part by the whole.*
- C. 60%
- D. 125%

*Explanation:* The profit is $60, and 60 ÷ 240 = 25%. Dividing by the selling price, $300, gives 20%. 125% is the selling price as a percent of the cost.

## One-Variable Data (`m-one-var-data`): 11 → 26 items

### Fixed

- **Item 2.** Two right answers: the mode is also unaffected by outliers. Replaced with a question about how changing one value moves the mean but not the median.
- **Item 3.** 'Range' and 'Sum' were offered as measures of center, and the mode (6) was also a defensible 'typical value'. Rewritten as a mean-vs-median comparison.
- **Item 4.** Wrong choices like 'Set A's values are all identical' were throwaways. Rewritten around the real confusion: spread vs. average.
- **Item 9.** The stem contradicted itself ('skewed right due to one extremely low score being removed'). Rewritten.
- **Item 10.** 'Median' and 'Mode' were offered as measures of spread. Choices replaced.

### New items

**1. Reading Values and Basic Statistics Directly from a Graph or Table · medium**

> The bar graph shows the number of pets owned by each of 20 students.
>
> What is the median number of pets owned by these students?

*Figure: bar graph of Number of students by Number of pets: 0: 5, 1: 8, 2: 4, 3: 3.*

- **A. 1** ✓
- B. 1.25
- C. 8 — *trap: Confusing a value's frequency (how many data points have that value) with the value itself.*
- D. 2

*Explanation:* Listed in order, the 10th and 11th values are both 1 (the 0s fill spots 1–5 and the 1s fill 6–13), so the median is 1. 1.25 is the mean; 8 is a frequency, not a number of pets.

**2. Reading Values and Basic Statistics Directly from a Graph or Table · hard**

> The table shows the scores of 20 students on a 5-point quiz.
>
> What is the mean score?

| Score | Number of students |
|---|---|
| 2 | 3 |
| 3 | 5 |
| 4 | 8 |
| 5 | 4 |

- **A. 3.65** ✓
- B. 3.5 — *trap: Confusing a value's frequency (how many data points have that value) with the value itself.*
- C. 5 — *trap: Confusing a value's frequency (how many data points have that value) with the value itself.*
- D. 4

*Explanation:* Total points = 2(3) + 3(5) + 4(8) + 5(4) = 73, and 73 ÷ 20 = 3.65. 3.5 averages the four scores without weighting them by how many students earned each; 5 averages the frequencies.

**3. Reading Values and Basic Statistics Directly from a Graph or Table · easy**

> The histogram shows the heights of 40 plants. Each bar includes its left endpoint but not its right endpoint.
>
> How many plants are at least 20 centimeters tall?

*Figure: histogram of Height (centimeters): 0–10: 6, 10–20: 14, 20–30: 12, 30–40: 8.*

- **A. 20** ✓
- B. 12 — *trap: For a histogram question about a range of values ('20 or more'), forgetting to include every bin that satisfies the condition, not just the first one.*
- C. 8 — *trap: For a histogram question about a range of values ('20 or more'), forgetting to include every bin that satisfies the condition, not just the first one.*
- D. 34

*Explanation:* Both the 20–30 bin (12) and the 30–40 bin (8) count, for 20 plants. 12 stops after the first qualifying bin.

**4. Reading Values and Basic Statistics Directly from a Graph or Table · easy**

> The bar graph shows how many siblings each student in a class has.
>
> How many students have at least 2 siblings?

*Figure: bar graph of Number of students by Number of siblings: 0: 4, 1: 9, 2: 5, 3: 2.*

- **A. 7** ✓
- B. 5 — *trap: For a histogram question about a range of values ('20 or more'), forgetting to include every bin that satisfies the condition, not just the first one.*
- C. 16
- D. 2 — *trap: For a histogram question about a range of values ('20 or more'), forgetting to include every bin that satisfies the condition, not just the first one.*

*Explanation:* Students with 2 siblings (5) and with 3 siblings (2) both count: 7. Stopping at the first bin gives 5; 16 counts everyone with at least 1.

**5. Comparing Mean and Median to Detect Skew · medium**

> The dot plot shows the number of books each of 11 students read last month.
>
> Which statement about the data is true?

*Figure: dot plot of Number of books read: 1, 2, 2, 3, 3, 3, 4, 4, 5, 6, 9.*

- **A. The mean is greater than the median.** ✓
- B. The median is greater than the mean. — *trap: Misinterpreting which direction skew pulls the mean — right skew (high outliers) pulls the mean UP relative to the median, not down.*
- C. The mode is greater than the median.
- D. The mean, median, and mode are equal.

*Explanation:* The median and mode are both 3, and the mean is 42/11 ≈ 3.8: the high value 9 pulls the mean above the median.

**6. Comparing Mean and Median to Detect Skew · easy**

> At a small company, most employees earn between $40,000 and $60,000 a year, but the owner earns $400,000. Which measure gives a better idea of a typical employee's salary, and why?

- **A. The median, because the owner's salary pulls the mean far upward.** ✓
- B. The mean, because it is calculated using every salary at the company. — *trap: Defaulting to the mean as 'the' measure of center without checking whether outliers are present that would make the median more representative.*
- C. The median, because the owner's salary pulls the median far upward.
- D. The mean, because the owner's salary pulls the mean downward. — *trap: Misinterpreting which direction skew pulls the mean — right skew (high outliers) pulls the mean UP relative to the median, not down.*

*Explanation:* One huge salary drags the mean up, while the median stays in the middle of the typical salaries. It's the mean, not the median, that the outlier distorts, and it pulls the mean up, not down.

**7. Comparing Mean and Median to Detect Skew · medium**

> A histogram of a data set has a long tail extending to the left. Which statement about the data set is most likely true?

- **A. The mean is less than the median.** ✓
- B. The mean is greater than the median. — *trap: Misinterpreting which direction skew pulls the mean — right skew (high outliers) pulls the mean UP relative to the median, not down.*
- C. The mean and the median are equal.
- D. The standard deviation is zero.

*Explanation:* A left tail means some unusually low values, which pull the mean down below the median.

**8. Interpreting Standard Deviation as Spread · medium**

> Two classes took the same test. Class A's scores were 70, 75, 80, 85, and 90. Class B's scores were 60, 70, 80, 90, and 100. Which statement is true?

- **A. The means are equal, and Class B's scores have the larger standard deviation.** ✓
- B. The means are equal, and Class A's scores have the larger standard deviation.
- C. Class B has the larger mean, because its highest score is higher.
- D. The standard deviations are equal, because the means are equal. — *trap: Assuming a larger standard deviation implies a larger or smaller mean, when the two statistics are independent of each other.*

*Explanation:* Both means are 80. Class B's scores sit farther from 80, so its standard deviation is larger. Equal means say nothing about spread.

**9. Interpreting Standard Deviation as Spread · hard**

> Set I is 2, 4, 6, 8, 10. Set II is 12, 14, 16, 18, 20. Set III is 1, 6, 6, 6, 11. Which statement about the standard deviations of the sets is true?

- **A. Sets I and II have equal standard deviations.** ✓
- B. Set II has a larger standard deviation because its values are larger. — *trap: Assuming a larger standard deviation implies a larger or smaller mean, when the two statistics are independent of each other.*
- C. Set III has the smallest standard deviation because three values are equal.
- D. Set I has a larger standard deviation than Set III.

*Explanation:* Set II is Set I shifted up by 10, which doesn't change the spread. Set III's 1 and 11 sit 5 away from its mean of 6, farther than any value in Set I, so Set III is the most spread out.

**10. Interpreting Standard Deviation as Spread · easy**

> The standard deviation of the weights of apples in Crate X is 12 grams, and in Crate Y it is 4 grams. Which conclusion is best supported?

- **A. The apple weights in Crate X vary more than those in Crate Y.** ✓
- B. The apples in Crate X are heavier on average than those in Crate Y. — *trap: Assuming a larger standard deviation implies a larger or smaller mean, when the two statistics are independent of each other.*
- C. Crate X contains three times as many apples as Crate Y.
- D. A typical apple in Crate X weighs about 12 grams. — *trap: Confusing standard deviation (a measure of spread) with the mean (a measure of center) — they answer different questions entirely.*

*Explanation:* Standard deviation measures how much the weights vary. It says nothing about the average weight or the number of apples.

**11. How Changing a Data Set Changes Its Statistics · easy**

> A data set has a mean of 20 and a median of 18. If 5 is added to every value in the data set, what are the new mean and median?

- **A. Mean 25, median 23** ✓
- B. Mean 25, median 18 — *trap: Assuming a new data point always shifts the median the same way it shifts the mean — the median only changes based on where the new point falls in the sorted order.*
- C. Mean 20, median 18 — *trap: Forgetting that shifting every value by a constant leaves the range (and standard deviation) unchanged, even though it does shift the mean and median.*
- D. Mean 100, median 90

*Explanation:* Adding 5 to every value shifts every measure of center up by 5. The median shifts too, since every value moves.

**12. How Changing a Data Set Changes Its Statistics · easy**

> The data set 3, 7, 8, 12, 15 has a range of 12. If the value 10 is added to the data set, what happens to the range?

- **A. It stays the same.** ✓
- B. It increases. — *trap: Assuming the range changes whenever a new point is added — it only changes if the new point is more extreme than the existing minimum or maximum.*
- C. It decreases. — *trap: Assuming the range changes whenever a new point is added — it only changes if the new point is more extreme than the existing minimum or maximum.*
- D. It becomes 10.

*Explanation:* 10 is between the minimum (3) and the maximum (15), so the range is still 15 - 3 = 12.

**13. How Changing a Data Set Changes Its Statistics · medium**

> The mean of 8 numbers is 15. When a ninth number is added, the mean of the 9 numbers is 16. What is the ninth number?

- **A. 24** ✓
- B. 16
- C. 1
- D. 31

*Explanation:* The 8 numbers total 8 × 15 = 120, and the 9 numbers total 9 × 16 = 144. The ninth number is 144 - 120 = 24.

**14. How Changing a Data Set Changes Its Statistics · hard**

> A data set of 9 values has a median of 40. Two values, 10 and 90, are added to the data set. What is the median of the new data set?

- **A. 40** ✓
- B. Less than 40 — *trap: Assuming a new data point always shifts the median the same way it shifts the mean — the median only changes based on where the new point falls in the sorted order.*
- C. Greater than 40 — *trap: Assuming a new data point always shifts the median the same way it shifts the mean — the median only changes based on where the new point falls in the sorted order.*
- D. It cannot be determined.

*Explanation:* One new value is below 40 and one is above it, so 40 is still the middle value: the 6th of 11.

**15. How Changing a Data Set Changes Its Statistics · hard**

> A teacher discovers that one score in a data set was recorded as 58 instead of 85. After the error is corrected, which statistic must increase?

- **A. The mean** ✓
- B. The median — *trap: Assuming a new data point always shifts the median the same way it shifts the mean — the median only changes based on where the new point falls in the sorted order.*
- C. The range — *trap: Assuming the range changes whenever a new point is added — it only changes if the new point is more extreme than the existing minimum or maximum.*
- D. The mode

*Explanation:* Raising any value by 27 raises the total, so the mean must increase. The median, range, and mode change only if that score sits in the middle, at an extreme, or among the most common values.

## Two-Variable Data (`m-two-var-data`): 9 → 24 items

### Fixed

- **Items 2, 4.** The key was about twice as long as every wrong choice. Rebalanced with plausible wrong answers.

### New items

**1. Choosing the Right Model Shape from a Scatterplot's Pattern · easy**

> The scatterplot shows the number of hours each of 10 students studied and the student's test score. The line of best fit is y = 4.2x + 61.
>
> What test score does the line of best fit predict for a student who studied 5 hours?

*Figure: scatterplot, Hours studied 0–8 by Test score 60–100. Points (1, 64), (2, 68), (2, 71), (3, 72), (4, 79), (5, 78), (5, 85), (6, 86), (7, 90), (8, 93); line y = 4.2x + 61.*

- **A. 82** ✓
- B. 65.2
- C. 21
- D. 90

*Explanation:* y = 4.2(5) + 61 = 21 + 61 = 82. 65.2 adds 4.2 once instead of five times; 21 leaves off the 61.

**2. Interpreting Residuals · medium**

> The scatterplot shows the number of hours each of 10 students studied and the student's test score. The line of best fit is y = 4.2x + 61.
>
> What is the residual for the student who studied 5 hours and scored 78?

*Figure: scatterplot, Hours studied 0–8 by Test score 60–100. Points (1, 64), (2, 68), (2, 71), (3, 72), (4, 79), (5, 78), (5, 85), (6, 86), (7, 90), (8, 93); line y = 4.2x + 61.*

- **A. -4** ✓
- B. 4 — *trap: Reversing the residual formula (predicted minus actual instead of actual minus predicted), which flips the sign of the answer.*
- C. 78
- D. 82

*Explanation:* The line predicts 82. Residual = actual - predicted = 78 - 82 = -4. Subtracting the other way gives 4.

**3. Interpreting Residuals · medium**

> The scatterplot shows a data set and its line of best fit, y = -1.5x + 40.
>
> What is the residual for the data point (10, 28)?

*Figure: scatterplot, x 0–16 by y 0–45. Points (0, 41), (2, 36), (4, 35), (6, 30), (8, 29), (10, 28), (12, 21), (14, 20), (16, 16); line y = -1.5x + 40.*

- **A. 3** ✓
- B. -3 — *trap: Reversing the residual formula (predicted minus actual instead of actual minus predicted), which flips the sign of the answer.*
- C. 25
- D. 28

*Explanation:* The line predicts -1.5(10) + 40 = 25, so the residual is 28 - 25 = 3. Predicted minus actual gives -3.

**4. Interpreting Residuals · easy**

> A data point on a scatterplot has a residual of -6 with respect to the line of best fit. Which statement must be true?

- **A. The point lies 6 units below the line.** ✓
- B. The point lies 6 units above the line. — *trap: Reversing the residual formula (predicted minus actual instead of actual minus predicted), which flips the sign of the answer.*
- C. The line has a slope of -6. — *trap: Confusing a residual (a single point's deviation) with the overall correlation or fit quality of the entire model.*
- D. The data have a negative correlation. — *trap: Confusing a residual (a single point's deviation) with the overall correlation or fit quality of the entire model.*

*Explanation:* A negative residual means actual < predicted, so the point sits below the line. A residual describes one point, not the line's slope or the overall correlation.

**5. Interpreting Residuals · hard**

> The scatterplot shows the points (1, 7), (3, 8), and (5, 10) and the line of best fit y = 2x + 3.
>
> Which point has the largest positive residual?

*Figure: scatterplot, x 0–6 by y 0–16. Points (1, 7), (3, 8), (5, 10); line y = 2x + 3.*

- **A. (1, 7)** ✓
- B. (3, 8)
- C. (5, 10) — *trap: Reversing the residual formula (predicted minus actual instead of actual minus predicted), which flips the sign of the answer.*
- D. All three residuals are equal.

*Explanation:* Predicted values are 5, 9, and 13, so the residuals are 7 - 5 = 2, 8 - 9 = -1, and 10 - 13 = -3. Only (1, 7) has a positive residual. Computing predicted minus actual would make (5, 10) look largest.

**6. Interpreting Residuals · medium**

> Which description of the residuals suggests that a line of best fit is a good model for the data?

- **A. The residuals are small and show no clear pattern.** ✓
- B. All of the residuals are positive.
- C. The residuals increase steadily as x increases.
- D. The residuals are all equal to the slope. — *trap: Confusing a residual (a single point's deviation) with the overall correlation or fit quality of the entire model.*

*Explanation:* A good linear fit leaves small, patternless residuals. All-positive residuals mean the line runs too low, and a steady trend in the residuals means the data curve away from the line.

**7. Interpreting Residuals · easy**

> A model predicts that a plant will be 14.5 centimeters tall after 20 days. The plant's actual height after 20 days is 13.2 centimeters. What is the residual?

- **A. -1.3** ✓
- B. 1.3 — *trap: Reversing the residual formula (predicted minus actual instead of actual minus predicted), which flips the sign of the answer.*
- C. 13.2
- D. 27.7

*Explanation:* Residual = actual - predicted = 13.2 - 14.5 = -1.3. Predicted minus actual gives 1.3.

**8. Choosing the Right Model Shape from a Scatterplot's Pattern · easy**

> The table shows four values of x and their corresponding values of y.
>
> Which type of model best fits the data in the table?

| x | y |
|---|---|
| 0 | 5 |
| 1 | 10 |
| 2 | 20 |
| 3 | 40 |

- **A. Exponential growth** ✓
- B. Linear growth — *trap: Confusing exponential growth (accelerating rate) with linear growth (constant rate) when a scatterplot's curve is subtle.*
- C. Exponential decay
- D. Linear decay

*Explanation:* Each y-value is double the one before, so y grows by a constant factor: exponential growth. Linear growth would add the same amount each time, but the increases are 5, 10, and 20.

**9. Choosing the Right Model Shape from a Scatterplot's Pattern · easy**

> The table shows the value of y for each of four values of x.
>
> Which type of model best fits these data?

| x | y |
|---|---|
| 0 | 50 |
| 1 | 44 |
| 2 | 38 |
| 3 | 32 |

- **A. Linear decay** ✓
- B. Exponential decay — *trap: Confusing exponential growth (accelerating rate) with linear growth (constant rate) when a scatterplot's curve is subtle.*
- C. Linear growth
- D. Exponential growth

*Explanation:* y drops by the same amount, 6, each time, so the decrease is linear. Exponential decay would drop by the same percent each time.

**10. Choosing the Right Model Shape from a Scatterplot's Pattern · medium**

> The table shows four values of x and their corresponding values of y.
>
> Which statement best describes the relationship between x and y?

| x | y |
|---|---|
| 0 | 800 |
| 1 | 400 |
| 2 | 200 |
| 3 | 100 |

- **A. y decreases exponentially, halving each time x increases by 1.** ✓
- B. y decreases linearly, falling by 400 each time x increases by 1. — *trap: Assuming any 'increasing' pattern must be linear, without checking whether the rate of increase itself is constant, accelerating, or otherwise.*
- C. y decreases linearly, falling by about 233 each time x increases by 1. — *trap: Assuming any 'increasing' pattern must be linear, without checking whether the rate of increase itself is constant, accelerating, or otherwise.*
- D. y increases exponentially, doubling each time x increases by 1.

*Explanation:* The drops are 400, 200, and 100, which aren't constant, but each value is half the one before: exponential decay. The first drop alone makes it look linear.

**11. Choosing the Right Model Shape from a Scatterplot's Pattern · medium**

> The population of a town, in thousands, x years after 2000 is modeled by y = 12(1.03)^x. What does 1.03 represent in this model?

- **A. The population grows by 3% each year.** ✓
- B. The population grows by 1.03 thousand people each year. — *trap: Confusing exponential growth (accelerating rate) with linear growth (constant rate) when a scatterplot's curve is subtle.*
- C. The population grows by 103% each year.
- D. The population in 2000 was 1.03 thousand.

*Explanation:* Multiplying by 1.03 each year adds 3% of the current population. Adding 1.03 thousand each year would be a linear model; 12 is the population in 2000.

**12. Choosing the Right Model Shape from a Scatterplot's Pattern · easy**

> The line of best fit y = 0.8x + 12 models the price y, in dollars, of a large pizza with x toppings at several restaurants. What does 12 represent in this model?

- **A. The predicted price of a large pizza with no toppings** ✓
- B. The predicted increase in price for each added topping
- C. The number of toppings on the most expensive pizza
- D. The price of each topping, in dollars

*Explanation:* 12 is the value of y when x = 0: the predicted price with no toppings. 0.8 is the predicted increase per topping.

**13. Choosing the Right Model Shape from a Scatterplot's Pattern · medium**

> The scatterplot shows a data set in which y increases as x increases.
>
> Which equation could model the data?

*Figure: scatterplot, x 0–10 by y 0–20. Points (0, 3), (1, 3.6), (2, 4.32), (3, 5.18), (4, 6.22), (5, 7.46), (6, 8.96), (7, 10.75), (8, 12.9), (9, 15.48), (10, 18.58).*

- **A. y = 3(1.2)^x** ✓
- B. y = 3 + 1.2x — *trap: Assuming any 'increasing' pattern must be linear, without checking whether the rate of increase itself is constant, accelerating, or otherwise.*
- C. y = 3(0.8)^x
- D. y = 3 - 1.2x

*Explanation:* Increases that keep getting larger mean growth by a factor: y = 3(1.2)^x. y = 3 + 1.2x grows by the same 1.2 each time, and the other two decrease.

**14. Choosing the Right Model Shape from a Scatterplot's Pattern · medium**

> The scatterplot shows the heights of children aged 2 to 10 years, along with the line of best fit y = 2.5x + 31, where y is height in inches and x is age in years.
>
> Which is the best reason NOT to use this line to predict the height of a 40-year-old?

*Figure: scatterplot, Age (years) 2–10 by Height (inches) 30–60. Points (2, 36), (3, 38.5), (4, 41), (5, 43), (6, 46), (7, 48.5), (8, 51), (9, 53), (10, 56); line y = 2.5x + 31.*

- **A. Age 40 is far outside the range of ages used to create the model.** ✓
- B. The slope of 2.5 is too small to give a meaningful prediction.
- C. The model would predict a height of less than 31 inches.
- D. The y-intercept of the model changes for adults.

*Explanation:* The model describes growth between ages 2 and 10. People stop growing, so extending the line to 40 (131 inches) makes no sense.

**15. Choosing the Right Model Shape from a Scatterplot's Pattern · easy**

> Which description of a scatterplot indicates the strongest negative linear association between x and y?

- **A. The points fall close to a line that slopes downward.** ✓
- B. The points are loosely scattered around a line that slopes downward.
- C. The points fall close to a line that slopes upward.
- D. The points are spread out with no visible trend.

*Explanation:* Negative means y tends to decrease as x increases (a downward slope), and strong means the points stay close to the line.

## Probability and Conditional Probability (`m-probability`): 10 → 25 items

### Fixed

- **Item 4.** Forgetting to subtract the overlap gives 1.00, the key mistake for this item; it wasn't a choice. Added.
- **Item 5.** Two right answers: '13/26' equals the key, 1/2. Replaced.
- **Item 10.** '95% accurate' doesn't say how the test does on healthy people specifically. The stem now states it directly.

### New items

**1. Conditional Probability · hard**

> The table summarizes the answers of 200 students who were asked whether they prefer online or in-person classes.
>
> If a student who prefers online classes is selected at random, what is the probability that the student is in 10th grade?

|  | Online | In person | Total |
|---|---|---|---|
| 9th grade | 40 | 50 | 90 |
| 10th grade | 66 | 44 | 110 |
| Total | 106 | 94 | 200 |

- **A. 33/53** ✓
- B. 3/5 — *trap: Confusing P(A given B) with P(B given A) — these can have very different values depending on the group sizes involved.*
- C. 33/100 — *trap: Using the full original sample size (52 cards) as the denominator instead of the restricted subgroup specified by the 'given that' condition.*
- D. 20/53

*Explanation:* 106 students prefer online (40 + 66), and 66 of them are tenth graders: 66/106 = 33/53. 3/5 is the chance a tenth grader prefers online, the reverse condition; 33/100 divides by all 200 students.

**2. Conditional Probability · medium**

> The table summarizes the answers of 200 students who were asked whether they prefer online or in-person classes.
>
> If a 10th grader is selected at random, what is the probability that the student prefers online classes?

|  | Online | In person | Total |
|---|---|---|---|
| 9th grade | 40 | 50 | 90 |
| 10th grade | 66 | 44 | 110 |
| Total | 106 | 94 | 200 |

- **A. 3/5** ✓
- B. 33/53 — *trap: Confusing P(A given B) with P(B given A) — these can have very different values depending on the group sizes involved.*
- C. 33/100 — *trap: Using the full original sample size (52 cards) as the denominator instead of the restricted subgroup specified by the 'given that' condition.*
- D. 2/5

*Explanation:* Only the 110 tenth graders count, and 66 of them prefer online: 66/110 = 3/5. 33/53 is the reverse question; 2/5 is the tenth graders who prefer in-person.

**3. Conditional Probability · medium**

> The table shows 150 plants classified by flower color and height.
>
> If a white plant is selected at random, what is the probability that it is short?

|  | Tall | Short | Total |
|---|---|---|---|
| Red | 30 | 20 | 50 |
| White | 45 | 55 | 100 |
| Total | 75 | 75 | 150 |

- **A. 11/20** ✓
- B. 11/30 — *trap: Using the full original sample size (52 cards) as the denominator instead of the restricted subgroup specified by the 'given that' condition.*
- C. 11/15 — *trap: Confusing P(A given B) with P(B given A) — these can have very different values depending on the group sizes involved.*
- D. 1/2

*Explanation:* Only the 100 white plants count, and 55 are short: 55/100 = 11/20. 11/30 divides by all 150 plants; 11/15 divides by the 75 short plants, which answers 'given short, what's the chance it's white?'

**4. Conditional Probability · medium**

> The table shows 150 plants classified by flower color and height.
>
> If a tall plant is selected at random, what is the probability that it is red?

|  | Tall | Short | Total |
|---|---|---|---|
| Red | 30 | 20 | 50 |
| White | 45 | 55 | 100 |
| Total | 75 | 75 | 150 |

- **A. 2/5** ✓
- B. 3/5 — *trap: Confusing P(A given B) with P(B given A) — these can have very different values depending on the group sizes involved.*
- C. 1/5 — *trap: Using the full original sample size (52 cards) as the denominator instead of the restricted subgroup specified by the 'given that' condition.*
- D. 2/3

*Explanation:* There are 30 + 45 = 75 tall plants, and 30 are red: 30/75 = 2/5. 3/5 is the chance a red plant is tall; 1/5 divides by all 150 plants.

**5. Conditional Probability · hard**

> At a school, 60% of students take a language class, and 25% of students take both a language class and an art class. If a student who takes a language class is chosen at random, what is the probability that the student also takes art?

- **A. 5/12** ✓
- B. 1/4 — *trap: Using the full original sample size (52 cards) as the denominator instead of the restricted subgroup specified by the 'given that' condition.*
- C. 3/20
- D. 17/20

*Explanation:* Restrict to language students: 0.25 ÷ 0.60 = 5/12. 1/4 uses all students as the denominator.

**6. Conditional Probability · hard**

> Two fair six-sided dice are rolled. Given that the sum of the dice is 8, what is the probability that both dice show a 4?

- **A. 1/5** ✓
- B. 1/36 — *trap: Using the full original sample size (52 cards) as the denominator instead of the restricted subgroup specified by the 'given that' condition.*
- C. 1/6
- D. 5/36

*Explanation:* Only 5 outcomes sum to 8: (2, 6), (3, 5), (4, 4), (5, 3), (6, 2). One of them is (4, 4), so the probability is 1/5. 1/36 ignores the condition.

**7. Conditional Probability · medium**

> In a group of 40 people, 24 have a dog, and 10 have both a dog and a cat. If a dog owner is selected at random, what is the probability that the person also has a cat?

- **A. 5/12** ✓
- B. 1/4 — *trap: Using the full original sample size (52 cards) as the denominator instead of the restricted subgroup specified by the 'given that' condition.*
- C. 3/5
- D. 7/12

*Explanation:* Restrict to the 24 dog owners: 10/24 = 5/12. 1/4 divides by all 40 people; 7/12 is the dog owners without a cat.

**8. Conditional Probability · hard**

> Machine A makes 600 items a day, and 3% of them are defective. Machine B makes 400 items a day, and 5% of them are defective. If a defective item from one day is chosen at random, what is the probability that it came from Machine A?

- **A. 9/19** ✓
- B. 3/8
- C. 3/5
- D. 9/500 — *trap: Using the full original sample size (52 cards) as the denominator instead of the restricted subgroup specified by the 'given that' condition.*

*Explanation:* Machine A makes 18 defective items and Machine B makes 20, so 18 of the 38 defective items came from A: 9/19. 3/5 is A's share of all items, not of defective ones; 9/500 divides by all 1,000 items.

**9. Basic and Compound Probability · medium**

> A spinner has 8 equal sections numbered 1 through 8. What is the probability that the spinner lands on a number that is even or greater than 5?

- **A. 5/8** ✓
- B. 7/8 — *trap: Forgetting to subtract the overlap when using the addition rule for 'or' scenarios with events that can both occur.*
- C. 3/16
- D. 1/4

*Explanation:* The qualifying numbers are 2, 4, 6, 7, and 8: 5/8. Adding 4/8 + 3/8 = 7/8 counts 6 and 8 twice.

**10. Basic and Compound Probability · easy**

> A fair coin is flipped 3 times. What is the probability that it lands heads all 3 times?

- **A. 1/8** ✓
- B. 1/6
- C. 1/2
- D. 3/8

*Explanation:* Each flip is independent: (1/2)(1/2)(1/2) = 1/8.

**11. Basic and Compound Probability · medium**

> A bag contains 5 red, 3 blue, and 2 green tiles. A tile is drawn at random and put back, and then a second tile is drawn. What is the probability that both tiles are red?

- **A. 1/4** ✓
- B. 1 — *trap: Adding probabilities for an 'and' scenario instead of multiplying (that rule is for independent 'and' events specifically).*
- C. 2/9
- D. 1/2

*Explanation:* With replacement the draws are independent: (5/10)(5/10) = 1/4. Adding 1/2 + 1/2 = 1 treats 'and' like 'or'; 2/9 is the answer without replacement.

**12. Basic and Compound Probability · hard**

> A bag contains 5 red, 3 blue, and 2 green tiles. Two tiles are drawn at random without replacement. What is the probability that both tiles are red?

- **A. 2/9** ✓
- B. 1/4
- C. 1/5
- D. 4/9

*Explanation:* After one red is drawn, 4 of the 9 remaining tiles are red: (5/10)(4/9) = 20/90 = 2/9. 1/4 assumes the first tile was put back.

**13. Basic and Compound Probability · medium**

> The probability of rain on Saturday is 0.3, and the probability of rain on Sunday is 0.4. The two events are independent. What is the probability that it rains on neither day?

- **A. 0.42** ✓
- B. 0.3 — *trap: Adding probabilities for an 'and' scenario instead of multiplying (that rule is for independent 'and' events specifically).*
- C. 0.12
- D. 0.58

*Explanation:* No rain Saturday (0.7) and no rain Sunday (0.6): 0.7 × 0.6 = 0.42. 0.3 comes from 1 - (0.3 + 0.4), adding probabilities that should be multiplied; 0.58 is rain on at least one day.

**14. Basic and Compound Probability · medium**

> An integer from 1 through 20 is chosen at random. What is the probability that it is a multiple of 3 or a multiple of 5?

- **A. 9/20** ✓
- B. 1/2 — *trap: Forgetting to subtract the overlap when using the addition rule for 'or' scenarios with events that can both occur.*
- C. 1/20
- D. 3/50

*Explanation:* There are 6 multiples of 3 and 4 multiples of 5, but 15 is both, so 6 + 4 - 1 = 9 numbers qualify: 9/20. 1/2 counts 15 twice.

**15. Basic and Compound Probability · hard**

> A class of 25 students includes 15 who play an instrument. Two students are chosen at random, one after the other, without replacement. What is the probability that both play an instrument?

- **A. 7/20** ✓
- B. 9/25
- C. 6/5 — *trap: Adding probabilities for an 'and' scenario instead of multiplying (that rule is for independent 'and' events specifically).*
- D. 3/5

*Explanation:* (15/25)(14/24) = 210/600 = 7/20. 9/25 assumes the first student could be chosen again; 6/5 adds the probabilities instead of multiplying.

## Inference from Sample Statistics (`m-inference`): 8 → 23 items

### Fixed

- **Item 3.** The key ('a 95% chance the true mean lies between 48 and 56') is the classic misreading of a confidence interval. Now: it is plausible that the population mean is between 48 and 56.
- **Item 8.** The key was about twice as long as every wrong choice. Rebalanced with plausible wrong answers.

### New items

**1. Estimating a Population Count from a Sample Proportion · easy**

> A random sample of 400 adults in a city found that 32% walk to work. There are 150,000 adults in the city. Based on the sample, about how many adults in the city walk to work?

- **A. 48,000** ✓
- B. 128 — *trap: Applying the sample's raw count directly to the population instead of first converting it to a proportion or rate.*
- C. 102,000
- D. 4,800

*Explanation:* 32% of 150,000 = 48,000. 128 is the number in the sample (32% of 400); 102,000 is the adults who don't walk.

**2. Estimating a Population Count from a Sample Proportion · medium**

> A random sample of 250 of a school's 1,800 students found that 45 of them bike to school. Based on the sample, about how many students at the school bike to school?

- **A. 324** ✓
- B. 45 — *trap: Applying the sample's raw count directly to the population instead of first converting it to a proportion or rate.*
- C. 1,476
- D. 405

*Explanation:* 45/250 = 18%, and 18% of 1,800 = 324. 45 is only the sample's count; 1,476 is the students who don't bike.

**3. Estimating a Population Count from a Sample Proportion · medium**

> To estimate how many of a town's 20,000 residents use the public library, a researcher surveyed 200 people as they left the library. Of these, 180 said they use the library at least once a month. Which statement is true?

- **A. The sample isn't representative, so it can't give a good estimate for the town.** ✓
- B. About 18,000 of the town's residents use the library at least once a month. — *trap: Estimating a population count from a sample that wasn't randomly selected, when the problem specifically flags a biased or self-selected sample.*
- C. About 180 of the town's residents use the library at least once a month. — *trap: Applying the sample's raw count directly to the population instead of first converting it to a proportion or rate.*
- D. The sample is too small, since it includes only 1% of the town's residents.

*Explanation:* Everyone surveyed was leaving the library, so library users are heavily overrepresented. Scaling 90% up to the town (18,000) repeats the bias; 200 people would be plenty if they had been chosen at random.

**4. Estimating a Population Count from a Sample Proportion · easy**

> In a random sample of 80 boxes from a shipment of 5,000 boxes, 6 boxes were damaged. Based on the sample, what is the best estimate of the number of damaged boxes in the shipment?

- **A. 375** ✓
- B. 6 — *trap: Applying the sample's raw count directly to the population instead of first converting it to a proportion or rate.*
- C. 480
- D. 4,625

*Explanation:* 6/80 = 7.5%, and 7.5% of 5,000 = 375. 6 is just the sample's count, and 4,625 is the undamaged boxes.

**5. Estimating a Population Count from a Sample Proportion · hard**

> A biologist catches 60 fish in a lake, tags them, and releases them. A week later, she catches 80 fish, and 12 of them are tagged. Assuming the tagged fish mixed evenly with the others, what is the best estimate of the number of fish in the lake?

- **A. 400** ✓
- B. 128
- C. 16 — *trap: Applying the sample's raw count directly to the population instead of first converting it to a proportion or rate.*
- D. 4,800

*Explanation:* The second catch is 12/80 = 15% tagged, so the 60 tagged fish are about 15% of the lake: 60 ÷ 0.15 = 400. 16 comes from setting up the proportion upside down.

**6. Estimating a Population Count from a Sample Proportion · easy**

> Based on a random sample, an estimated 0.8% of the 12,500 households in a town have a solar water heater. Which is the best estimate of the number of households in the town with a solar water heater?

- **A. 100** ✓
- B. 1,000
- C. 10
- D. 12,400

*Explanation:* 0.8% is 0.008, and 0.008 × 12,500 = 100. Using 0.08 (8%) gives 1,000.

**7. Interpreting Confidence Intervals Correctly · medium**

> A random sample of 900 voters estimated that 54% support a proposal, with a margin of error of 3.5 percentage points. Which is the most appropriate conclusion?

- **A. It is plausible that 50.5% to 57.5% of all voters support the proposal.** ✓
- B. Between 50.5% and 57.5% of the voters in the sample support the proposal. — *trap: Interpreting a confidence interval as describing where individual data points fall, rather than describing the population parameter.*
- C. Exactly 54% of all voters support the proposal. — *trap: Treating the confidence interval as an absolute guarantee rather than a statement tied to the reliability of the sampling method.*
- D. It is certain that a majority of all voters support the proposal. — *trap: Treating the confidence interval as an absolute guarantee rather than a statement tied to the reliability of the sampling method.*

*Explanation:* 54 ± 3.5 gives plausible values for all voters from 50.5% to 57.5%. In the sample, exactly 54% supported it, and neither 'exactly 54%' nor 'certain' fits an estimate.

**8. Interpreting Confidence Intervals Correctly · easy**

> A study estimates that the mean commute time of a city's workers is 27 minutes, with a margin of error of 4 minutes. Which value is NOT a plausible value for the true mean commute time?

- **A. 32 minutes** ✓
- B. 23.5 minutes
- C. 27 minutes
- D. 30 minutes

*Explanation:* The plausible values run from 27 - 4 = 23 to 27 + 4 = 31 minutes. Only 32 falls outside that range.

**9. Sample Size's Effect on Margin of Error · medium**

> Two random samples were used to estimate the mean height of a type of seedling. Sample A gave 14.2 cm with a margin of error of 0.6 cm. Sample B gave 14.5 cm with a margin of error of 1.5 cm. Both used the same confidence level. Which is the most likely reason Sample B's margin of error is larger?

- **A. Sample B was smaller than Sample A.** ✓
- B. Sample B was larger than Sample A. — *trap: Reversing the relationship and assuming larger samples produce wider (less precise) intervals.*
- C. The seedlings in Sample B were taller.
- D. Sample B used a lower confidence level. — *trap: Confusing sample size effects with confidence level effects — increasing confidence level (e.g., 95% to 99%) actually widens the interval, the opposite direction from increasing sample size.*

*Explanation:* At the same confidence level, a smaller sample gives a less precise estimate and a larger margin of error. A larger sample would shrink it.

**10. Interpreting Confidence Intervals Correctly · medium**

> A 95% confidence interval for the proportion of a school's students who own a bike is 0.42 to 0.50. Which statement is supported by the interval?

- **A. It is plausible that at most half of the school's students own a bike.** ✓
- B. Exactly 46% of the school's students own a bike. — *trap: Treating the confidence interval as an absolute guarantee rather than a statement tied to the reliability of the sampling method.*
- C. Between 42% and 50% of the students in every class own a bike. — *trap: Interpreting a confidence interval as describing where individual data points fall, rather than describing the population parameter.*
- D. It is certain that at least 42% of the students own a bike. — *trap: Treating the confidence interval as an absolute guarantee rather than a statement tied to the reliability of the sampling method.*

*Explanation:* Every value in the interval is at most 0.50, so 'at most half' is plausible. The interval doesn't give an exact value, describe each class, or make anything certain.

**11. Interpreting Confidence Intervals Correctly · hard**

> An interval estimate of the mean household size is 2.4 to 2.8 people for Town A and 2.7 to 3.1 people for Town B. Which conclusion is best supported?

- **A. It is unclear which town has the larger mean, because the intervals overlap.** ✓
- B. Town B has a larger mean household size than Town A does. — *trap: Treating the confidence interval as an absolute guarantee rather than a statement tied to the reliability of the sampling method.*
- C. Every household in Town B is larger than every household in Town A. — *trap: Interpreting a confidence interval as describing where individual data points fall, rather than describing the population parameter.*
- D. Town A has a larger mean household size, since its interval starts lower.

*Explanation:* Values from 2.7 to 2.8 are plausible for both towns, so the data don't settle which mean is larger. The intervals describe means, not individual households.

**12. Interpreting Confidence Intervals Correctly · easy**

> A researcher reports that the mean amount of sleep for teens in a district is 7.1 hours per night, with a margin of error of 0.3 hours at a 95% confidence level. Which is the best interpretation?

- **A. The mean for all teens in the district is plausibly between 6.8 and 7.4 hours.** ✓
- B. 95% of the district's teens sleep between 6.8 and 7.4 hours per night. — *trap: Interpreting a confidence interval as describing where individual data points fall, rather than describing the population parameter.*
- C. Every teen in the district sleeps at least 6.8 hours per night. — *trap: Interpreting a confidence interval as describing where individual data points fall, rather than describing the population parameter.*
- D. The mean for all teens in the district is certainly between 6.8 and 7.4 hours. — *trap: Treating the confidence interval as an absolute guarantee rather than a statement tied to the reliability of the sampling method.*

*Explanation:* The interval is about the population mean, not individual teens, and it gives plausible values rather than a guarantee.

**13. Sample Size's Effect on Margin of Error · easy**

> A polling company wants a smaller margin of error for its next poll without changing its confidence level. What should it do?

- **A. Survey a larger random sample.** ✓
- B. Survey a smaller random sample. — *trap: Reversing the relationship and assuming larger samples produce wider (less precise) intervals.*
- C. Raise the confidence level to 99%. — *trap: Confusing sample size effects with confidence level effects — increasing confidence level (e.g., 95% to 99%) actually widens the interval, the opposite direction from increasing sample size.*
- D. Survey only people likely to respond.

*Explanation:* Larger random samples give more precise estimates. Raising the confidence level widens the margin of error, and surveying only likely responders adds bias.

**14. Sample Size's Effect on Margin of Error · easy**

> Poll X surveyed 300 randomly chosen residents of a city, and Poll Y surveyed 1,200 randomly chosen residents of the same city. Both polls asked the same question and used a 95% confidence level. Which is most likely true?

- **A. Poll Y has a smaller margin of error than Poll X.** ✓
- B. Poll X has a smaller margin of error than Poll Y. — *trap: Reversing the relationship and assuming larger samples produce wider (less precise) intervals.*
- C. The two polls have the same margin of error.
- D. Poll Y's estimate equals the true value.

*Explanation:* Poll Y's much larger sample gives a more precise estimate, so its margin of error is smaller. No poll's estimate is guaranteed to equal the true value.

**15. Sample Size's Effect on Margin of Error · medium**

> A researcher uses the same sample to build a 90% confidence interval and a 99% confidence interval for a population mean. How does the 99% interval compare with the 90% interval?

- **A. It is wider.** ✓
- B. It is narrower. — *trap: Confusing sample size effects with confidence level effects — increasing confidence level (e.g., 95% to 99%) actually widens the interval, the opposite direction from increasing sample size.*
- C. It is the same width.
- D. It is centered on a higher value.

*Explanation:* To be more confident of capturing the mean, the interval has to cover more values, so it gets wider. Both intervals are centered on the same sample mean.

## Evaluating Statistical Claims (`m-statistical-claims`): 8 → 23 items

### Fixed

- **Items 2, 3, 4, 5, 8.** The key was about twice as long as every wrong choice. Rebalanced with plausible wrong answers.

### New items

**1. Distinguishing Correlation from Causation · medium**

> Researchers surveyed 2,000 randomly selected adults in a country and found that those who drank more coffee reported fewer headaches. Which conclusion is best supported?

- **A. Among the country's adults, drinking more coffee is associated with fewer headaches.** ✓
- B. Drinking coffee prevents headaches among the country's adults. — *trap: Concluding a direct causal relationship ('ice cream causes drowning') from an observational correlation.*
- C. The association applies only to the 2,000 adults who were surveyed.
- D. Adults in the country who get headaches should drink more coffee. — *trap: Concluding a direct causal relationship ('ice cream causes drowning') from an observational correlation.*

*Explanation:* Random sampling lets the association extend to all the country's adults, but with no random assignment it can't show that coffee causes fewer headaches.

**2. Distinguishing Correlation from Causation · easy**

> Cities with more fire trucks tend to have more fires each year. Which is the most likely explanation for this association?

- **A. Larger cities tend to have both more fire trucks and more fires.** ✓
- B. Fire trucks cause fires to break out in cities. — *trap: Concluding a direct causal relationship ('ice cream causes drowning') from an observational correlation.*
- C. Having many fires makes a city's fire trucks less effective.
- D. The association proves that fire trucks do not prevent fires. — *trap: Failing to identify a plausible confounding variable that could explain both observed trends simultaneously.*

*Explanation:* City size drives both numbers, a classic confounding variable. Nothing suggests trucks cause fires.

**3. Distinguishing Correlation from Causation · hard**

> A study of 500 volunteers found that those who meditated daily reported lower stress than those who did not. The volunteers chose for themselves whether to meditate. Which conclusion is appropriate?

- **A. Among these volunteers, daily meditation is associated with lower stress.** ✓
- B. Daily meditation caused lower stress among these volunteers. — *trap: Concluding a direct causal relationship ('ice cream causes drowning') from an observational correlation.*
- C. Daily meditation causes lower stress in all adults. — *trap: Concluding a direct causal relationship ('ice cream causes drowning') from an observational correlation.*
- D. Among all adults, daily meditation is associated with lower stress.

*Explanation:* People chose whether to meditate (no random assignment), so only an association is supported, and volunteers aren't a random sample, so it applies only to them.

**4. Distinguishing Correlation from Causation · medium**

> A study finds that students who eat breakfast earn higher grades than students who don't. Which of the following, if it differed between the two groups, could be a confounding variable?

- **A. Family income, which could affect both breakfast habits and grades** ✓
- B. The number of students who took part in the study
- C. The day of the week on which grades were recorded
- D. The number of grades recorded for each student

*Explanation:* A confounding variable is linked to both breakfast and grades. Family income could affect both; the others aren't related to breakfast habits.

**5. Distinguishing Correlation from Causation · easy**

> Data from 50 countries show that countries with more internet users per person have longer average life expectancies. Which is the most reasonable interpretation?

- **A. A country's wealth may lead to both more internet use and longer lives.** ✓
- B. Using the internet makes people in a country live longer. — *trap: Concluding a direct causal relationship ('ice cream causes drowning') from an observational correlation.*
- C. Living longer causes people in a country to use the internet more. — *trap: Concluding a direct causal relationship ('ice cream causes drowning') from an observational correlation.*
- D. The data show no relationship between the two variables.

*Explanation:* A third factor such as wealth can raise both. The data show an association, but not that either one causes the other.

**6. Distinguishing Correlation from Causation · medium**

> A random sample of 1,000 households in a state found a strong positive association between household size and the number of hours of television the household watches. Which conclusion is supported?

- **A. Larger households in the state tend to watch more hours of television.** ✓
- B. Adding people to a household causes it to watch more television. — *trap: Concluding a direct causal relationship ('ice cream causes drowning') from an observational correlation.*
- C. Watching more television causes households to grow larger. — *trap: Concluding a direct causal relationship ('ice cream causes drowning') from an observational correlation.*
- D. The association holds only for the 1,000 households surveyed.

*Explanation:* The random sample supports an association for the state's households, but no causal claim in either direction.

**7. Distinguishing Correlation from Causation · easy**

> A researcher finds a strong negative association between the number of hours per week teens spend outdoors and how often they report feeling anxious. Which statement is supported?

- **A. Teens who spend more time outdoors tend to report feeling anxious less often.** ✓
- B. Spending time outdoors reduces how often teens feel anxious. — *trap: Concluding a direct causal relationship ('ice cream causes drowning') from an observational correlation.*
- C. Anxious teens should be required to spend more time outdoors. — *trap: Concluding a direct causal relationship ('ice cream causes drowning') from an observational correlation.*
- D. Teens who spend more time outdoors tend to report feeling anxious more often.

*Explanation:* A negative association means one goes up as the other goes down. That's all the data show; they don't show that time outdoors reduces anxiety.

**8. Evaluating Study Design for Causal Claims · hard**

> A researcher randomly selected 300 students from a university and then randomly assigned half of them to use a new study app. The app group scored higher on the final exam. To whom can the conclusion that the app caused higher scores be applied?

- **A. All students at the university** ✓
- B. Only the 150 students who used the app
- C. All college students in the country
- D. No one, because causal claims need a larger sample — *trap: Attributing a study's weakness to sample size or public perception when the actual, specific flaw is a missing control group or missing random assignment.*

*Explanation:* Random assignment supports a causal conclusion, and random selection from this university lets it extend to all of the university's students, but not beyond them.

**9. Evaluating Study Design for Causal Claims · easy**

> A gym wants to know whether a new warm-up routine reduces injuries. Which study design would best allow the gym to conclude that the routine causes fewer injuries?

- **A. Randomly assign members to the new routine or the old one, then compare injury rates.** ✓
- B. Compare injury rates of members who chose the new routine with those who didn't.
- C. Ask members whether they think the new routine has reduced their injuries.
- D. Compare this year's injury rate with last year's rate, before the routine existed.

*Explanation:* Only random assignment makes the two groups alike in everything except the routine. Members who choose the routine may already be more careful.

**10. Evaluating Study Design for Causal Claims · hard**

> In an experiment, 80 volunteers were randomly assigned to sleep either 6 hours or 8 hours before taking a memory test. The 8-hour group scored higher on average. Which conclusion is appropriate?

- **A. For people like these volunteers, more sleep likely caused the higher scores.** ✓
- B. More sleep causes higher memory scores for all adults.
- C. Only an association is shown, since the participants were volunteers. — *trap: Attributing a study's weakness to sample size or public perception when the actual, specific flaw is a missing control group or missing random assignment.*
- D. More sleep is proven to have raised every volunteer's score. — *trap: Accepting a causal claim as fully proven just because a study reports a statistically notable result, without checking the underlying design.*

*Explanation:* Random assignment supports cause and effect, but volunteers aren't a random sample of all adults. Using volunteers limits who the result applies to; it doesn't reduce the result to an association.

**11. Evaluating Study Design for Causal Claims · medium**

> An online poll on a news website asked visitors whether they supported a new tax, and 72% said no. Why can't this result be applied to all of the region's residents?

- **A. The respondents chose to take part, so they may not represent all residents.** ✓
- B. The poll did not randomly assign respondents to different groups.
- C. A result of 72% is too high to be an accurate measurement.
- D. The poll asked only one question about the new tax.

*Explanation:* Self-selected respondents (people who visit the site and choose to answer) can differ from the population. Random assignment matters for experiments, not for polls like this one.

**12. Evaluating Study Design for Causal Claims · medium**

> A company found that employees who used its standing desks took fewer sick days than other employees. Employees could request a standing desk if they wanted one. What is the main flaw in concluding that standing desks cause fewer sick days?

- **A. Employees who requested the desks may already have had healthier habits.** ✓
- B. The company may not have studied enough of its employees to be sure. — *trap: Attributing a study's weakness to sample size or public perception when the actual, specific flaw is a missing control group or missing random assignment.*
- C. Standing desks cost more than regular desks do.
- D. Sick days are recorded differently from one department to another.

*Explanation:* Employees chose the desks, so the two groups may differ in ways that affect health. That self-selection, not the number of employees, is the flaw.

**13. Evaluating Study Design for Causal Claims · hard**

> In a randomized experiment, 200 patients were randomly assigned to take a new drug or a placebo. 30% of the drug group improved, and 28% of the placebo group improved. Which conclusion is best?

- **A. The results give little evidence that the drug works better than the placebo.** ✓
- B. The drug is 2% more effective than the placebo, so it should be prescribed. — *trap: Accepting a causal claim as fully proven just because a study reports a statistically notable result, without checking the underlying design.*
- C. Because of random assignment, the drug is proven to be effective. — *trap: Accepting a causal claim as fully proven just because a study reports a statistically notable result, without checking the underlying design.*
- D. The placebo caused its group to improve more than the drug group did.

*Explanation:* A 2-point difference between groups of about 100 is small enough to be chance. Random assignment makes a causal conclusion possible, but only if there's a real difference to explain.

**14. Evaluating Study Design for Causal Claims · medium**

> A school tried a new math curriculum in its honors classes, and those students scored higher than students in regular classes. What is the biggest problem with concluding that the curriculum caused the higher scores?

- **A. Honors students would likely have scored higher even without the curriculum.** ✓
- B. The school may not have tested enough students to reach a conclusion. — *trap: Attributing a study's weakness to sample size or public perception when the actual, specific flaw is a missing control group or missing random assignment.*
- C. Math scores are difficult to compare fairly between different classes.
- D. The curriculum was used for only one school year.

*Explanation:* The groups differed before the curriculum began, so the comparison can't separate the curriculum from the students. There was no random assignment.

**15. Evaluating Study Design for Causal Claims · hard**

> Which study design supports both a causal conclusion and generalizing that conclusion to a larger population?

- **A. Randomly select people from the population, then randomly assign treatments.** ✓
- B. Randomly select people from the population, then let them choose treatments.
- C. Use volunteers, then randomly assign the volunteers to treatments.
- D. Use volunteers, then let the volunteers choose their own treatments.

*Explanation:* Random selection supports generalizing to the population; random assignment supports cause and effect. Only the first design has both.

