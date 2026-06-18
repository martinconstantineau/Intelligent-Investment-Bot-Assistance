import { HoldingsTable } from "@/components/holdings-table";

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Portfolio</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Portfolio Holdings</h1>
          <p className="mt-2 text-slate-400">Track owned assets, allocation, cost basis, and market value.</p>
        </header>
        <HoldingsTable />
      </div>
    </main>
  );
}
