"use client";
// Step 2 output: the research instrument.
import type { StepSource } from "@/lib/api-client";
import type { ResearchPlan } from "@/lib/types";
import { StepSourceBadge } from "./ProvenanceBadge";
import { Stagger, StaggerItem } from "./motion";
import { Card, Label } from "./ui";

const typeLabel = {
  single_select: "Single choice",
  multi_select: "Multiple choice",
  scale: "Scale",
  open_text: "Open text",
} as const;

export function PlanCard({ plan, source }: { plan: ResearchPlan; source: StepSource }) {
  return (
    <Card
      step={2}
      title="Research plan"
      aside={<StepSourceBadge source={source} />}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label>Objective</Label>
            <p className="text-sm">{plan.objective}</p>
          </div>
          <div>
            <Label>Target sample</Label>
            <p className="text-sm">{plan.sampleSize} respondents</p>
          </div>
        </div>
        <div>
          <Label>Target segment</Label>
          <p className="text-sm">{plan.targetSegment}</p>
        </div>
        <div>
          <Label>Questions</Label>
          <Stagger as="ol" className="space-y-2">
            {plan.questions.map((q, i) => (
              <StaggerItem key={q.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-sm dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-start justify-between gap-3">
                  <span>
                    <span className="mr-2 font-semibold text-slate-400">Q{i + 1}</span>
                    {q.text}
                  </span>
                  <span className="shrink-0 text-[10px] font-semibold text-slate-500 uppercase">
                    {typeLabel[q.type]}
                  </span>
                </div>
                {q.options && q.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {q.options.map((o) => (
                      <span
                        key={o}
                        className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                )}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <div>
          <Label>Neutrality notes</Label>
          <p className="text-sm text-slate-600 dark:text-slate-400">{plan.neutralityNotes}</p>
        </div>
      </div>
    </Card>
  );
}
