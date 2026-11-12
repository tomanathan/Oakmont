import { SignJWT, jwtVerify } from "jose";
import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getSecretKey } from "./auth";
import { itemsForSubskill, type BankItem } from "./items";
import { finishActivity } from "./activity";
import { onlyReferrerOrDirect } from "./signupSource";
import { STARTER_QUESTIONS } from "./starterQuestions";

// The /start onboarding: five short questions answered before any account
// exists, then a test date, then "save my plan". What they answered is held
// in a server-set, signed cookie (so it survives the Google redirect and
// Safari's limits on script storage, and can't be forged), and applied only
// when a brand-new account is created -- never merged into an existing one,
// so a shared device can't hand one student's answers to the next.

export const START_COOKIE = "oak_start";
const START_MAX_AGE = 30 * 24 * 60 * 60;

// When every starter is right, the plan still needs a first skill: a short one
// they haven't seen yet.
const ALL_RIGHT_FIRST_SKILL = "m-ratios-rates";

export function starterItems(): BankItem[] {
  return STARTER_QUESTIONS.map(({ skill, startsWith }) => {
    const bank = itemsForSubskill(skill);
    const item = bank.find((q) => q.q.startsWith(startsWith));
    if (item) return item;
    // The named question was reworded or replaced in the bank. /start is the
    // front door and signup grades against this list, so neither may fail
    // over it: stand in the skill's shortest easy question with no figure.
    console.error(`Starter question not found: ${skill} / ${startsWith}`);
    const plain = bank.filter((q) => !q.figure);
    const easy = plain.filter((q) => q.difficulty === "easy");
    const standIn = [...(easy.length ? easy : plain.length ? plain : bank)].sort((a, b) => a.q.length - b.q.length)[0];
    if (!standIn) throw new Error(`No questions at all for starter skill ${skill}`);
    return standIn;
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
  if (invite && (await connectInvite(userId, invite))) await labelParentInvite(userId);
  return claimed;
}

// A student who came because their parent sent the link is counted that
// way, unless a tagged link or a friend's invite brought them first.
async function labelParentInvite(userId: string) {
  const row = await prisma.user.findUnique({ where: { id: userId }, select: { signupSource: true, signupReferrer: true } });
  if (row && onlyReferrerOrDirect(row)) {
    await prisma.user.update({ where: { id: userId }, data: { signupSource: "parent-invite" } });
  }
}
