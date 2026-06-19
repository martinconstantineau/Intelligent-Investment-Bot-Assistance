import { AllocationChart } from "@/components/allocation-chart";
import { HoldingsTable } from "@/components/holdings-table";
import { ReportList } from "@/components/report-list";
import { StatCard } from "@/components/stat-card";
import { ThesisList } from "@/components/thesis-list";
import { canonicalHoldings, portfolioDisclaimer } from "@/lib/portfolio";

export default function Home() {
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
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100 lg:max-w-md">{portfolioDisclaimer}</div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tracked Holdings" value={String(canonicalHoldings.length)} detail="Canonical starting portfolio" />
          <StatCard label="Data Source" value="Firebase" detail="Firestore-backed MVP path" />
          <StatCard label="Position Data" value="Manual" detail="No invented quantities or prices" />
          <StatCard label="Automation" value="Off" detail="Scheduled reports planned later" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <AllocationChart />
          <HoldingsTable />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ThesisList />
          <ReportList />
        </section>
      </div>
    </main>
  );
}
