import type { MetadataRoute } from "next";

// Only the public pages are worth crawling: the landing page, the SAT skill
// pages (/sat and /sat/...), /start, the sample parent view and the two legal
// pages -- everything else is either an authenticated app route with nothing
// to index, or an API route. ("/subskill" below is the signed-in lesson; it
// doesn't prefix-match "/sat".)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/sat", "/terms", "/privacy"],
      // "/parent/" with its slash: a bare "/parent" is a prefix match that
      // would also block the public /parents/sample.
      disallow: [
        "/dashboard",
        "/plan",
        "/subskill",
        "/settings",
        "/subscribe",
        "/welcome",
        "/parent/",
        "/share",
        "/link",
        "/go",
        "/login",
        "/admin",
        "/review",
        "/analysis",
        "/email",
        "/api",
        "/reset-password",
      ],
    },
    sitemap: "https://oakmontsat.com/sitemap.xml",
  };
}
