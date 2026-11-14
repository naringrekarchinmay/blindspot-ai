import { NextResponse } from "next/server";
import { ResearchStatusRequest } from "@/lib/types";
import { apiError, parseBody } from "@/lib/http";
import { getJob } from "@/lib/research-jobs";

// Current state of a live Flashpoint run started by /api/research.
export async function POST(req: Request) {
  const body = await parseBody(req, ResearchStatusRequest);
  if (!body.ok) return body.res;
  const result = getJob(body.data.jobId);
  if (!result) return apiError("This research run is no longer known to the server (it may have restarted). Run research again.", 404);
  return NextResponse.json(result);
}
