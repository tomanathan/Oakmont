# Content batch 7 — graphs

Earlier batches skipped question types that need a graph, because the app couldn't draw one. This batch fills that gap.

- **New graph figures:** lines and curves on the xy-plane, shaded inequality regions (solid or dashed boundaries), and line graphs of data over time. Every line, curve, and region is computed from its equation, and the answer checks use the same equations. The build fails if any marked point, curve, region, or label falls outside the graph's window.
- **Figures for items that described one in words (9):** three Evidence items (the museum table, the food-waste bar graph, the rainfall table), four scatterplot questions in Two-Variable Data, one inequality graph, and one linear-function graph.
- **24 new graph-reading items** for patterns that had few or none: reading a system's solution from a graph (Systems had zero), slope and intercept from a graph, matching a shaded region to an inequality, vertex, shifts and asymptotes from graphs, and two Evidence data items (a line graph and a bar graph).

Please flag anything that reads wrong. Choices are listed in authored order (students see them shuffled each sitting); ✓ marks the answer, and the trap tag follows each wrong choice.

## Command of Evidence (`rw-evidence`): 37 → 39 items

### Fixed

- **Items 11, 12, 29.** Now shows the figure it used to describe in words.

### New items

**1. Reading Data from a Graph or Table · medium**

> The graph shows the number of volunteers at the Harlow Creek cleanup each year from 2016 to 2023. A local newspaper reports that the number of volunteers generally grew over this period, although ______
>
> Which choice most effectively uses data from the graph to complete the statement?

*Figure: scatterplot, Year 2016–2023 by Volunteers 0–90. Points (2016, 40), (2017, 52), (2018, 48), (2019, 65), (2020, 30), (2021, 58), (2022, 72), (2023, 80).*

- **A. it fell sharply in 2020, from 65 to 30.** ✓
- B. it fell in every year after 2019. — *trap: Overstating what the data shows — a single dip becomes 'fell every quarter,' or a modest gap becomes framed as if it were the entire story.*
- C. it rose from 30 in 2019 to 65 in 2020. — *trap: Reporting two real values but swapping which category or variable each one belongs to, which can flip a supporting statement into its opposite.*
- D. it peaked at 80 volunteers in 2019. — *trap: Citing real numbers from the graph or table that don't actually address what the question is asking (the right city, but the wrong statistic; the right trend, but the wrong time period).*

*Explanation:* The one sharp break in the upward trend is 2020, when the count dropped from 65 to 30. It rose again every year after 2020, the third choice swaps the years, and the peak of 80 came in 2023.

**2. Reading Data from a Graph or Table · medium**

> The bar graph shows the percent of households that recycle in four neighborhoods. A city council member claims that Eastgate's recycling rate was higher than that of every other neighborhood in the survey.
>
> Which choice most effectively uses data from the graph to support the claim?

*Figure: bar graph of Households that recycle (%) by Neighborhood: Northfield: 62, Eastgate: 78, Riverside: 55, Old Mill: 70.*

- **A. Eastgate's rate was 78%, compared with 70% for Old Mill, the next highest.** ✓
- B. Eastgate's rate was 78%, compared with 55% for Riverside. — *trap: Citing real numbers from the graph or table that don't actually address what the question is asking (the right city, but the wrong statistic; the right trend, but the wrong time period).*
- C. Old Mill's rate was 78%, compared with 70% for Eastgate. — *trap: Reporting two real values but swapping which category or variable each one belongs to, which can flip a supporting statement into its opposite.*
- D. Eastgate's rate was more than twice Riverside's rate of 55%. — *trap: Overstating what the data shows — a single dip becomes 'fell every quarter,' or a modest gap becomes framed as if it were the entire story.*

*Explanation:* To show Eastgate beat every neighborhood, compare it with the next-highest one, Old Mill (70%). Beating Riverside alone doesn't rule out the others, the third choice swaps the two neighborhoods, and 78% isn't twice 55%.

## Linear Functions (`m-linear-func`): 27 → 32 items

### Fixed

- **Item 24.** Now shows the figure it used to describe in words.

### New items

**1. Reading Slope and Intercept Directly from a Graph · medium**

> The graph of a linear function is shown in the xy-plane. The line passes through the marked points.
>
> What is the slope of the line?

*Figure: graph on the xy-plane, drawn from its equations; marked points (0, 2), (2, -1), (4, -4).*

- **A. -3/2** ✓
- B. -2/3 — *trap: Misreading which axis is which, especially when the graph's scale isn't 1 unit per gridline.*
- C. 3/2
- D. 2 — *trap: Confusing the x-intercept (where the line crosses the x-axis) with the y-intercept when the question asks for one specifically.*

*Explanation:* From (0, 2) to (2, -1), y falls 3 while x rises 2: slope = -3/2. -2/3 puts the change in x over the change in y; 2 is the y-intercept.

**2. Reading Slope and Intercept Directly from a Graph · easy**

> The graph of y = f(x) is shown in the xy-plane.
>
> What is the y-intercept of the graph?

*Figure: graph on the xy-plane, drawn from its equations; marked points (-3, 0), (0, 4).*

- **A. (0, 4)** ✓
- B. (-3, 0) — *trap: Confusing the x-intercept (where the line crosses the x-axis) with the y-intercept when the question asks for one specifically.*
- C. (4, 0) — *trap: Misreading which axis is which, especially when the graph's scale isn't 1 unit per gridline.*
- D. (0, -3) — *trap: Misreading which axis is which, especially when the graph's scale isn't 1 unit per gridline.*

*Explanation:* The y-intercept is where the line crosses the y-axis: (0, 4). (-3, 0) is the x-intercept; the other two swap coordinates.

**3. Reading Slope and Intercept Directly from a Graph · medium**

> The graph shows the amount of water in a tank as it drains at a constant rate.
>
> At what rate is the water draining?

*Figure: scatterplot, Time (minutes) 0–10 by Water (gallons) 0–50. Points ; line y = -5x + 50.*

- **A. 5 gallons per minute** ✓
- B. 10 gallons per minute
- C. 50 gallons per minute — *trap: Confusing the x-intercept (where the line crosses the x-axis) with the y-intercept when the question asks for one specifically.*
- D. 0.2 gallon per minute — *trap: Misreading which axis is which, especially when the graph's scale isn't 1 unit per gridline.*

*Explanation:* The line falls from 50 gallons at 0 minutes to 0 gallons at 10 minutes: 50 ÷ 10 = 5 gallons per minute. 50 is the starting amount, and 0.2 divides minutes by gallons.

**4. Reading Slope and Intercept Directly from a Graph · medium**

> The graph of the linear function g is shown in the xy-plane. The line passes through the marked points.
>
> Which equation defines g?

*Figure: graph on the xy-plane, drawn from its equations; marked points (0, -1), (2, 3).*

- **A. g(x) = 2x - 1** ✓
- B. g(x) = -x + 2
- C. g(x) = (1/2)x - 1 — *trap: Misreading which axis is which, especially when the graph's scale isn't 1 unit per gridline.*
- D. g(x) = 2x + 1

*Explanation:* The line crosses the y-axis at -1 and rises 4 for every 2 to the right (from (0, -1) to (2, 3)), so the slope is 2: g(x) = 2x - 1. (1/2)x - 1 flips rise and run.

**5. Reading Slope and Intercept Directly from a Graph · hard**

> The graph shows the total cost of renting a kayak for different numbers of hours.
>
> What is the best interpretation of the point where the graph crosses the vertical axis?

*Figure: scatterplot, Rental time (hours) 0–6 by Total cost (dollars) 0–80. Points (0, 15), (6, 75); line y = 10x + 15.*

- **A. A flat fee of $15 is charged for any rental.** ✓
- B. Each hour of the rental costs $15. — *trap: Misreading which axis is which, especially when the graph's scale isn't 1 unit per gridline.*
- C. Each hour of the rental costs $10.
- D. The total cost of a 6-hour rental is $75.

*Explanation:* At 0 hours the cost is already $15, so that's a one-time fee. The $10 rise per hour is the slope, and $75 is just another point on the line.

## Systems of Two Linear Equations (`m-systems`): 27 → 33 items

### New items

**1. Reading the Solution Directly from a Graph · easy**

> The graph of a system of two linear equations is shown in the xy-plane.
>
> What is the solution (x, y) to the system?

*Figure: graph on the xy-plane, drawn from its equations.*

- **A. (2, 3)** ✓
- B. (3, 2) — *trap: Reading the intersection point's coordinates in the wrong order (mixing up x and y).*
- C. (0, 1) — *trap: Confusing a graph's x-intercept or y-intercept with the actual intersection point of the two lines, when a question asks specifically for the system's solution.*
- D. (3.5, 0) — *trap: Confusing a graph's x-intercept or y-intercept with the actual intersection point of the two lines, when a question asks specifically for the system's solution.*

*Explanation:* The solution is where the lines cross: (2, 3). (3, 2) swaps the coordinates; (0, 1) and (3.5, 0) are intercepts of one line.

**2. Reading the Solution Directly from a Graph · medium**

> The graph of a system of two linear equations is shown in the xy-plane.
>
> If (x, y) is the solution to the system, what is the value of x + y?

*Figure: graph on the xy-plane, drawn from its equations.*

- **A. 5** ✓
- B. 3
- C. 4
- D. 1 — *trap: Reading the intersection point's coordinates in the wrong order (mixing up x and y).*

*Explanation:* The lines cross at (4, 1), so x + y = 5. 3 is x - y.

**3. Reading the Solution Directly from a Graph · easy**

> The graph of a system of two linear equations is shown in the xy-plane.
>
> How many solutions does the system have?

*Figure: graph on the xy-plane, drawn from its equations.*

- **A. Zero** ✓
- B. Exactly one
- C. Exactly two
- D. Infinitely many

*Explanation:* The lines have the same slope and different y-intercepts, so they never cross: no solution.

**4. Reading the Solution Directly from a Graph · medium**

> The graph of a system of two linear equations is shown in the xy-plane. Each line passes through two marked points.
>
> Which system of equations is represented by the graph?

*Figure: graph on the xy-plane, drawn from its equations; marked points (0, 4), (4, 0), (0, -2), (2, 2).*

- **A. y = -x + 4 and y = 2x - 2** ✓
- B. y = x + 4 and y = 2x - 2
- C. y = -x + 4 and y = -2x - 2
- D. y = 4x - 1 and y = -2x + 2 — *trap: Confusing a graph's x-intercept or y-intercept with the actual intersection point of the two lines, when a question asks specifically for the system's solution.*

*Explanation:* One line crosses the y-axis at 4 and falls 1 per unit (y = -x + 4); the other crosses at -2 and rises 2 per unit (y = 2x - 2). The last choice swaps each slope and intercept.

**5. Reading the Solution Directly from a Graph · medium**

> The graph of a system of two linear equations is shown in the xy-plane. The solution to the system is (a, b).
>
> What is the value of a?

*Figure: graph on the xy-plane, drawn from its equations.*

- **A. 3** ✓
- B. 2 — *trap: Confusing a graph's x-intercept or y-intercept with the actual intersection point of the two lines, when a question asks specifically for the system's solution.*
- C. 6 — *trap: Confusing a graph's x-intercept or y-intercept with the actual intersection point of the two lines, when a question asks specifically for the system's solution.*
- D. 1

*Explanation:* The lines cross at (3, 3), so a = 3. 2 is where one line crosses the y-axis, and 6 is where the other crosses the x-axis.

**6. Reading the Solution Directly from a Graph · medium**

> The graphs of the linear functions f and g are shown in the xy-plane.
>
> For what value of x does f(x) = g(x)?

*Figure: graph on the xy-plane, drawn from its equations.*

- **A. 4** ✓
- B. 1 — *trap: Reading the intersection point's coordinates in the wrong order (mixing up x and y).*
- C. 6
- D. 3

*Explanation:* f(x) = g(x) where the graphs cross, at (4, 1), so x = 4. 1 is the y-coordinate of that point.

## Linear Inequalities (`m-linear-ineq`): 27 → 30 items

### Fixed

- **Item 26.** Now shows the figure it used to describe in words.

### New items

**1. Matching a Graph, Table, or Point to an Inequality or System · medium**

> The shaded region, including the solid line, shows the solutions to an inequality in the xy-plane.
>
> Which inequality is represented by the graph?

*Figure: graph on the xy-plane, drawn from its equations; marked points (0, -1), (2, 3).*

- **A. y ≥ 2x - 1** ✓
- B. y > 2x - 1 — *trap: Testing a point that's exactly on the boundary line rather than clearly inside the shaded region, which doesn't reveal which direction the inequality points.*
- C. y ≤ 2x - 1
- D. y ≥ -2x - 1

*Explanation:* The line crosses the y-axis at -1 with slope 2, the region above it is shaded, and a solid line means points on it count: y ≥ 2x - 1. A dashed line would mean >.

**2. Matching a Graph, Table, or Point to an Inequality or System · hard**

> The shaded region shows the solutions to a system of two inequalities. Points on the dashed line are not solutions; points on the solid line are.
>
> Which point is a solution to the system?

*Figure: graph on the xy-plane, drawn from its equations.*

- **A. (0, 0)** ✓
- B. (1, 4) — *trap: Forgetting that a point must satisfy every inequality in a system to count as a solution — satisfying most of them isn't enough.*
- C. (3, 1) — *trap: Testing a point that's exactly on the boundary line rather than clearly inside the shaded region, which doesn't reveal which direction the inequality points.*
- D. (5, 0)

*Explanation:* (0, 0) lies inside the shaded region. (1, 4) is above the solid line, outside one inequality. (3, 1) sits where the two boundaries meet, and it lies on the dashed line, so it isn't a solution.

**3. Matching a Graph, Table, or Point to an Inequality or System · medium**

> In the xy-plane, the shaded region below the dashed line shows the solutions to an inequality. The line passes through the marked points.
>
> Which inequality is represented by the graph?

*Figure: graph on the xy-plane, drawn from its equations; marked points (0, 3), (2, 2), (4, 1).*

- **A. y < -(1/2)x + 3** ✓
- B. y ≤ -(1/2)x + 3 — *trap: Testing a point that's exactly on the boundary line rather than clearly inside the shaded region, which doesn't reveal which direction the inequality points.*
- C. y > -(1/2)x + 3
- D. y < -2x + 3

*Explanation:* The line crosses the y-axis at 3 and falls 1 for every 2 to the right (slope -1/2). The region below is shaded and the line is dashed: y < -(1/2)x + 3.

## Nonlinear Functions (`m-nonlinear-func`): 26 → 34 items

### New items

**1. Reading Vertex Form Directly · easy**

> The graph of y = f(x) is shown in the xy-plane. The vertex of the parabola is marked.
>
> What is the minimum value of f?

*Figure: graph on the xy-plane, drawn from its equations; marked points (2, -3).*

- **A. -3** ✓
- B. 2
- C. 1
- D. -1

*Explanation:* The lowest point is the vertex, (2, -3), so the minimum value of f is its y-coordinate, -3. 2 is where the minimum occurs, not the minimum value; 1 is the y-intercept.

**2. Reading Vertex Form Directly · medium**

> The graph of y = f(x) is shown in the xy-plane. The vertex of the parabola is marked.
>
> Which equation could define f?

*Figure: graph on the xy-plane, drawn from its equations; marked points (-1, 4).*

- **A. f(x) = -(x + 1)² + 4** ✓
- B. f(x) = -(x - 1)² + 4
- C. f(x) = (x + 1)² + 4
- D. f(x) = -(x + 4)² + 1

*Explanation:* The parabola opens down with vertex (-1, 4), so f(x) = -(x - (-1))² + 4 = -(x + 1)² + 4. -(x - 1)² puts the vertex at x = 1, and the third choice opens up.

**3. Graph Transformations (Shifts) · hard**

> The graphs of y = f(x) and y = g(x) are shown in the xy-plane. The graph of g has the same shape as the graph of f, and each vertex is marked.
>
> Which equation defines g in terms of f?

*Figure: graph on the xy-plane, drawn from its equations; marked points (-1, -2), (2, -1).*

- **A. g(x) = f(x - 3) + 1** ✓
- B. g(x) = f(x + 3) + 1 — *trap: Shifting the graph in the wrong direction for a horizontal shift, since f(x-h) moves right for positive h, which feels backward compared to vertical shifts.*
- C. g(x) = f(x - 1) + 3 — *trap: Confusing a vertical shift (add/subtract outside the function) with a horizontal shift (add/subtract inside the function's parentheses).*
- D. g(x) = f(x) + 3 — *trap: Confusing a vertical shift (add/subtract outside the function) with a horizontal shift (add/subtract inside the function's parentheses).*

*Explanation:* The vertex moves from (-1, -2) to (2, -1): 3 right and 1 up. Moving right 3 is f(x - 3), and up 1 adds 1 outside. f(x + 3) would move the graph left.

**4. Graph Transformations (Shifts) · medium**

> The graph of y = f(x) is shown in the xy-plane. The y-intercept is marked.
>
> What is the y-intercept of the graph of y = f(x) - 4?

*Figure: graph on the xy-plane, drawn from its equations; marked points (0, 3).*

- **A. (0, -1)** ✓
- B. (0, 7)
- C. (0, 3)
- D. (-4, 3) — *trap: Confusing a vertical shift (add/subtract outside the function) with a horizontal shift (add/subtract inside the function's parentheses).*

*Explanation:* f(0) = 3, and subtracting 4 moves every point down 4: (0, -1). (0, 7) moves it up instead, and (-4, 3) shifts sideways.

**5. Minimum, Maximum, and Asymptote Reasoning for Exponential Functions · medium**

> The graph of y = f(x), where f(x) = a(b)^x + c and a, b, and c are constants, is shown in the xy-plane. The dashed line is the horizontal asymptote.
>
> What is the value of c?

*Figure: graph on the xy-plane, drawn from its equations; marked points (0, 7).*

- **A. 2** ✓
- B. 7
- C. 5
- D. 0

*Explanation:* As x grows, a(b)^x shrinks toward 0 and f(x) levels off at c, so c is the asymptote's height: 2. 7 is the y-intercept, a + c.

**6. Modeling Growth and Decay with Exponential Functions · medium**

> The graph of an exponential function f is shown in the xy-plane. The graph passes through the marked points.
>
> Which equation could define f?

*Figure: graph on the xy-plane, drawn from its equations; marked points (0, 4), (1, 2), (2, 1).*

- **A. f(x) = 4(0.5)^x** ✓
- B. f(x) = 0.5(4)^x
- C. f(x) = 4 - 2x
- D. f(x) = 4(2)^x

*Explanation:* f(0) = 4, and each step right halves the value (4, 2, 1), so f(x) = 4(0.5)^x. 4 - 2x also passes through (0, 4) and (1, 2) but gives 0 at x = 2, not 1.

**7. None · medium**

> The graph of y = f(x) is shown in the xy-plane. The vertex of the parabola is marked.
>
> For how many values of x does f(x) = 3?

*Figure: graph on the xy-plane, drawn from its equations; marked points (1, 4).*

- **A. 2** ✓
- B. 1
- C. 0
- D. 3

*Explanation:* The horizontal line y = 3 crosses the parabola twice, at x = 0 and x = 2, below the maximum of 4.

**8. None · easy**

> The graph of y = f(x) is shown in the xy-plane. The points where the graph crosses the axes are marked.
>
> What are the x-intercepts of the graph?

*Figure: graph on the xy-plane, drawn from its equations; marked points (-1, 0), (3, 0), (0, -3).*

- **A. (-1, 0) and (3, 0)** ✓
- B. (1, 0) and (-3, 0)
- C. (0, -3) only
- D. (1, -4) and (0, -3)

*Explanation:* The graph crosses the x-axis at x = -1 and x = 3. (0, -3) is the y-intercept, and (1, -4) is the vertex.

## Two-Variable Data (`m-two-var-data`): 24 → 24 items

### Fixed

- **Items 1, 3, 5, 8.** Now shows the figure it used to describe in words.

### New items

