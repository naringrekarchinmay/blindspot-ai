"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import * as api from "@/lib/api-client";
import { ApiClientError, type StepSource } from "@/lib/api-client";
import type { InitialAssessment, Reassessment, ResearchPlan, ResearchResult } from "@/lib/types";
import { AssessmentCard } from "@/components/AssessmentCard";
import { PlanCard } from "@/components/PlanCard";
import { ReassessCard } from "@/components/ReassessCard";
import { ResearchCard } from "@/components/ResearchCard";
import { StepTimeline, type StepStatus } from "@/components/StepTimeline";
import { Button, ErrorBox, Spinner } from "@/components/ui";

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
  const [error, setError] = useState<StepError | null>(null);

  // Ignore responses from a flow the user has since restarted.
  const runId = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

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
      () => api.research({ plan: plan.data }),
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
  const spinnerFor = (step: Step) => (loading === step ? <Spinner label={LOADING_TEXT[step]} /> : null);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          BlindSpot <span className="text-indigo-600">AI</span>
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Finds the question your decision depends on but nobody has asked, researches it, and tells you honestly
          whether the answer changes anything.
        </p>
        <div className="mt-5">
          <StepTimeline statuses={statuses} />
        </div>
      </header>

      <div className="space-y-6">
        <form
          onSubmit={analyze}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <label htmlFor="question" className="mb-1 block text-sm font-semibold">
            What are you deciding?
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            disabled={!!assessment || !!loading}
            placeholder="e.g. Should I open a late-night café in Neighborhood A or Neighborhood B?"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:disabled:bg-slate-900"
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
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:disabled:bg-slate-900"
                />
                {options.length > 2 && !assessment && (
                  <button
                    type="button"
                    onClick={() => setOptions(options.filter((_, j) => j !== i))}
                    className="rounded-lg px-2 text-slate-400 hover:text-rose-600"
                    aria-label={`Remove option ${i + 1}`}
                  >
                    ✕
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
                  + Add option
                </Button>
              )}
              <button
                type="button"
                onClick={() => {
                  setQuestion(DEMO.question);
                  setOptions(DEMO.options);
                }}
                disabled={!!loading}
                className="ml-auto text-sm font-medium text-indigo-600 hover:underline disabled:opacity-50 dark:text-indigo-400"
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
                    Research this blind spot →
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
                    <Button onClick={runResearch}>Run research →</Button>
                    <Button variant="secondary" onClick={() => resetFrom("plan")}>
                      Pick a different blind spot
                    </Button>
                  </div>
                )}
                {spinnerFor("research")}
                {errorFor("research")}
              </div>
            )}
          </>
        )}

        {plan && result && (
          <>
            <ResearchCard result={result} plan={plan.data} />
            {!reassessment && (
              <div className="space-y-3">
                {!loading && <Button onClick={runReassess}>Reassess the decision →</Button>}
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
  );
}
