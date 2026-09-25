// Soft, section-specific color identity — a light wayfinding cue (which half
// of the test is this?) rather than decoration. Drawn from the homepage's
// reserved pastels: powder blue for Reading and Writing, blush for Math,
// so neither competes with the green used for progress and mastery.
export function sectionTheme(section: string) {
  if (section === "Math") {
    return {
      dot: "bg-[#c9826a]",
      // Same colors as `dot`/`bar` below, as raw hex -- needed anywhere a
      // Tailwind arbitrary-value class won't work, like an SVG `stroke`
      // (the dashboard's per-subject mastery ring).
      dotHex: "#c9826a",
      text: "text-[#9c4f35]",
      bar: "bg-[#d38f76]",
      barHex: "#d38f76",
      cardBg: "bg-[#f7e7e1]",
      cardBorder: "border-[#ecd2c7] hover:border-[#dfb8a8]",
      // A single strong hue for a thin accent strip -- the same color as
      // `dot`, exposed on its own so it can drive a left border without a
      // wrapper element.
      accentBorder: "border-l-[#c9826a]",
    };
  }
  return {
    dot: "bg-[#6f93b5]",
    dotHex: "#6f93b5",
    text: "text-[#35607f]",
    bar: "bg-[#6f98bd]",
    barHex: "#6f98bd",
    cardBg: "bg-[#e6eef5]",
    cardBorder: "border-[#cfdde9] hover:border-[#b3c8dc]",
    accentBorder: "border-l-[#6f93b5]",
  };
}
