"use client";
// Step 3 output: findings with provenance, synthetic notice and caveats.
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT, Stagger, StaggerItem } from "./motion";
import type { Finding, ResearchPlan, ResearchResult } from "@/lib/types";
import { ProvenanceBadge, SyntheticNotice } from "./ProvenanceBadge";
import { SearchOffIcon } from "./icons";
import { BulletList, Button, Card, Label } from "./ui";

function DistributionBars({
  distribution,
  unit,
}: {
  distribution: Record<string, number>;
  unit: string;
}) {
  const entries = Object.entries(distribution);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="space-y-1.5">
      {entries.map(([label, count], i) => (
        <div
          key={label}
          className="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-2 text-xs sm:grid-cols-[minmax(0,10rem)_1fr_auto]"
        >
          <span
            className="truncate text-slate-600 dark:text-slate-400"
            title={label}
          >
            {label}
          </span>
          <div className="h-4 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
            <motion.div
              className="h-4 origin-left rounded bg-brand-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: count / max }}
              transition={{
                duration: 0.6,
                ease: EASE_OUT,
                delay: 0.15 + i * 0.06,
              }}
            />
          </div>
          <span className="w-16 text-right tabular-nums text-slate-700 dark:text-slate-300">
            {count}
            {total > 0 && <span className="text-slate-400"> / {total}</span>}
          </span>
        </div>
      ))}
      <div className="text-right text-[10px] text-slate-400">
        counts of {unit}
      </div>
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
      <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
        {finding.summary}
      </p>
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

export function ResearchCard({
  result,
  plan,
  connect,
  canRunLive,
  onRunAgain,
}: {
  result: ResearchResult;
  plan: ResearchPlan;
  /** Connect-Flashpoint control, shown when no study was run. */
  connect?: ReactNode;
  canRunLive?: boolean;
  onRunAgain?: () => void;
}) {
  const synthetic = result.provenance.source === "flashpoint_synthetic";
  const unit = synthetic ? "AI personas" : "respondents";
  const questionIndex = new Map(plan.questions.map((q, i) => [q.id, i]));
  const findings = [...result.findings].sort(
    (a, b) =>
      (questionIndex.get(a.questionId) ?? 99) -
      (questionIndex.get(b.questionId) ?? 99),
  );

  // A demo-fixture result carries no numbers or quotes: show one clear explanation instead of
  // repeating "no data" under every question.
  const noData =
    result.provenance.mode === "fixture" &&
    result.findings.every(
      (f) => !f.distribution && !(f.quotes && f.quotes.length),
    );

  return (
    <Card
      step={3}
      title="Research findings"
      aside={<ProvenanceBadge provenance={result.provenance} />}
    >
      <div className="space-y-4">
        {synthetic && <SyntheticNotice />}
        {result.status !== "completed" && (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Research status: {result.status}
          </p>
        )}
        {noData ? (
          <NoResearchPanel plan={plan} connect={connect} canRunLive={canRunLive} onRunAgain={onRunAgain} />
        ) : (
          <Stagger className="space-y-3">
            {findings.map((f, i) => {
              const qi = questionIndex.get(f.questionId);
              return (
                <FindingBlock
                  key={`${f.questionId}-${i}`}
                  finding={f}
                  index={qi ?? i}
                  questionText={
                    qi !== undefined ? plan.questions[qi].text : undefined
                  }
                  unit={unit}
                />
              );
            })}
          </Stagger>
        )}
        <div>
          <Label>Caveats</Label>
          <BulletList items={result.caveats} />
        </div>
      </div>
    </Card>
  );
}

function NoResearchPanel({
  plan,
  connect,
  canRunLive,
  onRunAgain,
}: {
  plan: ResearchPlan;
  connect?: ReactNode;
  canRunLive?: boolean;
  onRunAgain?: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-sm">
        <SearchOffIcon size={22} className="mt-0.5 shrink-0 text-slate-400" />
        <div className="space-y-1.5">
          <p className="font-bold text-slate-100">
            No study has been run for this plan, so there are no findings.
          </p>
          <p className="text-slate-300">
            Nothing below is data. No captured Flashpoint study matches this
            plan, and live research needs a connected Flashpoint account, so
            the reassessment won&apos;t gain any new evidence. Connect
            Flashpoint to run this plan on a live synthetic panel (it takes a
            few minutes).
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {connect}
            {canRunLive && onRunAgain && (
              <Button onClick={onRunAgain}>Run live research</Button>
            )}
          </div>
        </div>
      </div>
      <div>
        <Label>Planned questions, not yet researched</Label>
        <Stagger as="ol" className="space-y-2">
          {plan.questions.map((q, i) => (
            <StaggerItem
              key={q.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-dashed border-slate-700 p-3 text-sm"
            >
              <span className="text-slate-300">
                <span className="mr-2 text-slate-500">Q{i + 1}</span>
                {q.text}
              </span>
              <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                No data
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  );
}
