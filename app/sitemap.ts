import type { MetadataRoute } from "next";
import { allSkillSlugs } from "@/lib/skillPreview";

const BASE_URL = "https://oakmontsat.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/start`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/sat`, changeFrequency: "monthly", priority: 0.8 },
    ...allSkillSlugs().map((slug) => ({ url: `${BASE_URL}/sat/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${BASE_URL}/parents/sample`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
