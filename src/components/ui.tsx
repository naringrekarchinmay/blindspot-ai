"use client";
// Small shared UI primitives.
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import type { Confidence, Level } from "@/lib/types";
import { AlertIcon, RetryIcon } from "./icons";
import { cardVariants } from "./motion";

export function Card({
  step,
  title,
  aside,
  children,
}: {
  step?: number;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.section
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_24px_-12px_rgb(15_23_42/0.12)] backdrop-blur-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900/80"
    >
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {step !== undefined && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-400 font-sans text-sm font-bold text-slate-950">
              {step}
            </span>
          )}
          {title}
        </h2>
        {aside}
      </header>
      {children}
    </motion.section>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-bold tracking-[0.08em] text-slate-500 uppercase dark:text-slate-400">
      {children}
    </h3>
  );
}

const levelStyles: Record<Level, string> = {
  low: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  medium: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  high: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

export function LevelPill({ level, prefix }: { level: Level; prefix?: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${levelStyles[level]}`}>
      {prefix ? `${prefix}: ` : ""}
      {level}
    </span>
  );
}

export function ConfidenceBlock({ confidence, label = "Confidence" }: { confidence: Confidence; label?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="mb-1 flex items-center gap-2 text-sm font-bold">
        {label} <LevelPill level={confidence.level} />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{confidence.reason}</p>
    </div>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  type = "button",
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
}) {
  const styles =
    variant === "primary"
      ? "bg-brand-400 text-slate-950 shadow-[0_0_0_1px_rgb(47_188_174/0.4),0_8px_20px_-8px_rgb(47_188_174/0.55)] hover:bg-brand-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
      : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 motion-reduce:active:scale-100 ${styles}`}
    >
      {children}
    </button>
  );
}

/** Loading state: a status line plus a shimmering skeleton shaped like the card that's coming. */
export function Spinner({ label, lines = 3 }: { label: string; lines?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 dark:border-slate-700 dark:bg-slate-900/50"
    >
      <div className="mb-4 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        {label}
      </div>
      <div className="space-y-2.5" aria-hidden="true">
        <div className="skeleton h-5 w-2/5 rounded" />
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="skeleton h-3.5 rounded" style={{ width: `${92 - i * 14}%` }} />
        ))}
      </div>
    </motion.div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        role="alert"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
      >
        <span className="flex items-center gap-2">
          <AlertIcon size={18} className="shrink-0" />
          {message}
        </span>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            <RetryIcon /> Retry
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export function BulletList({ items, empty = "None." }: { items: string[]; empty?: string }) {
  if (items.length === 0) return <p className="text-sm text-slate-500 italic">{empty}</p>;
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 marker:text-slate-400 dark:text-slate-300">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
