import crypto from "crypto";
import { prisma } from "./prisma";

// Excludes visually-ambiguous characters (0/O, 1/I) since this code gets
// read off one screen and typed into another.
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

function generateCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  return code;
}

// Generates a fresh code and saves it, replacing any previous one.
export async function newParentInviteCode(userId: string): Promise<string> {
  let code = generateCode();
  // A collision is vanishingly unlikely (8 chars from a 32-char alphabet)
  // but would otherwise surface as a raw 500 from the unique constraint.
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.user.findUnique({ where: { parentInviteCode: code } });
    if (!existing) break;
    code = generateCode();
  }
  await prisma.user.update({ where: { id: userId }, data: { parentInviteCode: code } });
  return code;
}

// The student's current code, creating one only if there isn't one yet --
// so a code already shared with someone keeps working.
export async function ensureParentInviteCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { parentInviteCode: true } });
  return user?.parentInviteCode ?? newParentInviteCode(userId);
}
