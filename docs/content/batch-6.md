# Content batch 6 — review

The four Geometry and Trigonometry subskills (about 15% of the Math section): area and volume; lines, angles, and triangles; right triangles and trigonometry; circles. This completes the bank: every subskill has now had a quality pass, trap tags, and new items.

- **Geometry figures, drawn to scale.** Questions can now show plane figures built from real coordinates (triangles, parallel lines and transversals, circles, sectors, tangents, coordinate-plane circles) and solids drawn to their stated dimensions (cylinders, cones, prisms). The build measures every labeled side and angle in the drawing and fails if any label disagrees by more than 1% (lengths) or 0.3° (angles), checks right-angle marks are 90°, and checks that every point a figure references exists. 38 items have figures, 32 of them new. The existing lesson diagrams are schematic ('not drawn to scale') and were left as they are.
- Every existing item (46) was re-checked: all keys were correct. One stem was hard to parse and let the classic mistake reach the right answer, one was garbled, several items had no pattern, and 26 difficulty labels were corrected (mostly one-step problems marked hard). Six existing items gained figures.
- 15 new original items per subskill (60), with 52 automatic answer checks.

Please flag anything that reads wrong. Choices are listed in authored order (students see them shuffled each sitting); ✓ marks the answer, and the trap tag follows each wrong choice.

## Area and Volume (`m-area-volume`): 12 → 27 items

### Fixed

- **Item 4.** Added a to-scale figure of the cylinder.
- **Item 10.** Added a to-scale figure of the cone.

### New items

**1. Scale Factor Effects on Area and Volume · easy**

> Two rectangles are similar, and each side of the larger rectangle is 3 times as long as the corresponding side of the smaller one. The area of the smaller rectangle is 12 square inches. What is the area of the larger rectangle, in square inches?

- **A. 108** ✓
- B. 36 — *trap: Applying the linear scale factor directly to area or volume instead of squaring (for area) or cubing (for volume) it first.*
- C. 324 — *trap: Mixing up which scaling rule (k² or k³) applies to area versus volume.*
- D. 48

*Explanation:* Area scales by the square of the side ratio: 12 × 3² = 108. Multiplying by 3 treats area like length; 324 cubes the ratio, which is the rule for volume.

**2. Scale Factor Effects on Area and Volume · medium**

> The radius and the height of a cylinder are both doubled. The volume of the new cylinder is how many times the volume of the original cylinder?

- **A. 8** ✓
- B. 4 — *trap: Mixing up which scaling rule (k² or k³) applies to area versus volume.*
- C. 2 — *trap: Applying the linear scale factor directly to area or volume instead of squaring (for area) or cubing (for volume) it first.*
- D. 6

*Explanation:* V = πr²h. Doubling r multiplies r² by 4, and doubling h multiplies by 2 more: 4 × 2 = 8. 4 treats volume like area.

**3. Scale Factor Effects on Area and Volume · hard**

> Two solids are similar. The ratio of their surface areas is 9 to 25. The volume of the smaller solid is 54 cubic centimeters. What is the volume of the larger solid, in cubic centimeters?

- **A. 250** ✓
- B. 150 — *trap: Mixing up which scaling rule (k² or k³) applies to area versus volume.*
- C. 90 — *trap: Applying the linear scale factor directly to area or volume instead of squaring (for area) or cubing (for volume) it first.*
- D. 1,350

*Explanation:* Areas scale by k², so k² = 25/9 and k = 5/3. Volumes scale by k³ = 125/27: 54 × 125/27 = 250. 150 uses the area ratio for volume; 90 uses the side ratio.

**4. Scale Factor Effects on Area and Volume · medium**

> A model car is built at a scale of 1 to 20. The model's windshield has an area of 12 square inches. What is the area of the actual car's windshield, in square inches?

- **A. 4,800** ✓
- B. 240 — *trap: Applying the linear scale factor directly to area or volume instead of squaring (for area) or cubing (for volume) it first.*
- C. 96,000 — *trap: Mixing up which scaling rule (k² or k³) applies to area versus volume.*
- D. 480

*Explanation:* Lengths scale by 20, so areas scale by 20² = 400: 12 × 400 = 4,800. 240 scales area like length; 96,000 cubes the scale factor.

**5. Composite Figures and Formula Selection · medium**

> The figure shows a floor plan made of rectangles. All angles are right angles.
>
> What is the area of the floor plan?

*Figure (drawn to scale; labels checked against the drawing): P1P2 = 10; P2P3 = 4; P6P1 = 9; P5P6 = 4; right angle at P1, P2, P6.*

- **A. 60** ✓
- B. 90
- C. 76
- D. 40

*Explanation:* Split it into a 10-by-4 rectangle (40) and a 4-by-5 rectangle on top (the left side is 9, so 9 - 4 = 5): 40 + 20 = 60. 90 is the full 10-by-9 rectangle around it.

**6. Composite Figures and Formula Selection · medium**

> The figure shows a window made of a rectangle topped by a semicircle. The semicircle's diameter is the top side of the rectangle.
>
> What is the area of the window?

*Figure (drawn to scale; labels checked against the drawing): AB = 6; BC = 8; right angle at A, B.*

- **A. 48 + 4.5π** ✓
- B. 48 + 9π
- C. 48 + 18π — *trap: Substituting the diameter where the radius is needed (or vice versa), especially when a problem gives diameter directly.*
- D. 48 + 3π

*Explanation:* Rectangle: 6 × 8 = 48. The semicircle has radius 3, so its area is (1/2)π(3²) = 4.5π. 48 + 9π uses a full circle; 48 + 18π uses the diameter, 6, as the radius.

**7. Composite Figures and Formula Selection · hard**

> The figure shows a circle inside a square. The circle touches all four sides of the square, and the square has a side length of 10.
>
> What is the area of the shaded region?

*Figure (drawn to scale; labels checked against the drawing): AB = 10.*

- **A. 100 - 25π** ✓
- B. 100 - 100π — *trap: Substituting the diameter where the radius is needed (or vice versa), especially when a problem gives diameter directly.*
- C. 100 - 10π
- D. 25π

*Explanation:* The square's area is 100. The circle's diameter equals the side, 10, so its radius is 5 and its area is 25π. Shaded = 100 - 25π. 100 - 100π uses the diameter as the radius.

**8. Composite Figures and Formula Selection · easy**

> The figure shows a right circular cylinder with a diameter of 8 and a height of 5.
>
> What is the volume of the cylinder, in terms of π?

*Figure: cylinder, diameter 8, height 5 (drawn to these dimensions).*

- **A. 80π** ✓
- B. 320π — *trap: Substituting the diameter where the radius is needed (or vice versa), especially when a problem gives diameter directly.*
- C. 80π/3 — *trap: Confusing similar formulas (e.g., using the cone volume formula, which includes a factor of 1/3, for what is actually a cylinder).*
- D. 40π

*Explanation:* The radius is 8 ÷ 2 = 4, so V = π(4²)(5) = 80π. 320π uses the diameter as the radius; 80π/3 uses the cone formula.

**9. Composite Figures and Formula Selection · medium**

> The figure shows a right circular cone with a diameter of 6 and a height of 4.
>
> What is the volume of the cone, in terms of π?

*Figure: cone, diameter 6, height 4 (drawn to these dimensions).*

- **A. 12π** ✓
- B. 36π — *trap: Confusing similar formulas (e.g., using the cone volume formula, which includes a factor of 1/3, for what is actually a cylinder).*
- C. 48π — *trap: Substituting the diameter where the radius is needed (or vice versa), especially when a problem gives diameter directly.*
- D. 15π

*Explanation:* The radius is 3, so V = (1/3)π(3²)(4) = 12π. 36π leaves out the 1/3 (the cylinder formula); 48π uses the diameter as the radius.

**10. Composite Figures and Formula Selection · medium**

> The figure shows a rectangular prism with length 5, width 3, and height 4.
>
> What is the surface area of the prism?

*Figure: prism, length 5, width 3, height 4 (drawn to these dimensions).*

- **A. 94** ✓
- B. 60 — *trap: Confusing similar formulas (e.g., using the cone volume formula, which includes a factor of 1/3, for what is actually a cylinder).*
- C. 47
- D. 120

*Explanation:* Surface area = 2(5·3 + 5·4 + 3·4) = 2(15 + 20 + 12) = 94. 60 is the volume, and 47 counts each pair of faces once.

**11. Building a Volume Expression Algebraically from a Word Description · medium**

> A box has a height of 2 feet. Its length is 3 feet more than its width, w. Which expression gives the volume of the box, in cubic feet?

- **A. 2w² + 6w** ✓
- B. 6w² — *trap: Mistranslating a comparative phrase like '5 more than the width' as '5 times the width,' or vice versa.*
- C. 2w² + 3 — *trap: Forgetting to expand or simplify the resulting algebraic expression into its most standard form once it's fully substituted.*
- D. w² + 3w + 2

*Explanation:* Volume = length × width × height = (w + 3)(w)(2) = 2w² + 6w. 6w² reads '3 more than' as '3 times'; 2w² + 3 forgets to multiply the 3 by 2w.

**12. Building a Volume Expression Algebraically from a Word Description · easy**

> A rectangle's length is twice its width, and its area is 72 square meters. What is the width of the rectangle, in meters?

- **A. 6** ✓
- B. 12 — *trap: Substituting a worded dimension into the wrong part of the formula (e.g., swapping which expression represents length vs. width).*
- C. 36
- D. 18

*Explanation:* w(2w) = 72, so w² = 36 and w = 6. 12 is the length.

**13. Building a Volume Expression Algebraically from a Word Description · hard**

> The height of a cylinder is 3 times its radius, r. Which expression gives the volume of the cylinder?

- **A. 3πr³** ✓
- B. 9πr³ — *trap: Substituting a worded dimension into the wrong part of the formula (e.g., swapping which expression represents length vs. width).*
- C. πr³
- D. 3πr² — *trap: Forgetting to expand or simplify the resulting algebraic expression into its most standard form once it's fully substituted.*

*Explanation:* V = πr²h = πr²(3r) = 3πr³. 9πr³ squares the 3 along with r; 3πr² forgets that h itself contains r.

**14. Building a Volume Expression Algebraically from a Word Description · hard**

> An open box is made from a 20-by-20-inch sheet of cardboard by cutting an x-by-x-inch square from each corner and folding up the sides. Which expression gives the volume of the box, in cubic inches?

- **A. x(20 - 2x)²** ✓
- B. x(20 - x)² — *trap: Substituting a worded dimension into the wrong part of the formula (e.g., swapping which expression represents length vs. width).*
- C. (20 - 2x)²
- D. x²(20 - 2x) — *trap: Substituting a worded dimension into the wrong part of the formula (e.g., swapping which expression represents length vs. width).*

*Explanation:* Each side loses x at both ends, so the base is (20 - 2x) by (20 - 2x), and the height is x. 20 - x removes only one corner; (20 - 2x)² is just the base area.

**15. Composite Figures and Formula Selection · easy**

> The volume of a cube is 125 cubic centimeters. What is the total surface area of the cube, in square centimeters?

- **A. 150** ✓
- B. 25 — *trap: Confusing similar formulas (e.g., using the cone volume formula, which includes a factor of 1/3, for what is actually a cylinder).*
- C. 125
- D. 30

*Explanation:* The side is ∛125 = 5, so the surface area is 6 × 5² = 150. 25 is the area of one face.

## Lines, Angles, and Triangles (`m-lines-angles-tri`): 14 → 29 items

### Fixed

- **Item 9.** The stem ('it is not adjacent to one of the triangle's interior angles of 40°') was hard to parse, and with its numbers the adjacent interior angle equaled the answer, so the classic mistake still got it right. New numbers and a figure.

### New items

**1. Triangle Angle Sum and Exterior Angles · easy**

> In the figure, D is a point on the extension of side AB of triangle ABC.
>
> What is the value of x?

*Figure (drawn to scale; labels checked against the drawing): ∠A = 50°; ∠B = 120°; ∠C = x°.*

- **A. 70** ✓
- B. 60 — *trap: Not recognizing the exterior angle shortcut, and instead trying to first find the triangle's adjacent interior angle (180° - exterior angle) before proceeding — this works but takes an unnecessary extra step.*
- C. 50
- D. 110

*Explanation:* Exterior angle CBD equals the sum of the two interior angles not next to it: 120 = 50 + x, so x = 70. 60 is interior angle ABC, the angle next to the exterior angle.

**2. Triangle Angle Sum and Exterior Angles · easy**

> In triangle ABC shown, the measures of the angles are x°, 2x°, and 3x°.
>
> What is the value of x?

*Figure (drawn to scale; labels checked against the drawing): ∠A = x°; ∠B = 3x°; ∠C = 2x°.*

- **A. 30** ✓
- B. 60
- C. 36
- D. 90

*Explanation:* x + 2x + 3x = 180, so 6x = 180 and x = 30. 60 and 90 are the other two angles.

**3. Triangle Angle Sum and Exterior Angles · easy**

> In triangle ABC shown, AB = AC and the measure of angle A is 40°.
>
> What is the measure of angle B?

*Figure (drawn to scale; labels checked against the drawing): ∠A = 40°.*

- **A. 70°** ✓
- B. 40°
- C. 140°
- D. 100°

*Explanation:* AB = AC makes angles B and C equal, and together they take up 180 - 40 = 140°, so each is 70°.

**4. Triangle Angle Sum and Exterior Angles · hard**

> In the figure, point D lies on the extension of side AC of triangle ABC.
>
> What is the value of x?

*Figure (drawn to scale; labels checked against the drawing): ∠A = 2x°; ∠B = (x + 40)°; ∠C = (5x + 10)°.*

- **A. 15** ✓
- B. 16.25
- C. 30
- D. 25

*Explanation:* The exterior angle equals the sum of the two remote interior angles: 5x + 10 = 2x + (x + 40), so 2x = 30 and x = 15. Setting all three expressions to add to 180 gives 16.25.

**5. Parallel Lines Cut by a Transversal · medium**

> In the figure, lines ℓ and m are parallel.
>
> What is the value of x?

*Figure (drawn to scale; labels checked against the drawing): ∠Q = 115°; ∠P = x°.*

- **A. 65** ✓
- B. 115 — *trap: Applying the 'equal angles' rule (correct for corresponding/alternate interior angles) to a co-interior angle pair, which is actually supplementary, not equal.*
- C. 25
- D. 75

*Explanation:* The two labeled angles are same-side interior angles, which add to 180°: x = 180 - 115 = 65. They aren't equal, so 115 is the trap.

**6. Parallel Lines Cut by a Transversal · medium**

> In the figure, parallel lines ℓ and m are cut by a transversal.
>
> What is the value of x?

*Figure (drawn to scale; labels checked against the drawing): ∠Q = (4x − 10)°; ∠P = 70°.*

- **A. 20** ✓
- B. 30 — *trap: Applying the 'equal angles' rule (correct for corresponding/alternate interior angles) to a co-interior angle pair, which is actually supplementary, not equal.*
- C. 15
- D. 70

*Explanation:* The labeled angles are alternate interior angles, so they're equal: 4x - 10 = 70 and x = 20. Treating them as supplementary gives 4x - 10 = 110, x = 30.

**7. Parallel Lines Cut by a Transversal · medium**

> In the figure, lines ℓ and m are parallel.
>
> What is the measure, in degrees, of the angle labeled 3x°?

*Figure (drawn to scale; labels checked against the drawing): ∠Q = 3x°; ∠P = (5x − 40)°.*

- **A. 60** ✓
- B. 20
- C. 120 — *trap: Misidentifying which specific angle pair type is shown in a given diagram or description.*
- D. 100

*Explanation:* The labeled angles are corresponding angles, so 3x = 5x - 40, which gives x = 20. The angle is 3(20) = 60°. 20 is x, not the angle.

**8. Parallel Lines Cut by a Transversal · hard**

> In the figure, lines ℓ and m are parallel, point A lies on ℓ, and point B lies on m.
>
> What is the value of x?

*Figure (drawn to scale; labels checked against the drawing): ∠A = 35°; ∠B = 50°; ∠P = x°.*

- **A. 85** ✓
- B. 95
- C. 15
- D. 42.5

*Explanation:* Draw a line through P parallel to ℓ and m. It splits x into two angles that are alternate interior angles with the 35° and 50° angles, so x = 35 + 50 = 85.

**9. Similar Triangles and Proportional Sides · medium**

> In the figure, segment DE is parallel to segment BC.
>
> What is the length of BC?

*Figure (drawn to scale; labels checked against the drawing): AD = 4; DB = 6; DE = 5.*

- **A. 12.5** ✓
- B. 7.5 — *trap: Matching sides based on their order of appearance in the problem rather than their actual corresponding angles, leading to an incorrect ratio.*
- C. 2 — *trap: Setting up the scale factor upside down (e.g., using the smaller triangle's side over the larger one when the reverse was needed).*
- D. 9

*Explanation:* DE ∥ BC makes triangle ADE similar to triangle ABC. AB = 4 + 6 = 10, so BC/5 = 10/4 and BC = 12.5. Using DB instead of AB gives 7.5.

**10. Similar Triangles and Proportional Sides · easy**

> Triangle ABC is similar to triangle DEF, with angle A corresponding to angle D and angle B to angle E. If AB = 8, AC = 6, and DE = 12, what is DF?

- **A. 9** ✓
- B. 4 — *trap: Setting up the scale factor upside down (e.g., using the smaller triangle's side over the larger one when the reverse was needed).*
- C. 10
- D. 16

*Explanation:* The scale factor from ABC to DEF is 12/8 = 1.5, so DF = 6 × 1.5 = 9. 4 uses the factor upside down; 10 adds 4 instead of multiplying.

**11. Similar Triangles and Proportional Sides · medium**

> In right triangles ABC and DEF, angles B and E are right angles and angle A is congruent to angle D. If AB = 4, BC = 3, and DE = 10, what is EF?

- **A. 7.5** ✓
- B. 13.3 — *trap: Matching sides based on their order of appearance in the problem rather than their actual corresponding angles, leading to an incorrect ratio.*
- C. 9
- D. 12.5

*Explanation:* Two pairs of equal angles make the triangles similar, with AB ↔ DE and BC ↔ EF. The factor is 10/4 = 2.5, so EF = 3 × 2.5 = 7.5. 13.3 pairs BC with DE.

**12. Similar Triangles and Proportional Sides · medium**

> In triangles ABC and DEF, angle A is congruent to angle D. Which additional fact would be enough to prove that the triangles are similar?

- **A. Angle B is congruent to angle E.** ✓
- B. AB = DE — *trap: Assuming triangles are similar just because one angle matches, without checking that a second angle (or proportional sides) confirms it.*
- C. Angle C measures 90°. — *trap: Assuming triangles are similar just because one angle matches, without checking that a second angle (or proportional sides) confirms it.*
- D. BC = EF — *trap: Assuming triangles are similar just because one angle matches, without checking that a second angle (or proportional sides) confirms it.*

*Explanation:* Two pairs of congruent angles guarantee similarity (AA). One angle plus one pair of equal sides isn't enough, and a single angle in one triangle tells you nothing about the other.

**13. Vertical Angles and Basic Angle Relationships · medium**

> In the figure, two lines intersect.
>
> What is the value of x?

*Figure (drawn to scale; labels checked against the drawing): ∠O = (3x + 10)°; ∠O = (5x − 30)°.*

- **A. 20** ✓
- B. 25 — *trap: Confusing vertical angles (equal) with adjacent angles along a line (supplementary, adding to 180°) — these are opposite relationships and easy to mix up under time pressure.*
- C. 70
- D. 10

*Explanation:* The labeled angles are vertical angles, so they're equal: 3x + 10 = 5x - 30, giving x = 20. Treating them as supplementary gives 8x - 20 = 180, x = 25.

**14. Vertical Angles and Basic Angle Relationships · medium**

> In the figure, three lines intersect at a point.
>
> What is the value of a?

*Figure (drawn to scale; labels checked against the drawing): ∠O = 60°; ∠O = a°; ∠O = 40°.*

- **A. 80** ✓
- B. 40 — *trap: Assuming two angles are vertical just because they look similar in size, without confirming they're actually positioned directly across the intersection from each other.*
- C. 100 — *trap: In multi-line intersection problems, losing track of which angles lie along the same straight line when applying the 180° rule.*
- D. 60

*Explanation:* The angles 60°, a°, and 40° lie side by side along one straight line, so they add to 180°: a = 180 - 60 - 40 = 80. The 40° angle isn't vertical to a°, so a isn't 40.

**15. Vertical Angles and Basic Angle Relationships · easy**

> Angles 1 and 2 form a linear pair, and the measure of angle 1 is 3 times the measure of angle 2. What is the measure of angle 1?

- **A. 135°** ✓
- B. 45°
- C. 67.5°
- D. 90°

*Explanation:* A linear pair adds to 180°: 3a + a = 180, so a = 45 and angle 1 = 135°. 45° is angle 2.

## Right Triangles and Trigonometry (`m-right-tri-trig`): 10 → 25 items

### Fixed

- **Item 5.** The stem was garbled ('What is cos(A) if the triangle's sides form a 3-4-5 ratio?'). Reworded.
- **Item 6.** Added a figure of the ladder, wall, and 60° angle.
- **Item 10.** Added a figure of the pole, cable, and 40° angle.

### New items

**1. SOH-CAH-TOA Setup · easy**

> In right triangle ABC shown, angle C is a right angle.
>
> What is the value of sin A?

*Figure (drawn to scale; labels checked against the drawing): CA = 12; CB = 5; AB = 13; right angle at C.*

- **A. 5/13** ✓
- B. 12/13 — *trap: Misidentifying which side is opposite versus adjacent relative to the specific angle being used — this depends on the angle's position, not just the shape of the triangle.*
- C. 5/12 — *trap: Choosing the wrong trig ratio (sine instead of tangent, etc.) because the opposite/adjacent/hypotenuse sides weren't correctly identified first.*
- D. 13/5

*Explanation:* sin A = opposite/hypotenuse. The side opposite A is BC = 5 and the hypotenuse is 13: 5/13. 12/13 is cos A (the adjacent side); 5/12 is tan A.

**2. Using the Pythagorean Theorem Before Computing a Trig Ratio · medium**

> In right triangle ABC shown, angle C is a right angle.
>
> What is the value of cos B?

*Figure (drawn to scale; labels checked against the drawing): CA = 15; CB = 8; right angle at C.*

- **A. 8/17** ✓
- B. 15/17 — *trap: Using the Pythagorean theorem correctly but then misidentifying which of the three sides is opposite versus adjacent to the specific angle in question.*
- C. 8/15 — *trap: Attempting to apply a trig ratio directly with only two known sides, without first solving for the missing third side.*
- D. 15/8

*Explanation:* First find the hypotenuse: √(8² + 15²) = 17. The side adjacent to B is BC = 8, so cos B = 8/17. 15/17 uses the side opposite B; 8/15 skips finding the hypotenuse.

**3. SOH-CAH-TOA Setup · medium**

> In right triangle ABC shown, AB = 20 and the measure of angle A is 32°.
>
> Which expression gives the value of x?

*Figure (drawn to scale; labels checked against the drawing): CB = x; AB = 20; ∠A = 32°; right angle at C.*

- **A. 20 sin 32°** ✓
- B. 20 cos 32° — *trap: Misidentifying which side is opposite versus adjacent relative to the specific angle being used — this depends on the angle's position, not just the shape of the triangle.*
- C. 20 tan 32° — *trap: Choosing the wrong trig ratio (sine instead of tangent, etc.) because the opposite/adjacent/hypotenuse sides weren't correctly identified first.*
- D. 20 / sin 32°

*Explanation:* x is opposite angle A and 20 is the hypotenuse, so sin 32° = x/20 and x = 20 sin 32°. Cosine would give the adjacent side.

**4. Special Right Triangles (30-60-90 and 45-45-90) · medium**

> In right triangle ABC shown, the hypotenuse AB has length 12 and the measure of angle A is 30°.
>
> What is the length of AC?

*Figure (drawn to scale; labels checked against the drawing): AB = 12; ∠A = 30°; right angle at C.*

- **A. 6√3** ✓
- B. 6
- C. 12√3
- D. 6√2 — *trap: Mixing up the 30-60-90 ratio (x, x√3, 2x) with the 45-45-90 ratio (x, x, x√2) under time pressure.*

*Explanation:* In a 30-60-90 triangle the sides are x, x√3, 2x. The hypotenuse 2x = 12, so x = 6 (the side opposite 30°, BC) and AC, opposite 60°, is 6√3. 6√2 uses the 45-45-90 ratio.

**5. Special Right Triangles (30-60-90 and 45-45-90) · medium**

> The diagonal of square ABCD shown has length 10.
>
> What is the side length of the square?

*Figure (drawn to scale; labels checked against the drawing): AC = 10; right angle at A, B, C, D.*

- **A. 5√2** ✓
- B. 10√2
- C. 5
- D. 10√3 — *trap: Mixing up the 30-60-90 ratio (x, x√3, 2x) with the 45-45-90 ratio (x, x, x√2) under time pressure.*

*Explanation:* A diagonal splits the square into two 45-45-90 triangles, where hypotenuse = side × √2. So side = 10/√2 = 5√2. 10√2 multiplies instead of dividing.

**6. Special Right Triangles (30-60-90 and 45-45-90) · medium**

> The figure shows equilateral triangle ABC with side length 8. Segment CM is the altitude from C to AB.
>
> What is the length of CM?

*Figure (drawn to scale; labels checked against the drawing): AB = 8; BC = 8; CA = 8; right angle at M.*

- **A. 4√3** ✓
- B. 8√3
- C. 4
- D. 4√2 — *trap: Mixing up the 30-60-90 ratio (x, x√3, 2x) with the 45-45-90 ratio (x, x, x√2) under time pressure.*

*Explanation:* The altitude splits the triangle into two 30-60-90 triangles with hypotenuse 8 and short leg 4. The altitude is the long leg: 4√3. 4√2 uses the 45-45-90 ratio.

**7. Using the Pythagorean Theorem Before Computing a Trig Ratio · hard**

> In right triangle PQR shown, angle Q is a right angle, PQ = 7, and PR = 25.
>
> What is the value of tan P?

*Figure (drawn to scale; labels checked against the drawing): QP = 7; PR = 25; right angle at Q.*

- **A. 24/7** ✓
- B. 7/24 — *trap: Using the Pythagorean theorem correctly but then misidentifying which of the three sides is opposite versus adjacent to the specific angle in question.*
- C. 24/25
- D. 7/25

*Explanation:* First QR = √(25² - 7²) = √576 = 24. For angle P, the opposite side is QR = 24 and the adjacent side is PQ = 7: tan P = 24/7. 7/24 swaps opposite and adjacent.

**8. Radian Measure and Coterminal Angles · easy**

> What is the measure of a 150° angle in radians?

- **A. 5π/6** ✓
- B. 5π/12 — *trap: Converting between radians and degrees incorrectly, especially forgetting that π radians equals 180°, not 360°.*
- C. 3π/4
- D. 150π

*Explanation:* Multiply by π/180: 150 × π/180 = 5π/6. 5π/12 uses 360° for π.

**9. Radian Measure and Coterminal Angles · medium**

> Which angle measure, between 0 and 2π radians, is coterminal with an angle of 17π/6 radians?

- **A. 5π/6** ✓
- B. π/6 — *trap: Subtracting or adding the wrong number of full rotations (2π), leaving an angle that's still outside the standard range or overshoots into the wrong quadrant.*
- C. 11π/6 — *trap: Subtracting or adding the wrong number of full rotations (2π), leaving an angle that's still outside the standard range or overshoots into the wrong quadrant.*
- D. 17π/12 — *trap: Converting between radians and degrees incorrectly, especially forgetting that π radians equals 180°, not 360°.*

*Explanation:* Subtract one full rotation: 17π/6 - 12π/6 = 5π/6, which is already between 0 and 2π.

**10. Radian Measure and Coterminal Angles · easy**

> What is the measure, in degrees, of an angle of 3π/4 radians?

- **A. 135** ✓
- B. 270 — *trap: Converting between radians and degrees incorrectly, especially forgetting that π radians equals 180°, not 360°.*
- C. 67.5
- D. 240

*Explanation:* Multiply by 180/π: (3/4)(180) = 135. 270 treats π as 360°.

**11. Using the Pythagorean Theorem Alone to Find a Missing Side · hard**

> A right triangle has a hypotenuse of length 9 and one leg of length 3√5. What is the length of the other leg?

- **A. 6** ✓
- B. 3√14 — *trap: Adding the hypotenuse's square to a leg's square when solving for the other leg, instead of subtracting — the hypotenuse only gets added when it's the value being solved FOR.*
- C. √66 — *trap: Squaring a radical leg length incorrectly — (a√b)² = a²b, not a²+b or a·b.*
- D. 36

*Explanation:* (3√5)² = 9 × 5 = 45, so the other leg is √(81 - 45) = √36 = 6. Adding instead of subtracting gives √126 = 3√14; squaring 3√5 as 15 gives √66.

**12. Using the Pythagorean Theorem Alone to Find a Missing Side · easy**

> The figure shows a 13-foot ladder leaning against a vertical wall, with its base 5 feet from the wall on level ground.
>
> How high up the wall does the ladder reach, in feet?

*Figure (drawn to scale; labels checked against the drawing): FT = 13; FB = 5; right angle at B.*

- **A. 12** ✓
- B. √194 — *trap: Adding the hypotenuse's square to a leg's square when solving for the other leg, instead of subtracting — the hypotenuse only gets added when it's the value being solved FOR.*
- C. 8
- D. 18

*Explanation:* The ladder is the hypotenuse: √(13² - 5²) = √144 = 12. √194 adds the squares instead of subtracting.

**13. The Sine-Cosine Complementary Angle Relationship · medium**

> In a right triangle, A and B are the two acute angles, and sin A = 0.28. What is the value of cos B?

- **A. 0.28** ✓
- B. 0.72
- C. 0.96 — *trap: Assuming sin and cos of the SAME angle are related this way — the identity only connects sin of one angle to cos of its complement (a different angle), not sin and cos of one angle to each other.*
- D. 3.57

*Explanation:* A and B are complementary, so cos B = sin A = 0.28. 0.96 is cos A, the cosine of the same angle.

**14. The Sine-Cosine Complementary Angle Relationship · hard**

> For an acute angle, sin((2x + 10)°) = cos((x + 20)°). What is the value of x?

- **A. 20** ✓
- B. 10 — *trap: Assuming sin and cos of the SAME angle are related this way — the identity only connects sin of one angle to cos of its complement (a different angle), not sin and cos of one angle to each other.*
- C. 50
- D. 60

*Explanation:* Sine of one angle equals cosine of its complement, so (2x + 10) + (x + 20) = 90, giving 3x = 60 and x = 20. Setting the two angles equal gives x = 10.

**15. SOH-CAH-TOA Setup · hard**

> The figure shows a cable anchored to level ground 30 feet from the base of a vertical pole. The cable meets the top of the pole and makes a 55° angle with the ground.
>
> Which expression gives the length of the cable, in feet?

*Figure (drawn to scale; labels checked against the drawing): AB = 30; ∠A = 55°; right angle at B.*

- **A. 30 / cos 55°** ✓
- B. 30 cos 55° — *trap: Choosing the wrong trig ratio (sine instead of tangent, etc.) because the opposite/adjacent/hypotenuse sides weren't correctly identified first.*
- C. 30 / sin 55° — *trap: Misidentifying which side is opposite versus adjacent relative to the specific angle being used — this depends on the angle's position, not just the shape of the triangle.*
- D. 30 tan 55° — *trap: Choosing the wrong trig ratio (sine instead of tangent, etc.) because the opposite/adjacent/hypotenuse sides weren't correctly identified first.*

*Explanation:* The cable is the hypotenuse and 30 is the side adjacent to the 55° angle: cos 55° = 30/cable, so cable = 30/cos 55°. Using sine treats 30 as the opposite side.

## Circles (`m-circles`): 10 → 25 items

### Fixed

- **Item 2.** Added a figure of the circle and the right-angle sector.

### New items

**1. The Circle Equation (Center-Radius Form) · hard**

> A circle in the xy-plane has the equation x² + y² - 6x + 4y - 12 = 0. What is the radius of the circle?

- **A. 5** ✓
- B. 12
- C. √12
- D. 25 — *trap: Forgetting to square the radius on the right side of the equation (writing r instead of r²), or forgetting to take the square root when working backward from an equation to find r.*

*Explanation:* Complete the square: (x - 3)² + (y + 2)² = 12 + 9 + 4 = 25, so the radius is 5. 25 is r², not r; √12 ignores the constants added while completing the square.

**2. The Circle Equation (Center-Radius Form) · easy**

> What is the center of the circle with equation (x + 4)² + (y - 1)² = 9?

- **A. (-4, 1)** ✓
- B. (4, -1) — *trap: Writing the wrong sign for a negative coordinate in the center — forgetting that subtracting a negative number flips to addition.*
- C. (-4, -1) — *trap: Writing the wrong sign for a negative coordinate in the center — forgetting that subtracting a negative number flips to addition.*
- D. (4, 1) — *trap: Writing the wrong sign for a negative coordinate in the center — forgetting that subtracting a negative number flips to addition.*

*Explanation:* The form is (x - h)² + (y - k)² = r², and x + 4 = x - (-4), so h = -4 and k = 1. Reading the signs as written gives (4, -1).

**3. The Circle Equation (Center-Radius Form) · medium**

> A circle in the xy-plane has center (-2, 5) and passes through the point (1, 1). Which equation represents the circle?

- **A. (x + 2)² + (y - 5)² = 25** ✓
- B. (x - 2)² + (y + 5)² = 25 — *trap: Writing the wrong sign for a negative coordinate in the center — forgetting that subtracting a negative number flips to addition.*
- C. (x + 2)² + (y - 5)² = 5 — *trap: Forgetting to square the radius on the right side of the equation (writing r instead of r²), or forgetting to take the square root when working backward from an equation to find r.*
- D. (x - 1)² + (y - 1)² = 25

*Explanation:* The radius is the distance from (-2, 5) to (1, 1): √(3² + 4²) = 5, so r² = 25. The second choice flips the center's signs, and the third forgets to square the radius.

**4. The Circle Equation (Center-Radius Form) · medium**

> The figure shows a circle in the xy-plane. The center of the circle is marked, and the circle passes through the point (7, 2).
>
> Which equation represents the circle?

*Figure (drawn to scale; labels checked against the drawing): unlabeled construction.*

- **A. (x - 3)² + (y - 2)² = 16** ✓
- B. (x + 3)² + (y + 2)² = 16 — *trap: Writing the wrong sign for a negative coordinate in the center — forgetting that subtracting a negative number flips to addition.*
- C. (x - 3)² + (y - 2)² = 4 — *trap: Forgetting to square the radius on the right side of the equation (writing r instead of r²), or forgetting to take the square root when working backward from an equation to find r.*
- D. (x - 2)² + (y - 3)² = 16

*Explanation:* The center is (3, 2) and the radius is 7 - 3 = 4, so r² = 16. The second choice flips the signs, and the third leaves the radius unsquared.

**5. Arc Length and Sector Area as Fractions of the Whole Circle · medium**

> In the figure, O is the center of the circle, the radius is 6, and the measure of angle AOB is 120°.
>
> What is the length of the minor arc AB?

*Figure (drawn to scale; labels checked against the drawing): OA = 6; ∠O = 120°.*

- **A. 4π** ✓
- B. 12π — *trap: Confusing arc length (a fraction of the circumference, a length) with sector area (a fraction of the area) and using the wrong base formula.*
- C. 2π
- D. 6π

*Explanation:* Arc length = (120/360) × 2π(6) = (1/3)(12π) = 4π. 12π is the sector's area, (1/3)(36π).

**6. Arc Length and Sector Area as Fractions of the Whole Circle · medium**

> A sector of a circle with radius 6 has an area of 15π. What is the central angle of the sector, in degrees?

- **A. 150** ✓
- B. 75
- C. 300
- D. 135

*Explanation:* The whole circle's area is 36π, and 15π/36π = 5/12 of it. (5/12)(360°) = 150°.

**7. Arc Length and Sector Area as Fractions of the Whole Circle · medium**

> A circle has a radius of 9. What is the length of an arc of the circle intercepted by a central angle of 2π/3 radians?

- **A. 6π** ✓
- B. 3π
- C. 27π — *trap: Confusing arc length (a fraction of the circumference, a length) with sector area (a fraction of the area) and using the wrong base formula.*
- D. 18π

*Explanation:* For an angle in radians, arc length = rθ = 9(2π/3) = 6π. 27π is the sector's area, (1/2)r²θ.

**8. Arc Length and Sector Area as Fractions of the Whole Circle · easy**

> An arc of a circle with radius 10 has a length of 5π. What is the measure, in degrees, of the central angle that intercepts the arc?

- **A. 90** ✓
- B. 45
- C. 180
- D. 30

*Explanation:* The circumference is 20π, and 5π is 1/4 of it, so the angle is (1/4)(360°) = 90°.

**9. Solving the Circle Equation for a Coordinate's Possible Values · medium**

> The circle (x - 1)² + (y + 2)² = 25 contains two points with an x-coordinate of 4. What are the y-coordinates of these points?

- **A. 2 and -6** ✓
- B. 2 only — *trap: Reporting only one solution when the equation actually produces two valid values (missing the ± from a square root).*
- C. -2 and 6
- D. 4 and -4

*Explanation:* Substitute x = 4: 9 + (y + 2)² = 25, so (y + 2)² = 16 and y + 2 = ±4. Then y = 2 or y = -6. '2 only' misses the negative square root.

**10. Solving the Circle Equation for a Coordinate's Possible Values · medium**

> Which point lies inside the circle x² + y² = 50?

- **A. (5, 4)** ✓
- B. (5, 5)
- C. (6, 4)
- D. (7, 1)

*Explanation:* A point is inside when x² + y² < 50. (5, 4) gives 41. (5, 5) and (7, 1) give exactly 50, so they lie on the circle, and (6, 4) gives 52, outside it.

**11. Solving the Circle Equation for a Coordinate's Possible Values · easy**

> The point (6, b) lies on the circle x² + y² = 100. What are all possible values of b?

- **A. 8 and -8** ✓
- B. 8 only — *trap: Reporting only one solution when the equation actually produces two valid values (missing the ± from a square root).*
- C. 4 and -4
- D. 2√34

*Explanation:* 36 + b² = 100, so b² = 64 and b = ±8. Both points are on the circle.

**12. Circle Theorems: Central Angles, Arcs, and Tangent Lines · medium**

> In the figure, O is the center of the circle, and points A, B, and C lie on the circle. The measure of central angle AOB is 100°.
>
> What is the value of x?

*Figure (drawn to scale; labels checked against the drawing): ∠O = 100°; ∠C = x°.*

- **A. 50** ✓
- B. 100 — *trap: Confusing a central angle (vertex at the circle's center, equal to its arc) with an inscribed angle (vertex on the circle itself, equal to HALF its intercepted arc) — these follow different rules.*
- C. 200
- D. 80

*Explanation:* An inscribed angle is half the central angle that intercepts the same arc: x = 100/2 = 50. Treating the inscribed angle like a central angle gives 100.

**13. Circle Theorems: Central Angles, Arcs, and Tangent Lines · medium**

> In the figure, the line is tangent to the circle with center O at point P. The radius OP is 5, and PQ = 12.
>
> What is the length of OQ?

*Figure (drawn to scale; labels checked against the drawing): OP = 5; PQ = 12; right angle at P.*

- **A. 13** ✓
- B. 17
- C. 7
- D. √119 — *trap: Forgetting that a tangent line and the radius drawn to the point of tangency are perpendicular, missing an available right angle and Pythagorean setup.*

*Explanation:* A tangent is perpendicular to the radius at the point of tangency, so triangle OPQ has a right angle at P: OQ = √(5² + 12²) = 13. √119 treats OQ as a leg.

**14. Circle Theorems: Central Angles, Arcs, and Tangent Lines · medium**

> In the figure, O is the center of the circle, the radius is 7, and the measure of angle AOB is 60°.
>
> What is the length of chord AB?

*Figure (drawn to scale; labels checked against the drawing): OA = 7; ∠O = 60°.*

- **A. 7** ✓
- B. 7√3 — *trap: Not recognizing when two radii of the same circle create an isosceles (or, with a 60° angle between them, equilateral) triangle.*
- C. 14 — *trap: Not recognizing when two radii of the same circle create an isosceles (or, with a 60° angle between them, equilateral) triangle.*
- D. 7√2 — *trap: Not recognizing when two radii of the same circle create an isosceles (or, with a 60° angle between them, equilateral) triangle.*

*Explanation:* OA and OB are both radii, so triangle AOB is isosceles; with a 60° angle between them, the other two angles are also 60°, making the triangle equilateral. AB = 7.

**15. Circle Theorems: Central Angles, Arcs, and Tangent Lines · hard**

> In the figure, AB is a diameter of the circle with center O, and C lies on the circle. AC = 6 and BC = 8.
>
> What is the radius of the circle?

*Figure (drawn to scale; labels checked against the drawing): AC = 6; CB = 8; right angle at C.*

- **A. 5** ✓
- B. 10
- C. 7
- D. 14

*Explanation:* An angle inscribed in a semicircle is a right angle, so AB = √(6² + 8²) = 10. The radius is half the diameter: 5. 10 is the diameter.

