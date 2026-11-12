// The questions shown on the public /start page: short, phone-sized questions
// from skills with short lessons, alternating Math and Reading & Writing, easy
// to medium. Found in the bank by their opening words so wording edits in the
// bank don't silently drop one. The public skill pages read this list too, so
// they never reuse a starter question. Kept free of imports so either side can
// load it without pulling in Prisma or request cookies.
export const STARTER_QUESTIONS: { skill: string; startsWith: string }[] = [
  { skill: "m-linear-eq-1var", startsWith: "Solve for x: 6x - 9 = 2x + 15" },
  { skill: "rw-transitions", startsWith: "Most substances expand as they warm." },
  { skill: "m-percentages", startsWith: "A hardware store sells a ladder for $84." },
  { skill: "rw-words-context", startsWith: "The negotiator's tone was ______" },
  { skill: "m-linear-func", startsWith: "If h(x) = -2x + 5, what is the value of h(-4)?" },
];
