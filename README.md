# Elevate SAT Prep

A full 6-month SAT curriculum platform built around the official SAT Suite
subskills (23 subskills across Reading & Writing and Math). Real per-student
accounts (email + password), persistent progress tracking, lessons, and
scored practice quizzes.

## Run it locally

You need [Node.js](https://nodejs.org) 18 or later installed. Then, from
this folder:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Sign up
with any email/password to create your first account — this is a completely
local database (a file called `dev.db` in this folder), so it's just for
your own testing until you deploy.

An `.env` file with working local defaults is already included. Nothing else
to configure for local use.

### Resetting your local database

If you want to wipe all accounts/progress and start fresh:

```bash
rm dev.db
npx prisma migrate dev --name init
```

## Project structure

- `app/` — Next.js pages and API routes (App Router)
  - `app/login` — sign up / log in page
  - `app/dashboard` — main curriculum overview
  - `app/plan` — the 26-week study roadmap
  - `app/subskill/[id]` — lesson + quiz for one subskill
  - `app/api/auth/*` — signup, login, logout, current-user routes
  - `app/api/progress` — saves/fetches quiz scores per student
- `data/curriculum.ts` — the 29 official SAT Suite subskills, broken into 78
  named question **patterns** (distinct question "shapes" within each
  subskill), each with a full teaching explanation, 5-6 worked examples
  ordered easy to hard, and common traps — plus a separate **tips and
  tricks** list of quick, shortcut-style heuristics. This is the
  deep-teaching content, described further below.
- `data/questions.ts` — the practice question bank (~12-16 original
  questions per subskill, 361 total — see below to add more)
- `prisma/schema.prisma` — the database model (User, Progress)
- `lib/` — auth (bcrypt password hashing, JWT sessions), Prisma client

## Question bank

`data/questions.ts` contains **361 original practice questions** (about
12-16 per subskill, across all 29 official SAT Suite subskills). Every
question was written from scratch to match the official digital SAT's
format, phrasing style, and difficulty — none of it is copied or adapted
from College Board's own question bank or any other test-maker's material.
That distinction matters for a paid product: reusing an actual test-maker's
questions would create real copyright exposure, whereas original questions
mirroring the public skill descriptions do not.

Each subskill is a simple array keyed by its subskill id:

```ts
"m-percentages": [
  {
    q: "A shirt originally $40 is discounted 25%. What is the sale price?",
    choices: ["$10", "$25", "$30", "$35"],
    answer: 2, // index into choices, 0-based
    explain: "25% of 40 is 10; 40 - 10 = 30.",
    pattern: "Straightforward Percent Change and Discount Problems", // optional, see below
  },
  // add more questions here
],
```

Add as many objects as you like to each array — the quiz UI automatically
adjusts to however many questions exist per subskill. 12-16 per subskill is
enough that a student won't see many repeats across a handful of sessions;
if you want zero repeats across the full 6-month course, aim higher (30+)
for subskills students will revisit during the full-length test weeks.

**Before you rely on this bank for paying clients:** given the volume,
spot-check a sample of questions and worked explanations yourself,
especially in Math, since a single mis-keyed answer index is easy to miss
at this scale and you know the material better than any automated check
would.

### Tying quiz questions back to the lesson: the `pattern` field

Each question can optionally carry a `pattern` field naming exactly one
`Pattern.name` from that subskill's entry in `data/curriculum.ts`. When a
student answers a tagged question incorrectly, the quiz UI shows a "This
question tests: [Pattern Name]" callout with that pattern's full method
explanation (the same one from the lesson) and a link that jumps straight
to that pattern's worked examples — so a wrong answer teaches the
transferable method, not just this one question's answer. Correct answers
never show the callout, since getting a question right is meant to be the
actual signal of mastery, not something that needs scaffolding.

`pattern` is optional and should only be set when a question maps cleanly
to exactly one pattern's specific method — 336 of the 361 existing
questions (93%) are tagged this way; the rest were left untagged rather
than force-fit into a pattern that doesn't really describe how to solve
them, since a misleading method attribution would undermine the whole
point. If you add new questions, tag them the same way when there's a
clean match, and leave `pattern` off otherwise. Untagged wrong answers
just show the existing `explain` text, same as before this feature existed.

This project deliberately does **not** cite or reference real SAT
questions (from College Board or otherwise) anywhere in the app, including
here — see the copyright note above. "This question tests [pattern]" ties
a wrong answer back to this app's own original lesson content, not to an
external test.

## Lesson content: patterns, worked examples, and tips

Each subskill's lesson page (`data/curriculum.ts`) goes deeper than a
generic overview. Instead of one blob of tips, every subskill is broken
into named **patterns** — distinct question "shapes" that show up within
that subskill, each solved by a genuinely different method (for example,
Boundaries splits into "Independent Clause Joins," "Semicolon-Separated
Lists with Internal Commas," "Nonessential Appositives and Descriptive
Phrases," and "Introductory Phrases," since each requires a different
mental model, not just a variation on the same rule). Patterns were
calibrated against real released SAT practice tests for format and
phrasing conventions — never by copying real questions, just by matching
the shapes those tests actually use — which is also how gaps in earlier
pattern coverage got found and split out into their own patterns.

Each pattern includes:

- **explanation** — the underlying logic and reliable method for that
  specific pattern, written the way an experienced tutor would actually
  teach it
- **examples** — an array of 5-6 fully worked questions (`WorkedExample`),
  ordered from easiest to hardest and each tagged with a
  `difficulty: "easy" | "medium" | "hard"` (typically 2 easy, 2 medium, and
  1-2 hard). Every example has its own `prompt`, a step-by-step
  `walkthrough`, and the `answer`. Within one pattern, every example is
  solved by the same underlying method — later examples vary what makes
  them hard (a subtler trap, a reversed direction, a less obvious
  application of the same rule) rather than just using bigger numbers. If a
  question shape needs a genuinely different method to solve, it becomes
  its own pattern instead of being force-fit into an existing one. In the
  lesson UI, students step through a pattern's examples one at a time via
  a segmented progress bar and a difficulty pill, rather than seeing them
  all stacked on the page at once — see "Guided lesson pathway" below for
  how that connects into a full walkthrough of the subskill.
- **traps** — the specific wrong-answer reasoning students tend to fall
  for on that exact pattern, shown once per pattern (not per example)

Separately, each subskill has a **tipsAndTricks** array: punchy,
shortcut-style heuristics (e.g., "if you see a plain system of two linear
equations, graphing both and reading the intersection point is often
faster and safer than solving algebraically"). In the app, these render as
a persistent side panel next to the lesson on desktop, and a collapsible
section on mobile — distinct from the core pattern explanations, since
tips are meant to be skimmed independently.

To add a new pattern to a subskill, find its entry in `data/curriculum.ts`
and add an object to its `patterns` array (referencing the `Pattern`
interface at the top of the file) or a string to its `tipsAndTricks` array.
The UI picks up new patterns and tips automatically — no other code changes
needed.

## Math domain classification and Desmos shortcuts

The 19 Math subskills (four domains: Algebra, Advanced Math,
Problem-Solving and Data Analysis, and Geometry and Trigonometry) were
checked against College Board's own published digital SAT Suite Assessment
Framework and current skill breakdown, not just against practice-test
impressions. Both the domain weighting (Algebra ~35%, Advanced Math ~35%,
Problem-Solving and Data Analysis ~15%, Geometry and Trigonometry ~15%) and
all 19 individual skill names in `data/curriculum.ts` already match the
official framework exactly — so no subskill/domain restructuring was
needed.

What that research did surface is that the built-in Desmos graphing
calculator is available for *every* Math question on the digital SAT
(unlike the old paper test's calculator-vs-no-calculator split), and a
handful of question patterns have a genuine, mechanical shortcut through
it — graph it and read the answer off the picture, instead of solving
algebraically. The classic example: a system of two linear equations has
no algebra to do at all if you graph both lines and click their
intersection.

That shortcut is real for 5 of the 54 patterns in the whole Math
curriculum, and actively unhelpful or irrelevant for the rest (e.g.
"Evaluating Statistical Claims" is pure reasoning about study design —
there's nothing to graph). So this is deliberately **not** a blanket
per-subskill feature: `Pattern` (see `data/curriculum.ts`) has an optional
`desmosTrick` field, set only on the specific patterns where the trick is
concrete and reliable — currently "Reading the Solution Directly from a
Graph" (Systems), "Determining the Number of Solutions via the
Discriminant" and "Solving a Linear-Quadratic System by Substitution"
(Nonlinear Equations), "Choosing the Right Model Shape from a Scatterplot's
Pattern" (Two-Variable Data), and "The Circle Equation" (Circles). Same
restraint as the `pattern` field on questions: only tag it where it
cleanly applies, never force it in just to have Desmos content everywhere.

Where it is set, it renders as a blue "Desmos shortcut for this pattern"
callout right in that pattern's lesson content (not a generic banner), and
is written as explicit, numbered steps — exactly what to type and exactly
what to look for — rather than abstract advice like "try graphing it,"
since most students using this app are still building solve-it-by-hand
intuition and won't reliably improvise calculator steps on their own. Each
callout links out to
[desmos.com/testing/college-board](https://www.desmos.com/testing/college-board)
in a new tab — the same Desmos build used in the real Bluebook exam — so
students practice on the literal tool they'll use on test day. The app
deliberately links out rather than embedding a live calculator, since a
production embed requires registering for Desmos's own API key
(desmos.com/my-api) under their terms; linking out avoids that dependency
entirely while still getting students fluent with the actual interface.

## Guided lesson pathway

Each subskill lesson (`SubskillClient.tsx`) walks a student through a single
linear path — pattern 1's examples, then pattern 2's, and so on, then into
the practice quiz — instead of leaving navigation to a grid of small,
fiddly targets:

- **Pattern stepper** — the patterns within a subskill render as a
  connected row of numbered steps (like a checkout flow), not a flat list
  of pills. The active step is filled ink-dark; a step turns into a green
  checkmark once a student has viewed every one of its examples; the
  connecting line between two steps fills in the same way. This is purely
  a "have you looked at this yet" signal, not a mastery claim — mastery is
  still only about quiz performance (see Gamification below).
- **Segmented example bar** — replaces the old row of tiny numbered
  circles (which were a genuinely annoying, easy-to-miss tap target) with
  a row of wide, flex-1 segments spanning the card's full width. Each
  segment is a large click/tap target, not just the thin bar you see —
  current segment is ink-dark, already-viewed segments are translucent
  accent-green, unvisited ones are gray.
- **One guided "Next" button** — at the bottom of each pattern, a single
  primary button advances the student along the whole pathway: to the next
  example, then to the next pattern once examples run out, then finally
  into the practice quiz once the last pattern's last example is reached.
  Its label changes accordingly ("Next example →" / "Next pattern →" /
  "Start practice quiz →"), so it's always obvious what happens next. A
  "Previous" button mirrors this backward, including crossing back over a
  pattern boundary. Free jumping is still available (click any step or
  segment directly) for review — the guided button is the default path,
  not the only path.

## 6-month pace

The dashboard shows a `PacingBar` (`components/PacingBar.tsx`) above the
overall-progress bar: a steady-pace line for finishing all subskills the
26-week study plan schedules, by the end of that 26-week window, plotted
against how many a student has actually done.

- The 26-week plan covers a fixed set of subskills (`STUDY_PLAN`'s
  `type: "subskill"` entries) over `COURSE_LENGTH_DAYS` (182) days, counted
  from each student's account-creation date (`User.createdAt`).
- The bar's fill is actual subskills done; a thin "Today" marker shows
  where a steady, evenly-paced student would be by now. A status line
  below states it directly — "N subskills ahead of pace," "behind pace,"
  or "Right on pace" — deliberately worded as a nudge, not a scold, since
  this is meant to keep a high schooler motivated over six months, not
  guilt them for a slow week.
- The pacing math is pure and testable in `lib/pacing.ts`
  (`computePacing`), independent of the date it's called with, so it's
  easy to unit test edge cases like day 1 or the last day of the course.

## Gamification: streaks, XP, and mastery

To make consistent practice feel rewarding (this is built for high
schoolers, not accountants), the app tracks three things per student,
computed in `lib/gamification.ts` and stored on `User`:

- **XP** — 10 XP per question a student answers correctly for the first
  time on a subskill, i.e. only for genuine improvement on that subskill's
  best score. Re-submitting a quiz without doing better earns 0 new XP, so
  the number reflects progress, not attempts. A one-time **25 XP mastery
  bonus** fires the moment a subskill first reaches a perfect score.
- **Daily streak** — `currentStreak` increments the first time a student
  submits any quiz on a new calendar day (UTC), and resets to 1 if a day is
  skipped. `longestStreak` is kept separately so a broken streak doesn't
  erase the record.
- **Mastery** — a subskill is "Mastered" once its best score equals its
  total. Mastered subskills get a gold badge and card treatment on the
  dashboard and study plan, distinct from the green "attempted" state.

These show up as: a streak/XP chip pair in the header on every page
(`components/AppShell.tsx`), gold mastery badges and per-domain progress
bars on the dashboard (`app/dashboard/DashboardClient.tsx`), an overall
week-progress bar on the study plan, and a results banner after each quiz
(`ResultBanner` in `SubskillClient.tsx`) that counts the score up, pops in
the XP gained, shows the streak, and — on a fresh mastery — fires a brief
CSS-only confetti burst. All of this is computed server-side in
`app/api/progress/route.ts` on every submission and returned to the client
in the same response, so there's no separate stats fetch.

If you change the XP/streak rules, `lib/gamification.ts` is the only place
that matters — it's pure functions with no Prisma or Next.js dependencies,
so it's straightforward to unit test.

## Deploying this online

This app is ready to deploy to any Node-hosting platform (Vercel, Railway,
Render, Fly.io, etc). The one thing to change is the database.

**Why:** SQLite (used above for local dev) is just a file on disk. Most
serverless hosts (like Vercel) don't give you persistent, writable disk
storage in production, so a file-based database doesn't survive between
requests there. The fix is to point Prisma at a real hosted database
instead — this is a config change, not a rewrite, because your application
code (all the `prisma.user.findUnique(...)`-style calls) stays identical.

### Steps to deploy

1. **Create a free hosted Postgres database.** Two good options:
   - [Neon](https://neon.tech) — generous free tier, made for exactly this
   - [Supabase](https://supabase.com) — also has a free tier, includes extras
     you don't need yet (auth, storage) but doesn't hurt to have

   Either one gives you a `DATABASE_URL` connection string after signup.

2. **Update `prisma/schema.prisma`:** change the datasource provider from
   `sqlite` to `postgresql`:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run migrations against the new database** (locally, pointed at
   production, one time):

   ```bash
   DATABASE_URL="your-neon-or-supabase-url" npx prisma migrate deploy
   ```

4. **Push this code to a GitHub repository.** If you're not already using
   git:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
   Then create a repo on GitHub and follow its instructions to push.

5. **Deploy on Vercel** (recommended, easiest path):
   - Go to [vercel.com](https://vercel.com), sign up, click "New Project,"
     and import your GitHub repo.
   - In the project's Environment Variables settings, add:
     - `DATABASE_URL` — your Neon/Supabase connection string
     - `SESSION_SECRET` — a long random string (generate one with
       `openssl rand -base64 32` in your terminal)
   - Click deploy. Vercel will run `npm run build`, which runs
     `prisma generate && prisma migrate deploy` automatically (already set
     up in `package.json`).

6. **Point your domain at it.** In Vercel's project settings under
   "Domains," add your own domain (e.g. `yourbrand.com`) and follow the DNS
   instructions Vercel gives you.

After that, the link you send clients is your own domain, accounts and
progress persist in a real database, and the whole thing keeps running
without you needing to keep anything open locally.

## Security notes before charging real money through/around this

- Passwords are hashed with bcrypt — reasonable for this scale.
- Sessions are signed JWTs in an httpOnly cookie — reasonable for this scale.
- There's currently no password-reset flow, no email verification, and no
  rate-limiting on login attempts. Fine for a small pilot with people you
  know; worth adding before wider public signup.
- This app has no payment/subscription logic yet — it only handles
  accounts, curriculum, and progress. Billing (e.g. via Stripe) would be a
  separate piece to add before you can actually charge the $10/month.
