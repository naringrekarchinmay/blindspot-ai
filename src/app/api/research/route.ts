import { NextResponse } from "next/server";
import { ResearchPlan, ResearchRequest, ResearchResult } from "@/lib/types";
import {
  CAPTURED_STUDIES,
  isDemoMode,
  loadFixture,
  loadOptionalFixture,
  samePlanQuestions,
} from "@/lib/fixtures";
import { parseBody, sourcedJson } from "@/lib/http";

// Order: live Flashpoint (RESEARCH_MODE=live) -> captured Flashpoint run -> demo fixture.
// A captured run is served only for the exact plan it answered; any other plan gets the
// labeled demo fixture. provenance on the result always states which one was used.
export async function POST(req: Request) {
  const body = await parseBody(req, ResearchRequest);
  if (!body.ok) return body.res;

  const mode = process.env.RESEARCH_MODE ?? "captured";
  if (!isDemoMode() && mode !== "fixture") {
    // TODO(P1): if mode === "live" && FLASHPOINT_TOKEN, try src/lib/flashpoint.ts first.
    for (const study of CAPTURED_STUDIES) {
      const plan = await loadOptionalFixture(study.plan, ResearchPlan);
      if (!plan || !samePlanQuestions(body.data.plan, plan)) continue;
      const captured = await loadOptionalFixture(study.result, ResearchResult);
      if (captured) return NextResponse.json(captured);
    }
  }
  const fixture = await demoFixtureFor(body.data.plan);
  return isDemoMode() ? sourcedJson(fixture, "fixture") : NextResponse.json(fixture);
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
