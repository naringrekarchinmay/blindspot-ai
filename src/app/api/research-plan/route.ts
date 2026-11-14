import { NextResponse } from "next/server";
import { ResearchPlan, ResearchPlanRequest } from "@/lib/types";
import { isDemoMode, loadFixture, loadOptionalFixture, studyForScenario } from "@/lib/fixtures";
import { apiError, handleError, parseBody, sourcedJson } from "@/lib/http";
import { planResearch } from "@/lib/claude";

export const maxDuration = 120;

// Order: demo fixture (DEMO_MODE=fixtures) -> captured Flashpoint plan (when the decision and
// selected blind spot match a captured study, RESEARCH_MODE=captured) -> live Claude.
// A pinned plan is marked with the x-blindspot-source: captured-plan header.
export async function POST(req: Request) {
  const body = await parseBody(req, ResearchPlanRequest);
  if (!body.ok) return body.res;
  const { assessment, blindSpotId } = body.data;
  const spot = assessment.blindSpots.find((b) => b.id === blindSpotId);
  if (!spot) return apiError(`Unknown blindSpotId "${blindSpotId}"`, 400);
  try {
    if (isDemoMode()) return sourcedJson(await loadFixture("research-plan.json", ResearchPlan), "fixture");

    const mode = process.env.RESEARCH_MODE ?? "captured";
    const study = mode === "captured" ? studyForScenario(assessment.decision, assessment.options, spot) : undefined;
    if (study) {
      const captured = await loadOptionalFixture(study.plan, ResearchPlan);
      if (captured) return sourcedJson({ ...captured, blindSpotId }, "captured-plan");
    }
    return NextResponse.json(await planResearch(assessment, blindSpotId));
  } catch (err) {
    return handleError(err);
  }
}
