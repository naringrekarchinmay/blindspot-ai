import { NextResponse } from "next/server";
import { AssessRequest, InitialAssessment } from "@/lib/types";
import { isDemoMode, loadFixture } from "@/lib/fixtures";
import { handleError, parseBody } from "@/lib/http";
import { assess } from "@/lib/claude";

export const maxDuration = 120;

export async function POST(req: Request) {
  const body = await parseBody(req, AssessRequest);
  if (!body.ok) return body.res;
  try {
    if (isDemoMode()) return NextResponse.json(await loadFixture("assess.json", InitialAssessment));
    return NextResponse.json(await assess(body.data));
  } catch (err) {
    return handleError(err);
  }
}
