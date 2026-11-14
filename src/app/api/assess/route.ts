import { NextResponse } from "next/server";
import { AssessRequest, InitialAssessment } from "@/lib/types";
import { CAPTURED_ASSESS, isDemoMode, isDemoQuestion, loadFixture, loadOptionalFixture } from "@/lib/fixtures";
import { handleError, parseBody, sourcedJson } from "@/lib/http";
import { assess } from "@/lib/claude";

export const maxDuration = 120;

// Order: demo fixture (DEMO_MODE=fixtures) -> live Claude -> captured assessment, the last only
// when Claude fails and the request is exactly the café demo question
// (x-blindspot-source: captured-assess).
export async function POST(req: Request) {
  const body = await parseBody(req, AssessRequest);
  if (!body.ok) return body.res;
  try {
    if (isDemoMode()) return sourcedJson(await loadFixture("assess.json", InitialAssessment), "fixture");
    return NextResponse.json(await assess(body.data));
  } catch (err) {
    if (isDemoQuestion(body.data.question, body.data.options)) {
      const captured = await loadOptionalFixture(CAPTURED_ASSESS, InitialAssessment);
      if (captured) {
        console.warn(`assess: live Claude call failed (${err instanceof Error ? err.message : "unknown"}), serving captured assessment`);
        return sourcedJson(captured, "captured-assess");
      }
    }
    return handleError(err);
  }
}
