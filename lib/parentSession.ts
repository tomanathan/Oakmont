import { cookies } from "next/headers";
import { PARENT_SESSION_COOKIE_NAME, verifyParentSessionToken } from "./parentAuth";

export async function getCurrentParent() {
  const token = cookies().get(PARENT_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifyParentSessionToken(token);
  if (!session) return null;
  return session;
}
