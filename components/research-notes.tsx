"use client";

import { useMemo, useState } from "react";
import type { Holding } from "@/lib/portfolio";
import type { ResearchNote, ResearchNoteCreateInput, ResearchNoteUpdateInput, RiskImpact, SourceType, ThesisImpact } from "@/lib/firebase/research-notes";

type ResearchNotesProps = {
  holdings: Holding[];
  notes: ResearchNote[];
  loading: boolean;
  error: string | null;
  onCreateNote: (note: ResearchNoteCreateInput) => Promise<void>;
  onUpdateNote: (noteId: string, updates: ResearchNoteUpdateInput) => Promise<void>;
};

type ResearchNoteFormState = {
  holdingId: string;
  title: string;
  sourceType: SourceType;
  sourceUrl: string;
  summary: string;
  thesisImpact: ThesisImpact | "";
  riskImpact: RiskImpact | "";
  tags: string;
};

const sourceTypeLabels: Record<SourceType, string> = {
  article: "Article",
  earnings: "Earnings",
  filing: "Filing",
  press_release: "Press release",
  analyst_note: "Analyst note",
  podcast: "Podcast",
  video: "Video",
  personal_note: "Personal note",
  other: "Other"
};

const emptyForm: ResearchNoteFormState = {
  holdingId: "",
  title: "",
  sourceType: "personal_note",
  sourceUrl: "",
  summary: "",
  thesisImpact: "",
  riskImpact: "",
  tags: ""
};

function inputClassName() {
  return "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-500";
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-xs text-slate-400">
      <span>{label}</span>
      {children}
    </label>
  );
}

function formatEnum(value: string | null) {
  return value ? value.replace(/_/g, " ") : "Not set";
}

function formFromNote(note: ResearchNote): ResearchNoteFormState {
  return {
    holdingId: note.holdingId ?? "",
    title: note.title,
    sourceType: note.sourceType,
    sourceUrl: note.sourceUrl ?? "",
    summary: note.summary,
    thesisImpact: note.thesisImpact ?? "",
    riskImpact: note.riskImpact ?? "",
    tags: note.tags.join(", ")
  };
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    throw new Error("Source URL must be blank or a valid URL.");
  }
}

function normalizeForm(form: ResearchNoteFormState, holdings: Holding[]): ResearchNoteCreateInput {
  const title = form.title.trim();
  const summary = form.summary.trim();

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!summary) {
    throw new Error("Summary is required.");
  }

  if (!Object.keys(sourceTypeLabels).includes(form.sourceType)) {
    throw new Error("Source type is invalid.");
  }

  const selectedHolding = holdings.find((holding) => holding.id === form.holdingId) ?? null;

  return {
    holdingId: selectedHolding?.id ?? null,
    symbol: selectedHolding?.symbol ?? null,
    title,
    sourceType: form.sourceType,
    sourceUrl: normalizeUrl(form.sourceUrl),
    summary,
    thesisImpact: form.thesisImpact || null,
    riskImpact: form.riskImpact || null,
    tags: parseTags(form.tags)
  };
}

function ResearchNoteForm({ form, holdings, setForm }: { form: ResearchNoteFormState; holdings: Holding[]; setForm: (next: ResearchNoteFormState) => void }) {
  const selectedHolding = useMemo(() => holdings.find((holding) => holding.id === form.holdingId) ?? null, [holdings, form.holdingId]);

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <FieldLabel label="Related Holding">
        <select className={inputClassName()} value={form.holdingId} onChange={(event) => setForm({ ...form, holdingId: event.target.value })}>
          <option value="">No related holding</option>
          {holdings.map((holding) => (
            <option key={holding.id} value={holding.id}>
              {holding.symbol} — {holding.name}
            </option>
          ))}
        </select>
      </FieldLabel>
      <FieldLabel label="Source Type">
        <select className={inputClassName()} value={form.sourceType} onChange={(event) => setForm({ ...form, sourceType: event.target.value as SourceType })}>
          {Object.entries(sourceTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FieldLabel>
      <FieldLabel label="Source URL">
        <input className={inputClassName()} value={form.sourceUrl} onChange={(event) => setForm({ ...form, sourceUrl: event.target.value })} placeholder="https://... optional" />
      </FieldLabel>
      <FieldLabel label="Title">
        <input className={inputClassName()} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Research note title" />
      </FieldLabel>
      <FieldLabel label="Thesis Impact">
        <select className={inputClassName()} value={form.thesisImpact} onChange={(event) => setForm({ ...form, thesisImpact: event.target.value as ThesisImpact | "" })}>
          <option value="">Not set</option>
          <option value="bullish">Bullish</option>
          <option value="neutral">Neutral</option>
          <option value="bearish">Bearish</option>
          <option value="mixed">Mixed</option>
        </select>
      </FieldLabel>
      <FieldLabel label="Risk Impact">
        <select className={inputClassName()} value={form.riskImpact} onChange={(event) => setForm({ ...form, riskImpact: event.target.value as RiskImpact | "" })}>
          <option value="">Not set</option>
          <option value="lower">Lower</option>
          <option value="unchanged">Unchanged</option>
          <option value="higher">Higher</option>
        </select>
      </FieldLabel>
      <FieldLabel label="Tags">
        <input className={inputClassName()} value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="AI, earnings, risk" />
      </FieldLabel>
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-400 md:col-span-2">
        <span className="font-medium text-slate-300">Selected:</span> {selectedHolding ? `${selectedHolding.symbol} — ${selectedHolding.name}` : "None"}
      </div>
      <label className="space-y-1 text-xs text-slate-400 md:col-span-2 xl:col-span-3">
        <span>Summary</span>
        <textarea className={`${inputClassName()} min-h-28 resize-y`} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="Summarize the evidence, key facts, and relevance to the thesis." />
      </label>
    </div>
  );
}

export function ResearchNotes({ holdings, notes, loading, error, onCreateNote, onUpdateNote }: ResearchNotesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<ResearchNoteFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ResearchNoteFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate() {
    try {
      setSaving(true);
      setFormError(null);
      await onCreateNote(normalizeForm(addForm, holdings));
      setAddForm(emptyForm);
      setShowAddForm(false);
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : "Unable to create research note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(noteId: string) {
    try {
      setSaving(true);
      setFormError(null);
      await onUpdateNote(noteId, normalizeForm(editForm, holdings));
      setEditingId(null);
      setEditForm(emptyForm);
    } catch (updateError) {
      setFormError(updateError instanceof Error ? updateError.message : "Unable to update research note.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(note: ResearchNote) {
    setFormError(null);
    setShowAddForm(false);
    setEditingId(note.id);
    setEditForm(formFromNote(note));
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Research Notes</h2>
          <p className="text-sm text-slate-400">Capture evidence, sources, and observations before generating any AI summaries.</p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setEditingId(null);
            setShowAddForm((current) => !current);
          }}
          className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950"
        >
          {showAddForm ? "Cancel" : "Add Note"}
        </button>
      </div>

      {formError ? <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{formError}</div> : null}

      {showAddForm ? (
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <h3 className="mb-4 text-sm font-semibold text-white">Add research note</h3>
          <ResearchNoteForm form={addForm} holdings={holdings} setForm={setAddForm} />
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={saving} onClick={handleCreate} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60">
              {saving ? "Saving…" : "Save Note"}
            </button>
            <button disabled={saving} onClick={() => setShowAddForm(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-60">
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {loading ? <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">Loading research notes…</div> : null}

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

      {!loading && !error && notes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">
          No research notes yet. Add notes from earnings, filings, articles, or your own observations.
        </div>
      ) : null}

      {!loading && !error && notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <article key={note.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              {editingId === note.id ? (
                <>
                  <ResearchNoteForm form={editForm} holdings={holdings} setForm={setEditForm} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button disabled={saving} onClick={() => handleSaveEdit(note.id)} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60">
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button disabled={saving} onClick={() => setEditingId(null)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-60">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
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
                    <button onClick={() => startEditing(note)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500">
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
                </>
              )}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
