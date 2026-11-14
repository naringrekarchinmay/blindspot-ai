// Owner: P2. Small shared UI primitives.
import type { ReactNode } from "react";
import type { Confidence, Level } from "@/lib/types";

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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-3 text-lg font-semibold">
          {step !== undefined && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              {step}
            </span>
          )}
          {title}
        </h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
      {children}
    </h3>
  );
}

const levelStyles: Record<Level, string> = {
  low: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  high: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

export function LevelPill({ level, prefix }: { level: Level; prefix?: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelStyles[level]}`}>
      {prefix ? `${prefix}: ` : ""}
      {level}
    </span>
  );
}

export function ConfidenceBlock({ confidence, label = "Confidence" }: { confidence: Confidence; label?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <div className="mb-1 flex items-center gap-2 text-sm font-medium">
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
      ? "bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-900"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${styles}`}
    >
      {children}
    </button>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2 text-sm text-slate-600 dark:text-slate-300" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      {label}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
    >
      <span>{message}</span>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function BulletList({ items, empty = "None." }: { items: string[]; empty?: string }) {
  if (items.length === 0) return <p className="text-sm text-slate-500 italic">{empty}</p>;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
