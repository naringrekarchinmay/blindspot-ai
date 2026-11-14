// Owner: P2. Analyze → Blind spot → Research → Reassess progress strip.
const STEPS = ["Analyze", "Blind spot", "Research", "Reassess"] as const;

export type StepStatus = "todo" | "active" | "done";

export function StepTimeline({ statuses }: { statuses: StepStatus[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
      {STEPS.map((name, i) => {
        const s = statuses[i] ?? "todo";
        const dot =
          s === "done"
            ? "bg-indigo-600 text-white"
            : s === "active"
              ? "border-2 border-indigo-600 text-indigo-600 animate-pulse"
              : "border border-slate-300 text-slate-400 dark:border-slate-700";
        return (
          <li key={name} className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${dot}`}>
              {s === "done" ? "✓" : i + 1}
            </span>
            <span className={s === "todo" ? "text-slate-400" : "font-medium"}>{name}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-slate-300 dark:bg-slate-700" />}
          </li>
        );
      })}
    </ol>
  );
}
