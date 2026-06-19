import { canonicalHoldings } from "@/lib/portfolio";

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

export function HoldingsTable() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Canonical Holdings</h2>
          <p className="text-sm text-slate-400">Starting research list. Position details are intentionally blank until entered by the user.</p>
        </div>
        <button className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950">Add Holding</button>
      </div>
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
            {canonicalHoldings.map((holding) => (
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
    </section>
  );
}
