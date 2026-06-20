type ReadinessItem = {
  title: string;
  status: "Ready for planning" | "Needs provider" | "Needs configuration" | "Out of scope";
  detail: string;
};

const readinessItems: ReadinessItem[] = [
  {
    title: "Market data provider",
    status: "Needs provider",
    detail: "The app has symbols and structured holdings. Live price data should be added only after selecting a provider and defining environment variables."
  },
  {
    title: "AI-assisted summaries",
    status: "Needs configuration",
    detail: "The app has structured inputs for summaries. Model calls should remain disabled until provider, cost, and review boundaries are configured."
  },
  {
    title: "External account connections",
    status: "Out of scope",
    detail: "External account connections are outside the current research workspace MVP and should not be added without a separate security review."
  },
  {
    title: "Scheduled report delivery",
    status: "Ready for planning",
    detail: "The manual report exists. Recurring delivery can be planned after notification preferences and hosting costs are defined."
  }
];

function statusClassName(status: ReadinessItem["status"]) {
  if (status === "Out of scope") return "bg-red-500/10 text-red-100 border-red-500/30";
  if (status === "Needs configuration") return "bg-amber-500/10 text-amber-100 border-amber-500/30";
  if (status === "Needs provider") return "bg-sky-500/10 text-sky-100 border-sky-500/30";
  return "bg-slate-800 text-slate-300 border-slate-700";
}

export function FutureIntegrationsReadiness() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Future Integrations Readiness</h2>
        <p className="text-sm text-slate-400">Integration gates for later features. These are not live calls and do not change workspace records.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {readinessItems.map((item) => (
          <article key={item.title} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className={`mb-3 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClassName(item.status)}`}>{item.status}</div>
            <h3 className="text-sm font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
