import { cookies } from "next/headers";
import { PARENT_SESSION_COOKIE_NAME, verifyParentSessionToken } from "./parentAuth";
import { prisma } from "./prisma";

export async function getCurrentParent() {
  const token = cookies().get(PARENT_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifyParentSessionToken(token);
  if (!session) return null;
  // Same check as the student session (lib/session.ts): the account still
  // exists, and the session is newer than its last password reset.
  try {
    const row = await prisma.parent.findUnique({ where: { id: session.parentId }, select: { sessionsValidAfter: true } });
    if (!row) return null;
    if (row.sessionsValidAfter && session.iat * 1000 < row.sessionsValidAfter.getTime()) return null;
  } catch (err) {
    console.error("parent session check failed", err);
  }
  return session;
}
