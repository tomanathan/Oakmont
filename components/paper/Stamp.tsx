// A rubber stamp pressed onto the page: a worn, slightly uneven ink
// impression in a double-ruled box, tilted the way a hand stamp lands.
// It comes down from above (big, blurred, close to you), hits, and the
// page jolts under it. Styles: .paper-stamp in app/paper.css; the ink
// texture is the #paper-stamp filter in PaperMotion.

export function Stamp({
  big,
  small,
  tone = "blue",
  tilt = -8,
  className = "",
  delay = 0,
}: {
  big: string;
  small: string;
  tone?: "blue" | "green";
  tilt?: number;
  className?: string;
  delay?: number;
}) {
  const ink = tone === "green" ? "#2e8b57" : "#3461c1";
  return (
    <span
      className={`paper-stamp pointer-events-none select-none ${className}`}
      style={{ ["--stamp-rot" as string]: `${tilt}deg`, animationDelay: `${delay}ms` }}
      aria-hidden
    >
      <span className="paper-stamp-ink" style={{ color: ink, borderColor: ink }}>
        <span className="paper-stamp-small">{small}</span>
        <span className="paper-stamp-big">{big}</span>
      </span>
    </span>
  );
}
