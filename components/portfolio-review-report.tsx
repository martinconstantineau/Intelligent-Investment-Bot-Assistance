"use client";

import { useMemo } from "react";
import type { DecisionJournalEntry } from "@/lib/supabase/decision-journal";
import type { ResearchNote } from "@/lib/supabase/research-notes";
import type { ThesisReview } from "@/lib/supabase/thesis-reviews";
import type { Holding } from "@/lib/portfolio";
import { formatDateTime, formatEnum } from "@/lib/formatters";

type PortfolioReviewReportProps = {
  holdings: Holding[];
  researchNotes: ResearchNote[];
  journalEntries: DecisionJournalEntry[];
  thesisReviews: ThesisReview[];
};

type ReviewItem = {
  symbol: string;
  reason: string;
};

function isBlank(value: string | null | undefined) {
  return !value || value.trim().length === 0;
}

function isRelatedToHolding(item: { holdingId?: string | null; symbol?: string | null }, holding: Holding) {
  return item.holdingId === holding.id || item.symbol === holding.symbol;
}

function needsReview(holding: Holding) {
  return holding.watchStatus === "review" || holding.riskLevel === "high" || holding.riskLevel === "very_high" || isBlank(holding.thesis);
}

function needsReviewReason(holding: Holding) {
  const reasons: string[] = [];

  if (holding.watchStatus === "review") reasons.push("watch status is review");
  if (holding.riskLevel === "high" || holding.riskLevel === "very_high") reasons.push(`risk level is ${holding.riskLevel.replace(/_/g, " ")}`);
  if (isBlank(holding.thesis)) reasons.push("thesis is missing");

  return reasons.join("; ");
}

function printReport() {
  window.print();
}

export function PortfolioReviewReport({ holdings, researchNotes, journalEntries, thesisReviews }: PortfolioReviewReportProps) {
  /**
   * Fixes Issue #2: Inefficient Filtering
   * Memoize calculated values to prevent unnecessary recalculations
   */
  const holdingsNeedingReview = useMemo(() => {
    return holdings.filter(needsReview).map((holding) => ({ symbol: holding.symbol, reason: needsReviewReason(holding) }));
  }, [holdings]);

  const recentResearchNotes = useMemo(() => researchNotes.slice(0, 5), [researchNotes]);
  const recentJournalEntries = useMemo(() => journalEntries.slice(0, 5), [journalEntries]);

  const thesisReviewsMap = useMemo(() => {
    const map = new Map<string, ThesisReview>();
    for (const review of thesisReviews) {
      map.set(review.holdingId, review);
    }
    return map;
  }, [thesisReviews]);

  const generatedAt = formatDateTime(new Date());

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 print:border-slate-300 print:bg-white print:text-black">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400 print:text-slate-700">Manual report</p>
          <h2 className="mt-2 text-xl font-semibold text-white print:text-black">Portfolio Review Report</h2>
          <p className="mt-2 text-sm text-slate-400 print:text-slate-700">Generated {generatedAt}</p>
        </div>
        <button onClick={printReport} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 print:hidden">
          Print Report
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 print:border-slate-300 print:bg-white">
          <p className="text-xs uppercase tracking-wide text-slate-500">Holdings</p>
          <p className="mt-2 text-2xl font-semibold text-white print:text-black">{holdings.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 print:border-slate-300 print:bg-white">
          <p className="text-xs uppercase tracking-wide text-slate-500">Research notes</p>
          <p className="mt-2 text-2xl font-semibold text-white print:text-black">{researchNotes.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 print:border-slate-300 print:bg-white">
          <p className="text-xs uppercase tracking-wide text-slate-500">Journal entries</p>
          <p className="mt-2 text-2xl font-semibold text-white print:text-black">{journalEntries.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 print:border-slate-300 print:bg-white">
          <p className="text-xs uppercase tracking-wide text-slate-500">Thesis reviews</p>
          <p className="mt-2 text-2xl font-semibold text-white print:text-black">{thesisReviews.length}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 print:border-slate-300 print:bg-white">
          <h3 className="text-base font-semibold text-white print:text-black">Holdings Needing Review</h3>
          {holdingsNeedingReview.length === 0 ? <p className="mt-3 text-sm text-slate-400 print:text-slate-700">No holdings flagged.</p> : null}
          <ul className="mt-3 space-y-2">
            {holdingsNeedingReview.map((item) => (
              <li key={`${item.symbol}-${item.reason}`} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 print:border-slate-300 print:bg-white">
                <p className="text-sm font-semibold text-white print:text-black">{item.symbol}</p>
                <p className="mt-1 text-xs text-slate-400 print:text-slate-700">{item.reason}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 print:border-slate-300 print:bg-white">
          <h3 className="text-base font-semibold text-white print:text-black">Latest Thesis Review Per Holding</h3>
          <ul className="mt-3 space-y-2">
            {holdings.map((holding) => {
              const review = thesisReviewsMap.get(holding.id);

              return (
                <li key={holding.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 print:border-slate-300 print:bg-white">
                  <p className="text-sm font-semibold text-white print:text-black">{holding.symbol}</p>
                  {review ? (
                    <div className="mt-1 space-y-1 text-xs text-slate-400 print:text-slate-700">
                      <p>Status: {formatEnum(review.thesisStatus)}</p>
                      <p>Conviction: {review.conviction ?? "Not set"}</p>
                      <p>Next review: {review.nextReviewDate ?? "Not set"}</p>
                      <p className="line-clamp-3">{review.summary}</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-400 print:text-slate-700">No thesis review yet.</p>
                  )}
                </li>
              );
            })}
          </ul>
        </article>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 print:border-slate-300 print:bg-white">
          <h3 className="text-base font-semibold text-white print:text-black">Recent Research Notes</h3>
          {recentResearchNotes.length === 0 ? <p className="mt-3 text-sm text-slate-400 print:text-slate-700">No research notes yet.</p> : null}
          <ul className="mt-3 space-y-2">
            {recentResearchNotes.map((note) => (
              <li key={note.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 print:border-slate-300 print:bg-white">
                <p className="text-sm font-semibold text-white print:text-black">{note.title}</p>
                <p className="mt-1 text-xs text-slate-400 print:text-slate-700">
                  {note.symbol ?? "No symbol"} · {formatEnum(note.sourceType)} · Thesis: {formatEnum(note.thesisImpact)} · Risk: {formatEnum(note.riskImpact)}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 print:border-slate-300 print:bg-white">
          <h3 className="text-base font-semibold text-white print:text-black">Recent Decision Journal Entries</h3>
          {recentJournalEntries.length === 0 ? <p className="mt-3 text-sm text-slate-400 print:text-slate-700">No journal entries yet.</p> : null}
          <ul className="mt-3 space-y-2">
            {recentJournalEntries.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 print:border-slate-300 print:bg-white">
                <p className="text-sm font-semibold text-white print:text-black">{entry.title}</p>
                <p className="mt-1 text-xs text-slate-400 print:text-slate-700">
                  {entry.symbol ?? "No symbol"} · {formatEnum(entry.decisionType)} · Confidence: {entry.confidence ?? "Not set"} · Risk: {formatEnum(entry.riskLevel)}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100 print:border-slate-300 print:bg-white print:text-slate-800">
        This report is for informational and research purposes only. It does not provide financial, investment, legal, tax, or professional advice.
      </div>
    </section>
  );
}
