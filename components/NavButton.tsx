"use client";

export function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${
        active
          ? "bg-ink text-white border-ink"
          : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
