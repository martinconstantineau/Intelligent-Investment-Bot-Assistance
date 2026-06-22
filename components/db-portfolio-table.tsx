type Holding = {
  symbol: string;
  name: string;
  assetType: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  allocation: number;
};

type DbPortfolioTableProps = {
  items: Holding[];
};

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 2
});

export function DbPortfolioTable({ items }: DbPortfolioTableProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Top Holdings</h2>
          <p className="text-sm text-slate-400">Database-backed holdings with mock fallback.</p>
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
              <th className="py-3 font-medium">Avg. Cost</th>
              <th className="py-3 font-medium">Current</th>
              <th className="py-3 font-medium">Allocation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {items.map((item) => (
              <tr key={item.symbol} className="text-slate-200">
                <td className="py-3 font-semibold text-white">{item.symbol}</td>
                <td className="py-3">{item.name}</td>
                <td className="py-3">{item.assetType}</td>
                <td className="py-3">{item.quantity}</td>
                <td className="py-3">{money.format(item.averageCost)}</td>
                <td className="py-3">{money.format(item.currentPrice)}</td>
                <td className="py-3">{item.allocation}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
