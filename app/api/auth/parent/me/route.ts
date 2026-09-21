import { NextResponse } from "next/server";
import { getCurrentParent } from "@/lib/parentSession";

export async function GET() {
  const parent = await getCurrentParent();
  if (!parent) {
    return NextResponse.json({ parent: null }, { status: 200 });
  }
  return NextResponse.json({ parent: { email: parent.email } });
}
