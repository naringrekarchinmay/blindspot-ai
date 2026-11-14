// Owner: P2. Typed browser client for the four BlindSpot API routes.
import type {
  ApiError,
  AssessRequest,
  InitialAssessment,
  Reassessment,
  ReassessRequest,
  ResearchPlan,
  ResearchPlanRequest,
  ResearchRequest,
  ResearchResult,
} from "./types";

/**
 * Value of the `x-blindspot-source` header: set when a step came from saved data, not a live call.
 * "fixture" = DEMO_MODE=fixtures (any route); "captured-*" = saved data from the captured Flashpoint run.
 */
export type StepSource = "fixture" | "captured-plan" | "captured-reassess" | null;

const STEP_SOURCES = new Set<string>(["fixture", "captured-plan", "captured-reassess"]);

export type ApiResponse<T> = { data: T; source: StepSource };

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiClientError("Network error: couldn't reach the server.", 0, true);
  }

  const json: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const err = json as Partial<ApiError> | null;
    throw new ApiClientError(
      err?.error ?? `Request failed (${res.status})`,
      res.status,
      err?.retryable ?? res.status >= 500,
    );
  }
  if (json === null) {
    throw new ApiClientError("Server returned an invalid response.", res.status, true);
  }

  const header = res.headers.get("x-blindspot-source");
  const source = header && STEP_SOURCES.has(header) ? (header as StepSource) : null;

  return { data: json as T, source };
}

export const assess = (body: AssessRequest) =>
  post<InitialAssessment>("/api/assess", body);

export const researchPlan = (body: ResearchPlanRequest) =>
  post<ResearchPlan>("/api/research-plan", body);

export const research = (body: ResearchRequest) =>
  post<ResearchResult>("/api/research", body);

export const reassess = (body: ReassessRequest) =>
  post<Reassessment>("/api/reassess", body);
