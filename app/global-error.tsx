"use client";

import { useEffect } from "react";

// The last resort: the root layout itself failed, so this replaces it and
// has to bring its own <html> and <body>. Inline styles and system fonts
// only, since none of the app's CSS or fonts can be assumed here.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", background: "#dde7f7", color: "#1f2f5a", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
        <div
          style={{
            maxWidth: 560,
            margin: "48px auto",
            padding: "28px 24px 32px",
            width: "calc(100% - 72px)",
            background: "#fffdf7",
            border: "2px solid #3461c1",
            borderRadius: 10,
            boxShadow: "5px 5px 0 #3461c1",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 26, lineHeight: 1.2, fontWeight: 700 }}>Something went wrong on our end</h1>
          <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.6 }}>This page didn&apos;t load. Reload it, and if it keeps happening, come back in a few minutes.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 22,
              minHeight: 44,
              padding: "0 20px",
              border: 0,
              borderRadius: 8,
              background: "#3461c1",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Reload the page
          </button>
        </div>
      </body>
    </html>
  );
}
