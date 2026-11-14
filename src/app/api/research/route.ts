import { NextResponse } from "next/server";
import { ResearchRequest, ResearchResult } from "@/lib/types";
import { isDemoMode, loadFixture, loadOptionalFixture } from "@/lib/fixtures";
import { parseBody } from "@/lib/http";

// Order: live Flashpoint (RESEARCH_MODE=live) -> captured Flashpoint run -> demo fixture.
// provenance on the result always states which one was used.
export async function POST(req: Request) {
  const body = await parseBody(req, ResearchRequest);
  if (!body.ok) return body.res;

  const mode = process.env.RESEARCH_MODE ?? "captured";
  if (!isDemoMode() && mode !== "fixture") {
    // TODO(P1): if mode === "live" && FLASHPOINT_TOKEN, try src/lib/flashpoint.ts first.
    const captured = await loadOptionalFixture("research/flashpoint-capture.json", ResearchResult);
    if (captured) return NextResponse.json(captured);
  }
  return NextResponse.json(await loadFixture("research.json", ResearchResult));
}
