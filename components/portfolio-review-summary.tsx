import type { DecisionJournalEntry } from "@/lib/supabase/decision-journal";
import type { ResearchNote } from "@/lib/supabase/research-notes";
import type { ThesisReview } from "@/lib/supabase/thesis-reviews";
import type { Holding } from "@/lib/portfolio";

type PortfolioReviewSummaryProps = {
  holdings: Holding[];
  researchNotes: ResearchNote[];
  journalEntries: DecisionJournalEntry[];
  thesisReviews: ThesisReview[];
};

type SummaryItem = {
  symbol: string;
  reason: string;
};

function isBlank(value: string | null | undefined) {
  return !value || value.trim().length === 0;
}

function isRelatedToHolding(item: { holdingId?: string | null; symbol?: string | null }, holding: Holding) {
  return item.holdingId === holding.id || item.symbol === holding.symbol;
}

function getLatestReviewForHolding(holding: Holding, thesisReviews: ThesisReview[]) {
  return thesisReviews.find((review) => isRelatedToHolding(review, holding)) ?? null;
}

function isDueOrPast(dateValue: string | null) {
  if (!dateValue) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reviewDate = new Date(`${dateValue}T00:00:00`);
  reviewDate.setHours(0, 0, 0, 0);

  return reviewDate <= today;
}

function buildNeedsReviewItems(holdings: Holding[]): SummaryItem[] {
  return holdings
    .map((holding) => {
      const reasons: string[] = [];

      if (holding.watchStatus === "review") reasons.push("watch status is review");
      if (holding.riskLevel === "high" || holding.riskLevel === "very_high") reasons.push(`risk level is ${holding.riskLevel.replace(/_/g, " ")}`);
      if (isBlank(holding.thesis)) reasons.push("thesis is missing");

      return reasons.length > 0 ? { symbol: holding.symbol, reason: reasons.join("; ") } : null;
    })
    .filter((item): item is SummaryItem => item !== null);
}

function buildStaleReviewItems(holdings: Holding[], thesisReviews: ThesisReview[]): SummaryItem[] {
  return holdings
    .map((holding) => {
      const latestReview = getLatestReviewForHolding(holding, thesisReviews);

      if (!latestReview) return { symbol: holding.symbol, reason: "no thesis review yet" };
      if (isDueOrPast(latestReview.nextReviewDate)) return { symbol: holding.symbol, reason: `next review date is ${latestReview.nextReviewDate}` };

      return null;
    })
    .filter((item): item is SummaryItem => item !== null);
}

function buildMissingResearchItems(holdings: Holding[], researchNotes: ResearchNote[]): SummaryItem[] {
  return holdings
    .filter((holding) => !researchNotes.some((note) => isRelatedToHolding(note, holding)))
    .map((holding) => ({ symbol: holding.symbol, reason: "no related research notes" }));
}

function buildMissingJournalItems(holdings: Holding[], journalEntries: DecisionJournalEntry[]): SummaryItem[] {
  return holdings
    .filter((holding) => !journalEntries.some((entry) => isRelatedToHolding(entry, holding)))
    .map((holding) => ({ symbol: holding.symbol, reason: "no related decision journal entries" }));
}

function buildWeakeningThesisItems(holdings: Holding[], thesisReviews: ThesisReview[]): SummaryItem[] {
  return holdings
    .map((holding) => {
      const latestReview = getLatestReviewForHolding(holding, thesisReviews);

      if (!latestReview) return null;

      if (latestReview.thesisStatus === "weakening" || latestReview.thesisStatus === "broken") {
        return { symbol: holding.symbol, reason: `latest thesis status is ${latestReview.thesisStatus}` };
      }

      return null;
    })
    .filter((item): item is SummaryItem => item !== null);
}

function SummaryCard({ title, description, items }: { title: string; description: string; items: SummaryItem[] }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-400">Nothing flagged.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.slice(0, 8).map((item) => (
            <li key={`${item.symbol}-${item.reason}`} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-sm font-semibold text-slate-100">{item.symbol}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{item.reason}</p>
            </li>
          ))}
          {items.length > 8 ? <li className="text-xs text-slate-500">+{items.length - 8} more</li> : null}
        </ul>
      )}
    </article>
  );
}

export function PortfolioReviewSummary({ holdings, researchNotes, journalEntries, thesisReviews }: PortfolioReviewSummaryProps) {
  const needsReview = buildNeedsReviewItems(holdings);
  const staleReviews = buildStaleReviewItems(holdings, thesisReviews);
  const missingResearch = buildMissingResearchItems(holdings, researchNotes);
  const missingJournal = buildMissingJournalItems(holdings, journalEntries);
  const weakeningTheses = buildWeakeningThesisItems(holdings, thesisReviews);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Portfolio Review Summary</h2>
        <p className="text-sm text-slate-400">Deterministic review flags from your holdings, notes, journal entries, and thesis reviews.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard title="Needs Review" description="High risk, review status, or missing thesis." items={needsReview} />
        <SummaryCard title="Stale Reviews" description="No review or next review date due." items={staleReviews} />
        <SummaryCard title="Missing Research" description="Holdings without related research notes." items={missingResearch} />
        <SummaryCard title="Missing Journal" description="Holdings without decision history." items={missingJournal} />
        <SummaryCard title="Weakening Theses" description="Latest review is weakening or no longer intact." items={weakeningTheses} />
      </div>
    </section>
  );
}
