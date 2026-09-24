// The homepage's small typographic flourishes, all in the one brass accent:
// italic emphasis inside headings, small-caps labels ruled like a letterhead,
// and a hairline-and-diamond ornament.

export function Highlight({ children }: { children: React.ReactNode }) {
  return <em className="font-display font-medium italic text-forest">{children}</em>;
}

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
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-brass/70" />
      <span className="h-1.5 w-1.5 rotate-45 bg-brass" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-brass/70" />
    </div>
  );
}
