import { NextResponse } from "next/server";
import { ResearchPlan, ResearchPlanRequest, type InitialAssessment } from "@/lib/types";
import { CAPTURED_PLAN, isDemoMode, loadFixture, loadOptionalFixture } from "@/lib/fixtures";
import { apiError, handleError, parseBody, sourcedJson } from "@/lib/http";
import { planResearch } from "@/lib/claude";

export const maxDuration = 120;

// The captured Flashpoint study only answers "late-night café demand in Neighborhood A vs B".
// Pin its plan only for that decision and for a blind spot about customer demand, so the
// captured findings are never paired with a question they don't answer.
function isCapturedScenario(assessment: InitialAssessment, blindSpotId: string) {
  const opts = new Set(assessment.options.map((o) => o.trim().toLowerCase()));
  const sameOptions = opts.size === 2 && opts.has("neighborhood a") && opts.has("neighborhood b");
  const cafe = /caf[eé]/i.test(assessment.decision);
  const spot = assessment.blindSpots.find((b) => b.id === blindSpotId);
  const aboutDemand = !!spot && /demand|visit|customer|foot traffic|patron|willing|interest/i.test(`${spot.question} ${spot.whyItMatters}`);
  return sameOptions && cafe && aboutDemand;
}

// Order: demo fixture (DEMO_MODE=fixtures) -> captured Flashpoint plan (captured scenario,
// RESEARCH_MODE not live/fixture) -> live Claude. A pinned plan is marked with the
// x-blindspot-source: captured-plan header.
export async function POST(req: Request) {
  const body = await parseBody(req, ResearchPlanRequest);
  if (!body.ok) return body.res;
  const { assessment, blindSpotId } = body.data;
  if (!assessment.blindSpots.some((b) => b.id === blindSpotId)) {
    return apiError(`Unknown blindSpotId "${blindSpotId}"`, 400);
  }
  try {
    if (isDemoMode()) return sourcedJson(await loadFixture("research-plan.json", ResearchPlan), "fixture");

    const mode = process.env.RESEARCH_MODE ?? "captured";
    if (mode === "captured" && isCapturedScenario(assessment, blindSpotId)) {
      const captured = await loadOptionalFixture(CAPTURED_PLAN, ResearchPlan);
      if (captured) {
        return sourcedJson({ ...captured, blindSpotId }, "captured-plan");
      }
    }
    return NextResponse.json(await planResearch(assessment, blindSpotId));
  } catch (err) {
    return handleError(err);
  }
}
