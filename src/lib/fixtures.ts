// Owner: P1. Loads demo fixtures and the captured Flashpoint run (server-side only).
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ZodType } from "zod";
import type { ResearchPlan } from "./types";

const FIXTURE_DIR = path.join(process.cwd(), "fixtures");

export const isDemoMode = () => process.env.DEMO_MODE === "fixtures";

export async function loadFixture<T>(name: string, schema: ZodType<T>): Promise<T> {
  const raw = await readFile(path.join(FIXTURE_DIR, name), "utf8");
  return schema.parse(JSON.parse(raw));
}

// The captured Flashpoint study: the plan its survey was built from and the run that answered it.
export const CAPTURED_PLAN = "research/flashpoint-plan.json";
export const CAPTURED_RESULT = "research/flashpoint-capture.json";

// True when `plan` asks exactly the captured survey's questions (same ids, text and order),
// i.e. when the captured findings actually answer it.
export function samePlanQuestions(plan: ResearchPlan, captured: ResearchPlan) {
  return (
    plan.questions.length === captured.questions.length &&
    plan.questions.every((q, i) => q.id === captured.questions[i].id && q.text === captured.questions[i].text)
  );
}

export async function loadOptionalFixture<T>(name: string, schema: ZodType<T>): Promise<T | null> {
  try {
    return await loadFixture(name, schema);
  } catch {
    return null;
  }
}
