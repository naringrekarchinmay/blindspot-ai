import { NextResponse } from "next/server";
import { Reassessment, ReassessRequest, type ResearchResult } from "@/lib/types";
import { isDemoMode, loadFixture, loadOptionalFixture } from "@/lib/fixtures";
import { handleError, parseBody, sourcedJson } from "@/lib/http";
import { reassess } from "@/lib/claude";

export const maxDuration = 120;

const CAPTURED_REASSESS = "research/reassess-capture.json";
// The Flashpoint run the captured reassessment was produced from.
const CAPTURED_RUN = { surveyId: "a5a02725-7220-4920-8947-e6f053ee93e1", panelId: "01a1dad8-a77d-75cc-895c-e2dd8c587dcb" };

// The captured reassessment is only valid evidence-wise for the run it was made from.
function isCapturedRun(result: ResearchResult) {
  const p = result.provenance;
  return p.platform === "flashpoint" && p.surveyId === CAPTURED_RUN.surveyId && p.panelId === CAPTURED_RUN.panelId;
}

// Order: demo fixture (DEMO_MODE=fixtures) -> live Claude -> captured reassessment,
// the last only when Claude fails and the request carries the captured Flashpoint run.
// A captured response is marked with the x-blindspot-source header.
export async function POST(req: Request) {
  const body = await parseBody(req, ReassessRequest);
  if (!body.ok) return body.res;
  const { assessment, plan, result } = body.data;
  try {
    if (isDemoMode()) return sourcedJson(await loadFixture("reassess.json", Reassessment), "fixture");
    return NextResponse.json(await reassess(assessment, plan, result));
  } catch (err) {
    if (isCapturedRun(result)) {
      const captured = await loadOptionalFixture(CAPTURED_REASSESS, Reassessment);
      if (captured) {
        console.warn("reassess: live Claude call failed, serving captured reassessment");
        return sourcedJson(captured, "captured-reassess");
      }
    }
    return handleError(err);
  }
}
