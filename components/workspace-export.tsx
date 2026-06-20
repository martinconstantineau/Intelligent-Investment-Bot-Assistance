"use client";

import { useMemo, useState } from "react";
import type { DecisionJournalEntry } from "@/lib/firebase/decision-journal";
import type { ResearchNote } from "@/lib/firebase/research-notes";
import type { ThesisReview } from "@/lib/firebase/thesis-reviews";
import type { Holding } from "@/lib/portfolio";

type WorkspaceExportProps = {
  holdings: Holding[];
  researchNotes: ResearchNote[];
  journalEntries: DecisionJournalEntry[];
  thesisReviews: ThesisReview[];
};

type ExportFormat = "json" | "csv";
type CsvRow = Record<string, string | number | null | undefined>;

function csvEscape(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  const normalized = String(value).replace(/\r?\n|\r/g, " ");
  return normalized.includes(",") || normalized.includes('"') ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

function rowsToCsv(rows: CsvRow[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  return [headers.map(csvEscape).join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
}

function buildCsv(holdings: Holding[], researchNotes: ResearchNote[], journalEntries: DecisionJournalEntry[], thesisReviews: ThesisReview[]) {
  const holdingRows = holdings.map((holding) => ({
    type: "holding",
    id: holding.id,
    symbol: holding.symbol,
    title: holding.name,
    status: holding.watchStatus,
    risk: holding.riskLevel,
    summary: holding.thesis
  }));

  const noteRows = researchNotes.map((note) => ({
    type: "research_note",
    id: note.id,
    symbol: note.symbol,
    title: note.title,
    status: note.thesisImpact,
    risk: note.riskImpact,
    summary: note.summary
  }));

  const journalRows = journalEntries.map((entry) => ({
    type: "decision_journal",
    id: entry.id,
    symbol: entry.symbol,
    title: entry.title,
    status: entry.decisionType,
    risk: entry.riskLevel,
    summary: entry.reasoning
  }));

  const reviewRows = thesisReviews.map((review) => ({
    type: "thesis_review",
    id: review.id,
    symbol: review.symbol,
    title: `${review.symbol} thesis review`,
    status: review.thesisStatus,
    risk: review.riskAssessment,
    summary: review.summary
  }));

  return rowsToCsv([...holdingRows, ...noteRows, ...journalRows, ...reviewRows]);
}

function buildJson(holdings: Holding[], researchNotes: ResearchNote[], journalEntries: DecisionJournalEntry[], thesisReviews: ThesisReview[]) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      holdings,
      researchNotes,
      journalEntries,
      thesisReviews
    },
    null,
    2
  );
}

export function WorkspaceExport({ holdings, researchNotes, journalEntries, thesisReviews }: WorkspaceExportProps) {
  const [format, setFormat] = useState<ExportFormat>("json");
  const [copied, setCopied] = useState(false);

  const exportText = useMemo(() => {
    return format === "json" ? buildJson(holdings, researchNotes, journalEntries, thesisReviews) : buildCsv(holdings, researchNotes, journalEntries, thesisReviews);
  }, [format, holdings, researchNotes, journalEntries, thesisReviews]);

  async function copyExportText() {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 print:hidden">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Workspace Export</h2>
          <p className="mt-1 text-sm text-slate-400">Generate structured JSON or CSV text from the records currently loaded on this page.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFormat("json")} className={format === "json" ? "rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950" : "rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"}>
            JSON
          </button>
          <button onClick={() => setFormat("csv")} className={format === "csv" ? "rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950" : "rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"}>
            CSV
          </button>
          <button onClick={copyExportText} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <textarea readOnly value={exportText} className="h-72 w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 outline-none" />
    </section>
  );
}
