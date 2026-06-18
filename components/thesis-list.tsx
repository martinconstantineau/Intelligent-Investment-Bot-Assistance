import { theses } from "@/lib/mock-data";

export function ThesisList() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Investment Theses</h2>
        <p className="text-sm text-slate-400">Track why each asset is owned and what would break the thesis.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {theses.map((thesis) => (
          <article key={thesis.symbol} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-white">{thesis.symbol}</h3>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Confidence {thesis.confidence}/10</span>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Bull case</dt>
                <dd className="text-slate-200">{thesis.bullCase}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Bear case</dt>
                <dd className="text-slate-200">{thesis.bearCase}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Break condition</dt>
                <dd className="text-slate-200">{thesis.breakCondition}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">Last reviewed: {thesis.lastReviewed}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
