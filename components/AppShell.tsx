"use client";

import { useRouter, usePathname } from "next/navigation";
import { NavButton } from "./NavButton";

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
      <div className="relative flex items-center justify-between py-4 px-5 bg-white rounded-2xl shadow-[0_1px_2px_rgba(26,26,46,0.04),0_6px_20px_rgba(26,26,46,0.05)] border border-[#eeecfb] mb-6 flex-wrap gap-3">
        {stats && stats.currentStreak > 0 && (
          <div
            className="absolute top-2 right-3 flex items-center gap-1 text-[11px] font-semibold text-gray-400"
            title={`${stats.currentStreak}-day streak`}
          >
            <span className="animate-flame-pulse inline-block">🔥</span>
            {stats.currentStreak}
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6d7fd6] to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            O
          </span>
          <div>
            <div className="font-bold text-lg text-ink leading-tight">Oakmont Study Center</div>
            <div className="text-xs text-gray-400">{email}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap pr-1">
          <NavButton active={pathname === "/dashboard"} onClick={() => router.push("/dashboard")}>
            Dashboard
          </NavButton>
          <NavButton active={pathname === "/plan"} onClick={() => router.push("/plan")}>
            6-month plan
          </NavButton>
          <NavButton active={pathname === "/analysis"} onClick={() => router.push("/analysis")}>
            Practice exam analysis
          </NavButton>
          <button
            onClick={() => router.push("/settings")}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 ml-1"
          >
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            Log out
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
