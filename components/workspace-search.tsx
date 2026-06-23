"use client";

import { useMemo, useState } from "react";
import type { DecisionJournalEntry } from "@/lib/supabase/decision-journal";
import type { ResearchNote } from "@/lib/supabase/research-notes";
import type { ThesisReview } from "@/lib/supabase/thesis-reviews";
import type { Holding } from "@/lib/portfolio";

type WorkspaceSearchProps = {
  holdings: Holding[];
  researchNotes: ResearchNote[];
  journalEntries: DecisionJournalEntry[];
  thesisReviews: ThesisReview[];
};

type FilterKey =
  | "all"
  | "holdings"
  | "research_notes"
  | "decision_journal"
  | "thesis_reviews"
  | "needs_review"
  | "high_risk"
  | "missing_thesis"
  | "weakening_thesis";

type SearchResult = {
  id: string;
  type: "Holding" | "Research Note" | "Decision Journal" | "Thesis Review";
  symbol: string | null;
  title: string;
  excerpt: string;
  reason?: string;
  haystack: string;
};

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "holdings", label: "Holdings" },
  { key: "research_notes", label: "Research Notes" },
  { key: "decision_journal", label: "Decision Journal" },
  { key: "thesis_reviews", label: "Thesis Reviews" },
  { key: "needs_review", label: "Needs Review" },
  { key: "high_risk", label: "High Risk" },
  { key: "missing_thesis", label: "Missing Thesis" },
  { key: "weakening_thesis", label: "Weakening Thesis" }
];

function text(...values: Array<string | number | null | undefined | string[]>) {
  return values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string | number => value !== null && value !== undefined)
    .join(" ")
    .toLowerCase();
}

function isBlank(value: string | null | undefined) {
  return !value || value.trim().length === 0;
}

function isNeedsReview(holding: Holding) {
  return holding.watchStatus === "review" || holding.riskLevel === "high" || holding.riskLevel === "very_high" || isBlank(holding.thesis);
}

function needsReviewReason(holding: Holding) {
  const reasons: string[] = [];

  if (holding.watchStatus === "review") reasons.push("watch status is review");
  if (holding.riskLevel === "high" || holding.riskLevel === "very_high") reasons.push(`risk level is ${holding.riskLevel.replace(/_/g, " ")}`);
  if (isBlank(holding.thesis)) reasons.push("thesis is missing");

  return reasons.join("; ");
}

function buildHoldingResult(holding: Holding, reason?: string): SearchResult {
  return {
    id: `holding-${holding.id}`,
    type: "Holding",
    symbol: holding.symbol,
    title: holding.name,
    excerpt: holding.thesis || "No thesis entered.",
    reason,
    haystack: text(holding.symbol, holding.name, holding.thesis, holding.riskLevel, holding.timeHorizon, holding.watchStatus)
  };
}

function buildResearchNoteResult(note: ResearchNote): SearchResult {
  return {
    id: `research-${note.id}`,
    type: "Research Note",
    symbol: note.symbol,
    title: note.title,
    excerpt: note.summary,
    haystack: text(note.title, note.summary, note.symbol, note.sourceType, note.thesisImpact, note.riskImpact, note.tags, note.sourceUrl)
  };
}

function buildJournalResult(entry: DecisionJournalEntry): SearchResult {
  return {
    id: `journal-${entry.id}`,
    type: "Decision Journal",
    symbol: entry.symbol,
    title: entry.title,
    excerpt: entry.reasoning,
    haystack: text(entry.title, entry.reasoning, entry.symbol, entry.decisionType, entry.riskLevel, entry.thesisSnapshot, entry.outcome)
  };
}

function buildThesisReviewResult(review: ThesisReview, reason?: string): SearchResult {
  return {
    id: `review-${review.id}`,
    type: "Thesis Review",
    symbol: review.symbol,
    title: `${review.symbol} thesis review`,
    excerpt: review.summary,
    reason,
    haystack: text(review.symbol, review.thesisStatus, review.summary, review.supportingEvidence, review.opposingEvidence, review.riskAssessment, review.watchItems, review.nextReviewDate)
  };
}

function buildResults(
  filter: FilterKey,
  holdings: Holding[],
  researchNotes: ResearchNote[],
  journalEntries: DecisionJournalEntry[],
  thesisReviews: ThesisReview[]
): SearchResult[] {
  switch (filter) {
    case "holdings":
      return holdings.map((holding) => buildHoldingResult(holding));
    case "research_notes":
      return researchNotes.map(buildResearchNoteResult);
    case "decision_journal":
      return journalEntries.map(buildJournalResult);
    case "thesis_reviews":
      return thesisReviews.map((review) => buildThesisReviewResult(review));
    case "needs_review":
      return holdings.filter(isNeedsReview).map((holding) => buildHoldingResult(holding, needsReviewReason(holding)));
    case "high_risk":
      return holdings
        .filter((holding) => holding.riskLevel === "high" || holding.riskLevel === "very_high")
        .map((holding) => buildHoldingResult(holding, `risk level is ${holding.riskLevel?.replace(/_/g, " ")}`));
    case "missing_thesis":
      return holdings.filter((holding) => isBlank(holding.thesis)).map((holding) => buildHoldingResult(holding, "thesis is missing"));
    case "weakening_thesis":
      return thesisReviews
        .filter((review) => review.thesisStatus === "weakening" || review.thesisStatus === "broken")
        .map((review) => buildThesisReviewResult(review, `thesis status is ${review.thesisStatus}`));
    case "all":
    default:
      return [
        ...holdings.map((holding) => buildHoldingResult(holding)),
        ...researchNotes.map(buildResearchNoteResult),
        ...journalEntries.map(buildJournalResult),
        ...thesisReviews.map((review) => buildThesisReviewResult(review))
      ];
  }
}

export function WorkspaceSearch({ holdings, researchNotes, journalEntries, thesisReviews }: WorkspaceSearchProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const results = useMemo(() => {
    const baseResults = buildResults(activeFilter, holdings, researchNotes, journalEntries, thesisReviews);
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return baseResults;

    return baseResults.filter((result) => result.haystack.includes(normalizedQuery));
  }, [activeFilter, holdings, researchNotes, journalEntries, thesisReviews, query]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Workspace Search</h2>
          <p className="text-sm text-slate-400">Search holdings, research notes, journal entries, and thesis reviews without external services.</p>
        </div>
        <div className="text-sm text-slate-400">{results.length} result{results.length === 1 ? "" : "s"}</div>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search AMD, high risk, AI, thesis, notes…"
        className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-500"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={
              activeFilter === filter.key
                ? "rounded-full bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950"
                : "rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500"
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">No matching items.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.slice(0, 24).map((result) => (
            <article key={result.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-2 flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-slate-800 px-2 py-1">{result.type}</span>
                {result.symbol ? <span className="rounded-full bg-slate-800 px-2 py-1">{result.symbol}</span> : null}
              </div>
              <h3 className="text-sm font-semibold text-white">{result.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{result.excerpt || "No excerpt available."}</p>
              {result.reason ? <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-xs text-amber-100">{result.reason}</p> : null}
            </article>
          ))}
          {results.length > 24 ? <p className="text-xs text-slate-500">Showing 24 of {results.length} results.</p> : null}
        </div>
      )}
    </section>
  );
}
