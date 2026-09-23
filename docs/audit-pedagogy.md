# Pedagogy audit: why diligence isn't converting into points

**Frame.** A student used this app for eight weeks without missing a day. She read every lesson,
took every quiz and kept her streak. Her score rose 40 points. This audit asks why it wasn't 150.

**Scope.** It follows the learning loop exactly as the code implements it:

1. lesson
2. worked examples
3. practice quiz
4. feedback on a miss
5. what the app does next
6. what it does weeks later

UX friction already covered in `docs/walkthrough-maya.md` is not repeated here.

**Labels.** Every finding carries one of:

- **NOT BUILT**: a gap, nothing in the code attempts it.
- **WRONG**: built, and it trains or reports the wrong thing.
- **TRADEOFF**: a defensible choice for a self-paced tool. Confirm it's intentional.

**Costs.** Content cost means authoring work (items, explanations, tags). Build cost is
engineering only.

**Bank size.** The bank holds **375 items, not 361**: 160 Reading & Writing and 215 Math, across
29 subskills, from 8 to 22 items each. Counted by evaluating `data/questions.ts` directly.

---

## The three mechanisms most responsible for the plateau

### 1. Every practice question she answers arrives already labelled

The only place practice items are served is the subskill page. It passes that one subskill's
bank to the quiz and nothing else: `QUESTIONS[params.id]` at `app/subskill/[id]/page.tsx:17`. I
searched every consumer of `QUESTIONS`. There are three:

- the subskill page
- the progress route, which reads the bank only to count items (`app/api/progress/route.ts:71`)
- the landing page, which counts items for a marketing number (`components/landing/LandingPage.tsx:26`)

No mixed set, review set, or cross-subskill draw exists anywhere in `app/`, `components/` or
`lib/`.

The plan makes the blocking coarser still. `buildStudyPlan` (`data/curriculum.ts:7220-7245`)
hands out subskills one week at a time in curriculum order. By default that order is all of
Reading & Writing first, because `CURRICULUM` starts with that section at `data/curriculum.ts:6903`.

On the default 26-week plan:

- **Reading & Writing** is introduced in weeks 1–6.
- **Math** is introduced in weeks 7–25.

On an 11-week plan, Reading & Writing occupies weeks 1–4 and Math weeks 4–10.

So she spends every practice session knowing which skill is being tested. She has usually just
read the method for it minutes earlier, in the same lesson. What she never practices is the step
the real test makes her do first: looking at an unlabeled question and deciding which of 29 skills
it is and which method applies.

Her first time doing that is inside one of the eight full-length practice tests. Those are taken
outside the app, in Bluebook, and only logged here. They are the product's only mixed practice,
so she meets interleaving under test conditions only, about once a month. This is the single
biggest ceiling on how far her practice transfers to the test.

### 2. "Mastered" measures whether she has memorized the quiz, not whether she has the skill

**Every quiz is the entire bank for that subskill, every time.** A retake serves identical
items in identical order. Only the answer choices are reshuffled
(`app/subskill/[id]/SubskillClient.tsx:204`, `shuffleChoices` at `:1477`).

**Mastery requires a perfect score on that fixed set.**

- The check is `newBest === bestTotal` at `app/api/progress/route.ts:114`.
- The same check repeats in `isDomainComplete` at `lib/mastery.ts:52` and the recommender at
  `lib/recommend.ts:38,49`.
- Only the best attempt is kept: `route.ts:95-97` overwrites `bestScore` whenever a new attempt's
  ratio ties or beats the old one.

On a 12-item Math quiz, retake two or three times and she will recognize the items: "the one with
the train, the answer was 45." That is how she gets to "Mastered."

**Nothing stored could reveal it.** The `Progress` row (`prisma/schema.prisma:132-143`) holds
only `bestScore`, `total`, `attempts` and `lastAttempt`. There is no per-attempt row, no per-item
result and no first-attempt score. The client sends only an aggregate count (`SubskillClient.tsx:354,365`).

So the app cannot tell apart two students:

- one who scored 15/15 cold
- one who went 6/15, then 9/15, then 13/15, then 15/15 on the same fifteen items

**Every downstream number inherits the inflation:**

- the dashboard's "★ Mastered" (`DashboardClient.tsx:247,394`)
- domain stars
- the pace bar
- costume unlocks

It also reaches scheduling. The plan orders domains by `domainWeaknessScore`
(`lib/mastery.ts:128`), which uses best-ever quiz %. Memorizing a domain's quizzes therefore
pushes that domain toward the back of her plan.

### 3. Nothing she learns is ever asked again

"Mastered" is permanent: nothing in `lib/` or `app/` reads `lastAttempt` for decay. Its only use
is counting quizzes for the welcome-back modal (`app/dashboard/page.tsx:110`).

The plan does reserve review time. In a typical week, 4–5 of the 6 working days are "review" days
(`lib/studyPlan.ts:51-67`). But the review pool is `[...this week's subskills, ...every earlier
subskill]`, walked from index 0 every single week (`lib/studyPlan.ts:64-66`). I replicated the
logic for the default 26-week plan:

| | Review days |
|---|---|
| Total | 119 |
| Plan's first four subskills | 93 (27, 26, 23, 17) |
| Each of the other 25 subskills | exactly 1, in the week it was introduced |

So a subskill finished in week 6 is never scheduled again. Even when a review day does name a
mastered subskill, the dashboard's "Jump back in" button skips it. `findRecommended` filters
mastered subskills out of today's list (`lib/recommend.ts:38`) and falls through to the next
unmastered one.

In week 20 the dashboard still says she's mastered Transitions. She last saw a transitions question
in week 5, and she has forgotten it.

---

## Findings by dimension

### 1. Blocked vs. interleaved practice: **NOT BUILT** (plan structure: **WRONG**)

- **Evidence.** Mechanism 1 above.
  - Quizzes are single-subskill (`app/subskill/[id]/page.tsx:17`).
  - The plan is section-blocked by default (`data/curriculum.ts:6903,7220-7245`).
  - After a practice test is logged, the plan is domain-blocked, because weakness ordering sorts
    by domain (`lib/mastery.ts:152-160`).
- **Small mitigation.** Items within a subskill are mixed across that subskill's 2–4 patterns
  (e.g. `m-nonlinear-func` interleaves 4 patterns). The pattern name isn't shown until after
  submission (`SubskillClient.tsx:857`). That is interleaving across a two-to-four-way choice she
  was just taught, not a 29-way one.
- **How much is missing.** 0% of in-app practice items are served out of subskill context. The
  student's only mixed practice is the 8 full-length tests, which the plan places at 1/8…8/8 of
  the course (`data/curriculum.ts:7224-7228`). That means 8 sittings in 26 weeks, all diagnostic.
- **Score impact.** Highest in the report. Recognizing which skill a question is testing is a
  large share of the SAT's difficulty, and the app never exercises it.
- **Content cost.** None. The existing 375 items can be drawn across subskills.
- **Build cost.** A "mixed set" route plus a selection function, pointed at the plan's review
  days. The plan fix is separate and small: alternate Reading & Writing and Math subskills in
  `buildStudyPlan`'s order instead of doing one section and then the other.

### 2. Mastery that doesn't decay: **WRONG**

- **Evidence.** Mechanism 3.
  - The review pool always starts at index 0 (`lib/studyPlan.ts:64-66`), giving 93 of 119 review
    days to the first four subskills.
  - The recommender skips mastered subskills (`lib/recommend.ts:38`).
  - Nothing reads `lastAttempt` for decay; its only use is `app/dashboard/page.tsx:110`.
  - "★ Mastered" is permanent (`DashboardClient.tsx:247,394`).
- **Score impact.** High. With the default Reading & Writing-first order, all Reading & Writing
  learning finishes by week 6 of 26. Apart from the first four subskills, Reading & Writing is
  never revisited in the 20 weeks before the test.
- **Content cost.** None.
- **Build cost.** Small. Pick review subskills by oldest `lastAttempt` (or oldest correct
  exposure) instead of `r % length`. Let the recommender surface a due review. Show mastery with
  its age, e.g. "Mastered · 9 weeks ago · refresher due," instead of a permanent star.
- **Why it's WRONG, not just missing.** The review structure is already built and already takes
  most of each week. It is pointed at the wrong subskills, and the dashboard hides it.

### 3. Item reuse and score inflation: **WRONG**

- **Evidence.** Mechanism 2.
  - The whole bank is served every time, in fixed order, with choices shuffled
    (`SubskillClient.tsx:204,1477`).
  - Mastery is a perfect best score (`api/progress/route.ts:95-97,114`).
  - Storage is aggregate only (`prisma/schema.prisma:132-143`, `SubskillClient.tsx:365`).
- **Score impact.** High, and it compounds. Every progress signal the student and her parent see
  is inflated. Scheduling priority is inflated too, through `domainWeaknessScore`
  (`lib/mastery.ts:128`).
- **What would let you tell the difference.** Per-attempt, per-item records:
  - item id
  - chosen choice
  - correct or not
  - time taken
  - timestamp

  This is a new table and a change to the submit payload. **Content cost: none.** It is the
  foundation for every other fix in this report.
- **Fresh-draw retakes.** Serving a random subset biased toward unseen and previously-missed items
  helps a little at **zero content cost**. The bank is too thin to fix this properly: 8–22 items
  per subskill can't support two non-overlapping forms. A real fix is about **15 new items per
  subskill, roughly 435 items**, which nearly doubles the bank. That is the expensive part of this
  finding.
- **Cheap interim.** Count mastery on the **first** attempt, or on the first attempt after 7+ days,
  not on the best of N consecutive tries. This needs the per-attempt logging above.

### 4. Feedback that diagnoses: **Partly built. Distractor diagnosis: NOT BUILT**

- **What's there, and it's good:**
  - 350 of 375 items carry a `pattern` tag (`data/questions.ts:5-11`).
  - A missed item shows "This question tests: [pattern]", the pattern's method, and a link back
    to that pattern's worked examples (`SubskillClient.tsx:857`, `MethodCallout` at `:1224`).
  - That is real routing from a miss to the relevant lesson.
- **What's missing:**
  - The `Question` type has no per-choice data (`data/questions.ts:1-23`). There is no field for
    why a distractor is attractive, and no misconception tag.
  - Nothing distinguishes a content gap, a misread, a known trap, or a careless error.
  - Nothing routes her to *similar items*. There are none left to route to, since she already saw
    the whole bank.
- **Explanations are thin at the point of failure.** Quiz explanations run a median **94
  characters**, and only about 16% of them (61/375) mention a wrong choice or trap. The lesson's
  worked-example explanations run a median **378 characters**, and about 47% (252/533) address
  wrong choices. Both percentages come from a rough keyword count ("choice", "wrong", "trap",
  "rather than", …), not a hand read. The app explains best where the student is being taught,
  and least where she has just gone wrong.
- **Score impact.** Medium-high. Students who fall for the same distractor type repeatedly
  (extreme language, true-but-irrelevant, answers the wrong question) plateau until someone
  names the pattern.
- **Content cost, in increasing order:**
  1. Tag each distractor with one of its pattern's existing `traps` entries (`data/curriculum.ts:35`;
     106 patterns have trap lists). That's **about 1,125 tag selections** (375 × 3). It is choosing
     from lists that already exist, not writing, plus a handful of new traps where a list has gaps.
  2. A one-sentence rationale per distractor: **about 1,125 sentences**.
  3. Bring the 375 quiz explanations up to lesson depth: **375 rewrites**.

  Option 1 is the high-yield one: it enables "you've fallen for *extreme language* 4 times this
  week."

### 5. Timing: **NOT BUILT**

- **Evidence.** No timer, per-item duration, or pace signal exists in the quiz. I grepped the
  quiz component for `timer|elapsed|Date.now|performance.now|setInterval|minute` and found no
  quiz timing. Every "pace" hit in the codebase is plan pacing (`lib/pacing.ts`), not
  question pacing.
- **The real pace.** On the digital SAT, Reading & Writing is 54 questions in 64 minutes (about 71
  seconds each). Math is 44 in 70 minutes (about 95 seconds each). Every in-app item is untimed.
- **Score impact.** Medium-high for exactly this persona: diligent, accurate when unhurried.
  Untimed accuracy overstates timed accuracy, and the gap is largest on long Reading & Writing
  passages and multi-step Math.
- **Content cost.** None.
- **Build cost.** Small.
  - Record time per item, which comes free with the item logging above.
  - Show a soft pace target (71s / 95s) and a post-quiz "your average: 1:48 per question."
  - Offer a timed mode for mixed sets.
  - Lessons should stay untimed.

### 6. Worked examples and fading: **Attempt-first is good. Fading: NOT BUILT**

- **Evidence.**
  - Every worked example is attempt-first: she picks an answer before the explanation appears
    (`SubskillClient.tsx:660-671`). That is better than read-only examples and should be kept.
  - Examples are ordered easy to hard (`data/curriculum.ts:34`).
  - Support never fades. All 533 examples reveal the same full prose explanation after one
    click. None use the `Step N:` format that `StepList` already knows how to split
    (`components/StepList.tsx:10-16`): 0 of 533.
  - Each pattern's method is shown directly above its examples, so every example is solved with
    the method on screen.
- **Score impact.** Medium. This mostly matters for Math multi-step work: she learns to follow
  the solution rather than produce it.
- **Content cost.**
  - Cheapest real version: on each pattern's **last** example (about 106), withhold the method
    panel and reveal the explanation one step at a time. That needs those 106 explanations split
    into steps: **about 106 edits**.
  - Full step-structuring of all 533: **533 edits**, mostly mechanical.

### 7. Metacognition: **NOT BUILT**

- **Evidence.** No confidence, "unsure", flag, or guess field exists anywhere. I grepped `app`,
  `components`, `lib` and `data/questions.ts` for `confiden|unsure|guess|flag|mark for review|not sure`.
  The only hits are an unrelated layout constant and question text.
- **Consequence.** An item she got right by guessing is indistinguishable from one she knows. On
  a 4-option item with elimination, guessing between two choices is right half the time. Under
  `bestScore` those lucky hits count toward "Mastered" permanently.
- **Score impact.** Medium-high relative to its cost. "Right but unsure" is the best single
  predictor of which items break on test day, and it's the cheapest signal to collect.
- **Content cost.** None.
- **Build cost.** Small once per-item logging exists: a three-way Sure / Unsure / Guessed control
  per item. Feed "right but unsure" into the review queue, and list those items on the results card.

### 8. What the plan optimizes: **WRONG**

- **Evidence.** `buildStudyPlan` gives every subskill exactly one slot, spread evenly
  (`data/curriculum.ts:7236-7241`). Weakness only **reorders** domains; it never changes how much
  time a subskill gets (`lib/mastery.ts:152-160`, "a pure reordering, never a filter"). Test
  weight appears nowhere. Against College Board's published domain weights:

| Domain | Subskills | Share of plan slots | ≈ Share of composite | Slots per point |
|---|---|---|---|---|
| Information and Ideas | 3 | 10.3% | 13% | 0.79× |
| Craft and Structure | 3 | 10.3% | 14% | 0.74× |
| Expression of Ideas | 2 | 6.9% | 10% | 0.69× |
| Standard English Conventions | 2 | 6.9% | 13% | 0.53× |
| Algebra | 5 | 17.2% | 17.5% | 0.99× |
| Advanced Math | 3 | 10.3% | 17.5% | **0.59×** |
| Problem-Solving & Data Analysis | 7 | 24.1% | 7.5% | **3.2×** |
| Geometry & Trigonometry | 4 | 13.8% | 7.5% | 1.8× |

  The composite share is the section share times the domain share. The section shares are 50/50.
  The domain shares (approximate, from College Board's published distributions) are:

  - **Reading & Writing:** Information and Ideas about 26%, Craft and Structure about 28%,
    Expression of Ideas about 20%, Standard English Conventions about 26%.
  - **Math:** Algebra and Advanced Math about 35% each; Problem-Solving & Data Analysis and
    Geometry & Trigonometry about 15% each.

  Reading & Writing gets **34% of plan slots for 50% of the score**. Problem-Solving & Data Analysis
  gets roughly **5× the time per point** that Advanced Math gets. Advanced Math is one of the two
  heaviest Math domains and the one where mid-range students have the most headroom.
- **A related problem: the plan re-sorts itself on every page load.**
  - The dashboard, plan page and `/api/plan/next` all rebuild the plan from current best-ever
    quiz scores (`dashboard/page.tsx:57-62`, `plan/page.tsx:49-57`,
    `api/plan/next/route.ts:39-40`).
  - An untouched domain scores a neutral 60 (`lib/mastery.ts:129`). As soon as she scores above
    60% on one quiz in a domain, that domain drops behind every domain she hasn't started.
  - The schedule she saw yesterday is not today's.
  - Because weakness uses inflated best scores (finding 3), memorizing a quiz moves a domain later.
- **Score impact.** Medium-high. Time is the student's scarcest input, and it's allocated by
  subskill count rather than points.
- **Content cost.** None.
- **Build cost.** Small.
  - Weight slots by domain share divided by subskill count.
  - Interleave the sections.
  - Freeze the order at plan creation and after each logged practice test, not on every request.

### 9. (Added) Math is 100% multiple choice: **NOT BUILT**

- **Evidence.** `WorkedExample.choices` is "always exactly 4" (`data/curriculum.ts:16`), and every
  `Question` has `choices` and a numeric `answer` index (`data/questions.ts:1-4`). I grepped for
  `grid-in|student-produced|free response`: no hits.
- **Why it matters.** Roughly a quarter of digital-SAT Math questions are student-produced
  response, with no choices to plug in or eliminate. Two strategies the app's own tips teach
  ("plug in the answer choices", "cross off the wrong ones first") don't work on those questions,
  and she never practices without them.
- **Score impact.** Medium on Math.
- **Content cost.** Convert about **54 of the 215 Math items** (roughly 25%) to numeric entry.
  Some need rewording so a unique numeric answer exists, and the build needs answer
  normalization (fractions, decimals).

### 10. (Added) Difficulty labels are length-based and shown before answering: **TRADEOFF, minor**

- **Evidence.** Difficulty is "assigned by a length/complexity heuristic … not hand-graded"
  (`data/questions.ts:12-16`) and shown as a pill before she answers (`SubskillClient.tsx:840`).
- **Effect.** It primes her ("Hard" reads as "slow down, it's a trick") with a label that may not
  be accurate. It also means no practice set can be difficulty-targeted the way the test's second
  module is.
- **Score impact.** Low.
- **Cost.** None to hide the label before submission. Calibrating difficulty properly needs
  first-attempt response data, which again depends on item logging.

### What's working, and should be kept

- Attempt-first worked examples (`SubskillClient.tsx:660-671`).
- Miss → pattern → worked-examples routing (`SubskillClient.tsx:857,1224`).
- Nearly complete pattern tagging (350/375).
- Trap lists on 106 patterns: the raw material for distractor tagging.
- Logged practice tests feed plan priority, with test score weighted above quiz score
  (`lib/mastery.ts:128-133`).
- The 8 official tests are spread across the plan rather than bunched at the end.

These are real foundations. Every fix below builds on them rather than replacing them.

---

## Summary: where to spend time

| Finding | Label | Score impact | Content cost | Build |
|---|---|---|---|---|
| No interleaved practice; section-blocked plan | Not built / Wrong | Highest | None | Medium |
| Mastery = memorized items; no item history | Wrong | High | None (logging); ~435 items for fresh forms | Small–medium |
| No revisiting; review days mis-pointed; permanent "Mastered" | Wrong | High | None | Small |
| Untimed practice | Not built | Medium-high | None | Small |
| Plan allocates by subskill count, not points; re-sorts on every load | Wrong | Medium-high | None | Small |
| No confidence tagging | Not built | Medium-high | None | Small (after logging) |
| No distractor diagnosis; thin quiz explanations | Not built | Medium-high | ~1,125 trap tags (cheap) to ~1,125 rationales + 375 rewrites | Small |
| Math is all multiple choice | Not built | Medium | ~54 item conversions | Medium |
| No fading in worked examples | Not built | Medium | ~106 edits (minimum) | Small |
| Length-based difficulty shown pre-answer | Tradeoff | Low | None | Trivial |

**Cheap wins, no content and under a day each:**

- Walk the review pool by least-recently-seen instead of `r % length`.
- Let the recommender surface a due review.
- Alternate Reading & Writing and Math in the plan order.
- Hide the difficulty pill until after submission.
- Freeze plan order between practice tests.

---

## If you build exactly one thing in the next two weeks

**Build a daily mixed review set, backed by per-item attempt logging, and point the plan's existing
review days at it.**

**What it is:**

- 10–15 items drawn across every subskill she has been introduced to.
- No subskill label shown until after she answers.
- Items weighted toward, in order:
  1. items she has missed
  2. items she marked unsure
  3. subskills with the oldest last exposure
  4. domain test weight, as a tiebreak
- Items she has seen recently are avoided.
- Each answer records item id, choice, correctness, time, and a Sure / Unsure / Guessed tag.
- An optional timer runs at test pace.

**Why this one over the others:**

1. **It hits the top three mechanisms at once.** It removes the "I know what's coming" cue
   (finding 1). It schedules retrieval of old material, which is what makes a week-2 subskill
   still exist in week 20 (finding 2). Its item log is the data foundation that makes honest
   mastery possible (finding 3). Timing and confidence come almost free with it (findings 5 and 7).
2. **It costs zero content.** Every other high-impact fix either needs authoring (distractor
   tags, fresh forms, grid-ins) or depends on the item log this creates.
3. **The plan already reserves the time and currently wastes it.** In a normal week, 4–5 of the 6
   study days are "review" days. 93 of those 119 days go to the same four subskills, and the
   dashboard hides the rest behind the mastered-skip. Pointing them at a mixed set turns a large
   share of her existing study time into the most valuable practice she can do. It does this
   without asking her to study more.

**The honest limitation:** with 8–22 items per subskill, a mixed set will resurface items she has
seen. It still removes the context cue, which is most of the value. Once the item log shows which
items she's answering from memory (fast, sure, previously seen), the next investment is the bank
itself: about 15 fresh items per subskill.

---

## Implementation status (2026-09-23)

The zero-content fixes are built. The content work (distractor tags, fresh items, typed-answer
Math, deeper quiz explanations) is deferred to a separate, reviewable pass.

**Product decisions made for this pass:**

- A perfect quiz makes a subskill **passed**. It becomes **mastered** only after she answers it
  correctly in a later mixed review.
- A mastered subskill **stays mastered** when it goes stale. It is flagged **refresher due** and
  pulled into review; outfits and domain completions are never revoked.
- Existing perfect scores were grandfathered as mastered by the migration.
- The pace clock is **on, gentle, and hideable**.

| # | Finding | What changed | Where |
|---|---|---|---|
| 1 | No interleaving | Plan review days are now **mixed review**: 12 unlabelled questions across every introduced subskill, never the same subskill twice in a row. Plan order alternates Reading & Writing and Math by score weight instead of finishing one section first. | `lib/reviewSet.ts`, `app/review/`, `lib/studyPlan.ts`, `lib/mastery.ts` (`orderSubskillsByWeakness`) |
| 2 | Mastery never decays | Mastered subskills get a refresher due date: 21 days, doubling on each correct refresher, capped at 90. A miss makes it due immediately. Shown as "↻ Refresher due" everywhere, and mixed review pulls due subskills in first. | `lib/progressState.ts`, `app/api/review/route.ts`, `components/SubskillStatusBadge.tsx` |
| 3 | Retake inflation; no item history | Every answer is logged per item (`ItemAttempt`: item, choice, correct, time, confidence) and graded on the server. Retakes reshuffle question order. Mastery needs an unlabelled correct answer after passing. Mixed review avoids items seen in the last 3 days and favours unseen, missed and unsure ones. | `prisma/schema.prisma`, `lib/items.ts`, `lib/activity.ts`, `app/api/progress/route.ts` |
| 4 | Feedback doesn't diagnose | A mixed-review miss names the skill it tested and deep-links to that exact lesson pattern (`/subskill/[id]?pattern=…`). **Distractor tagging and explanation depth are deferred (content).** | `app/review/ReviewClient.tsx`, `SubskillClient.tsx` |
| 5 | Untimed | A pace clock against real SAT pace (71s Reading & Writing, 95s Math) on quizzes (whole quiz) and mixed review (per question). Time is logged per item, and results show average pace against SAT pace. | `components/PaceClock.tsx`, `lib/items.ts` (`PACE_SECONDS`) |
| 6 | No fading | From each pattern's third worked example, the method is folded away ("Try this one from memory") behind a one-click reveal. | `SubskillClient.tsx` (`FADE_FROM_EXAMPLE`) |
| 7 | No metacognition | Sure / Not sure / Guessed on every quiz and review answer. "Right but not sure" is counted on results and those items come back in review; a guessed-correct answer can't confirm mastery. | `components/ConfidencePicker.tsx`, `lib/reviewSet.ts`, `app/api/review/route.ts` |
| 8 | Plan allocates by count, re-sorts constantly | Mixed review samples by score weight (College Board domain shares) × status × recency × shakiness. That is where most practice happens: 4–5 of 6 study days a week. The plan order moves only when a practice test is logged, never on quiz results. | `lib/testWeights.ts`, `lib/reviewSet.ts`, `lib/mastery.ts` |
| 10 | Difficulty shown pre-answer | The difficulty pill appears only after submitting. | `SubskillClient.tsx` |

**Selector check.** A simulation ran 300 sets for a synthetic student with 1 subskill due, 2
passed, 1 attempted and 8 mastered-and-fresh:

- 12 items per set
- about 2.4 questions per passed or due subskill
- about 1.5 per attempted subskill
- about 0.4 per fresh mastered subskill
- zero items from the last 3 days
- zero back-to-back repeats of the same subskill
- no passed or due subskill ever left out

**Still open (content):**

- Distractor misconception tags: about 1,125, chosen from the existing `traps` lists.
- About 15 fresh items per subskill.
- About 54 Math items converted to typed answers.
- Quiz explanations brought up to lesson depth.
