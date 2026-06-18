import { ReportList } from "@/components/report-list";

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">AI research</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">AI Reports</h1>
          <p className="mt-2 text-slate-400">Review generated summaries, risk notes, and thesis-impact analysis.</p>
        </header>
        <ReportList />
      </div>
    </main>
  );
}
