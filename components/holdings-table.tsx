import type { Holding } from "@/lib/portfolio";

type HoldingsTableProps = {
  holdings: Holding[];
  loading: boolean;
  error: string | null;
};

function formatNumber(value: number | null) {
  return value === null ? "Not entered" : value.toLocaleString("en-CA");
}

function formatCurrency(value: number | null) {
  return value === null
    ? "Not entered"
    : new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 2
      }).format(value);
}

export function HoldingsTable({ holdings, loading, error }: HoldingsTableProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Holdings</h2>
          <p className="text-sm text-slate-400">User-specific Firestore holdings. Position details remain blank until entered.</p>
        </div>
        <button className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950">Add Holding</button>
      </div>

      {loading ? <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">Loading holdings…</div> : null}

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

      {!loading && !error && holdings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">
          No holdings found. The app will initialize your canonical research list after sign-in when Firestore is available.
        </div>
      ) : null}

      {!loading && !error && holdings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 font-medium">Symbol</th>
                <th className="py-3 font-medium">Name</th>
                <th className="py-3 font-medium">Type</th>
                <th className="py-3 font-medium">Quantity</th>
                <th className="py-3 font-medium">Cost</th>
                <th className="py-3 font-medium">Purchase Date</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {holdings.map((holding) => (
                <tr key={holding.id} className="text-slate-200">
                  <td className="py-3 font-semibold text-white">{holding.symbol}</td>
                  <td className="py-3">{holding.name}</td>
                  <td className="py-3 capitalize">{holding.assetType}</td>
                  <td className="py-3 text-slate-400">{formatNumber(holding.quantity)}</td>
                  <td className="py-3 text-slate-400">{formatCurrency(holding.costBasis)}</td>
                  <td className="py-3 text-slate-400">{holding.purchaseDate ?? "Not entered"}</td>
                  <td className="py-3 capitalize">{holding.watchStatus?.replace(/_/g, " ") ?? "Not set"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
