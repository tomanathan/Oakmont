// Soft, section-specific color identity — a light wayfinding cue (which half
// of the test is this?) rather than decoration. From the notebook palette:
// a lighter blue for Reading and Writing, apricot for Math, so the two are
// told apart at a glance and Math doesn't blend into the brand blue.
export function sectionTheme(section: string) {
  if (section === "Math") {
    return {
      dot: "bg-[#e39a68]",
      // Same colors as `dot`/`bar` below, as raw hex -- needed anywhere a
      // Tailwind arbitrary-value class won't work, like an SVG `stroke`
      // (the dashboard's per-subject mastery ring).
      dotHex: "#e39a68",
      text: "text-[#9c4f35]",
      bar: "bg-[#eaa878]",
      barHex: "#eaa878",
      cardBg: "bg-[#fdeee2]",
      cardBorder: "border-[#f3d6bf] hover:border-[#e9bf9f]",
      // A single strong hue for a thin accent strip -- the same color as
      // `dot`, exposed on its own so it can drive a left border without a
      // wrapper element.
      accentBorder: "border-l-[#e39a68]",
    };
  }
  return {
    dot: "bg-[#5f87d6]",
    dotHex: "#5f87d6",
    text: "text-[#2a4f9f]",
    bar: "bg-[#6f95dc]",
    barHex: "#6f95dc",
    cardBg: "bg-[#e6edfa]",
    cardBorder: "border-[#c9d6ee] hover:border-[#a8bde6]",
    accentBorder: "border-l-[#5f87d6]",
  };
}
