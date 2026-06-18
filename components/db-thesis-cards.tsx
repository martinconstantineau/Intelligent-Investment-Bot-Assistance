import type { Thesis } from "@/lib/mock-data";

type DbThesisCardsProps = {
  items: Thesis[];
};

export function DbThesisCards({ items }: DbThesisCardsProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Investment Theses</h2>
        <p className="text-sm text-slate-400">Database-backed thesis records with mock fallback.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.symbol} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-white">{item.symbol}</h3>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Confidence {item.confidence}/10</span>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Bull case</dt>
                <dd className="text-slate-200">{item.bullCase}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Bear case</dt>
                <dd className="text-slate-200">{item.bearCase}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Break condition</dt>
                <dd className="text-slate-200">{item.breakCondition}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">Last reviewed: {item.lastReviewed}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
