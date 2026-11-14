import { NextResponse } from "next/server";
import { ResearchPlan, ResearchPlanRequest } from "@/lib/types";
import { loadFixture } from "@/lib/fixtures";
import { parseBody } from "@/lib/http";

export async function POST(req: Request) {
  const body = await parseBody(req, ResearchPlanRequest);
  if (!body.ok) return body.res;
  // TODO(P1): when !isDemoMode(), call Claude. Stub returns the fixture for now.
  return NextResponse.json(await loadFixture("research-plan.json", ResearchPlan));
}
