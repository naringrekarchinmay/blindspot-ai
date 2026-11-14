import { NextResponse } from "next/server";
import { ResearchPlan, ResearchRequest, ResearchResult } from "@/lib/types";
import {
  CAPTURED_PLAN,
  CAPTURED_RESULT,
  isDemoMode,
  loadFixture,
  loadOptionalFixture,
  samePlanQuestions,
} from "@/lib/fixtures";
import { parseBody } from "@/lib/http";

// Order: live Flashpoint (RESEARCH_MODE=live) -> captured Flashpoint run -> demo fixture.
// The captured run is served only for the exact plan it answered; any other plan gets the
// labeled demo fixture. provenance on the result always states which one was used.
export async function POST(req: Request) {
  const body = await parseBody(req, ResearchRequest);
  if (!body.ok) return body.res;

  const mode = process.env.RESEARCH_MODE ?? "captured";
  if (!isDemoMode() && mode !== "fixture") {
    // TODO(P1): if mode === "live" && FLASHPOINT_TOKEN, try src/lib/flashpoint.ts first.
    const [plan, captured] = await Promise.all([
      loadOptionalFixture(CAPTURED_PLAN, ResearchPlan),
      loadOptionalFixture(CAPTURED_RESULT, ResearchResult),
    ]);
    if (plan && captured && samePlanQuestions(body.data.plan, plan)) return NextResponse.json(captured);
  }
  return NextResponse.json(await demoFixtureFor(body.data.plan));
}

// The topic-neutral demo fixture, with one explicit "no data" finding per plan question,
// so the UI can render any plan without showing numbers or quotes nobody gave.
async function demoFixtureFor(plan: ResearchPlan): Promise<ResearchResult> {
  const fixture = await loadFixture("research.json", ResearchResult);
  return {
    ...fixture,
    findings: plan.questions.map((q) => ({
      questionId: q.id,
      summary: "[Demo fixture] No research was run for this question; there is no data.",
    })),
  };
}
