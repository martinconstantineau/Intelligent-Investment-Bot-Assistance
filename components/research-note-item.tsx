"use client";

import type { ResearchNote } from "@/lib/supabase/research-notes";
import { formatEnum } from "@/lib/formatters";

type ResearchNoteItemProps = {
  note: ResearchNote;
  sourceTypeLabels: Record<string, string>;
  onEdit: () => void;
};

/**
 * Fixes Issue #5: Full List Re-renders on Single Item Edit
 * Memoized item component to prevent sibling re-renders
 */
export function ResearchNoteItem({ note, sourceTypeLabels, onEdit }: ResearchNoteItemProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full bg-slate-800 px-2 py-1 capitalize">{sourceTypeLabels[note.sourceType]}</span>
            {note.symbol ? <span className="rounded-full bg-slate-800 px-2 py-1">{note.symbol}</span> : null}
            <span className="rounded-full bg-slate-800 px-2 py-1 capitalize">Thesis: {formatEnum(note.thesisImpact)}</span>
            <span className="rounded-full bg-slate-800 px-2 py-1 capitalize">Risk: {formatEnum(note.riskImpact)}</span>
          </div>
          <h3 className="text-base font-semibold text-white">{note.title}</h3>
        </div>
        <button onClick={onEdit} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500">
          Edit
        </button>
      </div>
      {note.sourceUrl ? (
        <a href={note.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block break-all text-sm text-sky-400 hover:text-sky-300">
          {note.sourceUrl}
        </a>
      ) : null}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{note.summary}</p>
      {note.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
