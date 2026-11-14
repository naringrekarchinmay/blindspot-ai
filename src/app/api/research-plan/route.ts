import { NextResponse } from "next/server";
import { ResearchPlan, ResearchPlanRequest } from "@/lib/types";
import { isDemoMode, loadFixture } from "@/lib/fixtures";
import { apiError, handleError, parseBody } from "@/lib/http";
import { planResearch } from "@/lib/claude";

export const maxDuration = 120;

export async function POST(req: Request) {
  const body = await parseBody(req, ResearchPlanRequest);
  if (!body.ok) return body.res;
  const { assessment, blindSpotId } = body.data;
  if (!assessment.blindSpots.some((b) => b.id === blindSpotId)) {
    return apiError(`Unknown blindSpotId "${blindSpotId}"`, 400);
  }
  try {
    if (isDemoMode()) return NextResponse.json(await loadFixture("research-plan.json", ResearchPlan));
    return NextResponse.json(await planResearch(assessment, blindSpotId));
  } catch (err) {
    return handleError(err);
  }
}
