const settings = [
  { label: "Supabase", value: "Not connected" },
  { label: "Market data", value: "Provider not configured" },
  { label: "AI provider", value: "Provider not configured" },
  { label: "Trading", value: "Execution disabled" }
];

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Configuration</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Settings</h1>
          <p className="mt-2 text-slate-400">Provider status placeholders for the MVP foundation.</p>
        </header>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <dl className="divide-y divide-slate-800">
            {settings.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <dt className="font-medium text-white">{item.label}</dt>
                <dd className="text-sm text-slate-400">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
          This application is a decision-support and research tool only. It does not provide professional advice and does not execute trades.
        </section>
      </div>
    </main>
  );
}
