// Owner: P2. Step 4 output: before vs after.
import type { StepSource } from "@/lib/api-client";
import type { Reassessment } from "@/lib/types";
import { Badge } from "./ProvenanceBadge";
import { BulletList, Card, Label, LevelPill } from "./ui";

export function ReassessCard({ reassessment: r, source }: { reassessment: Reassessment; source: StepSource }) {
  return (
    <Card
      step={4}
      title="Reassessment"
      aside={
        source === "captured-reassess" ? (
          <Badge kind="captured" detail="Live Claude call failed; showing the saved reassessment" />
        ) : undefined
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["Before research", r.before, r.confidenceBefore],
              ["After research", r.after, r.confidenceAfter],
            ] as const
          ).map(([label, rec, conf]) => (
            <div key={label} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</span>
                <LevelPill level={conf.level} prefix="confidence" />
              </div>
              <div className="mt-1 text-lg font-bold">{rec.choice}</div>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{rec.rationale}</p>
              <p className="mt-2 text-xs text-slate-500">{conf.reason}</p>
            </div>
          ))}
        </div>

        <div
          className={`rounded-xl p-3 text-sm font-medium ${
            r.changed
              ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200"
              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          }`}
        >
          {r.changed
            ? `Recommendation changed: ${r.before.choice} → ${r.after.choice}`
            : `Recommendation unchanged: still ${r.after.choice}`}
          {r.confidenceBefore.level !== r.confidenceAfter.level
            ? ` · confidence ${r.confidenceBefore.level} → ${r.confidenceAfter.level}`
            : ` · confidence stays ${r.confidenceAfter.level}`}
        </div>

        {r.changedAssumptions.length > 0 && (
          <div>
            <Label>Assumptions updated</Label>
            <ul className="space-y-2">
              {r.changedAssumptions.map((a) => (
                <li key={a.id} className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-2 text-slate-500 line-through decoration-slate-300 dark:bg-slate-800/60">
                    {a.before}
                  </div>
                  <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-950/40">{a.after}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Supporting evidence</Label>
            <BulletList items={r.supporting} />
          </div>
          <div>
            <Label>Contradicting evidence</Label>
            <BulletList items={r.contradicting} />
          </div>
        </div>

        <div>
          <Label>Limitations</Label>
          <BulletList items={r.limitations} />
        </div>
      </div>
    </Card>
  );
}
