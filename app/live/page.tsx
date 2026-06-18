import { AllocationChart } from "@/components/allocation-chart";
import { DbPortfolioTable } from "@/components/db-portfolio-table";
import { DbThesisCards } from "@/components/db-thesis-cards";
import { ReportList } from "@/components/report-list";
import { StatCard } from "@/components/stat-card";
import { getDashboardHoldings, getDashboardTheses } from "@/lib/database-data";

export const dynamic = "force-dynamic";

export default async function LiveDashboardPage() {
  const [portfolioItems, thesisItems] = await Promise.all([
    getDashboardHoldings(),
    getDashboardTheses()
  ]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Live MVP</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Supabase-Backed Dashboard</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                Portfolio holdings and investment theses now load from Supabase when environment variables are configured. The app falls back safely to mock data if they are missing.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100 lg:max-w-md">
              This tool is for informational and research purposes only. It does not provide financial, investment, legal, tax, or professional advice.
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Portfolio Records" value={String(portfolioItems.length)} detail="Loaded from holdings table or fallback data" />
          <StatCard label="Thesis Records" value={String(thesisItems.length)} detail="Loaded from investment_theses table or fallback data" />
          <StatCard label="Daily Change" value="Pending" detail="Requires market-data ingestion" />
          <StatCard label="Risk Score" value="Pending" detail="Requires risk engine" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <AllocationChart />
          <DbPortfolioTable items={portfolioItems} />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <DbThesisCards items={thesisItems} />
          <ReportList />
        </section>
      </div>
    </main>
  );
}
