"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { MotionConfig } from "motion/react";
import * as api from "@/lib/api-client";
import { ApiClientError, type FlashpointStatus, type StepSource } from "@/lib/api-client";
import type { InitialAssessment, Reassessment, ResearchPlan, ResearchResult } from "@/lib/types";
import { AssessmentCard } from "@/components/AssessmentCard";
import { PlanCard } from "@/components/PlanCard";
import { ReassessCard } from "@/components/ReassessCard";
import { ResearchCard } from "@/components/ResearchCard";
import { ConnectFlashpoint, LiveProgress } from "@/components/LiveResearch";
import { StepTimeline, type StepStatus } from "@/components/StepTimeline";
import { Button, ErrorBox, Spinner } from "@/components/ui";
import { ArrowRightIcon, PlusIcon, SparkIcon, XIcon } from "@/components/icons";

const DEMO = {
  question: "Should I open a late-night café in Neighborhood A or Neighborhood B?",
  options: ["Neighborhood A", "Neighborhood B"],
};

type Step = "assess" | "plan" | "research" | "reassess";

const LOADING_TEXT: Record<Step, string> = {
  assess: "Analyzing the decision and looking for blind spots… (about 10s)",
  plan: "Designing a neutral research plan… (about 10s)",
  research: "Fetching research results…",
  reassess: "Reassessing with the new evidence… (about 10s)",
};

type StepError = { step: Step; message: string; retry?: () => void };

export default function Home() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  const [assessment, setAssessment] = useState<InitialAssessment | null>(null);
  const [assessmentSource, setAssessmentSource] = useState<StepSource>(null);
  const [blindSpotId, setBlindSpotId] = useState<string>("");
  const [plan, setPlan] = useState<{ data: ResearchPlan; source: StepSource } | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [reassessment, setReassessment] = useState<{ data: Reassessment; source: StepSource } | null>(null);

  const [loading, setLoading] = useState<Step | null>(null);
  // A live Flashpoint run in progress (status "running"), shown instead of the spinner.
  const [liveRun, setLiveRun] = useState<ResearchResult | null>(null);
  const [fpStatus, setFpStatus] = useState<FlashpointStatus | null>(null);
  const [error, setError] = useState<StepError | null>(null);

  // Ignore responses from a flow the user has since restarted.
  const runId = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshFlashpoint = useCallback(() => {
    api.flashpointStatus().then(({ data }) => setFpStatus(data), () => setFpStatus(null));
  }, []);
  useEffect(refreshFlashpoint, [refreshFlashpoint]);

  useEffect(() => {
    if (loading || assessment) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [loading, assessment, plan, result, reassessment, error]);

  async function run<T>(step: Step, call: () => Promise<T>, onDone: (value: T) => void, retry: () => void) {
    const id = runId.current;
    setLoading(step);
    setError(null);
    try {
      const value = await call();
      if (id !== runId.current) return;
      onDone(value);
    } catch (e) {
      if (id !== runId.current) return;
      const err = e instanceof ApiClientError ? e : new ApiClientError("Something went wrong.", 0, true);
      setError({ step, message: err.message, retry: err.retryable ? retry : undefined });
    } finally {
      if (id === runId.current) setLoading(null);
    }
  }

  function resetFrom(step: Step) {
    if (step === "assess") {
      setAssessment(null);
      setAssessmentSource(null);
      setBlindSpotId("");
    }
    if (step === "assess" || step === "plan") setPlan(null);
    if (step !== "reassess") setResult(null);
    setReassessment(null);
  }

  const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
  const canAnalyze = question.trim().length > 0 && cleanOptions.length >= 2 && !loading;

  function analyze(e?: FormEvent) {
    e?.preventDefault();
    if (!canAnalyze) return;
    runId.current += 1;
    resetFrom("assess");
    const body = { question: question.trim(), options: cleanOptions };
    run(
      "assess",
      () => api.assess(body),
      ({ data, source }) => {
        setAssessment(data);
        setAssessmentSource(source);
        setBlindSpotId(data.selectedBlindSpotId);
      },
      () => analyze(),
    );
  }

  function makePlan() {
    if (!assessment) return;
    resetFrom("plan");
    run(
      "plan",
      () => api.researchPlan({ assessment, blindSpotId }),
      (res) => setPlan(res),
      makePlan,
    );
  }

  function runResearch() {
    if (!plan) return;
    resetFrom("research");
    run(
      "research",
      async () => {
        const id = runId.current;
        let res = await api.research({ plan: plan.data });
        try {
          // Live Flashpoint runs come back "running": poll until they finish.
          while (res.data.status === "running" && res.data.jobId) {
            setLiveRun(res.data);
            await new Promise((r) => setTimeout(r, 4000));
            if (id !== runId.current) return res;
            res = await api.researchStatus({ jobId: res.data.jobId });
          }
        } finally {
          if (id === runId.current) setLiveRun(null);
        }
        if (res.data.status === "failed") {
          refreshFlashpoint();
          throw new ApiClientError(`Live Flashpoint research failed: ${res.data.progress?.message ?? "unknown error"}`, 502, true);
        }
        return res;
      },
      ({ data }) => setResult(data),
      runResearch,
    );
  }

  function runReassess() {
    if (!assessment || !plan || !result) return;
    resetFrom("reassess");
    run(
      "reassess",
      () => api.reassess({ assessment, plan: plan.data, result }),
      (res) => setReassessment(res),
      runReassess,
    );
  }

  function startOver() {
    runId.current += 1;
    resetFrom("assess");
    setLoading(null);
    setLiveRun(null);
    setError(null);
  }

  const done = [!!assessment, !!plan, !!result, !!reassessment];
  const loadingIndex = loading ? (["assess", "plan", "research", "reassess"] as Step[]).indexOf(loading) : -1;
  const statuses: StepStatus[] = done.map((d, i) => (i === loadingIndex ? "active" : d ? "done" : "todo"));

  const blindSpotHint =
    loading === "plan"
      ? "Writing a research plan for the selected blind spot…"
      : !plan
        ? "Pick the blind spot to research."
        : !result && !loading
          ? "Selected for research. To change it, use “Pick a different blind spot” below."
          : "This is the blind spot being researched. Start over to try a different one.";

  const errorFor = (step: Step) =>
    error?.step === step ? <ErrorBox message={error.message} onRetry={error.retry} /> : null;
  const SKELETON_LINES: Record<Step, number> = { assess: 5, plan: 4, research: 3, reassess: 4 };
  const spinnerFor = (step: Step) =>
    loading === step ? <Spinner label={LOADING_TEXT[step]} lines={SKELETON_LINES[step]} /> : null;

  return (
    <MotionConfig reducedMotion="user">
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-bold tracking-wide text-brand-700 dark:border-brand-900 dark:bg-slate-900/60 dark:text-brand-300">
          <SparkIcon size={14} /> Decision research with Flashpoint.AI
        </div>
        <h1 className="text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl dark:text-slate-50">
          BlindSpot <span className="text-brand-600 dark:text-brand-400">AI</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Finds the question your decision depends on but nobody has asked, researches it, and tells you honestly
          whether the answer changes anything.
        </p>
      </header>
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-slate-200/70 bg-[var(--background)]/80 px-4 py-3 backdrop-blur-md dark:border-slate-800/70">
        <StepTimeline statuses={statuses} />
      </div>

      <div className="space-y-6">
        <form
          onSubmit={analyze}
          className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_24px_-12px_rgb(15_23_42/0.12)] backdrop-blur-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900/80"
        >
          <label htmlFor="question" className="mb-2 block font-serif text-xl font-semibold">
            What are you deciding?
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            disabled={!!assessment || !!loading}
            placeholder="e.g. Should I open a late-night café in Neighborhood A or Neighborhood B?"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:disabled:bg-slate-900"
          />

          <div className="mt-4 mb-1 text-sm font-semibold">Options</div>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={opt}
                  aria-label={`Option ${i + 1}`}
                  onChange={(e) => setOptions(options.map((o, j) => (j === i ? e.target.value : o)))}
                  disabled={!!assessment || !!loading}
                  placeholder={`Option ${i + 1}`}
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:disabled:bg-slate-900"
                />
                {options.length > 2 && !assessment && (
                  <button
                    type="button"
                    onClick={() => setOptions(options.filter((_, j) => j !== i))}
                    className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-brand-300 dark:hover:bg-rose-950/40"
                    aria-label={`Remove option ${i + 1}`}
                  >
                    <XIcon />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!assessment && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={!canAnalyze}>
                Analyze decision
              </Button>
              {options.length < 5 && (
                <Button variant="secondary" onClick={() => setOptions([...options, ""])} disabled={!!loading}>
                  <PlusIcon /> Add option
                </Button>
              )}
              <button
                type="button"
                onClick={() => {
                  setQuestion(DEMO.question);
                  setOptions(DEMO.options);
                }}
                disabled={!!loading}
                className="ml-auto min-h-11 cursor-pointer rounded-lg px-2 text-sm font-bold text-brand-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand-300 disabled:opacity-50 dark:text-brand-400"
              >
                Use café demo
              </button>
            </div>
          )}
          {assessment && (
            <div className="mt-4">
              <Button variant="secondary" onClick={startOver}>
                Start over
              </Button>
            </div>
          )}
          <div className="mt-3">
            {spinnerFor("assess")}
            {errorFor("assess")}
          </div>
        </form>

        {assessment && (
          <>
            <AssessmentCard
              assessment={assessment}
              source={assessmentSource}
              selectedId={blindSpotId}
              onSelect={(id) => {
                setBlindSpotId(id);
                resetFrom("plan");
              }}
              locked={!!loading || !!plan}
              hint={blindSpotHint}
            />
            {!plan && (
              <div className="space-y-3">
                {!loading && (
                  <Button onClick={makePlan} disabled={!blindSpotId}>
                    Research this blind spot <ArrowRightIcon />
                  </Button>
                )}
                {spinnerFor("plan")}
                {errorFor("plan")}
              </div>
            )}
          </>
        )}

        {assessment && plan && (
          <>
            <PlanCard plan={plan.data} source={plan.source} />
            {!result && (
              <div className="space-y-3">
                {!loading && (
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={runResearch}>
                      Run research <ArrowRightIcon />
                    </Button>
                    <Button variant="secondary" onClick={() => resetFrom("plan")}>
                      Pick a different blind spot
                    </Button>
                    <div className="flex items-center">
                      <ConnectFlashpoint status={fpStatus} onConnected={refreshFlashpoint} />
                    </div>
                  </div>
                )}
                {liveRun ? <LiveProgress result={liveRun} /> : spinnerFor("research")}
                {errorFor("research")}
              </div>
            )}
          </>
        )}

        {plan && result && (
          <>
            <ResearchCard
              result={result}
              plan={plan.data}
              connect={<ConnectFlashpoint status={fpStatus} onConnected={refreshFlashpoint} />}
              canRunLive={!!fpStatus?.connected}
              onRunAgain={runResearch}
            />
            {!reassessment && (
              <div className="space-y-3">
                {!loading && (
                  <Button onClick={runReassess}>
                    Reassess the decision <ArrowRightIcon />
                  </Button>
                )}
                {spinnerFor("reassess")}
                {errorFor("reassess")}
              </div>
            )}
          </>
        )}

        {reassessment && (
          <>
            <ReassessCard reassessment={reassessment.data} source={reassessment.source} />
            <div className="flex justify-center pb-4">
              <Button variant="secondary" onClick={startOver}>
                Start over
              </Button>
            </div>
          </>
        )}
        <div ref={bottomRef} />
      </div>
    </main>
    </MotionConfig>
  );
}
