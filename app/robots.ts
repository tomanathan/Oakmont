import type { MetadataRoute } from "next";

// Only the public landing page and the two legal pages are worth crawling
// -- everything else is either an authenticated app route with nothing to
// index, or an API route.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/terms", "/privacy"],
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
