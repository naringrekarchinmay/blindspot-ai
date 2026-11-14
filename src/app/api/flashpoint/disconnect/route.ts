import { NextResponse } from "next/server";
import { disconnectFlashpoint } from "@/lib/flashpoint-auth";

export async function POST() {
  await disconnectFlashpoint();
  return NextResponse.json({ ok: true });
}
