import { reports } from "@/lib/mock-data";

export function ReportList() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Recent AI Reports</h2>
        <p className="text-sm text-slate-400">Mock research output. Final reports should be generated server-side.</p>
      </div>
      <div className="space-y-3">
        {reports.map((report) => (
          <article key={`${report.symbol}-${report.type}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-white">{report.symbol}</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{report.type}</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{report.impact}</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">Risk: {report.risk}</span>
            </div>
            <p className="text-sm text-slate-300">{report.summary}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Suggested action: {report.action}</span>
              <span>{report.date}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
