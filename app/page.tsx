import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Oakmont Study Center — Every SAT skill, one week at a time",
  description:
    "A complete SAT plan sized to the time you have, covering all 29 official SAT skills, built by a 6-year SAT tutor. Try a real question free, no account needed.",
  alternates: { canonical: "https://oakmontsat.com" },
  openGraph: {
    title: "Oakmont Study Center — Every SAT skill, one week at a time",
    description:
      "A complete SAT plan sized to the time you have, covering all 29 official SAT skills, built by a 6-year SAT tutor. Try a real question free, no account needed.",
    url: "https://oakmontsat.com",
    siteName: "Oakmont Study Center",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oakmont Study Center — Every SAT skill, one week at a time",
    description: "A complete SAT plan sized to the time you have, covering all 29 official SAT skills, built by a 6-year SAT tutor.",
  },
};

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) return <LandingPage />;

  const stats = await getUserStats(user.userId);
  if (!hasActiveAccess(stats.subscriptionStatus, stats.accessExpiresAt)) redirect("/subscribe");

  redirect("/dashboard");
}
