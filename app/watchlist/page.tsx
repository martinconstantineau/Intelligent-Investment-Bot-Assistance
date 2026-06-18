const watchlist = [
  { symbol: "NVDA", name: "Nvidia", priority: "High", note: "AI infrastructure benchmark holding to compare against AMD." },
  { symbol: "TSM", name: "Taiwan Semiconductor", priority: "Medium", note: "Foundry exposure and semiconductor supply chain indicator." },
  { symbol: "AVGO", name: "Broadcom", priority: "Medium", note: "AI networking and custom silicon exposure." }
];

export default function WatchlistPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Research</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Watchlist</h1>
          <p className="mt-2 text-slate-400">Track assets that may deserve future capital allocation.</p>
        </header>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="space-y-3">
            {watchlist.map((item) => (
              <article key={item.symbol} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-white">{item.symbol} — {item.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{item.note}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{item.priority}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
