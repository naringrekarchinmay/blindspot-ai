// Owner: P1. Shared route-handler helpers.
import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import type { ApiError } from "./types";

export function apiError(error: string, status: number, retryable = false) {
  return NextResponse.json<ApiError>({ error, retryable }, { status });
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
