"use client";
// Step 3 output: findings with provenance, synthetic notice and caveats.
import { motion } from "motion/react";
import { EASE_OUT, Stagger, StaggerItem } from "./motion";
import type { Finding, ResearchPlan, ResearchResult } from "@/lib/types";
import { ProvenanceBadge, SyntheticNotice } from "./ProvenanceBadge";
import { BulletList, Card, Label } from "./ui";

function DistributionBars({ distribution, unit }: { distribution: Record<string, number>; unit: string }) {
  const entries = Object.entries(distribution);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="space-y-1.5">
      {entries.map(([label, count], i) => (
        <div key={label} className="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-2 text-xs sm:grid-cols-[minmax(0,10rem)_1fr_auto]">
          <span className="truncate text-slate-600 dark:text-slate-400" title={label}>
            {label}
          </span>
          <div className="h-4 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
            <motion.div
              className="h-4 origin-left rounded bg-brand-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: count / max }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.15 + i * 0.06 }}
            />
          </div>
          <span className="w-16 text-right tabular-nums text-slate-700 dark:text-slate-300">
            {count}
            {total > 0 && <span className="text-slate-400"> / {total}</span>}
          </span>
        </div>
      ))}
      <div className="text-right text-[10px] text-slate-400">counts of {unit}</div>
    </div>
  );
}

function FindingBlock({
  finding,
  index,
  questionText,
  unit,
}: {
  finding: Finding;
  index: number;
  questionText?: string;
  unit: string;
}) {
  return (
    <StaggerItem className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="mb-2 text-sm font-medium">
        <span className="mr-2 text-slate-400">Q{index + 1}</span>
        {questionText ?? finding.questionId}
      </div>
      <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">{finding.summary}</p>
      {finding.distribution && Object.keys(finding.distribution).length > 0 && (
        <DistributionBars distribution={finding.distribution} unit={unit} />
      )}
      {finding.quotes && finding.quotes.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
            Sample answers{unit === "AI personas" ? " (AI personas)" : ""}
          </div>
          {finding.quotes.map((q, i) => (
            <blockquote
              key={i}
              className="border-l-2 border-brand-300 pl-3 text-sm text-slate-600 italic dark:border-brand-700 dark:text-slate-400"
            >
              “{q}”
            </blockquote>
          ))}
        </div>
      )}
    </StaggerItem>
  );
}

export function ResearchCard({ result, plan }: { result: ResearchResult; plan: ResearchPlan }) {
  const synthetic = result.provenance.source === "flashpoint_synthetic";
  const unit = synthetic ? "AI personas" : "respondents";
  const questionIndex = new Map(plan.questions.map((q, i) => [q.id, i]));
  const findings = [...result.findings].sort(
    (a, b) => (questionIndex.get(a.questionId) ?? 99) - (questionIndex.get(b.questionId) ?? 99),
  );

  return (
    <Card step={3} title="Research findings" aside={<ProvenanceBadge provenance={result.provenance} />}>
      <div className="space-y-4">
        {synthetic && <SyntheticNotice />}
        {result.status !== "completed" && (
          <p className="text-sm text-amber-700 dark:text-amber-300">Research status: {result.status}</p>
        )}
        <Stagger className="space-y-3">
          {findings.map((f, i) => {
            const qi = questionIndex.get(f.questionId);
            return (
              <FindingBlock
                key={`${f.questionId}-${i}`}
                finding={f}
                index={qi ?? i}
                questionText={qi !== undefined ? plan.questions[qi].text : undefined}
                unit={unit}
              />
            );
          })}
        </Stagger>
        <div>
          <Label>Caveats</Label>
          <BulletList items={result.caveats} />
        </div>
      </div>
    </Card>
  );
}
