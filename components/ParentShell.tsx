"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "./BrandMark";

// A lightweight sibling of AppShell.tsx for parent-facing pages -- same
// header chrome (BrandMark, white rounded card, fonts/colors) so the two
// halves of the app read as one product, but none of AppShell's
// student-only concerns. Switches between linked students and adds more.
export function ParentShell({
  parentEmail,
  students,
  activeStudentId,
  children,
}: {
  parentEmail: string;
  students: { id: string; name: string }[];
  activeStudentId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/parent/logout", { method: "POST" });
    router.push("/parent/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-2 font-sans">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-2 shadow-[0_1px_2px_rgba(38,34,24,0.04),0_6px_20px_rgba(38,34,24,0.05)]">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark size={28} />
          <div className="min-w-0">
            <div className="truncate font-display text-[14px] font-semibold leading-tight text-ink">Oakmont for Parents</div>
            <div className="truncate text-[10.5px] text-stone-400">{parentEmail}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {students.map((s) => (
            <Link
              key={s.id}
              href={`/parent/dashboard?student=${s.id}`}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                s.id === activeStudentId ? "bg-forest text-white" : "text-stone-600 hover:bg-[#eef3e9] hover:text-ink"
              }`}
            >
              {s.name}
            </Link>
          ))}
          <Link
            href="/parent/dashboard?add=1"
            className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
              activeStudentId === "" && students.length > 0 ? "bg-forest text-white" : "text-[#2c4c3b] hover:bg-[#eef3e9]"
            }`}
          >
            + Add a student
          </Link>
          <span className="mx-1 hidden h-5 w-px bg-stone-200 sm:inline-block" />
          <button onClick={handleLogout} className="px-2 text-xs text-stone-400 transition-colors hover:text-ink">
            Log out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
