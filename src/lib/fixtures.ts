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

// Captured Flashpoint studies: for each, the plan its survey was built from, the run that
// answered it, and when that plan may be pinned (decision, options and selected blind spot).
// The plan is pinned only when the user's decision and blind spot are what the study asked,
// and the findings are served only for that exact plan, so captured data is never paired
// with questions it doesn't answer.
export type CapturedStudy = {
  id: string;
  plan: string;
  result: string;
  options: string[];
  decision: RegExp;
  /** Every pattern must match the selected blind spot's question (not its why-it-matters, which
   *  often mentions demand even for rent or competition blind spots). */
  blindSpot: RegExp[];
};

export const CAPTURED_STUDIES: CapturedStudy[] = [
  {
    id: "cafe",
    plan: "research/flashpoint-plan.json",
    result: "research/flashpoint-capture.json",
    options: ["Neighborhood A", "Neighborhood B"],
    decision: /caf[eé]/i,
    // Late-night demand: would people actually come, and how often.
    blindSpot: [/visit|demand|patron|want a caf|would (actually )?(go|come|use)|how many (people|residents)|how often/i],
  },
  {
    id: "football",
    plan: "research/football-plan.json",
    result: "research/football-capture.json",
    options: ["Upper East Side", "Lower East Side"],
    decision: /football|soccer/i,
    // In-store purchase intent: a buying word and a channel word.
    blindSpot: [/\b(buy|purchas|shop)/i, /online|in-store|in person|physical/i],
  },
  {
    id: "indian",
    plan: "research/indian-plan.json",
    result: "research/indian-capture.json",
    options: ["SoHo", "Upper East Side"],
    decision: /indian/i,
    // Diner demand: how often people eat or order Indian food (not rent, competition or concept).
    blindSpot: [/\b(eat|order|dine|visit|demand)\b/i],
  },
  {
    id: "bandai",
    plan: "research/bandai-plan.json",
    result: "research/bandai-capture.json",
    options: ["bandai", "knockoff"],
    decision: /bandai|model kit|gunpla/i,
    // Shopper demand: what people would pay and how often they'd buy (not legal or supply risk).
    blindSpot: [/\b(pay|price|pricing|spend|buy|purchas\w*|demand|willing)/i],
  },
];

const normOption = (s: string) => s.trim().toLowerCase().replace(/^the\s+/, "").replace(/\s+/g, " ");

/** The captured study whose plan fits this decision and blind spot, if any. */
export function studyForScenario(
  decision: string,
  options: string[],
  blindSpot: { question: string; whyItMatters: string } | undefined,
) {
  if (!blindSpot) return undefined;
  const opts = options.map(normOption).sort().join("|");
  const text = blindSpot.question;
  return CAPTURED_STUDIES.find(
    (s) =>
      s.options.map(normOption).sort().join("|") === opts &&
      s.decision.test(decision) &&
      s.blindSpot.every((re) => re.test(text)),
  );
}

// Live Claude outputs for the café demo, served only when a live call fails on that exact input.
export const CAPTURED_ASSESS = "research/assess-capture.json";
export const CAPTURED_REASSESS = "research/reassess-capture.json";

export const DEMO_QUESTION = "Should I open a late-night café in Neighborhood A or Neighborhood B?";
export const DEMO_OPTIONS = ["Neighborhood A", "Neighborhood B"];

const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

/** True for the café demo question with exactly its two options (order and spacing ignored). */
export function isDemoQuestion(question: string, options: string[]) {
  const opts = options.map(norm).sort();
  return norm(question) === norm(DEMO_QUESTION) && opts.join("|") === DEMO_OPTIONS.map(norm).sort().join("|");
}

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
