"use client";

import { useRouter, usePathname } from "next/navigation";
import { NavButton } from "./NavButton";
import { BrandMark } from "./BrandMark";

export function AppShell({
  email,
  stats,
  children,
}: {
  email: string;
  stats?: { currentStreak: number };
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 pb-12 pt-4 font-sans">
      <header className="flex items-center justify-between gap-4 py-3.5 px-5 bg-white rounded-2xl shadow-[0_1px_2px_rgba(26,26,46,0.04),0_6px_20px_rgba(26,26,46,0.05)] border border-stone-200 mb-6 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <BrandMark size={38} />
          <div className="min-w-0">
            <div className="font-display font-semibold text-[17px] text-ink leading-tight truncate">
              Oakmont Study Center
            </div>
            <div className="text-xs text-stone-400 truncate">{email}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {stats && stats.currentStreak > 0 && (
            <div
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 rounded-full pl-1.5 pr-2 py-1"
              title={`${stats.currentStreak}-day streak`}
            >
              <span className="animate-flame-pulse inline-block">🔥</span>
              {stats.currentStreak}
            </div>
          )}

          <nav className="flex items-center gap-1.5 flex-wrap">
            <NavButton active={pathname === "/dashboard"} onClick={() => router.push("/dashboard")}>
              Dashboard
            </NavButton>
            <NavButton active={pathname === "/plan"} onClick={() => router.push("/plan")}>
              6-month plan
            </NavButton>
            <NavButton active={pathname === "/analysis"} onClick={() => router.push("/analysis")}>
              Practice exam analysis
            </NavButton>
          </nav>

          {/* No divider border here on purpose -- on narrow viewports this
              group wraps onto its own line, and a left border would show
              up as an orphaned tick with nothing to actually divide from. */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/settings")}
              className="text-xs text-stone-400 hover:text-ink transition-colors"
            >
              Settings
            </button>
            <button onClick={handleLogout} className="text-xs text-stone-400 hover:text-ink transition-colors">
              Log out
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
