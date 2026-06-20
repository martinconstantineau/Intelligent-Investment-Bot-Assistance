"use client";

import { useEffect, useState } from "react";
import { AllocationChart } from "@/components/allocation-chart";
import { DecisionJournal } from "@/components/decision-journal";
import { HoldingsTable } from "@/components/holdings-table";
import { ReportList } from "@/components/report-list";
import { StatCard } from "@/components/stat-card";
import { ThesisList } from "@/components/thesis-list";
import { useAuth } from "@/components/auth-gate";
import {
  createHolding,
  initializeCanonicalHoldingsIfEmpty,
  listenToHoldings,
  updateHolding,
  type HoldingCreateInput,
  type HoldingUpdateInput
} from "@/lib/firebase/client-holdings";
import {
  createDecisionJournalEntry,
  listenToDecisionJournalEntries,
  updateDecisionJournalEntry,
  type DecisionJournalCreateInput,
  type DecisionJournalEntry,
  type DecisionJournalUpdateInput
} from "@/lib/firebase/decision-journal";
import { portfolioDisclaimer, type Holding } from "@/lib/portfolio";

export function Dashboard() {
  const { user, signOutUser } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loadingHoldings, setLoadingHoldings] = useState(true);
  const [holdingsError, setHoldingsError] = useState<string | null>(null);
  const [journalEntries, setJournalEntries] = useState<DecisionJournalEntry[]>([]);
  const [loadingJournalEntries, setLoadingJournalEntries] = useState(true);
  const [journalError, setJournalError] = useState<string | null>(null);

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

    initializeAndSubscribe(user.uid);

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
      user.uid,
      (nextEntries) => {
        setJournalEntries(nextEntries);
        setLoadingJournalEntries(false);
      },
      (message) => {
        setJournalError(message);
        setLoadingJournalEntries(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  if (!user) {
    return null;
  }

  const displayName = user.displayName || user.email || "Signed-in user";

  async function handleCreateHolding(input: HoldingCreateInput) {
    await createHolding(user.uid, input);
  }

  async function handleUpdateHolding(holdingId: string, updates: HoldingUpdateInput) {
    await updateHolding(user.uid, holdingId, updates);
  }

  async function handleCreateJournalEntry(input: DecisionJournalCreateInput) {
    await createDecisionJournalEntry(user.uid, input);
  }

  async function handleUpdateJournalEntry(entryId: string, updates: DecisionJournalUpdateInput) {
    await updateDecisionJournalEntry(user.uid, entryId, updates);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Firebase-first investment intelligence</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Intelligent Investment Bot Assistance</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                Minimal Firebase MVP for portfolio monitoring, thesis tracking, research notes, and decision journaling. No brokerage integration and no trading execution.
              </p>
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
          <StatCard label="Tracked Holdings" value={loadingHoldings ? "…" : String(holdings.length)} detail="User-specific Firestore holdings" />
          <StatCard label="Journal Entries" value={loadingJournalEntries ? "…" : String(journalEntries.length)} detail="Decision history records" />
          <StatCard label="Position Data" value="Manual" detail="No invented quantities or prices" />
          <StatCard label="Automation" value="Off" detail="Scheduled reports planned later" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <AllocationChart />
          <HoldingsTable holdings={holdings} loading={loadingHoldings} error={holdingsError} onCreateHolding={handleCreateHolding} onUpdateHolding={handleUpdateHolding} />
        </section>

        <DecisionJournal
          holdings={holdings}
          entries={journalEntries}
          loading={loadingJournalEntries}
          error={journalError}
          onCreateEntry={handleCreateJournalEntry}
          onUpdateEntry={handleUpdateJournalEntry}
        />

        <section className="grid gap-6 xl:grid-cols-2">
          <ThesisList />
          <ReportList />
        </section>
      </div>
    </main>
  );
}
