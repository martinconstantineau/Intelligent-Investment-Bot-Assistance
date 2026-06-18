import { ThesisList } from "@/components/thesis-list";

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Research</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Investment Research</h1>
          <p className="mt-2 text-slate-400">Document bull cases, bear cases, and thesis-break conditions.</p>
        </header>
        <ThesisList />
      </div>
    </main>
  );
}
