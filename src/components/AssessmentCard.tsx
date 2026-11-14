"use client";
// Step 1 output: recommendation, assumptions, blind spots (selectable).
import type { StepSource } from "@/lib/api-client";
import type { EvidenceSource, InitialAssessment } from "@/lib/types";
import { StepSourceBadge } from "./ProvenanceBadge";
import { Stagger, StaggerItem } from "./motion";
import { Card, ConfidenceBlock, Label, LevelPill } from "./ui";

export const sourceLabel: Record<EvidenceSource, string> = {
  assumption: "Assumption",
  public_info: "Public info",
  flashpoint_synthetic: "Synthetic panel",
  flashpoint_real: "Real respondents",
  demo_fixture: "Demo fixture",
};

export function AssessmentCard({
  assessment,
  source,
  selectedId,
  onSelect,
  locked,
  hint,
}: {
  assessment: InitialAssessment;
  source: StepSource;
  selectedId: string;
  onSelect: (id: string) => void;
  locked: boolean;
  /** Line under "Blind spots, ranked" describing what the user can do right now. */
  hint: string;
}) {
  const blindSpots = [...assessment.blindSpots].sort((a, b) => a.rank - b.rank);
  return (
    <Card step={1} title="Initial assessment" aside={<StepSourceBadge source={source} />}>
      <div className="space-y-5">
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/40">
          <div className="text-xs font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-300">
            Leaning toward
          </div>
          <div className="mt-1 font-serif text-3xl font-semibold text-slate-900 dark:text-slate-50">{assessment.recommendation.choice}</div>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{assessment.recommendation.rationale}</p>
        </div>

        <ConfidenceBlock confidence={assessment.confidence} />

        {assessment.criteria.length > 0 && (
          <div>
            <Label>Criteria considered</Label>
            <div className="flex flex-wrap gap-2">
              {assessment.criteria.map((c) => (
                <span key={c} className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>Assumptions it rests on</Label>
          <Stagger className="space-y-2">
            {assessment.assumptions.map((a) => (
              <StaggerItem key={a.id} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase dark:bg-slate-800 dark:text-slate-300">
                  {sourceLabel[a.source]}
                </span>
                <span className="text-slate-700 dark:text-slate-300">{a.text}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div>
          <Label>Blind spots, ranked</Label>
          <p className="mb-2 text-xs text-slate-500">{hint}</p>
          <Stagger as="div" className="space-y-2">
          <div className="space-y-2" role="radiogroup" aria-label="Blind spots">
            {blindSpots.map((b) => {
              const selected = b.id === selectedId;
              return (
                <StaggerItem as="div" key={b.id}>
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={locked}
                  onClick={() => onSelect(b.id)}
                  className={`w-full cursor-pointer rounded-xl border p-3.5 text-left transition duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 enabled:hover:-translate-y-px enabled:hover:shadow-sm disabled:cursor-default motion-reduce:hover:translate-y-0 ${
                    selected
                      ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:bg-brand-950/40"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                  } ${locked && !selected ? "opacity-50" : ""}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{b.rank}</span>
                    {b.id === assessment.selectedBlindSpotId && (
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">AI pick</span>
                    )}
                    <LevelPill level={b.impact} prefix="impact" />
                    <LevelPill level={b.answerability} prefix="answerable" />
                  </div>
                  <div className="mt-1.5 text-sm font-medium">{b.question}</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{b.whyItMatters}</div>
                </button>
                </StaggerItem>
              );
            })}
          </div>
          </Stagger>
        </div>
      </div>
    </Card>
  );
}
