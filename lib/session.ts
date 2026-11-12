import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;
  // A signed cookie is good for 30 days on its own, so check the account
  // still exists and the session wasn't issued before its password was last
  // reset (User.sessionsValidAfter). If the lookup itself fails, the signed
  // cookie stands: the page's own queries will report the outage.
  try {
    const row = await prisma.user.findUnique({ where: { id: session.userId }, select: { sessionsValidAfter: true } });
    if (!row) return null;
    if (row.sessionsValidAfter && session.iat * 1000 < row.sessionsValidAfter.getTime()) return null;
  } catch (err) {
    console.error("session check failed", err);
  }
  return session;
}
