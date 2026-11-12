import type { Section } from "@/data/curriculum";

// The curriculum with everything but its table of contents taken out:
// sections, their domains, and each skill's id, name and one-line blurb.
// This is all the dashboard (and findRecommended / sectionProgress) reads,
// and it's what a server page should hand a client component -- the full
// CURRICULUM carries every lesson body and worked example, which is most
// of a megabyte to serialise into the page for nothing.
//
// The full Section[] is still assignable to this, so server code that
// already holds CURRICULUM can pass it straight to the same helpers.
export interface OutlineSection {
  section: string;
  domains: { domain: string; subskills: { id: string; name: string; blurb: string }[] }[];
}

export function curriculumOutline(curriculum: Section[]): OutlineSection[] {
  return curriculum.map((sec) => ({
    section: sec.section,
    domains: sec.domains.map((d) => ({
      domain: d.domain,
      subskills: d.subskills.map((s) => ({ id: s.id, name: s.name, blurb: s.blurb })),
    })),
  }));
}
