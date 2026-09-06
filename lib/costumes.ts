// Ozho's wardrobe: cosmetic costumes unlocked one of two ways -- either by
// fully completing domains ("sections": every subskill in that domain
// quizzed to a perfect score, see lib/mastery.ts's `completed` flag) or by
// reaching a daily practice streak milestone (see lib/gamification.ts).
// Two separate currencies, both already tracked elsewhere in the app, now
// both spend into the same wardrobe. Every unlocked costume stays
// available to re-equip any time, and there's always a free "no costume"
// option.
export interface Costume {
  id: string;
  name: string;
  // Exactly one of these three -- a discriminated union rather than two
  // optional numbers, so a costume can never accidentally end up gated by
  // both a domain count AND a streak length, or by neither.
  requirement: { type: "free" } | { type: "domains"; count: number } | { type: "streak"; days: number };
  // Shown in the wardrobe picker to explain what's still needed.
  blurb: string;
}

// What's actually needed to unlock a costume, gathered in one place so
// every unlock check (isCostumeUnlocked, unlockedCostumes,
// bestUnlockedCostume) reads the exact same rule.
export interface UnlockProgress {
  domainsCompleted: number;
  longestStreak: number;
}

function meetsRequirement(c: Costume, progress: UnlockProgress): boolean {
  switch (c.requirement.type) {
    case "free":
      return true;
    case "domains":
      return progress.domainsCompleted >= c.requirement.count;
    case "streak":
      return progress.longestStreak >= c.requirement.days;
  }
}

// Three looks are free from day one -- no section completed needed -- so
// there's real cosmetic choice available immediately, not just a locked
// wall of outfits. The section-reward costumes are earned across 8 total
// domains (4 per section): 1 (finish your first section), roughly a
// third, roughly two-thirds, and all 8 -- reachable early, aspirational at
// the top. The streak-reward costumes run alongside that on a completely
// separate clock, at three of lib/gamification.ts's own milestone numbers
// (3, 7, 14 days) -- deliberately stopping short of that list's bigger
// milestones (30+), which is what the second companion (see
// lib/pet.ts's SECOND_PET_UNLOCK_STREAK_DAYS) is reserved for instead, so
// the two streak rewards don't land on the same day.
export const COSTUMES: Costume[] = [
  { id: "none", name: "No costume", requirement: { type: "free" }, blurb: "Just Ozho, as he is." },
  { id: "sunglasses", name: "Sunglasses", requirement: { type: "free" }, blurb: "Effortlessly cool. Free from the start." },
  { id: "bowtie", name: "Bow tie", requirement: { type: "free" }, blurb: "Sharp and a little formal. Free from the start." },
  { id: "scarf", name: "Scarf", requirement: { type: "free" }, blurb: "Cozy for a long study session. Free from the start." },
  { id: "flame-collar", name: "Flame collar", requirement: { type: "streak", days: 3 }, blurb: "A 3-day streak. You're heating up." },
  { id: "bandana", name: "Bandana", requirement: { type: "domains", count: 1 }, blurb: "A jaunty neck bandana." },
  { id: "star-badge", name: "Star badge", requirement: { type: "streak", days: 7 }, blurb: "A full week of practice, without a miss." },
  { id: "cap", name: "Backwards cap", requirement: { type: "domains", count: 3 }, blurb: "Ready to study, or skate." },
  { id: "explorer-hat", name: "Explorer hat", requirement: { type: "streak", days: 14 }, blurb: "Two weeks in a row. You've earned the brim." },
  { id: "cape", name: "Hero cape", requirement: { type: "domains", count: 5 }, blurb: "For a bona fide study champion." },
  { id: "crown", name: "Golden crown", requirement: { type: "domains", count: 8 }, blurb: "Every section, mastered." },
];

export type CostumeId = (typeof COSTUMES)[number]["id"];

export function unlockedCostumes(progress: UnlockProgress): Costume[] {
  return COSTUMES.filter((c) => meetsRequirement(c, progress));
}

export function isCostumeUnlocked(id: string, progress: UnlockProgress): boolean {
  const c = COSTUMES.find((c) => c.id === id);
  return !!c && meetsRequirement(c, progress);
}

/**
 * The costume auto-worn until the student explicitly picks one for
 * themselves: the best-earned (not free) costume unlocked so far, across
 * either currency, or bare ("none") for a brand-new student. Deliberately
 * ignores the free-from-the-start looks here -- those are opt-in flavor
 * picked from the wardrobe, not something to default a new student into
 * wearing before they've earned anything. "Best" is just "last earned in
 * COSTUMES' own order" -- the list above is arranged roughly
 * easiest-to-hardest across both currencies interleaved, so the last
 * match is a reasonable stand-in for "most impressive" even though domain
 * counts and streak days aren't directly comparable numbers.
 */
export function bestUnlockedCostume(progress: UnlockProgress): Costume {
  const earned = COSTUMES.filter((c) => c.requirement.type !== "free" && meetsRequirement(c, progress));
  return earned[earned.length - 1] ?? COSTUMES[0];
}
