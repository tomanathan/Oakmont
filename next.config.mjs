// Headers every page gets, framed or not: no content-type guessing, and
// links out carry only our origin, never a path (some paths hold a private
// token, e.g. /share/<token>).
const BASE_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    // Next sends the headers of every entry whose source matches (a later
    // one can't take an earlier one's away), so the two framing rules
    // below match paths that never overlap: everything outside /embed, and
    // /embed itself.
    return [
      {
        // Every page outside /embed: can't be framed by another site
        // (clickjacking). The lookahead skips "/embed" and "/embed/...",
        // but not "/embedded" or "/daily/embed".
        source: "/:path((?!embed(?:/|$)).*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          ...BASE_HEADERS,
        ],
      },
      {
        // Pages made to sit in an iframe on other people's sites (the SAT
        // question of the day card, app/embed/daily): any site may frame
        // them. Nothing private lives under /embed; it is public pages only.
        source: "/embed/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }, ...BASE_HEADERS],
      },
      {
        // Lesson narration: large, and replaced only when a lesson is
        // re-recorded, so let browsers keep it for a day and refresh quietly.
        source: "/lesson-audio/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
