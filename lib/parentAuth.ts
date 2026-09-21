import { SignJWT, jwtVerify } from "jose";
import { getSecretKey } from "./auth";

// A parent's session is entirely separate from a student's (lib/auth.ts) --
// its own cookie, its own JWT payload shape -- so a parent and their kid can
// both be logged in on the same browser at once without either session
// clobbering the other. Signed with the same SESSION_SECRET as the student
// session; that's safe to share because verifyParentSessionToken below only
// accepts a payload shaped like a parent's (parentId + email), so a student
// token landing in this cookie by mistake would fail the shape check even
// though the signature itself would still verify.
const PARENT_SESSION_COOKIE = "sat_parent_session";
const PARENT_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days, same as the student session

export interface ParentSessionPayload {
  parentId: string;
  email: string;
}

export async function createParentSessionToken(payload: ParentSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PARENT_SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyParentSessionToken(token: string): Promise<ParentSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.parentId === "string" && typeof payload.email === "string") {
      return { parentId: payload.parentId, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}

export const PARENT_SESSION_COOKIE_NAME = PARENT_SESSION_COOKIE;
export const PARENT_SESSION_MAX_AGE = PARENT_SESSION_DURATION_SECONDS;
