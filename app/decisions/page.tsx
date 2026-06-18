const decisions = [
  {
    symbol: "AMD",
    decision: "Hold",
    confidence: 8,
    reason: "No thesis break identified. Continue monitoring data centre and AI accelerator execution.",
    date: "2026-06-18"
  },
  {
    symbol: "SOL",
    decision: "Monitor",
    confidence: 6,
    reason: "Maintain position but monitor portfolio concentration and crypto volatility.",
    date: "2026-06-18"
  }
];

export default function DecisionsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Decision history</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Decision Journal</h1>
          <p className="mt-2 text-slate-400">Record recommendations, reasoning, confidence, and later outcomes.</p>
        </header>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="space-y-3">
            {decisions.map((item) => (
              <article key={`${item.symbol}-${item.date}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-white">{item.symbol} - {item.decision}</h2>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Confidence {item.confidence}/10</span>
                </div>
                <p className="text-sm text-slate-300">{item.reason}</p>
                <p className="mt-3 text-xs text-slate-500">{item.date}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
