import { NextResponse } from "next/server";
import { InitialAssessment, Reassessment, ReassessRequest, type ResearchResult } from "@/lib/types";
import { CAPTURED_ASSESS, CAPTURED_REASSESS, isDemoMode, loadFixture, loadOptionalFixture } from "@/lib/fixtures";
import { handleError, parseBody, sourcedJson } from "@/lib/http";
import { reassess } from "@/lib/claude";

export const maxDuration = 120;

// The Flashpoint run the captured reassessment was produced from.
const CAPTURED_RUN = { surveyId: "a5a02725-7220-4920-8947-e6f053ee93e1", panelId: "01a1dad8-a77d-75cc-895c-e2dd8c587dcb" };

function isCapturedRun(result: ResearchResult) {
  const p = result.provenance;
  return p.platform === "flashpoint" && p.surveyId === CAPTURED_RUN.surveyId && p.panelId === CAPTURED_RUN.panelId;
}

// The captured reassessment's "before" side and changed assumptions come from the captured
// assessment, so it only fits a request that carries that same assessment.
function isCapturedAssessment(a: InitialAssessment, captured: InitialAssessment) {
  return (
    a.decision === captured.decision &&
    a.recommendation.choice === captured.recommendation.choice &&
    a.recommendation.rationale === captured.recommendation.rationale
  );
}

// Order: demo fixture (DEMO_MODE=fixtures) -> live Claude -> captured reassessment, the last only
// when Claude fails and the request carries the captured assessment and the captured Flashpoint
// run (x-blindspot-source: captured-reassess). Anything else returns the error so the UI can retry.
export async function POST(req: Request) {
  const body = await parseBody(req, ReassessRequest);
  if (!body.ok) return body.res;
  const { assessment, plan, result } = body.data;
  try {
    if (isDemoMode()) return sourcedJson(await loadFixture("reassess.json", Reassessment), "fixture");
    return NextResponse.json(await reassess(assessment, plan, result));
  } catch (err) {
    if (isCapturedRun(result)) {
      const [capturedAssess, captured] = await Promise.all([
        loadOptionalFixture(CAPTURED_ASSESS, InitialAssessment),
        loadOptionalFixture(CAPTURED_REASSESS, Reassessment),
      ]);
      if (capturedAssess && captured && isCapturedAssessment(assessment, capturedAssess)) {
        console.warn(`reassess: live Claude call failed (${err instanceof Error ? err.message : "unknown"}), serving captured reassessment`);
        return sourcedJson(captured, "captured-reassess");
      }
    }
    return handleError(err);
  }
}
