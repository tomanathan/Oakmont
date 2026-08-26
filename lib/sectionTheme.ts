// Soft, section-specific color identity — a light wayfinding cue (which half
// of the test is this?) rather than decoration, kept pastel so it doesn't
// compete with the accent green used for actual progress/mastery signals.
export function sectionTheme(section: string) {
  if (section === "Math") {
    return {
      dot: "bg-[#d97a4d]",
      text: "text-[#b5602f]",
      bar: "bg-[#e6a37c]",
      cardBg: "bg-[#fbe9dd]",
      cardBorder: "border-[#f0d0b3] hover:border-[#e6b98f]",
    };
  }
  return {
    dot: "bg-[#6d7fd6]",
    text: "text-[#4a5bb0]",
    bar: "bg-[#95a2e2]",
    cardBg: "bg-[#eaecfa]",
    cardBorder: "border-[#d3d7f2] hover:border-[#b7bdea]",
  };
}
