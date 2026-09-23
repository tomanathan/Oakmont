# Content batch 3 — review

The five Algebra subskills (35% of the Math section): Linear Equations in One Variable, Linear Functions, Linear Equations in Two Variables, Systems of Two Linear Equations, and Linear Inequalities.

- Every existing item was re-checked. All 62 answer keys were recomputed and are correct. One stem gave its answer away, one choice was ambiguous, and 10 items had the wrong pattern or were missing one that fits (listed below).
- Difficulty labels were brought in line with the SAT: 24 of the 62 were rated too hard (one rating went up). For example, 'same slope and same y-intercept: how many solutions?' was 'hard' and is now 'easy'.
- Wrong choices are tagged with the lesson trap they represent where one fits. Many older distractors are arbitrary numbers with no trap behind them, so they stay untagged; every new item was written so its wrong answers come from real mistakes.
- 15 new original items per subskill, each checked with SymPy (64 automatic answer checks). New items lean on the patterns the old bank barely covered: solving for an expression like 6x + 10 without finding x, no-solution/infinite-solution equations, perpendicular slopes, mixtures, and elimination shortcuts like adding the equations to get x + y directly.
- The length check from batch 2 flagged nothing here.
- Stacked equations (a system written on two lines) now keep their line breaks in the quiz; before, the two equations would have run together on one line.

Please flag anything that reads wrong. Choices are listed in authored order (students see them shuffled each sitting); ✓ marks the answer, and the trap tag follows each wrong choice.

## Linear Equations in One Variable (`m-linear-eq-1var`): 14 → 29 items

### Fixed

- **Item 3.** The stem gave its own answer away: 'no solution when k ≠ 7', keyed 'any k ≠ 7'. Rewritten as a real question: which k gives infinitely many solutions (7), with 'any value except 7' as the no-solution trap.
- **Item 5.** Was tagged as a plain isolate-the-variable equation; it's a word problem, so it now teaches (and reports) the translation traps.
- **Item 7.** Was tagged as a plain isolate-the-variable equation; it's a word problem, so it now teaches (and reports) the translation traps.
- **Item 10.** Was tagged as a plain isolate-the-variable equation; it's a word problem, so it now teaches (and reports) the translation traps.
- **Item 12.** Was tagged as a plain isolate-the-variable equation; it's a word problem, so it now teaches (and reports) the translation traps.
- **Item 14.** Was tagged as a plain isolate-the-variable equation; it's a word problem, so it now teaches (and reports) the translation traps.

### New items

**1. Solving for a Related Expression Without Fully Isolating x · medium**

> If 3x + 5 = 17, what is the value of 6x + 10?

- **A. 34** ✓
- B. 4 — *trap: Automatically solving all the way for x out of habit, even when the question never asks for x itself and a faster shortcut is available.*
- C. 24 — *trap: Isolating the wrong combination of terms — one that looks similar to the requested expression but isn't an exact match.*
- D. 22

*Explanation:* 6x + 10 is exactly 2(3x + 5), so it equals 2(17) = 34. No need to find x first.

**2. Solving for a Related Expression Without Fully Isolating x · medium**

> If x/3 + 2 = 7, what is the value of x + 6?

- **A. 21** ✓
- B. 15 — *trap: Automatically solving all the way for x out of habit, even when the question never asks for x itself and a faster shortcut is available.*
- C. 5 — *trap: Isolating the wrong combination of terms — one that looks similar to the requested expression but isn't an exact match.*
- D. 11

*Explanation:* x/3 = 5, so x = 15 and x + 6 = 21. Stopping at x = 15 answers a different question.

**3. Solving for a Related Expression Without Fully Isolating x · medium**

> If 4a - 8 = 20, what is the value of a - 2?

- **A. 5** ✓
- B. 7 — *trap: Automatically solving all the way for x out of habit, even when the question never asks for x itself and a faster shortcut is available.*
- C. 28 — *trap: Isolating the wrong combination of terms — one that looks similar to the requested expression but isn't an exact match.*
- D. 3

*Explanation:* 4a - 8 = 4(a - 2), so 4(a - 2) = 20 and a - 2 = 5.

**4. Solving for a Related Expression Without Fully Isolating x · hard**

> If 2(3y - 1) = 22, what is the value of 3y?

- **A. 12** ✓
- B. 4 — *trap: Automatically solving all the way for x out of habit, even when the question never asks for x itself and a faster shortcut is available.*
- C. 11 — *trap: Isolating the wrong combination of terms — one that looks similar to the requested expression but isn't an exact match.*
- D. 24 — *trap: Making an arithmetic slip when scaling the equation to match the requested expression's exact coefficient.*

*Explanation:* Divide by 2: 3y - 1 = 11, so 3y = 12. (y itself is 4, but the question asks for 3y.)

**5. Solving for a Related Expression Without Fully Isolating x · hard**

> If 7 - 2x = 3, what is the value of 4x - 14?

- **A. -6** ✓
- B. 2 — *trap: Automatically solving all the way for x out of habit, even when the question never asks for x itself and a faster shortcut is available.*
- C. 6 — *trap: Making an arithmetic slip when scaling the equation to match the requested expression's exact coefficient.*
- D. -10

*Explanation:* 4x - 14 = -2(7 - 2x) = -2(3) = -6. Or solve: x = 2, so 4(2) - 14 = -6.

**6. No-Solution and Infinite-Solution Equations · easy**

> How many solutions does the equation 3(x + 4) = 3x + 12 have?

- **A. Infinitely many** ✓
- B. No solution — *trap: Confusing 'no solution' (a false statement remains) with 'infinite solutions' (a true statement remains) after the x-terms cancel.*
- C. Exactly one — *trap: Trying to solve for x algebraically when the x-terms have already canceled — there's no value of x to find in this scenario.*
- D. Exactly two

*Explanation:* Distributing gives 3x + 12 = 3x + 12, which is true for every x.

**7. No-Solution and Infinite-Solution Equations · hard**

> In the equation 4(2x - 1) = 8x + c, c is a constant. If the equation has no solution, which of the following must be true?

- **A. c ≠ -4** ✓
- B. c = -4 — *trap: Confusing 'no solution' (a false statement remains) with 'infinite solutions' (a true statement remains) after the x-terms cancel.*
- C. c = 4
- D. c = 0

*Explanation:* Distributing gives 8x - 4 = 8x + c, so the x-terms cancel and -4 = c remains. If c = -4 there are infinitely many solutions; any other value leaves a false statement: no solution.

**8. No-Solution and Infinite-Solution Equations · medium**

> Which equation has no solution?

- **A. 2(x + 3) = 2x + 5** ✓
- B. 2(x + 3) = 2x + 6 — *trap: Confusing 'no solution' (a false statement remains) with 'infinite solutions' (a true statement remains) after the x-terms cancel.*
- C. 2(x + 3) = 3x + 6
- D. 2(x + 3) = x + 6

*Explanation:* 2(x + 3) = 2x + 6. With 2x + 5 on the right, the x-terms cancel and 6 = 5 is false: no solution. 2x + 6 gives infinitely many; the other two have one solution each.

**9. Translating a Word Problem into an Equation · medium**

> Maria has $240 in savings and adds $15 each week. Jon has $420 and spends $15 each week. After how many weeks will they have the same amount of money?

- **A. 6** ✓
- B. 12
- C. 18
- D. 4

*Explanation:* 240 + 15w = 420 - 15w, so 30w = 180 and w = 6. Using only one person's $15 per week gives 12.

**10. Translating a Word Problem into an Equation · hard**

> Five less than three times a number is equal to the number increased by 11. What is the number?

- **A. 8** ✓
- B. -1.5 — *trap: Translating 'less than' in the same left-to-right order it's spoken, instead of reversing which quantity comes first in the equation.*
- C. 13 — *trap: Trying to translate an entire sentence in one pass instead of working through it phrase by phrase, which is where translation errors usually happen.*
- D. 4

*Explanation:* 'Five less than three times a number' is 3n - 5, so 3n - 5 = n + 11 and n = 8. Writing 5 - 3n reverses 'less than' and gives -1.5; writing 3(n - 5) gives 13.

**11. Translating a Word Problem into an Equation · easy**

> A plumber charges a $65 service fee plus $48 per hour of work. Which equation gives the total charge C, in dollars, for h hours of work?

- **A. C = 48h + 65** ✓
- B. C = 65h + 48 — *trap: Confusing which quantity is the rate (multiplied by the variable) and which is the fixed starting amount (added as a constant) in a per-unit word problem.*
- C. C = 113h
- D. C = 48(h + 65)

*Explanation:* The $48 is charged per hour, so it multiplies h; the $65 fee is charged once, so it's added on its own.

**12. Translating a Word Problem into an Equation · hard**

> After a $12 discount, the price of a jacket is two-thirds of its original price. What was the original price, in dollars?

- **A. 36** ✓
- B. 24
- C. 18
- D. 8

*Explanation:* p - 12 = (2/3)p, so (1/3)p = 12 and p = 36. The discounted price is $24.

**13. Standard Isolate-the-Variable Equations · easy**

> What value of x satisfies (3/4)x - 5 = 7?

- **A. 16** ✓
- B. 9
- C. 8/3
- D. 3

*Explanation:* Add 5: (3/4)x = 12. Multiply by 4/3: x = 16. Multiplying 12 by 3/4 instead gives 9.

**14. Standard Isolate-the-Variable Equations · hard**

> What value of x satisfies 0.4(x - 20) = 0.2x + 6?

- **A. 70** ✓
- B. 130 — *trap: Forgetting to apply an operation to every term on both sides of the equation, not just one term.*
- C. -10 — *trap: Sign errors when distributing a negative number across parentheses.*
- D. 35

*Explanation:* 0.4x - 8 = 0.2x + 6, so 0.2x = 14 and x = 70. Not distributing to the 20 gives 130; making -8 into +8 gives -10.

**15. Standard Isolate-the-Variable Equations · medium**

> What value of x satisfies 2x/3 + 1 = x - 4?

- **A. 15** ✓
- B. 13 — *trap: Forgetting to apply an operation to every term on both sides of the equation, not just one term.*
- C. -15 — *trap: Sign errors when distributing a negative number across parentheses.*
- D. 5

*Explanation:* Multiply every term by 3: 2x + 3 = 3x - 12, so x = 15. Multiplying only some terms by 3 gives 13.

## Linear Functions (`m-linear-func`): 12 → 27 items

### New items

**1. Evaluating a Function and Solving for Input Given Output · easy**

> If f(x) = 4x - 9, what is the value of f(-3)?

- **A. -21** ✓
- B. 3 — *trap: Sign errors when substituting a negative input into a function with a negative coefficient.*
- C. -3
- D. 21

*Explanation:* f(-3) = 4(-3) - 9 = -12 - 9 = -21. Dropping the negative sign on -3 gives 3.

**2. Evaluating a Function and Solving for Input Given Output · medium**

> The function g is defined by g(x) = 5x + 2. If g(k) = 37, what is the value of k?

- **A. 7** ✓
- B. 187 — *trap: Substituting the given value for f(x) itself rather than for x — these are the output and input respectively, not interchangeable.*
- C. 39
- D. 5

*Explanation:* g(k) = 37 is an output: 5k + 2 = 37, so k = 7. Plugging 37 in as the input gives g(37) = 187.

**3. Evaluating a Function and Solving for Input Given Output · hard**

> If f(x) = 3x - 4, which expression is equivalent to f(x + 2)?

- **A. 3x + 2** ✓
- B. 3x - 2 — *trap: When the input is an expression rather than a plain number, forgetting to substitute the entire expression (not just part of it) everywhere x appears in the rule.*
- C. 3x + 6 — *trap: When the input is an expression rather than a plain number, forgetting to substitute the entire expression (not just part of it) everywhere x appears in the rule.*
- D. 5x - 4

*Explanation:* Replace every x with (x + 2): 3(x + 2) - 4 = 3x + 6 - 4 = 3x + 2. Adding 2 without multiplying it by 3 gives 3x - 2.

**4. Finding Slope from Two Points or Function Values · medium**

> A linear function f satisfies f(2) = 11 and f(6) = 23. What is the value of f(10)?

- **A. 35** ✓
- B. 3
- C. 31
- D. 47

*Explanation:* The slope is (23 - 11)/(6 - 2) = 3, so each increase of 4 in x adds 12: f(10) = 23 + 12 = 35. The slope itself is 3.

**5. Finding Slope from Two Points or Function Values · hard**

> For x = 1, 3, and 5, a linear function takes the values 7, 13, and 19, respectively. Which equation defines the function?

- **A. y = 3x + 4** ✓
- B. y = 6x + 1
- C. y = (1/3)x + 20/3 — *trap: Flipping the slope formula's numerator and denominator (using change in input over change in output).*
- D. y = 3x + 7

*Explanation:* y rises by 6 each time x rises by 2, so the slope is 6/2 = 3. Then 7 = 3(1) + b gives b = 4. Using 6 as the slope ignores that x goes up by 2, not 1.

**6. Extracting Slope and Intercept from a Real-World Scenario · easy**

> A phone battery is at 85% charge and loses 4 percentage points of charge per hour of use. Which function gives the charge C(h), in percent, after h hours of use?

- **A. C(h) = 85 - 4h** ✓
- B. C(h) = 85 + 4h — *trap: Forgetting that a decreasing quantity (like a draining tank) needs a negative sign on the rate term, not just the rate's numeric value.*
- C. C(h) = 4 - 85h — *trap: Swapping which number is the slope and which is the intercept, especially when the flat fee is mentioned first in the sentence.*
- D. C(h) = 81h

*Explanation:* Start at 85 and subtract 4 for each hour: 85 - 4h. The rate term needs a negative sign because the charge is decreasing.

**7. Extracting Slope and Intercept from a Real-World Scenario · medium**

> The function P(t) = 18t + 240 gives the total number of pages a student has read t days after starting a summer reading log. What is the best interpretation of 18 in this context?

- **A. The student reads 18 pages per day.** ✓
- B. The student had read 18 pages when the log began. — *trap: Swapping which number is the slope and which is the intercept, especially when the flat fee is mentioned first in the sentence.*
- C. The student reads for 18 days.
- D. The student will finish the log in 18 days.

*Explanation:* 18 multiplies t, the number of days, so it's the rate: pages per day. The 240 is the number already read when the log began.

**8. Extracting Slope and Intercept from a Real-World Scenario · hard**

> A taxi ride costs $2.50 plus $1.75 per mile. A rider has $20. What is the greatest whole number of miles the rider can travel?

- **A. 10** ✓
- B. 11
- C. 12
- D. 9

*Explanation:* 2.50 + 1.75m ≤ 20, so 1.75m ≤ 17.50 and m ≤ 10. Ignoring the $2.50 fee gives 20/1.75 ≈ 11.4, or 11 miles.

**9. Finding Slope from Two Points or Function Values · medium**

> A bamboo plant grows at a constant rate. It was 30 centimeters tall on day 4 and 66 centimeters tall on day 10. How tall was it on day 0, in centimeters?

- **A. 6** ✓
- B. 30
- C. 36
- D. 12

*Explanation:* The rate is (66 - 30)/(10 - 4) = 6 cm per day. Four days before day 4 it was 30 - 4(6) = 6 cm.

**10. Evaluating a Function and Solving for Input Given Output · medium**

> If h(x) = -2x + 5, what is the value of h(-4)?

- **A. 13** ✓
- B. -3 — *trap: Sign errors when substituting a negative input into a function with a negative coefficient.*
- C. 3
- D. -13

*Explanation:* h(-4) = -2(-4) + 5 = 8 + 5 = 13. A negative times a negative is positive; treating -2(-4) as -8 gives -3.

**11. Evaluating a Function and Solving for Input Given Output · hard**

> The function f is defined by f(x) = (1/2)x - 3. For what value of x is f(x) = 5?

- **A. 16** ✓
- B. -0.5 — *trap: Substituting the given value for f(x) itself rather than for x — these are the output and input respectively, not interchangeable.*
- C. 4
- D. 1

*Explanation:* Set the output to 5: (1/2)x - 3 = 5, so (1/2)x = 8 and x = 16. f(5) = -0.5 answers a different question.

**12. Reading Slope and Intercept Directly from a Graph · medium**

> The graph of a linear function f in the xy-plane passes through (0, -6) and (3, 0). What is the value of f(5)?

- **A. 4** ✓
- B. -6 — *trap: Confusing the x-intercept (where the line crosses the x-axis) with the y-intercept when the question asks for one specifically.*
- C. 3 — *trap: Confusing the x-intercept (where the line crosses the x-axis) with the y-intercept when the question asks for one specifically.*
- D. 16

*Explanation:* The slope is (0 - (-6))/(3 - 0) = 2 and the y-intercept is -6, so f(5) = 2(5) - 6 = 4. The 3 is the x-intercept, and -6 is the y-intercept, not f(5).

**13. Reading Slope and Intercept Directly from a Graph · hard**

> A line in the xy-plane has an x-intercept of 4 and a y-intercept of -2. What is the slope of the line?

- **A. 1/2** ✓
- B. 2 — *trap: Misreading which axis is which, especially when the graph's scale isn't 1 unit per gridline.*
- C. -1/2
- D. -2 — *trap: Confusing the x-intercept (where the line crosses the x-axis) with the y-intercept when the question asks for one specifically.*

*Explanation:* The line passes through (4, 0) and (0, -2): slope = (0 - (-2))/(4 - 0) = 2/4 = 1/2. Swapping rise and run gives 2.

**14. Extracting Slope and Intercept from a Real-World Scenario · hard**

> Company A charges $40 plus $0.15 per mile to rent a truck. Company B charges $25 plus $0.25 per mile. For how many miles will the two companies charge the same amount?

- **A. 150** ✓
- B. 100
- C. 60
- D. 37.5

*Explanation:* 40 + 0.15m = 25 + 0.25m, so 15 = 0.10m and m = 150.

**15. Evaluating a Function and Solving for Input Given Output · hard**

> If f(x) = 2x + 1 and f(a) = 9, what is the value of f(2a)?

- **A. 17** ✓
- B. 18 — *trap: When the input is an expression rather than a plain number, forgetting to substitute the entire expression (not just part of it) everywhere x appears in the rule.*
- C. 8
- D. 19 — *trap: Substituting the given value for f(x) itself rather than for x — these are the output and input respectively, not interchangeable.*

*Explanation:* f(a) = 9 means 2a + 1 = 9, so a = 4 and f(2a) = f(8) = 17. Doubling f(a) gives 18, and f(9) = 19 uses the output as an input.

## Linear Equations in Two Variables (`m-linear-eq-2var`): 12 → 27 items

### Fixed

- **Item 2.** Choice 'y = -1/2x + 5' can be read as -1/(2x). Now written 'y = -(1/2)x + 5'.
- **Item 3.** Slope from two points was tagged 'Extracting Slope from Standard Form'. No pattern in this lesson covers it, so it's untagged.
- **Item 4.** Parallel-line item had no pattern; now tagged 'Parallel and Perpendicular Line Relationships'.
- **Item 12.** Had no pattern; now tagged 'Solving for One Variable Given the Other's Value'.

### New items

**1. Extracting Slope from Standard Form · medium**

> What is the slope of the line 3x - 4y = 12 in the xy-plane?

- **A. 3/4** ✓
- B. -3/4 — *trap: Sign errors when dividing negative coefficients across the equation.*
- C. 3 — *trap: Reading the coefficient of x in standard form directly as the slope, without converting — this gives the wrong sign or value.*
- D. -3

*Explanation:* Solve for y: -4y = -3x + 12, so y = (3/4)x - 3. The slope is 3/4. Reading the 3 straight off standard form gives the wrong value.

**2. Extracting Slope from Standard Form · hard**

> In the xy-plane, the line 2x + ky = 10, where k is a constant, has a slope of -1/3. What is the value of k?

- **A. 6** ✓
- B. -6 — *trap: Sign errors when dividing negative coefficients across the equation.*
- C. 3
- D. 2/3

*Explanation:* Solving for y gives slope -2/k. Setting -2/k = -1/3 gives k = 6.

**3. Extracting Slope from Standard Form · medium**

> What is the y-intercept of the graph of 5x - 2y = 14 in the xy-plane?

- **A. (0, -7)** ✓
- B. (0, 7) — *trap: Sign errors when dividing negative coefficients across the equation.*
- C. (14/5, 0)
- D. (0, -5/2)

*Explanation:* Set x = 0: -2y = 14, so y = -7. (14/5, 0) is the x-intercept.

**4. Parallel and Perpendicular Line Relationships · medium**

> Line k passes through (0, 4) and is parallel to the line y = -3x + 1. Which equation defines line k?

- **A. y = -3x + 4** ✓
- B. y = (1/3)x + 4 — *trap: Confusing parallel (same slope) and perpendicular (negative reciprocal slope) rules under time pressure.*
- C. y = 3x + 4
- D. y = -3x + 1

*Explanation:* Parallel lines have the same slope, -3, and the line crosses the y-axis at 4: y = -3x + 4. The last choice is the original line itself.

**5. Parallel and Perpendicular Line Relationships · hard**

> Line m passes through the origin and is perpendicular to the line 2x + 5y = 7. Which equation defines line m?

- **A. y = (5/2)x** ✓
- B. y = -(5/2)x — *trap: Taking only the reciprocal (flipping the fraction) without also changing the sign — perpendicular slopes require both steps.*
- C. y = -(2/5)x — *trap: Confusing parallel (same slope) and perpendicular (negative reciprocal slope) rules under time pressure.*
- D. y = (2/5)x

*Explanation:* 2x + 5y = 7 has slope -2/5. A perpendicular slope is the negative reciprocal: 5/2. Flipping the fraction without changing the sign gives -5/2.

**6. Parallel and Perpendicular Line Relationships · medium**

> Lines ℓ and n are perpendicular. Line ℓ passes through (1, 2) and (4, 8). What is the slope of line n?

- **A. -1/2** ✓
- B. 1/2 — *trap: Taking only the reciprocal (flipping the fraction) without also changing the sign — perpendicular slopes require both steps.*
- C. -2
- D. 2 — *trap: Confusing parallel (same slope) and perpendicular (negative reciprocal slope) rules under time pressure.*

*Explanation:* Line ℓ has slope (8 - 2)/(4 - 1) = 2, so line n has slope -1/2.

**7. Interpreting a Constant or Coefficient in a Real-World Equation · medium**

> A school cafeteria's weekly lunch purchases satisfy 3.5s + 5t = 1,400, where s is the number of student lunches and t is the number of teacher lunches. What does 5 represent in this context?

- **A. The cost, in dollars, of one teacher lunch** ✓
- B. The cost, in dollars, of one student lunch — *trap: Assigning a number's meaning to the wrong variable when the equation involves two related quantities.*
- C. The total weekly lunch budget, in dollars — *trap: Confusing the coefficient (multiplies a variable, representing a rate) with the constant term (stands alone, representing a fixed starting amount).*
- D. The number of teacher lunches purchased each week

*Explanation:* 5 multiplies t, the number of teacher lunches, so it's the price per teacher lunch. 1,400 is the total budget.

**8. Interpreting a Constant or Coefficient in a Real-World Equation · medium**

> The equation y = 900 - 60x gives the distance y, in miles, a train still has to travel x hours after leaving the station. What does 900 represent?

- **A. The total length of the trip, in miles** ✓
- B. The train's speed, in miles per hour — *trap: Confusing the coefficient (multiplies a variable, representing a rate) with the constant term (stands alone, representing a fixed starting amount).*
- C. The number of hours the trip takes
- D. The distance the train travels in 60 hours

*Explanation:* When x = 0 the train hasn't left yet, so y = 900 is the whole trip. 60 is the speed.

**9. Interpreting a Constant or Coefficient in a Real-World Equation · hard**

> The equation y = 900 - 60x gives the distance y, in miles, a train still has to travel x hours after leaving the station. What is the x-intercept of the graph, and what does it represent?

- **A. 15; the number of hours the whole trip takes** ✓
- B. 900; the total length of the trip, in miles
- C. 60; the train's speed, in miles per hour — *trap: Confusing the coefficient (multiplies a variable, representing a rate) with the constant term (stands alone, representing a fixed starting amount).*
- D. 15; the train's speed, in miles per hour — *trap: Overlooking the units or context needed to state precisely what the number represents, rather than just restating the number itself.*

*Explanation:* Set y = 0: 900 = 60x, so x = 15. The distance left reaches 0 after 15 hours, when the trip ends.

**10. Translating a Word Scenario into a Two-Variable Equation · easy**

> A florist sells roses for $3 each and tulips for $2 each. She earns $250 from selling r roses and t tulips. Which equation represents this situation?

- **A. 3r + 2t = 250** ✓
- B. 2r + 3t = 250 — *trap: Multiplying the wrong quantity by a rate or price — double-check which variable each per-unit value actually belongs to.*
- C. 5(r + t) = 250
- D. r + t = 250

*Explanation:* Each rose brings $3 and each tulip $2, so the earnings are 3r + 2t. Swapping the prices is the most common error.

**11. Translating a Word Scenario into a Two-Variable Equation · hard**

> A gym charges a one-time $60 fee plus $25 per month. Over m months, a member has also bought p protein bars at $2.50 each and spent $235 in total. Which equation represents this situation?

- **A. 60 + 25m + 2.50p = 235** ✓
- B. 60m + 25 + 2.50p = 235 — *trap: Treating a one-time fixed cost as if it needed to be multiplied by a variable, when it should remain a standalone constant.*
- C. 85m + 2.50p = 235 — *trap: Treating a one-time fixed cost as if it needed to be multiplied by a variable, when it should remain a standalone constant.*
- D. 60 + 25m + 2.50 = 235p

*Explanation:* The $60 fee is paid once, so it stands alone; $25 is per month and $2.50 is per bar. Multiplying the one-time fee by m is the classic mistake.

**12. Translating a Word Scenario into a Two-Variable Equation · hard**

> A chemist mixes x liters of a 10% acid solution with y liters of a 30% acid solution to make 20 liters of a 25% acid solution. Which system of equations represents this situation?

- **A. x + y = 20 and 0.10x + 0.30y = 5** ✓
- B. x + y = 20 and 0.10x + 0.30y = 0.25 — *trap: In mixture problems, forgetting that both the total volume AND the total concentration need their own accounting — losing track of one of the two relationships the scenario describes.*
- C. x + y = 5 and 0.10x + 0.30y = 20 — *trap: In mixture problems, forgetting that both the total volume AND the total concentration need their own accounting — losing track of one of the two relationships the scenario describes.*
- D. x + y = 20 and 0.10x + 0.30y = 25

*Explanation:* The volumes add to 20 liters. The acid adds too: 25% of 20 liters is 5 liters of acid, so 0.10x + 0.30y = 5.

**13. Solving for One Variable Given the Other's Value · medium**

> The equation 4x - 3y = 24 relates x and y. What is the value of y when x = 3?

- **A. -4** ✓
- B. 4 — *trap: Sign errors when isolating a variable that has a negative coefficient after substitution.*
- C. 8.25 — *trap: Substituting the known value for the wrong variable in the equation.*
- D. 12

*Explanation:* Substitute x = 3: 12 - 3y = 24, so -3y = 12 and y = -4. Substituting 3 for y instead gives x = 8.25.

**14. Solving for One Variable Given the Other's Value · medium**

> If (a, 7) is a solution to the equation 3x + 2y = 29, what is the value of a?

- **A. 5** ✓
- B. 4 — *trap: Substituting the known value for the wrong variable in the equation.*
- C. 43/3 — *trap: Sign errors when isolating a variable that has a negative coefficient after substitution.*
- D. 7

*Explanation:* The point's y-value is 7: 3a + 2(7) = 29, so 3a = 15 and a = 5. Putting 7 in for x gives 4.

**15. Solving for One Variable Given the Other's Value · hard**

> In the equation 2x + 5y = 40, y = x - 6. What is the value of x?

- **A. 10** ✓
- B. 4
- C. 46/7 — *trap: Rushing the substitution step and simplifying incorrectly, especially when the known 'value' is itself an expression rather than a plain number.*
- D. 34/7 — *trap: Sign errors when isolating a variable that has a negative coefficient after substitution.*

*Explanation:* Substitute the whole expression: 2x + 5(x - 6) = 40, so 7x - 30 = 40 and x = 10. Multiplying only the x by 5 gives 46/7.

## Systems of Two Linear Equations (`m-systems`): 12 → 27 items

### New items

**1. Solving for a Specific Value via Elimination · easy**

> 3x + 2y = 16  
> 3x - 2y = 8
>
> What is the value of x in the solution to the system of equations above?

- **A. 4** ✓
- B. 2
- C. 8/3
- D. 6

*Explanation:* Adding the equations eliminates y: 6x = 24, so x = 4.

**2. Solving for a Specific Value via Elimination · hard**

> 2x + 3y = 17  
> 3x + 2y = 18
>
> If (x, y) is the solution to the system above, what is the value of x + y?

- **A. 7** ✓
- B. 35
- C. 4
- D. 1

*Explanation:* Adding the equations gives 5x + 5y = 35, so x + y = 7 with no need to find x and y. Subtracting gives x - y = 1 instead.

**3. Solving for a Specific Value via Elimination · hard**

> 5x - 3y = 11  
> 2x - 3y = 2
>
> What is the value of y in the solution to the system above?

- **A. 4/3** ✓
- B. 3
- C. -4/3 — *trap: Sign errors when subtracting (rather than adding) equations — subtracting requires distributing a negative sign across an entire equation.*
- D. 13/3

*Explanation:* Subtracting the second equation from the first gives 3x = 9, so x = 3. Then 2(3) - 3y = 2, so y = 4/3.

**4. Solving for a Specific Value via Elimination · medium**

> A theater sold 300 tickets. Adult tickets cost $12 and student tickets cost $7, and total sales were $2,900. How many student tickets were sold?

- **A. 140** ✓
- B. 160
- C. 150
- D. 100

*Explanation:* a + s = 300 and 12a + 7s = 2,900. Substituting a = 300 - s gives 3,600 - 5s = 2,900, so s = 140. 160 is the number of adult tickets.

**5. Solving for a Specific Value via Elimination · hard**

> A coffee shop sells small drinks for $3 and large drinks for $5. One morning it sold 70 drinks for a total of $270. How many more small drinks than large drinks did it sell?

- **A. 10** ✓
- B. 40
- C. 30
- D. 70

*Explanation:* s + l = 70 and 3s + 5l = 270, so 210 + 2l = 270, l = 30 and s = 40. The difference is 10.

**6. Solving for a Specific Value via Elimination · hard**

> 4x - y = 10  
> 2x + 3y = 12
>
> If (x, y) is the solution to the system above, what is the value of 6x + 2y?

- **A. 22** ✓
- B. 5
- C. -2 — *trap: Sign errors when subtracting (rather than adding) equations — subtracting requires distributing a negative sign across an entire equation.*
- D. 18

*Explanation:* Adding the equations gives exactly 6x + 2y = 22. Subtracting instead gives 2x - 4y = -2.

**7. Solving for a Specific Value via Elimination · medium**

> 0.5x + 0.2y = 4  
> x - 0.2y = 5
>
> What is the value of x in the solution to the system above?

- **A. 6** ✓
- B. 5
- C. 9
- D. 18

*Explanation:* Adding the equations eliminates y: 1.5x = 9, so x = 6.

**8. Solving for a Specific Value via Elimination · easy**

> The sum of two numbers is 58 and their difference is 14. What is the larger number?

- **A. 36** ✓
- B. 22
- C. 44
- D. 29

*Explanation:* x + y = 58 and x - y = 14. Adding gives 2x = 72, so x = 36. 22 is the smaller number.

**9. Determining the Number of Solutions Without Fully Solving · medium**

> How many solutions does the system 2x - y = 5 and 4x - 2y = 10 have?

- **A. Infinitely many** ✓
- B. Exactly one
- C. No solution
- D. Exactly two

*Explanation:* The second equation is the first multiplied by 2, so both describe the same line.

**10. Determining the Number of Solutions Without Fully Solving · hard**

> 3x + ky = 9  
> 6x + 4y = 18
>
> In the system above, k is a constant. For what value of k does the system have infinitely many solutions?

- **A. 2** ✓
- B. 4 — *trap: Forgetting to convert equations to a comparable form (like slope-intercept) before comparing slopes and intercepts.*
- C. -2
- D. 1/2

*Explanation:* The second equation is 2 times the first when every coefficient doubles: 2k = 4, so k = 2. Copying the 4 across compares the equations without scaling them.

**11. Determining the Number of Solutions Without Fully Solving · hard**

> y = 4x + 3  
> 8x - 2y = c
>
> In the system above, c is a constant. For what value of c does the system have infinitely many solutions?

- **A. -6** ✓
- B. 6
- C. 3
- D. -3

*Explanation:* Substituting y: 8x - 2(4x + 3) = c, so -6 = c. With c = -6 every point on the line works; any other c gives no solution.

**12. Determining the Number of Solutions Without Fully Solving · medium**

> Which of the following systems of equations has no solution?

- **A. y = 2x + 1 and y = 2x - 4** ✓
- B. y = 2x + 1 and y = -2x + 1
- C. y = 2x + 1 and 4x - 2y = -2 — *trap: Forgetting to convert equations to a comparable form (like slope-intercept) before comparing slopes and intercepts.*
- D. y = 2x + 1 and 2y = 4x + 2 — *trap: Forgetting to convert equations to a comparable form (like slope-intercept) before comparing slopes and intercepts.*

*Explanation:* Same slope and different y-intercepts means parallel lines that never meet. The last two choices are the same line as y = 2x + 1 rewritten, so they have infinitely many solutions.

**13. Determining the Number of Solutions Without Fully Solving · hard**

> How many solutions does the system x + 3y = 6 and 2x + 6y = 15 have?

- **A. No solution** ✓
- B. Infinitely many — *trap: Forgetting to convert equations to a comparable form (like slope-intercept) before comparing slopes and intercepts.*
- C. Exactly one
- D. Exactly two

*Explanation:* In slope-intercept form, y = -x/3 + 2 and y = -x/3 + 2.5: same slope, different intercepts, so the lines are parallel. Doubling the first equation gives 2x + 6y = 12, not 15, so the lines never meet.

**14. Determining the Number of Solutions Without Fully Solving · easy**

> A system of two linear equations has exactly one solution. Which statement must be true?

- **A. The lines have different slopes.** ✓
- B. The lines have the same slope and different y-intercepts.
- C. The lines have the same slope and the same y-intercept.
- D. The lines have the same y-intercept.

*Explanation:* Lines cross at exactly one point only when their slopes differ. Equal slopes give either no solution or infinitely many.

**15. Determining the Number of Solutions Without Fully Solving · medium**

> 2x + by = 7  
> 4x + 10y = 14
>
> In the system above, b is a constant. If the system has infinitely many solutions, what is the value of b?

- **A. 5** ✓
- B. 10 — *trap: Forgetting to convert equations to a comparable form (like slope-intercept) before comparing slopes and intercepts.*
- C. 2.5
- D. 7

*Explanation:* Doubling the first equation must give the second: 2b = 10, so b = 5.

## Linear Inequalities (`m-linear-ineq`): 12 → 27 items

### Fixed

- **Item 2.** Checking which point satisfies an inequality was tagged 'Sign-Flip Rule'. Retagged to 'Matching a Graph, Table, or Point'.
- **Item 9.** Same retag. Two of its wrong points sit exactly on the boundary line, now tagged with the boundary-point trap.

### New items

**1. Solving with the Sign-Flip Rule · easy**

> Which inequality is equivalent to -4x + 7 ≥ 23?

- **A. x ≤ -4** ✓
- B. x ≥ -4 — *trap: Forgetting to flip the inequality sign when dividing or multiplying by a negative number.*
- C. x ≤ 4
- D. x ≥ -7.5

*Explanation:* Subtract 7: -4x ≥ 16. Dividing by -4 flips the sign: x ≤ -4.

**2. Solving with the Sign-Flip Rule · hard**

> Which inequality is equivalent to (3 - 2x)/5 < 1?

- **A. x > -1** ✓
- B. x < -1 — *trap: Forgetting to flip the inequality sign when dividing or multiplying by a negative number.*
- C. x > 1
- D. x < 1

*Explanation:* Multiply by 5: 3 - 2x < 5, so -2x < 2. Dividing by -2 flips the sign: x > -1.

**3. Solving with the Sign-Flip Rule · easy**

> Which inequality is equivalent to x - 9 > -4?

- **A. x > 5** ✓
- B. x < 5 — *trap: Flipping the sign unnecessarily when the operation involved was addition/subtraction rather than multiplication/division by a negative.*
- C. x > -13
- D. x < -13

*Explanation:* Add 9 to both sides: x > 5. Adding never flips the sign; only multiplying or dividing by a negative does.

**4. Solving with the Sign-Flip Rule · hard**

> Which values of x satisfy -3 < 2x + 5 ≤ 11?

- **A. -4 < x ≤ 3** ✓
- B. -4 ≤ x < 3
- C. -1 < x ≤ 8
- D. -3 < x ≤ 6

*Explanation:* Subtract 5 from all three parts: -8 < 2x ≤ 6. Divide by 2: -4 < x ≤ 3. The strict and non-strict ends stay where they were.

**5. Solving with the Sign-Flip Rule · medium**

> Which inequality is equivalent to 3(x - 2) ≥ 5x + 4?

- **A. x ≤ -5** ✓
- B. x ≥ -5 — *trap: Forgetting to flip the inequality sign when dividing or multiplying by a negative number.*
- C. x ≤ 5
- D. x ≥ 5

*Explanation:* 3x - 6 ≥ 5x + 4, so -2x ≥ 10. Dividing by -2 flips the sign: x ≤ -5.

**6. Word Problems with Inequality Language · medium**

> A club needs at least $600 for a trip. It has raised $180 so far and earns $15 for each car it washes. Which inequality represents the number of cars, c, the club must wash to reach its goal?

- **A. 180 + 15c ≥ 600** ✓
- B. 180 + 15c > 600 — *trap: Using strict inequality (> or <) when the phrase 'at least' or 'at most' actually requires ≥ or ≤ (allowing the boundary value itself).*
- C. 15c ≥ 600
- D. 180c + 15 ≥ 600

*Explanation:* 'At least $600' includes exactly $600, so the sign is ≥. The $180 already raised is added once; $15 is earned per car.

**7. Word Problems with Inequality Language · medium**

> A club needs at least $600 for a trip. It has raised $180 so far and earns $15 for each car it washes. What is the minimum number of cars the club must wash?

- **A. 28** ✓
- B. 29 — *trap: Using strict inequality (> or <) when the phrase 'at least' or 'at most' actually requires ≥ or ≤ (allowing the boundary value itself).*
- C. 40
- D. 52

*Explanation:* 180 + 15c ≥ 600, so 15c ≥ 420 and c ≥ 28. Exactly 28 cars reaches $600, which counts as 'at least.' Ignoring the $180 gives 40.

**8. Word Problems with Inequality Language · hard**

> Kai's scores on four quizzes are 78, 85, 90, and 82. What is the lowest score on a fifth quiz that will give Kai an average of at least 85 on all five quizzes?

- **A. 90** ✓
- B. 85 — *trap: Forgetting to multiply through by the total count when solving an average-based inequality, leading to an incorrect setup.*
- C. 89
- D. 92

*Explanation:* The five scores must total at least 5(85) = 425. The first four total 335, so the fifth must be at least 90. Scoring just 85 keeps the average below 85.

**9. Word Problems with Inequality Language · medium**

> An elevator can carry at most 1,500 pounds. A worker who weighs 180 pounds rides with boxes that weigh 45 pounds each. What is the greatest number of boxes the worker can bring?

- **A. 29** ✓
- B. 30
- C. 33
- D. 28

*Explanation:* 180 + 45b ≤ 1,500, so b ≤ 29.3, and the greatest whole number of boxes is 29. Rounding up to 30 goes over the limit; ignoring the worker's weight gives 33.

**10. Word Problems with Inequality Language · hard**

> A phone plan costs $35 per month plus $0.05 per text message. A student wants to spend less than $50 in a month. What is the greatest number of text messages the student can send?

- **A. 299** ✓
- B. 300 — *trap: Using strict inequality (> or <) when the phrase 'at least' or 'at most' actually requires ≥ or ≤ (allowing the boundary value itself).*
- C. 1,000
- D. 700

*Explanation:* 35 + 0.05t < 50, so t < 300. 'Less than' excludes exactly $50, so 300 texts is too many and the answer is 299.

**11. Matching a Graph, Table, or Point to an Inequality or System · medium**

> Which point (x, y) is a solution to the inequality y > 3x - 2?

- **A. (1, 2)** ✓
- B. (2, 4) — *trap: Testing a point that's exactly on the boundary line rather than clearly inside the shaded region, which doesn't reveal which direction the inequality points.*
- C. (0, -3)
- D. (3, 6)

*Explanation:* (1, 2): 2 > 1 ✓. (2, 4) lands exactly on the boundary (4 > 4 is false), and the other two fall below the line.

**12. Matching a Graph, Table, or Point to an Inequality or System · hard**

> Which point (x, y) is a solution to the system of inequalities y ≤ x + 4 and y > -2x + 1?

- **A. (1, 3)** ✓
- B. (0, 0) — *trap: Forgetting that a point must satisfy every inequality in a system to count as a solution — satisfying most of them isn't enough.*
- C. (-2, 3)
- D. (2, 7) — *trap: Forgetting that a point must satisfy every inequality in a system to count as a solution — satisfying most of them isn't enough.*

*Explanation:* (1, 3) satisfies both: 3 ≤ 5 and 3 > -1. (0, 0) satisfies only the first, and (2, 7) only the second. A solution must satisfy every inequality.

**13. Matching a Graph, Table, or Point to an Inequality or System · hard**

> Which set of points consists only of solutions to y < 2x + 1?

- **A. (0, 0), (1, 2), (2, 4)** ✓
- B. (0, 0), (1, 3), (2, 4) — *trap: Concluding a table or graph matches an inequality after checking only some of the given points, rather than every single one.*
- C. (0, 2), (1, 2), (2, 4) — *trap: Concluding a table or graph matches an inequality after checking only some of the given points, rather than every single one.*
- D. (1, 1), (2, 6), (3, 5) — *trap: Concluding a table or graph matches an inequality after checking only some of the given points, rather than every single one.*

*Explanation:* Check every point: 0 < 1, 2 < 3 and 4 < 5 all hold. Each other set contains one point that fails, such as (1, 3), where 3 < 3 is false.

**14. Matching a Graph, Table, or Point to an Inequality or System · medium**

> The graph of an inequality in the xy-plane shows a dashed line through (0, 3) and (3, 0), with the region above the line shaded. Which inequality does the graph represent?

- **A. y > -x + 3** ✓
- B. y ≥ -x + 3
- C. y < -x + 3
- D. y ≤ -x + 3

*Explanation:* The line through (0, 3) and (3, 0) is y = -x + 3. Shading above means y is greater, and a dashed line means points on the line aren't included, so the sign is strict.

**15. Matching a Graph, Table, or Point to an Inequality or System · hard**

> Which system of inequalities is satisfied by the point (3, -1)?

- **A. y < x - 3 and y > -2** ✓
- B. y > x - 3 and y < -2
- C. y < x - 3 and y < -2 — *trap: Forgetting that a point must satisfy every inequality in a system to count as a solution — satisfying most of them isn't enough.*
- D. y ≥ 2x and y ≤ 0

*Explanation:* For (3, -1): -1 < 0 and -1 > -2 are both true. In the third choice the first inequality holds but -1 < -2 fails, and a solution must satisfy both.

