// Shared frontend/backend contract. Owner: P1. Changes after 11:20 go through a PR both review.
// Zod schemas double as Claude structured-output formats and API validation.
import { z } from "zod";

export const Level = z.enum(["low", "medium", "high"]);

export const Confidence = z.object({
  level: Level,
  reason: z.string(),
});

export const EvidenceSource = z.enum([
  "assumption",
  "public_info",
  "flashpoint_synthetic",
  "flashpoint_real",
  "demo_fixture",
]);

export const Assumption = z.object({
  id: z.string(),
  text: z.string(),
  source: EvidenceSource,
});

export const BlindSpot = z.object({
  id: z.string(),
  question: z.string(),
  whyItMatters: z.string(),
  impact: Level,
  answerability: Level,
  rank: z.number().int(),
});

export const Recommendation = z.object({
  choice: z.string(),
  rationale: z.string(),
});

export const InitialAssessment = z.object({
  decision: z.string(),
  options: z.array(z.string()),
  criteria: z.array(z.string()),
  recommendation: Recommendation,
  assumptions: z.array(Assumption),
  blindSpots: z.array(BlindSpot),
  selectedBlindSpotId: z.string(),
  confidence: Confidence,
});

export const ResearchQuestion = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(["single_select", "multi_select", "scale", "open_text"]),
  options: z.array(z.string()).optional(),
});

export const ResearchPlan = z.object({
  blindSpotId: z.string(),
  objective: z.string(),
  targetSegment: z.string(),
  sampleSize: z.number().int(),
  questions: z.array(ResearchQuestion),
  neutralityNotes: z.string(),
});

export const Provenance = z.object({
  mode: z.enum(["live", "captured", "fixture"]),
  source: EvidenceSource,
  platform: z.enum(["flashpoint", "none"]),
  surveyId: z.string().optional(),
  panelId: z.string().optional(),
  capturedAt: z.string().optional(),
  n: z.number().int(),
});

export const Finding = z.object({
  questionId: z.string(),
  summary: z.string(),
  distribution: z.record(z.string(), z.number()).optional(),
  quotes: z.array(z.string()).optional(),
});

// Where a live Flashpoint run is. Set only on results with status "running" or "failed".
export const ResearchProgress = z.object({
  stage: z.enum(["building_survey", "running_panel", "analyzing", "structuring", "done", "failed"]),
  message: z.string(),
  /** 0-1 within the current stage, when Flashpoint reports it. */
  fraction: z.number().optional(),
  startedAt: z.string(),
});

export const ResearchResult = z.object({
  status: z.enum(["completed", "running", "failed"]),
  provenance: Provenance,
  findings: z.array(Finding),
  caveats: z.array(z.string()),
  /** Live runs only: poll /api/research/status with this id until status is not "running". */
  jobId: z.string().optional(),
  progress: ResearchProgress.optional(),
});

export const Reassessment = z.object({
  before: Recommendation,
  after: Recommendation,
  changed: z.boolean(),
  changedAssumptions: z.array(
    z.object({ id: z.string(), before: z.string(), after: z.string() }),
  ),
  supporting: z.array(z.string()),
  contradicting: z.array(z.string()),
  limitations: z.array(z.string()),
  confidenceBefore: Confidence,
  confidenceAfter: Confidence,
});

// Request bodies
export const AssessRequest = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
});
export const ResearchPlanRequest = z.object({
  assessment: InitialAssessment,
  blindSpotId: z.string(),
});
export const ResearchRequest = z.object({ plan: ResearchPlan });
export const ResearchStatusRequest = z.object({ jobId: z.string().min(1) });
export const ReassessRequest = z.object({
  assessment: InitialAssessment,
  plan: ResearchPlan,
  result: ResearchResult,
});

export type Level = z.infer<typeof Level>;
export type Confidence = z.infer<typeof Confidence>;
export type EvidenceSource = z.infer<typeof EvidenceSource>;
export type Assumption = z.infer<typeof Assumption>;
export type BlindSpot = z.infer<typeof BlindSpot>;
export type Recommendation = z.infer<typeof Recommendation>;
export type InitialAssessment = z.infer<typeof InitialAssessment>;
export type ResearchQuestion = z.infer<typeof ResearchQuestion>;
export type ResearchPlan = z.infer<typeof ResearchPlan>;
export type Provenance = z.infer<typeof Provenance>;
export type Finding = z.infer<typeof Finding>;
export type ResearchProgress = z.infer<typeof ResearchProgress>;
export type ResearchResult = z.infer<typeof ResearchResult>;
export type Reassessment = z.infer<typeof Reassessment>;
export type AssessRequest = z.infer<typeof AssessRequest>;
export type ResearchPlanRequest = z.infer<typeof ResearchPlanRequest>;
export type ResearchRequest = z.infer<typeof ResearchRequest>;
export type ResearchStatusRequest = z.infer<typeof ResearchStatusRequest>;
export type ReassessRequest = z.infer<typeof ReassessRequest>;

// Error shape every route returns on failure
export type ApiError = { error: string; retryable: boolean };
