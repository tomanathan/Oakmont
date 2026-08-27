// The Oakmont tree mark, cropped from the source lockup with a
// transparent background (see public/oakmont-mark.png) so it drops
// cleanly onto any card or page background. Used everywhere the app used
// to fall back to a plain gradient "O" square -- the top bar, and the
// login/welcome/welcome-back screens -- so the brand is consistent
// wherever it shows up.
export function BrandMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/oakmont-mark.png"
      alt="Oakmont Study Center"
      width={size}
      height={size}
      className={`flex-shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
