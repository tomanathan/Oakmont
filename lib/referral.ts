import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

// Invite a friend: the friend gets a free month on top of the free week when
// they sign up through a student's link, and the student who invited them
// gets a free month once that friend has really studied -- on
// REFERRAL_STUDY_DAYS separate days, so made-up signups earn nothing. Each
// student can earn at most REFERRAL_MAX_MONTHS this way; friends past that
// still count on their invite page, they just earn no more.

export const REFERRAL_BONUS_DAYS = 30;
export const REFERRAL_STUDY_DAYS = 3;
export const REFERRAL_MAX_MONTHS = 6;

const APP_URL = process.env.APP_URL || "https://oakmontsat.com";
const DAY_MS = 24 * 60 * 60 * 1000;
const LIVE_SUBSCRIPTION = new Set(["trialing", "active", "past_due"]);

// Same alphabet as parent codes (lib/parentCode.ts): no 0/O or 1/I, since
// a code may be read off one screen and typed on another.
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
const CODE_RE = new RegExp(`^[${CODE_CHARS}]{${CODE_LENGTH}}$`);

function generateCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  return code;
}

export function inviteUrl(code: string): string {
  return `${APP_URL}/i/${code}`;
}

/** The student's invite code, made the first time it's asked for and kept after that. */
export async function ensureReferralCode(userId: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
    if (!user) throw new Error(`No user ${userId} for an invite code`);
    if (user.referralCode) return user.referralCode;
    const code = generateCode();
    try {
      // Only fills an empty slot: two tabs asking at once keep whichever
      // code landed first, and the loop reads it back.
      const set = await prisma.user.updateMany({ where: { id: userId, referralCode: null }, data: { referralCode: code } });
      if (set.count === 1) return code;
    } catch (err) {
      // Another student already has this code (vanishingly rare): try a new one.
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) throw err;
    }
  }
  throw new Error("Could not make an invite code");
}

/** The student behind an invite code, or null when the code is malformed or unknown. */
export async function findInviter(code: string): Promise<{ id: string; firstName: string | null } | null> {
  const clean = code.trim().toUpperCase();
  if (!CODE_RE.test(clean)) return null;
  return prisma.user.findUnique({ where: { referralCode: clean }, select: { id: true, firstName: true } });
}

/**
 * For the signup routes, right after the account is created: an account
 * made through a friend's invite gets the bonus days on its free trial and
 * remembers who invited it. Returns whether the invite applied.
 */
export async function applyReferralOnSignup(newUserId: string, code: string | null): Promise<boolean> {
  if (!code) return false;
  const inviter = await findInviter(code);
  if (!inviter || inviter.id === newUserId) return false;
  const user = await prisma.user.findUnique({ where: { id: newUserId }, select: { trialEndsAt: true, referredById: true } });
  if (!user || user.referredById) return false;
  const base = user.trialEndsAt?.getTime() ?? Date.now();
  const set = await prisma.user.updateMany({
    where: { id: newUserId, referredById: null },
    data: { referredById: inviter.id, trialEndsAt: new Date(base + REFERRAL_BONUS_DAYS * DAY_MS), trialReminderSentAt: null },
  });
  return set.count === 1;
}

/**
 * Gives the inviter their free month once this friend has studied on enough
 * days. Called after the friend's activity (lib/activity.ts), so it never
 * throws. The friend's row is claimed first, in one conditional write, so
 * two requests finishing at once can't both give the month; if giving it
 * fails, the claim is undone and the friend's next activity tries again.
 */
export async function rewardInviterIfEarned(friendId: string): Promise<void> {
  const claimedAt = new Date();
  let claimed = false;
  try {
    const claim = await prisma.user.updateMany({
      where: { id: friendId, referredById: { not: null }, referralRewardedAt: null, daysStudied: { gte: REFERRAL_STUDY_DAYS } },
      data: { referralRewardedAt: claimedAt },
    });
    if (claim.count !== 1) return;
    claimed = true;
    const friend = await prisma.user.findUnique({ where: { id: friendId }, select: { referredById: true } });
    if (friend?.referredById) await giveFreeMonth(friend.referredById, friendId);
  } catch (err) {
    console.error("Invite reward failed", friendId, err);
    if (claimed) {
      await prisma.user
        .updateMany({ where: { id: friendId, referralRewardedAt: claimedAt }, data: { referralRewardedAt: null } })
        .catch((undoErr) => console.error("Invite reward: could not undo the claim", friendId, undoErr));
    }
  }
}

/**
 * One free month for the inviter, in whatever form fits what they have now:
 * a credit on their monthly bill, more time on their 6-month pass, or more
 * free trial. Each write only applies if the inviter's row is still as it
 * was read (and under the cap), so two friends earning a month at the same
 * moment give two months, never one or a seventh.
 */
async function giveFreeMonth(inviterId: string, friendId: string): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const inviter = await prisma.user.findUnique({
      where: { id: inviterId },
      select: { referralMonthsEarned: true, subscriptionStatus: true, stripeCustomerId: true, accessExpiresAt: true, trialEndsAt: true },
    });
    // An inviter who has since deleted their account, or has every month already.
    if (!inviter || inviter.referralMonthsEarned >= REFERRAL_MAX_MONTHS) return;
    const unchanged = { id: inviterId, referralMonthsEarned: inviter.referralMonthsEarned };
    const now = Date.now();

    if (inviter.subscriptionStatus && LIVE_SUBSCRIPTION.has(inviter.subscriptionStatus) && inviter.stripeCustomerId) {
      // Monthly plan: a credit for one month's price, which Stripe takes off
      // their next bill. The month is counted first so the cap holds; if
      // Stripe refuses, it's uncounted and the error goes up to undo the claim.
      const counted = await prisma.user.updateMany({ where: unchanged, data: { referralMonthsEarned: { increment: 1 } } });
      if (counted.count !== 1) continue;
      try {
        // Loaded here rather than at the top so the study routes that call
        // this don't load the Stripe client for every student.
        const { stripe, getPlanPrices } = await import("./stripe");
        const { monthly } = await getPlanPrices();
        if (!(monthly.amountCents > 0)) throw new Error("Monthly price has no amount");
        await stripe.customers.createBalanceTransaction(
          inviter.stripeCustomerId,
          { amount: -monthly.amountCents, currency: monthly.currency, description: "Invite reward: one free month" },
          // A retry after a timeout that actually went through credits once.
          { idempotencyKey: `invite-reward-${friendId}` }
        );
      } catch (err) {
        await prisma.user.update({ where: { id: inviterId }, data: { referralMonthsEarned: { decrement: 1 } } });
        throw err;
      }
      return;
    }

    let extend: Prisma.UserUpdateManyMutationInput;
    let guard: Prisma.UserWhereInput;
    if (inviter.accessExpiresAt && inviter.accessExpiresAt.getTime() > now) {
      // A 6-month pass: it runs a month longer.
      extend = { accessExpiresAt: new Date(inviter.accessExpiresAt.getTime() + REFERRAL_BONUS_DAYS * DAY_MS) };
      guard = { accessExpiresAt: inviter.accessExpiresAt };
    } else {
      // In the free trial, or lapsed with no plan: a month more of free
      // trial from today or its current end, whichever is later. The "trial
      // ends tomorrow" email may then go out again before the new end.
      const from = Math.max(now, inviter.trialEndsAt?.getTime() ?? now);
      extend = { trialEndsAt: new Date(from + REFERRAL_BONUS_DAYS * DAY_MS), trialReminderSentAt: null };
      guard = { trialEndsAt: inviter.trialEndsAt };
    }
    const given = await prisma.user.updateMany({
      where: { ...unchanged, ...guard },
      data: { ...extend, referralMonthsEarned: { increment: 1 } },
    });
    if (given.count === 1) return;
  }
  throw new Error(`Inviter ${inviterId} kept changing; month not given yet`);
}

export interface ReferralSummary {
  code: string;
  url: string;
  joined: number; // accounts that signed up through this student's link
  earned: number; // of those, how many have earned the inviter a month (friend rows with referralRewardedAt set)
  monthsEarned: number; // referralMonthsEarned
  maxMonths: number; // REFERRAL_MAX_MONTHS
  friends: { firstName: string | null; joinedAt: string; earned: boolean }[]; // newest first, at most 12; ISO date strings
}

export async function getReferralSummary(userId: string): Promise<ReferralSummary> {
  const code = await ensureReferralCode(userId);
  const [user, joined, earned, friends] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { referralMonthsEarned: true } }),
    prisma.user.count({ where: { referredById: userId } }),
    prisma.user.count({ where: { referredById: userId, referralRewardedAt: { not: null } } }),
    prisma.user.findMany({
      where: { referredById: userId },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { firstName: true, createdAt: true, referralRewardedAt: true },
    }),
  ]);
  return {
    code,
    url: inviteUrl(code),
    joined,
    earned,
    monthsEarned: user?.referralMonthsEarned ?? 0,
    maxMonths: REFERRAL_MAX_MONTHS,
    friends: friends.map((f) => ({ firstName: f.firstName, joinedAt: f.createdAt.toISOString(), earned: !!f.referralRewardedAt })),
  };
}

// The dashboard's version of the summary: just the link and how many friends joined.
export async function getInviteStrip(userId: string): Promise<{ url: string; joined: number }> {
  const [code, joined] = await Promise.all([ensureReferralCode(userId), prisma.user.count({ where: { referredById: userId } })]);
  return { url: inviteUrl(code), joined };
}
