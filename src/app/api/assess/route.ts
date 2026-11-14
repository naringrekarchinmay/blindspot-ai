import { NextResponse } from "next/server";
import { AssessRequest, InitialAssessment } from "@/lib/types";
import { loadFixture } from "@/lib/fixtures";
import { parseBody } from "@/lib/http";

export async function POST(req: Request) {
  const body = await parseBody(req, AssessRequest);
  if (!body.ok) return body.res;
  // TODO(P1): when !isDemoMode(), call Claude (src/lib/claude.ts). Stub returns the fixture for now.
  return NextResponse.json(await loadFixture("assess.json", InitialAssessment));
}
