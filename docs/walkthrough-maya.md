# Maya's first-time walkthrough

Maya, 16, junior. Never taken the SAT. PSAT 1120. Test in 11 weeks. Mom paid for this. On an
iPhone ~70% of the time. Doesn't know "subskill," "Bluebook," that the digital SAT is adaptive,
or what a good score is. Bails fast.

Everything below was either reproduced live against a running instance with a fresh account and
an empty database, or traced directly in the source (file:line cited either way).

---

## The 5 things that would make Maya quit

1. **She does a real quiz, gets a real score, and the app tells her "0%."** Scored 7/18 (39%) on
   her very first quiz. The big number on her dashboard for that whole subject still read `0%`,
   because it's a "fully mastered" count, not an effort/attempt score, and nothing nearby says so.
   This is the app's core feedback loop punishing the exact behavior it wants to reinforce, in the
   first five minutes. (See Dashboard, finding 1.)
2. **Mid-quiz, any navigation away — a phone buzz, a back-swipe, a refresh — wipes every answer
   she's picked so far.** No warning, no draft save. On an 18-22 question quiz that's a lot to
   redo from zero. (See Practice quiz, finding 1.)
3. **Her plan silently assumes she has 6 months, not 11 weeks, and nothing ever asks her.**
   Onboarding never asks for a test date. The dashboard never mentions one is missing. She'd have
   to stumble into Settings on her own to find the one field that fixes it. (See Welcome/Onboarding
   finding 2, Dashboard finding 2.)
4. **If she ever forgets her password, she's locked out of her mom's paid account forever.** No
   "forgot password" link exists anywhere, and there is no support/contact email anywhere in the
   app. (See Login, finding 3.)
5. **On her phone — where she is most of the time — Ozho stands on top of the sentence she's
   reading, or the answer choice she's about to tap.** Happens on the lesson page, the quiz page,
   and the plan page. Reads as "this app is glitchy," not "cute mascot." (See Mobile, finding 1.)

---

## Landing / cold arrival

There is no marketing landing page — `app/page.tsx` redirects straight to `/login` for anyone
without a session. The "landing page" *is* the login form.

- **CONFUSING** — severity: mildly annoys her. The very first sentence Maya ever sees on the site
  is: *"A full 6-month SAT curriculum, built around every official subskill."* (`app/login/page.tsx:45`).
  She's never heard "subskill," and it's used as a headline word before she's even signed up.
  She'd assume it's some kind of jargon for "topic" and move on, but it's a bad first word.
- **Nothing tells her what this costs.** There is no pricing anywhere in the app — no
  `Stripe`/`billing`/`checkout` reference exists in the codebase at all (`grep` across `app/`,
  `components/`, `lib/` returns nothing). Her mom paid for *something*, but Maya has no way to see
  what, whether it recurs, or where to manage it. Not a bug (there's currently no paywall to hit
  in step 11 either — everything free/unpaid), but worth flagging since the persona explicitly
  asks "what does it cost."

## Sign up

- Validation that works as expected, quickly checked and not worth belaboring: password `<6`
  chars rejected server-side (`app/api/auth/signup/route.ts:19-21`) with a clear message; signing
  up with an email that's actually taken returns *"An account with this email already exists. Try
  logging in instead."* (`route.ts:24-29`) — clear and actionable.
- **DEAD END** — severity: would make her quit today, if she ever needs it. There is no "forgot
  password" link or flow anywhere. `app/login/page.tsx`'s interactive elements are exactly: Log
  in / Sign up tabs, email, password, submit — nothing else. There's also no support email or
  contact link anywhere in the app (`grep -rli "support@|help@|contact|mailto:"` across `app/` and
  `components/` returns nothing). If she forgets her password, her only options are "try to
  remember it" or "sign up again with the same email" — which fails with the "already exists"
  error above. She closes the tab; there's no path back into an account her mom already paid for.

## Immediately after signup (`/welcome`)

`app/welcome/WelcomeClient.tsx` is pure information — four feature cards and a "Meet Ozho" blurb,
then a single "Get started" button. No form fields at all.

- **CONFUSING** — severity: would make her quit this week. Nothing on this page, or anywhere in
  onboarding, asks Maya for her test date, her PSAT score, or how many days a week she can study.
  The page states the plan is "6 months" and never asks if that's even close to true for her. She
  has no way to know, reading this, that a field exists elsewhere that would fix this for her.
- **CONFUSING** — severity: mildly annoys her, but compounds. The card title *"Every official
  subskill"* (`WelcomeClient.tsx:59`) is the app's core organizing concept, introduced with zero
  definition, on the very first screen she reads after signing up. She'd read it as "some kind of
  sub-topic" and move on, but it's never actually explained anywhere in the app.
- One genuine positive worth noting only because it's a direct hit on the persona: the "What is
  the SAT?" paragraph explains the adaptive module structure — *"how you do on the first module
  determines the difficulty of the second"* — in plain English, without ever saying "adaptive" or
  "Bluebook." That's exactly calibrated to what Maya doesn't know. Not a finding, just noting the
  one place onboarding got the audience right.

## Dashboard, zero activity

`app/dashboard/page.tsx` redirects to `/welcome` if `welcomeSeenAt` is unset, otherwise renders
`DashboardClient` with real (empty) data — not seed/demo data.

1. **CONFUSING** — severity: would make her quit today. `sectionProgress()`
   (`app/dashboard/DashboardClient.tsx:392-404`) computes the big `32px` subject percentage as
   `masteredCount / total`, where "mastered" means a **perfect** quiz score
   (`p.bestScore === p.total`). Reproduced live: after scoring 7/18 on her first-ever quiz, the
   dashboard's "READING & WRITING" card still read **"0% · 0 of 10 mastered."** There is no
   secondary number anywhere on the card showing "1 attempted" or an average score. The single
   biggest number on her dashboard tells her she has done nothing, immediately after she did
   something.
2. **CONFUSING** — severity: would make her quit this week. There is no test-date prompt anywhere
   on the dashboard. `daysUntilTest !== null` is the only gate on the countdown pill
   (`DashboardClient.tsx:289-297`); when it's `null` (no date set — true for every new signup),
   that whole element just doesn't render — no fallback CTA like "Set your test date" appears in
   its place. Verified: a fresh account shows **"Week 1 of 26"** with nothing on screen suggesting
   that number is wrong for her. (The fix does exist — see Study Plan below — she just isn't told
   about it here, on the page she'll actually land on every day.)
3. Not a bug, but worth stating precisely since it's what the default plan actually does to her:
   with no target date set, `courseLengthDaysForUser()` falls back to `DEFAULT_COURSE_LENGTH_DAYS`
   = 182 days (`lib/pacing.ts:4,48`) — 26 weeks. Her real test is in 11. Verified live: the Week-26
   plan schedules "Practice test 8 of 8" for mid-March, four months after her real test date would
   be. If she never finds Settings, she never notices the plan is wrong for her at all.

## Study plan (`/plan`)

- The mechanism to fix the above genuinely works, and works well: setting baseline/goal/target
  date in Settings and saving immediately reflows the dashboard to **"Week 1 of 11 · 77 days until
  your SAT"** (verified live) with the recommended lesson also re-ordered by weakest domain first.
- **CONFUSING** — severity: mildly annoys her, given finding 2 above already got her this far
  without it. The plan page's own intro paragraph *does* mention the fix — *"Set a target SAT date
  in Settings to custom-fit this timeline"* — but it's the fifth sentence of a dense explanatory
  paragraph, not a button or a banner, and it only appears on `/plan`, a page she has no particular
  reason to visit before her dashboard tells her to.
- Direct-navigating to any subskill regardless of week works with no lock (`app/subskill/[id]/page.tsx`
  only checks the subskill id exists, never plan position). Not a finding — reasonable, probably
  intentional flexibility for a self-paced tool — but noting it since it was explicitly probed.

## Week 1, first lesson (`/subskill/rw-central-ideas`)

- The actual lesson prose is genuinely well-pitched at Maya: plain language, a real worked example,
  a click-to-check answer with a substantive explanation of both the right answer and why each
  wrong one is wrong. No jargon issues found in the lesson body itself.
- **CONFUSING** — severity: mildly annoys her, recurring. *"QUESTION PATTERNS WITHIN THIS
  SUBSKILL"* and, on the dashboard, *"0/29 subskills overall"* — "subskill" is load-bearing
  vocabulary across every major screen (lesson header, dashboard, plan) and is never defined once,
  anywhere in the app (checked `app/welcome`, `app/dashboard`, `app/plan`, and the lesson page
  itself).

## Practice quiz

1. **BROKEN** — severity: would make her quit this week. In-progress quiz answers are **not
   persisted anywhere** — `const [answers, setAnswers] = useState<Record<number, number>>({})`
   (`app/subskill/[id]/SubskillClient.tsx:45`), plain component state, no localStorage, no
   server draft. Reproduced three ways: answering 2 of 22 then doing an in-app navigation away and
   back → reset to 0 of 22; the same via a hard page reload; the same via the browser **back**
   button. Every case: answers gone, start over.
2. **BROKEN** (content bug) — severity: mildly annoys her, but it's exactly the thing meant to
   teach her. Five explanation strings reference the answer by a raw array position that was never
   translated into what the student actually sees: *"...which choice 2 captures precisely"* when
   the visible choices are lettered A-D (and are shuffled per attempt, so "choice 2" doesn't even
   consistently mean the same letter across students). Reproduced live: answered this exact
   question wrong, the on-screen explanation read *"...which choice 2 captures precisely."*
   Locations: `data/questions.ts:50,83,94,105,116`.
3. Submitting with unanswered questions is blocked client-side with *"Answer every question before
   submitting -- jumped you to the first one left"* (`SubskillClient.tsx:207`) rather than silently
   scoring skips as wrong. Not a bug — but it does mean the "skip a hard one, come back to it"
   habit a real test-taker should build doesn't work here for finishing a practice set; she has to
   guess something for every question before she can see her score. Worth a mention since the
   walkthrough explicitly asked to test a skip.
4. **CONFUSING** — severity: mildly annoys her, compounds with the dashboard's 0%. The results
   view shows a bare `Score: 7 / 18` (`SubskillClient.tsx`, the post-submit score line) — no
   percentage, no "first attempt" framing, no benchmark. Maya doesn't know what a good SAT score
   is per the persona; she has even less basis for judging a raw quiz fraction.

## Review / progress (dashboard subject cards, plan's practice-test analysis)

- Covered above under Dashboard finding 1 — the same "mastered-only" percentage is the only
  progress signal she sees.
- The "no practice tests logged yet" empty state on `/plan#practice-tests` is plain and clear —
  *"No practice tests logged yet."* + a *"+ Log a practice test"* button. No finding.

## Navigate away and back

- **CONFUSING** — severity: mildly annoys her. The worked-example position within a lesson
  (`Example 1 of 5` etc.) is plain component state with no persistence. Verified: advanced to
  "Example 3 of 6," navigated to the dashboard and back to the same subskill — reset to "Example 1
  of 6." No data is lost (quiz scores are saved server-side correctly), but she has to re-click
  through examples she'd already seen.
- Actual scored progress (quiz results, streak, mastery) persists correctly across real logout/login
  and across page reloads — checked, no issue.

## Log out / log back in / forgot password

- Log out then log back in works cleanly; a direct-navigate to `/dashboard` while logged out
  correctly server-redirects to `/login` with no flash of protected content
  (every protected page does `const user = await getCurrentUser(); if (!user) redirect("/login")`
  before rendering — `app/dashboard/page.tsx:20-21` and identically in `app/plan`, `app/settings`,
  `app/subskill/[id]`). No finding.
- **DEAD END** — already covered under Sign up, finding above (no forgot-password flow exists at
  all). Repeating the pointer here since this is the walkthrough step that explicitly asks for it.

## Paywalled/gated surfaces

- There aren't any. No Stripe/billing code exists anywhere in the repo. Every feature — full
  curriculum, all 8 practice test slots, wardrobe, Mochi — is available to every account today.
  Not a Maya-facing finding (nothing to hit), but worth noting since the walkthrough asked.

## Seams

- **Direct-navigate to an authed route while logged out** → clean server redirect to `/login`. No
  finding.
- **Direct-navigate to a later week's subskill without doing earlier ones** → works identically,
  no lock, no warning. Noted above under Study Plan; not treated as a finding.
- **Refresh mid-question / back button mid-question** → both reproduce the in-progress-answers
  data loss above (Practice quiz, finding 1). Same root cause, not a separate bug.
- **Zero-day-old account math** — checked `computePacing` (`lib/pacing.ts:65-96`, guards
  `totalUnits > 0` before dividing) and `computePetState`
  (`lib/pet.ts`, `daysInactive <= 0` branch) directly, and inspected a real same-day account live:
  no NaN, no divide-by-zero, pacing correctly reads "Right on pace" on day one. No finding.
- **Double-submitting the quiz Submit button** — rapid double-click reproduced two outgoing
  requests, but the persisted `attempts` count came back as `1`, not `2`; did not reproduce a real
  data-integrity problem. No finding.
- **Non-existent subskill route** (`/subskill/does-not-exist`) → `notFound()` is called
  (`app/subskill/[id]/page.tsx:14`), but there is no `app/not-found.tsx` anywhere in the project.
  **DEAD END** — severity: would make her quit today, if she lands here (a stale link, a typo).
  The result is Next.js's bare default 404 page: literally the words "404 / This page could not be
  found," no header, no nav, no "back to dashboard" link, no Oakmont branding at all — the only
  thing on the page besides that text is Ozho's floating speech bubble (he's mounted in the root
  layout and renders everywhere, 404 included), saying something like *"Hey there — ready when you
  are,"* which is now just bizarre floating on an error page. Her only way out is the browser's own
  back button.

## Mobile (390px) — dashboard, plan, lesson, quiz

- Layout itself is genuinely solid: cards stack cleanly, the desktop 3-column lesson layout
  (nav / content / tips) correctly collapses the tips sidebar into a "Show tips & tricks" toggle,
  no horizontal scrolling or clipped text anywhere checked.
1. **CONFUSING** — severity: mildly annoys her, but recurring and on her primary device. Ozho (the
   roaming companion) physically overlaps on-screen text/controls at this width. Reproduced three
   times: on lesson-page load, his sprite and greeting bubble sat directly on top of the opening
   paragraph of the lesson ("The trap: the main idea is almost never..."); a few seconds later, on
   the same page's quiz view, he drifted onto answer choice A's text; on the Study Plan page, he
   sat on top of the "✓ 7/18" score badge for Monday. He does wander off within a few seconds each
   time, but a 390px single-column layout leaves him very little space that isn't also where the
   text is. This is her primary device 70% of the time.

---

## Where most first-time users actually drop off

**Right after the first quiz submission**, when the dashboard's headline number for that whole
subject reads **0%** despite a genuine, engaged attempt (7/18, a completely normal cold-start
score on unfamiliar material). This is the single moment the product's entire motivational
design — a pet that thrives when you practice, a streak, warm ambient encouragement — actively
contradicts itself: the loudest, biggest number on the page tells a first-time user who just did
exactly what the app asked her to do that she has accomplished nothing. Combined with the fact
that nowhere does the app tell her whether 7/18 (or 39%, if she does the math herself) is a normal
first attempt or a bad sign, this is the point where a motivated-but-impatient user has the
least information and the most (falsely) discouraging feedback, in the same five minutes she
decided whether this app was for her.
