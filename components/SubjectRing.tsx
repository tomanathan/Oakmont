/**
 * A subject's mastery ring -- one thin arc segment per subskill in the
 * section, in a fixed clockwise order (doesn't need to match any
 * particular subskill, just needs to sum to `total` without double
 * counting). Each segment is exactly one of three states: mastered (the
 * section's full-strength color), attempted but not mastered (its lighter
 * shade), or untouched (flat gray) -- `masteredCount` is already a subset
 * of `attemptedCount` (see lib/subjectProgress.ts's sectionProgress), so
 * the first `masteredCount` segments are colored mastered, the next
 * `attemptedCount - masteredCount` are colored attempted, and the rest are
 * untouched, with no subskill ever contributing to two segments.
 *
 * Shared by the student dashboard and the parent dashboard/share-link
 * view -- both should read as the same ring, not two different-looking
 * mastery indicators for the same underlying numbers.
 */
export function SubjectRing({
  total,
  attemptedCount,
  masteredCount,
  color,
  lightColor,
  size = 46,
}: {
  total: number;
  attemptedCount: number;
  masteredCount: number;
  color: string;
  lightColor: string;
  size?: number;
}) {
  const strokeWidth = size >= 44 ? 5 : 4;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const gapDeg = total > 1 ? Math.min(4, 360 / total / 4) : 0;
  const segDeg = 360 / total;

  function arcPath(startDeg: number, endDeg: number) {
    const toXY = (deg: number) => {
      // -90 so segment 0 starts at 12 o'clock, not 3 o'clock.
      const rad = ((deg - 90) * Math.PI) / 180;
      // Rounded: server and browser Math.sin/cos can differ in the last
      // few bits, which React flags as a hydration mismatch on the path.
      const r3 = (v: number) => Math.round(v * 1000) / 1000;
      return [r3(center + radius * Math.cos(rad)), r3(center + radius * Math.sin(rad))];
    };
    const [x1, y1] = toXY(startDeg);
    const [x2, y2] = toXY(endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0" aria-hidden>
      {Array.from({ length: total }, (_, i) => {
        const state = i < masteredCount ? "mastered" : i < attemptedCount ? "attempted" : "untouched";
        const startDeg = i * segDeg + gapDeg / 2;
        const endDeg = (i + 1) * segDeg - gapDeg / 2;
        return (
          <path
            key={i}
            d={arcPath(startDeg, endDeg)}
            fill="none"
            stroke={state === "mastered" ? color : state === "attempted" ? lightColor : "#e5dccb"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
