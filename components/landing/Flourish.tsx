// The homepage's small typographic flourishes, all in the one brass accent:
// italic emphasis inside headings, small-caps labels ruled like a letterhead,
// and a hairline-and-diamond ornament.

// On light grounds: italic in green. On the green sections: italic in a
// polished-gold gradient.
export function Highlight({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <em
      className={`font-display font-medium italic ${
        dark
          ? "bg-[linear-gradient(100deg,#c79a4a_0%,#f3dfa6_45%,#c99b4b_70%,#e9cd8a_100%)] bg-clip-text pr-1 text-transparent"
          : "text-forest"
      }`}
    >
      {children}
    </em>
  );
}

// The fine diagonal pinstripe laid over every green panel, so the green
// reads as cloth, not a flat fill.
export const PINSTRIPE = {
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 11px)",
};

// Polished-gold fill for the main button on green.
export const GOLD_BUTTON =
  "bg-[linear-gradient(180deg,#f0dca0_0%,#d4ae62_55%,#b98f45_100%)] text-forest-900 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.5)] hover:brightness-105";

export function Eyebrow({ children, center = false, light = false }: { children: React.ReactNode; center?: boolean; light?: boolean }) {
  const rule = `h-px w-7 ${light ? "bg-brass-light/60" : "bg-brass/60"}`;
  return (
    <div
      className={`mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] ${
        light ? "text-brass-light" : "text-brass"
      } ${center ? "justify-center" : ""}`}
    >
      <span className={rule} aria-hidden="true" />
      {children}
      {center && <span className={rule} aria-hidden="true" />}
    </div>
  );
}

export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-brass/80" />
      <span className="h-1.5 w-1.5 rotate-45 bg-brass" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-brass/80" />
    </div>
  );
}
