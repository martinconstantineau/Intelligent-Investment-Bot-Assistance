"use client";

import { useEffect, useState } from "react";
import { AuthGate, useAuth } from "@/components/auth-gate";
import { HoldingsTable } from "@/components/holdings-table";
import {
  createHolding,
  initializeCanonicalHoldingsIfEmpty,
  listenToHoldings,
  updateHolding,
  type HoldingCreateInput,
  type HoldingUpdateInput
} from "@/lib/supabase/holdings";
import type { Holding } from "@/lib/portfolio";

function PortfolioView() {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    async function initializeAndSubscribe(userId: string) {
      try {
        setLoading(true);
        setError(null);
        await initializeCanonicalHoldingsIfEmpty(userId);
        if (cancelled) return;

        unsubscribe = listenToHoldings(
          userId,
          (nextHoldings) => {
            setHoldings(nextHoldings);
            setLoading(false);
          },
          (message) => {
            setError(message);
            setLoading(false);
          }
        );
      } catch (initError) {
        if (!cancelled) {
          setError(initError instanceof Error ? initError.message : "Unable to load holdings.");
          setLoading(false);
        }
      }
    }

    initializeAndSubscribe(user.id);

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user]);

  if (!user) return null;

  async function handleCreateHolding(input: HoldingCreateInput) {
    if (!user) return;
    await createHolding(user.id, input);
  }

  async function handleUpdateHolding(holdingId: string, updates: HoldingUpdateInput) {
    if (!user) return;
    await updateHolding(user.id, holdingId, updates);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Portfolio</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Portfolio Holdings</h1>
          <p className="mt-2 text-slate-400">Track owned assets, allocation, cost basis, and market value.</p>
        </header>
        <HoldingsTable holdings={holdings} loading={loading} error={error} onCreateHolding={handleCreateHolding} onUpdateHolding={handleUpdateHolding} />
      </div>
    </main>
  );
}

export function PortfolioContent() {
  return (
    <AuthGate>
      <PortfolioView />
    </AuthGate>
  );
}
