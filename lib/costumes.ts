// Ozho's wardrobe: cosmetic costumes unlocked by fully completing domains
// ("sections") -- every subskill in that domain quizzed to a perfect score
// (see lib/mastery.ts's `completed` flag). Unlocking is a direct reward for
// finishing a section, not an abstract point total. Every unlocked costume
// stays available to re-equip any time, and there's always a free "no
// costume" option.
export interface Costume {
  id: string;
  name: string;
  domainsRequired: number;
  // Shown in the wardrobe picker to explain what's still needed.
  blurb: string;
}

// Three looks are free from day one -- no section completed needed -- so
// there's real cosmetic choice available immediately, not just a locked
// wall of outfits. The rest are earned: there are 8 domains total (4 per
// section), so these land at 1 (finish your first section), roughly a
// third, roughly two-thirds, and all 8 -- reachable early, aspirational at
// the top.
export const COSTUMES: Costume[] = [
  { id: "none", name: "No costume", domainsRequired: 0, blurb: "Just Ozho, as he is." },
  { id: "sunglasses", name: "Sunglasses", domainsRequired: 0, blurb: "Effortlessly cool. Free from the start." },
  { id: "bowtie", name: "Bow tie", domainsRequired: 0, blurb: "Sharp and a little formal. Free from the start." },
  { id: "scarf", name: "Scarf", domainsRequired: 0, blurb: "Cozy for a long study session. Free from the start." },
  { id: "bandana", name: "Bandana", domainsRequired: 1, blurb: "A jaunty neck bandana." },
  { id: "cap", name: "Backwards cap", domainsRequired: 3, blurb: "Ready to study, or skate." },
  { id: "cape", name: "Hero cape", domainsRequired: 5, blurb: "For a bona fide study champion." },
  { id: "crown", name: "Golden crown", domainsRequired: 8, blurb: "Every section, mastered." },
];

export type CostumeId = (typeof COSTUMES)[number]["id"];

export function unlockedCostumes(domainsCompleted: number): Costume[] {
  return COSTUMES.filter((c) => domainsCompleted >= c.domainsRequired);
}

export function isCostumeUnlocked(id: string, domainsCompleted: number): boolean {
  const c = COSTUMES.find((c) => c.id === id);
  return !!c && domainsCompleted >= c.domainsRequired;
}

/**
 * The costume auto-worn until the student explicitly picks one for
 * themselves: the best-earned (domainsRequired > 0) costume unlocked so
 * far, or bare ("none") for a brand-new student. Deliberately ignores the
 * three free-from-the-start looks here -- those are opt-in flavor picked
 * from the wardrobe, not something to default a new student into wearing
 * before they've earned anything.
 */
export function bestUnlockedCostume(domainsCompleted: number): Costume {
  const earned = COSTUMES.filter((c) => c.domainsRequired > 0 && domainsCompleted >= c.domainsRequired);
  return earned[earned.length - 1] ?? COSTUMES[0];
}
