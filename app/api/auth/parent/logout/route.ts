import { NextResponse } from "next/server";
import { PARENT_SESSION_COOKIE_NAME } from "@/lib/parentAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARENT_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
