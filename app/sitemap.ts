import type { MetadataRoute } from "next";
import { allSkillSlugs } from "@/lib/skillPreview";
import { shownPlanSlugs } from "@/lib/publicPlan";

const BASE_URL = "https://oakmontsat.com";

// Which date plans exist changes as test dates approach and pass, so rebuild daily.
export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/start`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/sat`, changeFrequency: "monthly", priority: 0.8 },
    ...allSkillSlugs().map((slug) => ({ url: `${BASE_URL}/sat/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${BASE_URL}/daily`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/daily/embed`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/sat-study-plan`, changeFrequency: "weekly", priority: 0.8 },
    ...shownPlanSlugs().map((slug) => ({ url: `${BASE_URL}/sat-study-plan/${slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    { url: `${BASE_URL}/sat-test-dates`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/parents/sample`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
