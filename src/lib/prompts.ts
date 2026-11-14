// Owner: P1. Prompt text for each reasoning step. Keep SYSTEM stable (it is the cacheable prefix).
import type {
  AssessRequest,
  InitialAssessment,
  ResearchPlan,
  ResearchResult,
} from "./types";

export const SYSTEM = `You are BlindSpot AI, a decision-research agent that is honest about what it does not know.

Rules:
- Never invent facts, statistics, prices, sample sizes, survey participants, quotes or sources. If you lack data, say so and mark it as an assumption.
- Label every assumption's source. Use "assumption" for your own hypotheses and "public_info" only for widely known general facts. Never use "flashpoint_synthetic", "flashpoint_real" or "demo_fixture" unless the evidence given to you carries that label.
- Confidence is "low", "medium" or "high" with a one-sentence reason. Never give percentages.
- Prefer honest uncertainty over a dramatic change of mind. "Insufficient evidence; no change" is a valid outcome.
- Synthetic-panel responses come from AI personas, not real people. They are directional signals, not population estimates.
- Write concisely: rationales of 1-3 sentences, list items of one sentence.`;

const json = (v: unknown) => JSON.stringify(v, null, 2);

export function assessPrompt({ question, options }: AssessRequest) {
  return `Decision question: ${question}
Options: ${options.map((o, i) => `${i + 1}. ${o}`).join("\n")}

Produce an initial assessment:
- decision: restate the question. options: the options exactly as given.
- criteria: 3-5 decision criteria.
- recommendation: a provisional choice (one of the options) and why, based only on what is given plus clearly labeled assumptions.
- assumptions: 3-5 assumptions the recommendation depends on, ids "a1", "a2", ...
- blindSpots: 2-4 unknowns that could change the decision, ids "b1", "b2", ... Each has a question, why it matters, impact and answerability (could a short survey of the right people answer it?), and rank (1 = highest impact x answerability).
- selectedBlindSpotId: the id of the rank-1 blind spot.
- confidence: low, medium or high, with a reason.`;
}

export function researchPlanPrompt(assessment: InitialAssessment, blindSpotId: string) {
  const spot = assessment.blindSpots.find((b) => b.id === blindSpotId);
  return `Initial assessment:
${json(assessment)}

Design a short study to answer this blind spot:
${json(spot ?? { id: blindSpotId })}

It will run on a Flashpoint.AI synthetic panel (AI personas calibrated to a target population).
- blindSpotId: "${blindSpotId}".
- objective: one sentence.
- targetSegment: who should answer (demographics, location, behavior). Do not target sensitive traits.
- sampleSize: 30.
- questions: 3-5 neutral, non-leading questions, ids "q1", "q2", ... Use single_select, multi_select or scale with balanced options, and at most one open_text. Do not reveal which option the decision-maker prefers.
- neutralityNotes: one sentence on how you avoided bias.`;
}

export function reassessPrompt(
  assessment: InitialAssessment,
  plan: ResearchPlan,
  result: ResearchResult,
) {
  return `Initial assessment:
${json(assessment)}

Research plan:
${json(plan)}

Research result (provenance tells you where it came from):
${json(result)}

Re-assess the decision using ONLY this evidence:
- If provenance.mode is "fixture" or source is "demo_fixture", the result is placeholder data. Do not treat it as evidence: set changed=false and say there is insufficient evidence.
- If the source is "flashpoint_synthetic", treat it as directional signal from AI personas, not real people.
- before: copy the initial recommendation. after: the updated choice and rationale.
- changed: true only if the choice changed.
- changedAssumptions: assumptions (by id) whose wording should change given the evidence, with before and after text.
- supporting / contradicting: evidence points for and against the final choice, each citing a question id (e.g. "q3: ...").
- limitations: sample size, synthetic vs real, anything the study could not show.
- confidenceBefore: copy the initial confidence. confidenceAfter: updated.`;
}

export function structureFindingsPrompt(plan: ResearchPlan, analysis: string) {
  return `A Flashpoint synthetic panel (AI personas, not real people) answered this survey:
${json(plan.questions)}

Flashpoint's analysis of the responses (the only data you may use):
<analysis>
${analysis}
</analysis>

Turn the analysis into structured findings:
- n: the number of completed responses the analysis reports. Use 0 if it does not state one.
- findings: one per survey question, in order, with its questionId.
  - summary: 1-2 sentences stating what the responses show, using only numbers that appear in the analysis.
  - distribution: for single_select, multi_select and scale questions, the count per answer option, using the survey's option labels exactly. Include an option only if the analysis gives its count. Empty for open_text.
  - quotes: up to 3 verbatim persona answers quoted in the analysis. Never write or paraphrase a quote. Empty if none are quoted.
  - If the analysis has no data for a question, say "Flashpoint's analysis gave no data for this question." with an empty distribution and no quotes.
- caveats: 1-3 limitations visible in the analysis (sample size, missing questions, anything unusual). Do not repeat that respondents are AI personas.
Never invent counts, percentages or quotes.`;
}
