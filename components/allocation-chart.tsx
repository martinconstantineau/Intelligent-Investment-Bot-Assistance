export function AllocationChart() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Allocation</h2>
        <p className="text-sm text-slate-400">Allocation will appear after quantities and current values are entered.</p>
      </div>
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center">
        <div>
          <p className="text-sm font-medium text-slate-200">No allocation data yet</p>
          <p className="mt-2 max-w-xs text-sm text-slate-500">The Firebase MVP starts with a research list only. It should not invent portfolio weights, prices, or performance.</p>
        </div>
      </div>
    </section>
  );
}
