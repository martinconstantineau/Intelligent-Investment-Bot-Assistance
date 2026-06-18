import { AllocationChart } from "@/components/allocation-chart";
import { HoldingsTable } from "@/components/holdings-table";
import { ReportList } from "@/components/report-list";
import { StatCard } from "@/components/stat-card";
import { ThesisList } from "@/components/thesis-list";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Investment intelligence</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Intelligent Investment Bot Assistance</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                Portfolio monitoring, thesis tracking, AI research reports, risk review, and decision journaling. Mock data only for the MVP foundation.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100 lg:max-w-md">
              This tool is for informational and research purposes only. It does not provide financial, investment, legal, tax, or professional advice.
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Portfolio Value" value="$14,820.00" detail="Mock Canadian-dollar view" />
          <StatCard label="Daily Change" value="+$318.40" detail="+2.19% today" />
          <StatCard label="Risk Score" value="7.4 / 10" detail="High growth concentration" />
          <StatCard label="Open Thesis Reviews" value="2" detail="AMD and ETH active" />
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
