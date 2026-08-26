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
          : "bg-[#f0eff9] text-gray-700 border-[#e0defa] hover:border-[#c9c6ee]"
      }`}
    >
      {children}
    </button>
  );
}
