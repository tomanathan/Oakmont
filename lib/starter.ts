import { SignJWT, jwtVerify } from "jose";
import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getSecretKey } from "./auth";
import { itemsForSubskill, type BankItem } from "./items";
import { finishActivity } from "./activity";

// The /start onboarding: five short questions answered before any account
// exists, then a test date, then "save my plan". What they answered is held
// in a server-set, signed cookie (so it survives the Google redirect and
// Safari's limits on script storage, and can't be forged), and applied only
// when a brand-new account is created -- never merged into an existing one,
// so a shared device can't hand one student's answers to the next.

export const START_COOKIE = "oak_start";
const START_MAX_AGE = 30 * 24 * 60 * 60;

// Short, phone-sized questions from skills with short lessons, alternating
// Math and Reading & Writing, easy to medium. Found by their opening words so
// wording edits in the bank don't silently drop one.
const STARTERS: { skill: string; startsWith: string }[] = [
  { skill: "m-linear-eq-1var", startsWith: "Solve for x: 6x - 9 = 2x + 15" },
  { skill: "rw-transitions", startsWith: "Most substances expand as they warm." },
  { skill: "m-percentages", startsWith: "A shirt originally $40 is discounted 25%." },
  { skill: "rw-words-context", startsWith: "The negotiator's tone was ______" },
  { skill: "m-linear-func", startsWith: "If h(x) = -2x + 5, what is the value of h(-4)?" },
];
// When every starter is right, the plan still needs a first skill: a short one
// they haven't seen yet.
const ALL_RIGHT_FIRST_SKILL = "m-ratios-rates";

export function starterItems(): BankItem[] {
  return STARTERS.map(({ skill, startsWith }) => {
    const item = itemsForSubskill(skill).find((q) => q.q.startsWith(startsWith));
    if (!item) throw new Error(`Starter question not found: ${skill} / ${startsWith}`);
    return item;
  });
}

export interface StartState {
  answers: Record<string, number>; // itemId -> authored choice index
  date?: string | null; // YYYY-MM-DD, or null for "not sure"
  invite?: string | null; // a parent's invite token
}

export async function readStartCookie(raw?: string | null): Promise<StartState | null> {
  const value = raw ?? cookies().get(START_COOKIE)?.value;
  if (!value) return null;
  try {
    const { payload } = await jwtVerify(value, getSecretKey());
    if (payload.kind !== "start" || typeof payload.answers !== "object" || !payload.answers) return null;
    return {
      answers: payload.answers as Record<string, number>,
      date: typeof payload.date === "string" ? payload.date : null,
      invite: typeof payload.invite === "string" ? payload.invite : null,
    };
  } catch {
    return null;
  }
}

export async function writeStartCookie(res: NextResponse, state: StartState) {
  const token = await new SignJWT({ kind: "start", ...state })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${START_MAX_AGE}s`)
    .sign(getSecretKey());
  res.cookies.set(START_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: START_MAX_AGE,
  });
}

export function clearStartCookie(res: NextResponse) {
  res.cookies.delete({ name: START_COOKIE, path: "/" });
}

export interface StarterResult {
  items: { id: string; skill: string; correct: boolean }[];
  firstSkillId: string;
}

/** Grades against the bank (never the client's word) and picks the first skill. */
export function gradeStarter(answers: Record<string, number>): StarterResult {
  const items = starterItems().map((it) => ({ id: it.id, skill: it.subskillId, correct: answers[it.id] === it.answer }));
  const firstMiss = items.find((i) => answers[i.id] !== undefined && !i.correct);
  return { items, firstSkillId: firstMiss?.skill ?? ALL_RIGHT_FIRST_SKILL };
}

/**
 * Applies a finished /start to a just-created account: the test date, the
 * graded starter, the skill that leads their plan, onboarding marked done,
 * and Day 1 (Ozho fed, streak started). Returns the invite token, if any, for
 * the caller to connect the parent. No-op without at least one answer.
 */
export async function claimStarter(userId: string, state: StartState | null): Promise<{ claimed: boolean; invite: string | null }> {
  if (!state || Object.keys(state.answers).length === 0) return { claimed: false, invite: state?.invite ?? null };
  const result = gradeStarter(state.answers);
  const date = state.date && /^\d{4}-\d{2}-\d{2}$/.test(state.date) ? new Date(`${state.date}T12:00:00Z`) : null;
  await prisma.user.update({
    where: { id: userId },
    data: {
      starterResult: result as unknown as object,
      firstSkillId: result.firstSkillId,
      welcomeSeenAt: new Date(),
      ...(date && date > new Date() ? { targetTestDate: date } : {}),
    },
  });
  // The starter was real studying: it counts as today, same as a lesson.
  await finishActivity(userId, []);
  return { claimed: true, invite: state.invite ?? null };
}

/**
 * Connects the parent behind an invite token to a brand-new student account.
 * Single use: the invite is claimed atomically, so a link can't connect twice.
 */
export async function connectInvite(studentId: string, token: string): Promise<boolean> {
  const invite = await prisma.parentInvite.findUnique({ where: { token } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) return false;
  const used = await prisma.parentInvite.updateMany({ where: { id: invite.id, usedAt: null }, data: { usedAt: new Date() } });
  if (used.count !== 1) return false;
  await prisma.parentLink.upsert({
    where: { parentId_studentId: { parentId: invite.parentId, studentId } },
    create: { parentId: invite.parentId, studentId, nickname: invite.nickname },
    update: {},
  });
  return true;
}

/** For signup routes: apply a finished /start (and its invite) to a brand-new account. */
export async function applyStartOnSignup(userId: string, cookieValue: string | undefined): Promise<boolean> {
  const state = await readStartCookie(cookieValue ?? "");
  const { claimed, invite } = await claimStarter(userId, state);
  if (invite) await connectInvite(userId, invite);
  return claimed;
}
