import { NextResponse } from "next/server";
import { getFlashpointToken } from "@/lib/flashpoint-auth";
import { isDemoMode } from "@/lib/fixtures";

// Whether live Flashpoint research is enabled and connected. Never returns the token.
export async function POST() {
  const liveEnabled = !isDemoMode() && (process.env.RESEARCH_MODE || "live") === "live";
  return NextResponse.json({ liveEnabled, connected: liveEnabled && !!(await getFlashpointToken()) });
}
