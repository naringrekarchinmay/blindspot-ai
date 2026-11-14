import { NextResponse } from "next/server";
import { Reassessment, ReassessRequest } from "@/lib/types";
import { isDemoMode, loadFixture } from "@/lib/fixtures";
import { handleError, parseBody } from "@/lib/http";
import { reassess } from "@/lib/claude";

export const maxDuration = 120;

export async function POST(req: Request) {
  const body = await parseBody(req, ReassessRequest);
  if (!body.ok) return body.res;
  try {
    if (isDemoMode()) return NextResponse.json(await loadFixture("reassess.json", Reassessment));
    const { assessment, plan, result } = body.data;
    return NextResponse.json(await reassess(assessment, plan, result));
  } catch (err) {
    return handleError(err);
  }
}
