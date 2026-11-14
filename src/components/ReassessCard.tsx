"use client";
// Step 4 output: before vs after. The "after" side lands a beat later so the change reads as a change.
import type { StepSource } from "@/lib/api-client";
import type { Reassessment } from "@/lib/types";
import { StepSourceBadge } from "./ProvenanceBadge";
import { ArrowRightIcon } from "./icons";
import { Reveal } from "./motion";
import { BulletList, Card, Label, LevelPill } from "./ui";

export function ReassessCard({ reassessment: r, source }: { reassessment: Reassessment; source: StepSource }) {
  return (
    <Card
      step={4}
      title="Reassessment"
      aside={<StepSourceBadge source={source} />}
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["Before research", r.before, r.confidenceBefore],
              ["After research", r.after, r.confidenceAfter],
            ] as const
          ).map(([label, rec, conf], i) => (
            <Reveal
              key={label}
              delay={i * 0.25}
              className={`rounded-xl border p-4 ${
                i === 1
                  ? "border-brand-200 bg-brand-50/60 dark:border-brand-900 dark:bg-brand-950/40"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</span>
                <LevelPill level={conf.level} prefix="confidence" />
              </div>
              <div className="mt-1 font-serif text-2xl font-semibold text-slate-900 dark:text-slate-50">{rec.choice}</div>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{rec.rationale}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{conf.reason}</p>
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={0.5}
          className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl p-3 text-sm font-bold ${
            r.changed
              ? "bg-brand-50 text-brand-900 dark:bg-brand-950/50 dark:text-brand-200"
              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          }`}
        >
          {r.changed ? (
            <>
              Recommendation changed: {r.before.choice} <ArrowRightIcon className="shrink-0" /> {r.after.choice}
            </>
          ) : (
            <>Recommendation unchanged: still {r.after.choice}</>
          )}
          <span className="font-normal text-slate-500 dark:text-slate-400">
            {r.confidenceBefore.level !== r.confidenceAfter.level ? (
              <>
                {" "}· confidence {r.confidenceBefore.level} to {r.confidenceAfter.level}
              </>
            ) : (
              <> · confidence stays {r.confidenceAfter.level}</>
            )}
          </span>
        </Reveal>

        {r.changedAssumptions.length > 0 && (
          <Reveal delay={0.65}>
            <Label>Assumptions updated</Label>
            <ul className="space-y-2">
              {r.changedAssumptions.map((a) => (
                <li key={a.id} className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-2 text-slate-500 line-through decoration-slate-300 dark:bg-slate-800/60">
                    {a.before}
                  </div>
                  <div className="rounded-lg bg-brand-50 p-2 dark:bg-brand-950/40">{a.after}</div>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <Reveal delay={0.75} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Supporting evidence</Label>
            <BulletList items={r.supporting} />
          </div>
          <div>
            <Label>Contradicting evidence</Label>
            <BulletList items={r.contradicting} />
          </div>
        </Reveal>

        <div>
          <Label>Limitations</Label>
          <BulletList items={r.limitations} />
        </div>
      </div>
    </Card>
  );
}
