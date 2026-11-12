import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getCurrentParent } from "@/lib/parentSession";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "SAT Prep Online: Study Plan, Lessons and Practice | Oakmont",
  description:
    "Online SAT prep for the digital SAT: a week-by-week study plan sized to your test date, lessons and practice questions for all 29 SAT skills, and a dashboard for parents. Try 5 sample questions free, no account needed.",
  alternates: { canonical: "https://oakmontsat.com" },
  openGraph: {
    title: "SAT Prep Online: Study Plan, Lessons and Practice | Oakmont",
    description:
      "Online SAT prep for the digital SAT: a week-by-week study plan sized to your test date, lessons and practice questions for all 29 SAT skills, and a dashboard for parents. Try 5 sample questions free, no account needed.",
    url: "https://oakmontsat.com",
    siteName: "Oakmont Study Center",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SAT Prep Online: Study Plan, Lessons and Practice | Oakmont",
    description: "Online SAT prep for the digital SAT: a study plan sized to your test date, lessons and practice for all 29 SAT skills, and a dashboard for parents.",
  },
};

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    // A signed-in parent has a dashboard of their own to go back to.
    if (await getCurrentParent()) redirect("/parent/dashboard");
    return <LandingPage />;
  }

  const stats = await getUserStats(user.userId);
  if (!hasActiveAccess(stats)) redirect("/subscribe");

  redirect("/dashboard");
}
