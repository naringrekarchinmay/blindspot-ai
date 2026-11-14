// Owner: P1. Shared route-handler helpers.
import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import type { ApiError } from "./types";

export function apiError(error: string, status: number, retryable = false) {
  return NextResponse.json<ApiError>({ error, retryable }, { status });
}

// Marks a step that came from saved data instead of a live call. The UI reads it to badge the step.
// Values: "fixture" (DEMO_MODE=fixtures), "captured-plan", "captured-reassess".
export const SOURCE_HEADER = "x-blindspot-source";

export function sourcedJson<T>(data: T, source: "fixture" | "captured-plan" | "captured-reassess") {
  return NextResponse.json(data, { headers: { [SOURCE_HEADER]: source } });
}

export async function parseBody<T>(req: Request, schema: ZodType<T>) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { ok: false as const, res: apiError("Request body must be JSON", 400) };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return { ok: false as const, res: apiError(`Invalid request: ${parsed.error.message}`, 400) };
  }
  return { ok: true as const, data: parsed.data };
}

// Turns a thrown error into the standard {error, retryable} response.
export function handleError(err: unknown) {
  if (err && typeof err === "object" && "status" in err && "retryable" in err && err instanceof Error) {
    const e = err as Error & { status: number; retryable: boolean };
    return apiError(e.message, e.status, e.retryable);
  }
  console.error(err);
  return apiError("Unexpected server error", 500, true);
}
