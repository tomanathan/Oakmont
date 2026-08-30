/**
 * A 0-5 star rating -- the shared "how well do you know this" indicator
 * used for domains (dashboard, analysis) and the wardrobe's star totals.
 * No stars filled at all is a legitimate, distinct state ("you haven't
 * touched this yet"), not a rendering edge case, so it's never hidden.
 */
export function StarRating({
  stars,
  max = 5,
  size = "sm",
  className = "",
}: {
  stars: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const textSize = size === "lg" ? "text-lg" : size === "md" ? "text-sm" : "text-xs";
  return (
    <span
      className={`inline-flex items-center gap-0.5 leading-none ${textSize} ${className}`}
      aria-label={`${stars} of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < stars ? "text-[#c9971b]" : "text-gray-200"}>
          &#9733;
        </span>
      ))}
    </span>
  );
}
