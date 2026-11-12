// The public address of each skill's free preview page (app/sat/[slug]),
// made from the skill's name: lowercase, anything that isn't a letter or a
// digit squeezed to one hyphen. "Linear Equations in One Variable" becomes
// linear-equations-in-one-variable.
//
// Written out rather than built from data/curriculum.ts so this file stays
// free of data and any component can link to a skill page without pulling
// the curriculum into the browser. The skill pages check every entry
// against slugify(name) when they are built (see lib/skillPreview.ts), so a
// renamed skill fails the build instead of quietly keeping an old address.
// These are live URLs: changing one later loses whatever search ranking the
// old address had, so add a redirect if a name ever changes.

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SLUG_BY_ID: Record<string, string> = {
  "rw-central-ideas": "central-ideas-and-details",
  "rw-evidence": "command-of-evidence",
  "rw-inferences": "inferences",
  "rw-words-context": "words-in-context",
  "rw-text-structure": "text-structure-and-purpose",
  "rw-cross-text": "cross-text-connections",
  "rw-rhetorical-synthesis": "rhetorical-synthesis",
  "rw-transitions": "transitions",
  "rw-boundaries": "boundaries",
  "rw-form-structure": "form-structure-and-sense",
  "m-linear-eq-1var": "linear-equations-in-one-variable",
  "m-linear-func": "linear-functions",
  "m-linear-eq-2var": "linear-equations-in-two-variables",
  "m-systems": "systems-of-two-linear-equations",
  "m-linear-ineq": "linear-inequalities",
  "m-equiv-expr": "equivalent-expressions",
  "m-nonlinear-eq": "nonlinear-equations-and-systems",
  "m-nonlinear-func": "nonlinear-functions",
  "m-ratios-rates": "ratios-rates-proportions-and-units",
  "m-percentages": "percentages",
  "m-one-var-data": "one-variable-data",
  "m-two-var-data": "two-variable-data",
  "m-probability": "probability-and-conditional-probability",
  "m-inference": "inference-from-sample-statistics",
  "m-statistical-claims": "evaluating-statistical-claims",
  "m-area-volume": "area-and-volume",
  "m-lines-angles-tri": "lines-angles-and-triangles",
  "m-right-tri-trig": "right-triangles-and-trigonometry",
  "m-circles": "circles",
};

const ID_BY_SLUG = new Map<string, string>();
for (const [id, slug] of Object.entries(SLUG_BY_ID)) {
  // Two skills on one address would leave one of them unreachable.
  if (ID_BY_SLUG.has(slug)) throw new Error(`Duplicate skill slug "${slug}" (${ID_BY_SLUG.get(slug)} and ${id})`);
  ID_BY_SLUG.set(slug, id);
}

export function slugForSubskill(id: string): string | undefined {
  return SLUG_BY_ID[id];
}

export function subskillIdForSlug(slug: string): string | undefined {
  return ID_BY_SLUG.get(slug);
}

export function skillPath(id: string): string {
  return `/sat/${SLUG_BY_ID[id]}`;
}
