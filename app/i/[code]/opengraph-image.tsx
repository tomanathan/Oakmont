import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "You're invited to Oakmont SAT Prep. You both get a free month.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The link preview for a friend's invite (app/i/[code]). The same card for
// every invite: no name and no database lookup, so a preview never fails
// and never shows anything about the student who sent it. Same palette and
// plain system font as app/opengraph-image.tsx.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#dde7f7",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "#3461c1",
            color: "#fffdf7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          O
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, color: "#1f2f5a", marginBottom: 12 }}>You&apos;re invited</div>
        <div style={{ fontSize: 34, color: "#3461c1", marginBottom: 28 }}>Oakmont SAT Prep</div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            color: "#1f2f5a",
            background: "#fffdf7",
            border: "2px solid #b4c5e6",
            borderRadius: 16,
            padding: "14px 28px",
          }}
        >
          You both get a free month
        </div>
      </div>
    ),
    { ...size }
  );
}
