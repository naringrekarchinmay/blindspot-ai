// Owner: P1. Server-only Claude calls with zod-validated structured outputs.
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { ZodType } from "zod";
import {
  InitialAssessment,
  Reassessment,
  ResearchPlan,
  type AssessRequest,
  type ResearchResult,
} from "./types";
import { SYSTEM, assessPrompt, reassessPrompt, researchPlanPrompt } from "./prompts";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

let client: Anthropic | null = null;
function getClient() {
  // Created lazily so DEMO_MODE works without a key. SDK retries 429/5xx twice by default.
  client ??= new Anthropic({ timeout: 90_000 });
  return client;
}

export class ClaudeError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryable: boolean,
  ) {
    super(message);
  }
}

async function structured<T>(prompt: string, schema: ZodType<T>): Promise<T> {
  let response;
  try {
    response = await getClient().messages.parse({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
      output_config: {
        effort: "low",
        format: zodOutputFormat(schema),
      },
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      throw new ClaudeError("Anthropic API key missing or invalid (check .env.local)", 500, false);
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new ClaudeError("Anthropic rate limit reached; try again shortly", 429, true);
    }
    if (err instanceof Anthropic.APIError) {
      const status = err.status ?? 502;
      throw new ClaudeError(`Anthropic API error (${status})`, 502, status >= 500 || status === 408);
    }
    if (err instanceof Error && /api key|apiKey|authentication/i.test(err.message)) {
      throw new ClaudeError("Anthropic API key missing (set ANTHROPIC_API_KEY in .env.local)", 500, false);
    }
    throw new ClaudeError("Could not reach the Anthropic API", 502, true);
  }

  if (response.stop_reason === "refusal") {
    throw new ClaudeError("Claude declined this request", 422, false);
  }
  if (response.stop_reason === "max_tokens") {
    throw new ClaudeError("Claude's answer was cut off; try again", 502, true);
  }
  if (!response.parsed_output) {
    throw new ClaudeError("Claude returned output that did not match the schema", 502, true);
  }
  return response.parsed_output as T;
}

export async function assess(req: AssessRequest): Promise<InitialAssessment> {
  const out = await structured(assessPrompt(req), InitialAssessment);
  // Keep the selection valid even if the model picks a bad id.
  if (!out.blindSpots.some((b) => b.id === out.selectedBlindSpotId) && out.blindSpots.length) {
    out.selectedBlindSpotId = [...out.blindSpots].sort((a, b) => a.rank - b.rank)[0].id;
  }
  return out;
}

export async function planResearch(
  assessment: InitialAssessment,
  blindSpotId: string,
): Promise<ResearchPlan> {
  const out = await structured(researchPlanPrompt(assessment, blindSpotId), ResearchPlan);
  return { ...out, blindSpotId };
}

export async function reassess(
  assessment: InitialAssessment,
  plan: ResearchPlan,
  result: ResearchResult,
): Promise<Reassessment> {
  const out = await structured(reassessPrompt(assessment, plan, result), Reassessment);
  // "before" fields come from the real initial assessment, not the model's copy.
  const before = assessment.recommendation;
  return {
    ...out,
    before,
    confidenceBefore: assessment.confidence,
    changed: out.after.choice.trim() !== before.choice.trim(),
  };
}
