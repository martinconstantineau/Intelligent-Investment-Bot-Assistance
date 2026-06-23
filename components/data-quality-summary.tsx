import type { DecisionJournalEntry } from "@/lib/supabase/decision-journal";
import type { ResearchNote } from "@/lib/supabase/research-notes";
import type { ThesisReview } from "@/lib/supabase/thesis-reviews";
import type { Holding } from "@/lib/portfolio";

type DataQualitySummaryProps = {
  holdings: Holding[];
  researchNotes: ResearchNote[];
  journalEntries: DecisionJournalEntry[];
  thesisReviews: ThesisReview[];
};

type QualityIssue = {
  area: string;
  symbol: string | null;
  title: string;
  issue: string;
};

function isBlank(value: string | null | undefined) {
  return !value || value.trim().length === 0;
}

function isValidUrl(value: string | null) {
  if (!value) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getHoldingIssues(holdings: Holding[]): QualityIssue[] {
  return holdings.flatMap((holding) => {
    const issues: QualityIssue[] = [];

    if (isBlank(holding.symbol)) issues.push({ area: "Holding", symbol: null, title: holding.name || "Unnamed holding", issue: "Symbol is missing." });
    if (isBlank(holding.name)) issues.push({ area: "Holding", symbol: holding.symbol, title: holding.symbol, issue: "Name is missing." });
    if (isBlank(holding.thesis)) issues.push({ area: "Holding", symbol: holding.symbol, title: holding.name, issue: "Thesis is missing." });
    if (holding.quantity !== null && holding.quantity < 0) issues.push({ area: "Holding", symbol: holding.symbol, title: holding.name, issue: "Quantity cannot be negative." });
    if (holding.costBasis !== null && holding.costBasis < 0) issues.push({ area: "Holding", symbol: holding.symbol, title: holding.name, issue: "Cost basis cannot be negative." });

    return issues;
  });
}

function getResearchNoteIssues(researchNotes: ResearchNote[]): QualityIssue[] {
  return researchNotes.flatMap((note) => {
    const issues: QualityIssue[] = [];

    if (isBlank(note.title)) issues.push({ area: "Research Note", symbol: note.symbol, title: "Untitled note", issue: "Title is missing." });
    if (isBlank(note.summary)) issues.push({ area: "Research Note", symbol: note.symbol, title: note.title || "Untitled note", issue: "Summary is missing." });
    if (!isValidUrl(note.sourceUrl)) issues.push({ area: "Research Note", symbol: note.symbol, title: note.title, issue: "Source URL is invalid." });

    return issues;
  });
}

function getJournalIssues(journalEntries: DecisionJournalEntry[]): QualityIssue[] {
  return journalEntries.flatMap((entry) => {
    const issues: QualityIssue[] = [];

    if (isBlank(entry.title)) issues.push({ area: "Decision Journal", symbol: entry.symbol, title: "Untitled entry", issue: "Title is missing." });
    if (isBlank(entry.reasoning)) issues.push({ area: "Decision Journal", symbol: entry.symbol, title: entry.title || "Untitled entry", issue: "Reasoning is missing." });
    if (entry.confidence !== null && (entry.confidence < 1 || entry.confidence > 10)) {
      issues.push({ area: "Decision Journal", symbol: entry.symbol, title: entry.title, issue: "Confidence must be between 1 and 10." });
    }

    return issues;
  });
}

function getThesisReviewIssues(thesisReviews: ThesisReview[]): QualityIssue[] {
  return thesisReviews.flatMap((review) => {
    const issues: QualityIssue[] = [];

    if (isBlank(review.holdingId)) issues.push({ area: "Thesis Review", symbol: review.symbol, title: review.symbol, issue: "Holding link is missing." });
    if (isBlank(review.summary)) issues.push({ area: "Thesis Review", symbol: review.symbol, title: `${review.symbol} thesis review`, issue: "Summary is missing." });
    if (review.conviction !== null && (review.conviction < 1 || review.conviction > 10)) {
      issues.push({ area: "Thesis Review", symbol: review.symbol, title: `${review.symbol} thesis review`, issue: "Conviction must be between 1 and 10." });
    }

    return issues;
  });
}

export function DataQualitySummary({ holdings, researchNotes, journalEntries, thesisReviews }: DataQualitySummaryProps) {
  const issues = [
    ...getHoldingIssues(holdings),
    ...getResearchNoteIssues(researchNotes),
    ...getJournalIssues(journalEntries),
    ...getThesisReviewIssues(thesisReviews)
  ];

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Data Quality Summary</h2>
          <p className="text-sm text-slate-400">Deterministic validation checks across holdings, notes, journal entries, and thesis reviews.</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">{issues.length} issue{issues.length === 1 ? "" : "s"}</span>
      </div>

      {issues.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">No data quality issues detected.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {issues.slice(0, 24).map((issue, index) => (
            <article key={`${issue.area}-${issue.symbol}-${issue.issue}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-2 flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-slate-800 px-2 py-1">{issue.area}</span>
                {issue.symbol ? <span className="rounded-full bg-slate-800 px-2 py-1">{issue.symbol}</span> : null}
              </div>
              <h3 className="text-sm font-semibold text-white">{issue.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{issue.issue}</p>
            </article>
          ))}
          {issues.length > 24 ? <p className="text-xs text-slate-500">Showing 24 of {issues.length} issues.</p> : null}
        </div>
      )}
    </section>
  );
}
