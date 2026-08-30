// Ozho's wardrobe: cosmetic costumes unlocked purely by accumulating domain
// stars (see lib/mastery.ts) -- studying more, and doing well, dresses him
// up. Every unlocked costume stays available to re-equip any time (nothing
// is lost by, say, a later domain average dipping down a star), and there's
// always a free "no costume" option.
export interface Costume {
  id: string;
  name: string;
  starsRequired: number;
  // Shown in the wardrobe picker to explain what's still needed.
  blurb: string;
}

// Max possible is 8 domains x 5 stars = 40, so these sit at roughly
// 15/35/60/85% of that ceiling -- reachable early, aspirational at the top.
export const COSTUMES: Costume[] = [
  { id: "none", name: "No costume", starsRequired: 0, blurb: "Just Ozho, as he is." },
  { id: "bandana", name: "Bandana", starsRequired: 6, blurb: "A jaunty neck bandana." },
  { id: "cap", name: "Backwards cap", starsRequired: 14, blurb: "Ready to study, or skate." },
  { id: "cape", name: "Hero cape", starsRequired: 24, blurb: "For a bona fide study champion." },
  { id: "crown", name: "Golden crown", starsRequired: 34, blurb: "The full royal treatment." },
];

export type CostumeId = (typeof COSTUMES)[number]["id"];

export function unlockedCostumes(totalStars: number): Costume[] {
  return COSTUMES.filter((c) => totalStars >= c.starsRequired);
}

export function isCostumeUnlocked(id: string, totalStars: number): boolean {
  const c = COSTUMES.find((c) => c.id === id);
  return !!c && totalStars >= c.starsRequired;
}

/** The best (highest-tier) costume a given star total has unlocked. */
export function bestUnlockedCostume(totalStars: number): Costume {
  const unlocked = unlockedCostumes(totalStars);
  return unlocked[unlocked.length - 1] ?? COSTUMES[0];
}
