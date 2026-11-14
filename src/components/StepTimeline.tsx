"use client";
// Analyze → Blind spot → Research → Reassess progress strip. Connectors fill as steps complete.
import { motion } from "motion/react";
import { CheckIcon } from "./icons";
import { EASE_OUT } from "./motion";

const STEPS = ["Analyze", "Blind spot", "Research", "Reassess"] as const;

export type StepStatus = "todo" | "active" | "done";

export function StepTimeline({ statuses }: { statuses: StepStatus[] }) {
  const current = statuses.findIndex((s) => s !== "done");
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {STEPS.map((name, i) => {
          const s = statuses[i] ?? "todo";
          return (
            <li
              key={name}
              className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}
              aria-current={i === current ? "step" : undefined}
            >
              <div className="flex items-center gap-2">
                <motion.span
                  className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                    s === "done"
                      ? "bg-brand-400 text-slate-950"
                      : s === "active"
                        ? "border-2 border-brand-500 bg-white text-brand-600 dark:bg-slate-900 dark:text-brand-300"
                        : "border border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                  animate={{ scale: s === "active" ? 1.08 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                >
                  {s === "active" && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/30 motion-reduce:hidden" />
                  )}
                  {s === "done" ? (
                    <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 24 }}>
                      <CheckIcon size={14} strokeWidth={2.5} />
                    </motion.span>
                  ) : (
                    i + 1
                  )}
                </motion.span>
                <span
                  className={`hidden text-sm sm:inline ${s === "todo" ? "text-slate-400" : "font-bold text-slate-800 dark:text-slate-100"}`}
                >
                  {name}
                </span>
                <span className="sr-only sm:hidden">{`${name}: ${s === "done" ? "done" : s === "active" ? "in progress" : "not started"}`}</span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200 sm:mx-3 dark:bg-slate-800">
                  <motion.span
                    className="absolute inset-0 origin-left rounded-full bg-brand-500"
                    initial={false}
                    animate={{ scaleX: s === "done" ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
