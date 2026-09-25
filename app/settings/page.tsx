import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { computeDomainMastery, completedDomainCount } from "@/lib/mastery";
import { progressMapFromRows } from "@/lib/progressState";
import { isCostumeUnlocked, bestUnlockedCostume } from "@/lib/costumes";
import { computePetState, PET_NAME, SECOND_PET_NAME, SECOND_PET_UNLOCK_STREAK_DAYS } from "@/lib/pet";
import { AppShell } from "@/components/AppShell";
import { SettingsClient } from "./SettingsClient";
import { retakeState } from "@/lib/retakeCover";
import { stripe } from "@/lib/stripe";
import { trialDaysLeft, trialEnded } from "@/lib/subscription";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [stats, progressRows, parentAccess] = await Promise.all([
    getUserStats(user.userId),
    prisma.progress.findMany({ where: { userId: user.userId } }),
    prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        parentInviteCode: true,
        parentShareToken: true,
        stripeSubscriptionId: true,
        parentLinks: { select: { id: true, parent: { select: { id: true, email: true, passwordHash: true } } }, orderBy: { createdAt: "asc" } },
      },
    }),
  ]);

  const progress = progressMapFromRows(progressRows);
  const subskillsByDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
  // Wardrobe unlocks don't depend on practice-test scores at all, so this
  // page doesn't need to fetch them -- see lib/mastery.ts.
  const mastery = computeDomainMastery(ALL_DOMAINS, subskillsByDomain, progress, null);
  const sectionsCompleted = completedDomainCount(mastery);
  // Same fallback the dashboard and Ozho's own state use: until the
  // student explicitly picks something (including explicitly picking "no
  // costume"), the best costume they've earned is what's shown as worn --
  // so this page always agrees with what Ozho is actually wearing
  // elsewhere in the app.
  const unlockProgress = { domainsCompleted: sectionsCompleted, longestStreak: stats.longestStreak };
  const equippedCostume =
    stats.equippedCostume && isCostumeUnlocked(stats.equippedCostume, unlockProgress)
      ? stats.equippedCostume
      : bestUnlockedCostume(unlockProgress).id;

  const petState = computePetState(stats.lastActiveDate ?? null, stats.petDiedAt ?? null, stats.petBornAt);
  const retake = retakeState(stats.accessExpiresAt ?? null, stats.passRetakeClaimedAt ?? null);
  const pass = retake.hasPass
    ? {
        active: !!stats.accessExpiresAt && stats.accessExpiresAt.getTime() > Date.now(),
        claimedAt: retake.claimedAt?.toISOString() ?? null,
        accessExpiresAt: retake.accessExpiresAt?.toISOString() ?? null,
        options: retake.options,
      }
    : null;

  // Monthly subscribers only. The webhook mirrors status and period end but
  // not "set to cancel at period end" -- a subscription canceled from the
  // Billing Portal stays "active" until the period runs out -- so that one
  // detail is read live from Stripe, or the page would still say "Renews on".
  let subscription: { status: string; currentPeriodEnd: string | null; cancelsAt: string | null } | null = null;
  if (stats.stripeCustomerId && stats.subscriptionStatus) {
    let cancelsAt: string | null = null;
    const subscriptionId = parentAccess?.stripeSubscriptionId;
    if (subscriptionId && ["trialing", "active", "past_due"].includes(stats.subscriptionStatus)) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        if (sub.cancel_at) cancelsAt = new Date(sub.cancel_at * 1000).toISOString();
        else if (sub.cancel_at_period_end) cancelsAt = stats.currentPeriodEnd?.toISOString() ?? null;
      } catch (err) {
        // Stripe being unreachable shouldn't break Settings; fall back to
        // the stored status.
        console.error("Couldn't read subscription from Stripe:", err);
      }
    }
    subscription = {
      status: stats.subscriptionStatus,
      currentPeriodEnd: stats.currentPeriodEnd?.toISOString() ?? null,
      cancelsAt,
    };
  }

  return (
    <AppShell email={user.email} stats={stats}>
      <SettingsClient
        email={user.email}
        firstName={stats.firstName ?? null}
        baselineScore={stats.baselineScore}
        goalScore={stats.goalScore}
        targetTestDate={stats.targetTestDate ? stats.targetTestDate.toISOString().slice(0, 10) : null}
        sectionsCompleted={sectionsCompleted}
        totalSections={ALL_DOMAINS.length}
        equippedCostume={equippedCostume}
        petName={PET_NAME}
        petState={petState}
        longestStreak={stats.longestStreak}
        secondPetName={SECOND_PET_NAME}
        secondPetUnlockDays={SECOND_PET_UNLOCK_STREAK_DAYS}
        parentInviteCode={parentAccess?.parentInviteCode ?? null}
        parentShareToken={parentAccess?.parentShareToken ?? null}
        linkedParents={(parentAccess?.parentLinks ?? []).map((l) => ({ id: l.id, parentId: l.parent.id, email: l.parent.email, pending: !l.parent.passwordHash }))}
        pass={pass}
        subscription={subscription}
        trial={
          trialDaysLeft(stats) !== null || trialEnded(stats)
            ? {
                daysLeft: trialDaysLeft(stats),
                endsOn: stats.trialEndsAt!.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  timeZone: "America/Chicago",
                }),
              }
            : null
        }
      />
    </AppShell>
  );
}
