import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Oakmont Study Center — Every SAT skill, one week at a time";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Kept deliberately simple (system font, no fetched assets) rather than
// loading a custom font or the PNG brand mark into the edge runtime --
// those add real fragility (a failed fetch breaks every shared-link
// preview) for a component whose only job is looking right at a glance in
// a group chat or parent email.
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
          background: "#faf8f4",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "#1a1a2e",
            color: "#faf8f4",
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
        <div style={{ fontSize: 56, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>
          Every SAT skill. One week at a time.
        </div>
        <div style={{ fontSize: 28, color: "#6b7280" }}>Oakmont Study Center</div>
      </div>
    ),
    { ...size }
  );
}
