"use client";
// Live Flashpoint research: connect button and the progress panel shown while a run is going.
import { useEffect, useState } from "react";
import type { ResearchResult } from "@/lib/types";
import type { FlashpointStatus } from "@/lib/api-client";
import { Badge } from "./ProvenanceBadge";
import { Button } from "./ui";

const STAGES = [
  { id: "building_survey", label: "Build survey" },
  { id: "running_panel", label: "Run synthetic panel" },
  { id: "analyzing", label: "Flashpoint analysis" },
  { id: "structuring", label: "Structure findings" },
] as const;

function elapsed(since: string, now: number) {
  const s = Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function LiveProgress({ result }: { result: ResearchResult }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const p = result.progress;
  if (!p) return null;
  const current = STAGES.findIndex((s) => s.id === p.stage);

  return (
    <div
      role="status"
      aria-live="polite"
      className="space-y-4 rounded-xl border border-emerald-300/60 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/30"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge kind="live" detail="Flashpoint synthetic panel · running" />
        <span className="font-mono text-xs tabular-nums text-slate-500">{elapsed(p.startedAt, now)}</span>
      </div>
      <ol className="grid gap-2 sm:grid-cols-4">
        {STAGES.map((s, i) => {
          const state = i < current ? "done" : i === current ? "active" : "todo";
          return (
            <li
              key={s.id}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                state === "active"
                  ? "border-emerald-500 bg-white text-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
                  : state === "done"
                    ? "border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400"
                    : "border-slate-200 text-slate-400 dark:border-slate-800"
              }`}
            >
              {state === "done" ? "✓ " : state === "active" ? "● " : ""}
              {s.label}
            </li>
          );
        })}
      </ol>
      <p className="text-sm text-slate-700 dark:text-slate-300">
        {p.message}
        {p.fraction !== undefined && ` (${Math.round(p.fraction * 100)}%)`}
      </p>
      {p.fraction !== undefined && (
        <div className="h-1.5 overflow-hidden rounded bg-emerald-100 dark:bg-emerald-950">
          <div className="h-1.5 rounded bg-emerald-500 transition-[width]" style={{ width: `${p.fraction * 100}%` }} />
        </div>
      )}
      <p className="text-xs text-slate-500">
        A live run usually takes 3 to 15 minutes. You can leave this page open; it updates on its own.
        {result.provenance.surveyId && ` Survey ${result.provenance.surveyId.slice(0, 8)}.`}
      </p>
    </div>
  );
}

/** Opens Flashpoint sign-in in a popup; calls onConnected when the popup reports success (or the window regains focus). */
export function ConnectFlashpoint({
  status,
  onConnected,
}: {
  status: FlashpointStatus | null;
  onConnected: () => void;
}) {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === "flashpoint-auth" && e.data.ok) onConnected();
    };
    // Also re-check on focus, in case the popup opened as a tab without window.opener.
    const onFocus = () => onConnected();
    window.addEventListener("message", onMessage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("focus", onFocus);
    };
  }, [onConnected]);

  if (!status?.liveEnabled) return null;
  if (status.connected) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Flashpoint connected: new plans run live
      </span>
    );
  }
  return (
    <Button
      variant="secondary"
      onClick={() => window.open("/api/flashpoint/login", "flashpoint-auth", "width=520,height=720")}
    >
      Connect Flashpoint for live research
    </Button>
  );
}
