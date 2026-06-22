"use client";

import { useEffect, useState } from "react";
import { AllocationChart } from "@/components/allocation-chart";
import { DataQualitySummary } from "@/components/data-quality-summary";
import { DecisionJournal } from "@/components/decision-journal";
import { HoldingsTable } from "@/components/holdings-table";
import { PortfolioReviewReport } from "@/components/portfolio-review-report";
import { PortfolioReviewSummary } from "@/components/portfolio-review-summary";
import { ReportList } from "@/components/report-list";
import { ResearchNotes } from "@/components/research-notes";
import { StatCard } from "@/components/stat-card";
import { ThesisList } from "@/components/thesis-list";
import { ThesisReviews } from "@/components/thesis-reviews";
import { WorkspaceExport } from "@/components/workspace-export";
import { WorkspaceSearch } from "@/components/workspace-search";
import { useAuth } from "@/components/auth-gate";
import {
  createHolding,
  initializeCanonicalHoldingsIfEmpty,
  listenToHoldings,
  updateHolding,
  type HoldingCreateInput,
  type HoldingUpdateInput
} from "@/lib/supabase/holdings";
import {
  createDecisionJournalEntry,
  listenToDecisionJournalEntries,
  updateDecisionJournalEntry,
  type DecisionJournalCreateInput,
  type DecisionJournalEntry,
  type DecisionJournalUpdateInput
} from "@/lib/supabase/decision-journal";
import {
  createResearchNote,
  listenToResearchNotes,
  updateResearchNote,
  type ResearchNote,
  type ResearchNoteCreateInput,
  type ResearchNoteUpdateInput
} from "@/lib/supabase/research-notes";
import {
  createThesisReview,
  listenToThesisReviews,
  updateThesisReview,
  type ThesisReview,
  type ThesisReviewCreateInput,
  type ThesisReviewUpdateInput
} from "@/lib/supabase/thesis-reviews";
import { portfolioDisclaimer, type Holding } from "@/lib/portfolio";

export function Dashboard() {
  const { user, signOutUser } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loadingHoldings, setLoadingHoldings] = useState(true);
  const [holdingsError, setHoldingsError] = useState<string | null>(null);
  const [journalEntries, setJournalEntries] = useState<DecisionJournalEntry[]>([]);
  const [loadingJournalEntries, setLoadingJournalEntries] = useState(true);
  const [journalError, setJournalError] = useState<string | null>(null);
  const [researchNotes, setResearchNotes] = useState<ResearchNote[]>([]);
  const [loadingResearchNotes, setLoadingResearchNotes] = useState(true);
  const [researchNotesError, setResearchNotesError] = useState<string | null>(null);
  const [thesisReviews, setThesisReviews] = useState<ThesisReview[]>([]);
  const [loadingThesisReviews, setLoadingThesisReviews] = useState(true);
  const [thesisReviewsError, setThesisReviewsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    async function initializeAndSubscribe(userId: string) {
      try {
        setLoadingHoldings(true);
        setHoldingsError(null);
        await initializeCanonicalHoldingsIfEmpty(userId);
        if (cancelled) return;

        unsubscribe = listenToHoldings(
          userId,
          (nextHoldings) => {
            setHoldings(nextHoldings);
            setLoadingHoldings(false);
          },
          (message) => {
            setHoldingsError(message);
            setLoadingHoldings(false);
          }
        );
      } catch (error) {
        if (!cancelled) {
          setHoldingsError(error instanceof Error ? error.message : "Unable to load holdings.");
          setLoadingHoldings(false);
        }
      }
    }

    initializeAndSubscribe(user.id);

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    setLoadingJournalEntries(true);
    setJournalError(null);

    const unsubscribe = listenToDecisionJournalEntries(
      user.id,
      (nextEntries) => {
        setJournalEntries(nextEntries);
        setLoadingJournalEntries(false);
      },
      (message) => {
        setJournalError(message);
        setLoadingJournalEntries(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    setLoadingResearchNotes(true);
    setResearchNotesError(null);

    const unsubscribe = listenToResearchNotes(
      user.id,
      (nextNotes) => {
        setResearchNotes(nextNotes);
        setLoadingResearchNotes(false);
      },
      (message) => {
        setResearchNotesError(message);
        setLoadingResearchNotes(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    setLoadingThesisReviews(true);
    setThesisReviewsError(null);

    const unsubscribe = listenToThesisReviews(
      user.id,
      (nextReviews) => {
        setThesisReviews(nextReviews);
        setLoadingThesisReviews(false);
      },
      (message) => {
        setThesisReviewsError(message);
        setLoadingThesisReviews(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  const displayName = (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) || (typeof user.user_metadata?.name === "string" && user.user_metadata.name) || user.email || "Signed-in user";

  async function handleCreateHolding(input: HoldingCreateInput) {
    if (!user) return;
    await createHolding(user.id, input);
  }

  async function handleUpdateHolding(holdingId: string, updates: HoldingUpdateInput) {
    if (!user) return;
    await updateHolding(user.id, holdingId, updates);
  }

  async function handleCreateJournalEntry(input: DecisionJournalCreateInput) {
    if (!user) return;
    await createDecisionJournalEntry(user.id, input);
  }

  async function handleUpdateJournalEntry(entryId: string, updates: DecisionJournalUpdateInput) {
    if (!user) return;
    await updateDecisionJournalEntry(user.id, entryId, updates);
  }

  async function handleCreateResearchNote(input: ResearchNoteCreateInput) {
    if (!user) return;
    await createResearchNote(user.id, input);
  }

  async function handleUpdateResearchNote(noteId: string, updates: ResearchNoteUpdateInput) {
    if (!user) return;
    await updateResearchNote(user.id, noteId, updates);
  }

  async function handleCreateThesisReview(input: ThesisReviewCreateInput) {
    if (!user) return;
    await createThesisReview(user.id, input);
  }

  async function handleUpdateThesisReview(reviewId: string, updates: ThesisReviewUpdateInput) {
    if (!user) return;
    await updateThesisReview(user.id, reviewId, updates);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6 overflow-hidden sm:overflow-visible">
        <header className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Supabase + Vercel investment intelligence</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Intelligent Investment Bot Assistance</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">Supabase-backed MVP for portfolio monitoring, thesis tracking, research notes, and decision journaling.</p>
              <p className="mt-3 text-sm text-slate-300">Signed in as {displayName}</p>
            </div>
            <div className="space-y-3 lg:max-w-md">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">{portfolioDisclaimer}</div>
              <button onClick={signOutUser} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500">
                Sign out
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tracked Holdings" value={loadingHoldings ? "..." : String(holdings.length)} detail="User-specific Supabase holdings" />
          <StatCard label="Research Notes" value={loadingResearchNotes ? "..." : String(researchNotes.length)} detail="Evidence and source capture" />
          <StatCard label="Thesis Reviews" value={loadingThesisReviews ? "..." : String(thesisReviews.length)} detail="Manual review workflow" />
          <StatCard label="Journal Entries" value={loadingJournalEntries ? "..." : String(journalEntries.length)} detail="Decision history records" />
        </section>

        <PortfolioReviewSummary holdings={holdings} researchNotes={researchNotes} journalEntries={journalEntries} thesisReviews={thesisReviews} />

        <DataQualitySummary holdings={holdings} researchNotes={researchNotes} journalEntries={journalEntries} thesisReviews={thesisReviews} />

        <WorkspaceSearch holdings={holdings} researchNotes={researchNotes} journalEntries={journalEntries} thesisReviews={thesisReviews} />

        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <AllocationChart />
          <HoldingsTable holdings={holdings} loading={loadingHoldings} error={holdingsError} onCreateHolding={handleCreateHolding} onUpdateHolding={handleUpdateHolding} />
        </section>

        <ThesisReviews
          holdings={holdings}
          researchNotes={researchNotes}
          journalEntries={journalEntries}
          reviews={thesisReviews}
          loading={loadingThesisReviews}
          error={thesisReviewsError}
          onCreateReview={handleCreateThesisReview}
          onUpdateReview={handleUpdateThesisReview}
        />

        <section className="grid gap-6 xl:grid-cols-2">
          <ResearchNotes
            holdings={holdings}
            notes={researchNotes}
            loading={loadingResearchNotes}
            error={researchNotesError}
            onCreateNote={handleCreateResearchNote}
            onUpdateNote={handleUpdateResearchNote}
          />
          <DecisionJournal
            holdings={holdings}
            entries={journalEntries}
            loading={loadingJournalEntries}
            error={journalError}
            onCreateEntry={handleCreateJournalEntry}
            onUpdateEntry={handleUpdateJournalEntry}
          />
        </section>

        <PortfolioReviewReport holdings={holdings} researchNotes={researchNotes} journalEntries={journalEntries} thesisReviews={thesisReviews} />

        <WorkspaceExport holdings={holdings} researchNotes={researchNotes} journalEntries={journalEntries} thesisReviews={thesisReviews} />

        <section className="grid gap-6 xl:grid-cols-2">
          <ThesisList />
          <ReportList />
        </section>
      </div>
    </main>
  );
}
