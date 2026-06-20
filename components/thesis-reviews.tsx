"use client";

import { useMemo, useState } from "react";
import type { DecisionJournalEntry } from "@/lib/firebase/decision-journal";
import type { ResearchNote } from "@/lib/firebase/research-notes";
import type { ThesisReview, ThesisReviewCreateInput, ThesisReviewUpdateInput, ThesisStatus } from "@/lib/firebase/thesis-reviews";
import type { Holding } from "@/lib/portfolio";

type ThesisReviewsProps = {
  holdings: Holding[];
  researchNotes: ResearchNote[];
  journalEntries: DecisionJournalEntry[];
  reviews: ThesisReview[];
  loading: boolean;
  error: string | null;
  onCreateReview: (review: ThesisReviewCreateInput) => Promise<void>;
  onUpdateReview: (reviewId: string, updates: ThesisReviewUpdateInput) => Promise<void>;
};

type ThesisReviewFormState = {
  holdingId: string;
  thesisStatus: ThesisStatus;
  summary: string;
  supportingEvidence: string;
  opposingEvidence: string;
  riskAssessment: string;
  watchItems: string;
  nextReviewDate: string;
  conviction: string;
};

const thesisStatusLabels: Record<ThesisStatus, string> = {
  intact: "Intact",
  strengthening: "Strengthening",
  weakening: "Weakening",
  broken: "Broken",
  needs_more_data: "Needs more data"
};

const emptyForm: ThesisReviewFormState = {
  holdingId: "",
  thesisStatus: "needs_more_data",
  summary: "",
  supportingEvidence: "",
  opposingEvidence: "",
  riskAssessment: "",
  watchItems: "",
  nextReviewDate: "",
  conviction: ""
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

function formFromReview(review: ThesisReview): ThesisReviewFormState {
  return {
    holdingId: review.holdingId,
    thesisStatus: review.thesisStatus,
    summary: review.summary,
    supportingEvidence: review.supportingEvidence,
    opposingEvidence: review.opposingEvidence,
    riskAssessment: review.riskAssessment,
    watchItems: review.watchItems,
    nextReviewDate: review.nextReviewDate ?? "",
    conviction: review.conviction === null ? "" : String(review.conviction)
  };
}

function normalizeForm(form: ThesisReviewFormState, holdings: Holding[]): ThesisReviewCreateInput {
  const selectedHolding = holdings.find((holding) => holding.id === form.holdingId) ?? null;

  if (!selectedHolding) {
    throw new Error("Holding is required.");
  }

  if (!Object.keys(thesisStatusLabels).includes(form.thesisStatus)) {
    throw new Error("Thesis status is invalid.");
  }

  const summary = form.summary.trim();

  if (!summary) {
    throw new Error("Summary is required.");
  }

  const conviction = form.conviction.trim() === "" ? null : Number(form.conviction);

  if (conviction !== null && (!Number.isInteger(conviction) || conviction < 1 || conviction > 10)) {
    throw new Error("Conviction must be blank or a whole number between 1 and 10.");
  }

  return {
    holdingId: selectedHolding.id,
    symbol: selectedHolding.symbol,
    thesisStatus: form.thesisStatus,
    summary,
    supportingEvidence: form.supportingEvidence.trim(),
    opposingEvidence: form.opposingEvidence.trim(),
    riskAssessment: form.riskAssessment.trim(),
    watchItems: form.watchItems.trim(),
    nextReviewDate: form.nextReviewDate || null,
    conviction
  };
}

function HoldingContext({ holding, researchNotes, journalEntries }: { holding: Holding | null; researchNotes: ResearchNote[]; journalEntries: DecisionJournalEntry[] }) {
  if (!holding) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">
        Select a holding to view its current thesis, risk state, research notes, and journal entries.
      </div>
    );
  }

  const relatedNotes = researchNotes.filter((note) => note.holdingId === holding.id || note.symbol === holding.symbol).slice(0, 5);
  const relatedEntries = journalEntries.filter((entry) => entry.holdingId === holding.id || entry.symbol === holding.symbol).slice(0, 5);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div>
        <h3 className="text-sm font-semibold text-white">{holding.symbol} context</h3>
        <dl className="mt-3 grid gap-3 text-sm md:grid-cols-3">
          <div>
            <dt className="text-xs text-slate-500">Risk level</dt>
            <dd className="capitalize text-slate-300">{formatEnum(holding.riskLevel)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Watch status</dt>
            <dd className="capitalize text-slate-300">{formatEnum(holding.watchStatus)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Time horizon</dt>
            <dd className="capitalize text-slate-300">{formatEnum(holding.timeHorizon)}</dd>
          </div>
        </dl>
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current thesis</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{holding.thesis || "No thesis entered yet."}</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Recent research notes</h4>
          {relatedNotes.length === 0 ? <p className="text-sm text-slate-500">No related research notes.</p> : null}
          <div className="space-y-2">
            {relatedNotes.map((note) => (
              <div key={note.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-sm font-medium text-slate-200">{note.title}</p>
                <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-400">{note.summary}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Recent journal entries</h4>
          {relatedEntries.length === 0 ? <p className="text-sm text-slate-500">No related journal entries.</p> : null}
          <div className="space-y-2">
            {relatedEntries.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-sm font-medium text-slate-200">{entry.title}</p>
                <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-400">{entry.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewForm({ form, holdings, setForm }: { form: ThesisReviewFormState; holdings: Holding[]; setForm: (next: ThesisReviewFormState) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <FieldLabel label="Related Holding">
        <select className={inputClassName()} value={form.holdingId} onChange={(event) => setForm({ ...form, holdingId: event.target.value })}>
          <option value="">Select holding</option>
          {holdings.map((holding) => (
            <option key={holding.id} value={holding.id}>
              {holding.symbol} — {holding.name}
            </option>
          ))}
        </select>
      </FieldLabel>
      <FieldLabel label="Thesis Status">
        <select className={inputClassName()} value={form.thesisStatus} onChange={(event) => setForm({ ...form, thesisStatus: event.target.value as ThesisStatus })}>
          {Object.entries(thesisStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FieldLabel>
      <FieldLabel label="Conviction">
        <input className={inputClassName()} value={form.conviction} onChange={(event) => setForm({ ...form, conviction: event.target.value })} inputMode="numeric" placeholder="1–10 or blank" />
      </FieldLabel>
      <FieldLabel label="Next Review Date">
        <input className={inputClassName()} value={form.nextReviewDate} onChange={(event) => setForm({ ...form, nextReviewDate: event.target.value })} type="date" />
      </FieldLabel>
      <label className="space-y-1 text-xs text-slate-400 md:col-span-2 xl:col-span-3">
        <span>Summary</span>
        <textarea className={`${inputClassName()} min-h-24 resize-y`} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="Current thesis review summary." />
      </label>
      <label className="space-y-1 text-xs text-slate-400 md:col-span-2 xl:col-span-3">
        <span>Supporting Evidence</span>
        <textarea className={`${inputClassName()} min-h-24 resize-y`} value={form.supportingEvidence} onChange={(event) => setForm({ ...form, supportingEvidence: event.target.value })} placeholder="Evidence that supports the thesis." />
      </label>
      <label className="space-y-1 text-xs text-slate-400 md:col-span-2 xl:col-span-3">
        <span>Opposing Evidence</span>
        <textarea className={`${inputClassName()} min-h-24 resize-y`} value={form.opposingEvidence} onChange={(event) => setForm({ ...form, opposingEvidence: event.target.value })} placeholder="Evidence that weakens or challenges the thesis." />
      </label>
      <label className="space-y-1 text-xs text-slate-400 md:col-span-2 xl:col-span-3">
        <span>Risk Assessment</span>
        <textarea className={`${inputClassName()} min-h-24 resize-y`} value={form.riskAssessment} onChange={(event) => setForm({ ...form, riskAssessment: event.target.value })} placeholder="Risk changes, concentration risk, thesis risk, or uncertainty." />
      </label>
      <label className="space-y-1 text-xs text-slate-400 md:col-span-2 xl:col-span-3">
        <span>Watch Items</span>
        <textarea className={`${inputClassName()} min-h-24 resize-y`} value={form.watchItems} onChange={(event) => setForm({ ...form, watchItems: event.target.value })} placeholder="What to monitor before the next review." />
      </label>
    </div>
  );
}

export function ThesisReviews({ holdings, researchNotes, journalEntries, reviews, loading, error, onCreateReview, onUpdateReview }: ThesisReviewsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<ThesisReviewFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ThesisReviewFormState>(emptyForm);
  const [selectedHoldingId, setSelectedHoldingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const contextHolding = useMemo(() => {
    const activeId = editingId ? editForm.holdingId : showAddForm ? addForm.holdingId : selectedHoldingId;
    return holdings.find((holding) => holding.id === activeId) ?? null;
  }, [holdings, editingId, editForm.holdingId, showAddForm, addForm.holdingId, selectedHoldingId]);

  async function handleCreate() {
    try {
      setSaving(true);
      setFormError(null);
      await onCreateReview(normalizeForm(addForm, holdings));
      setSelectedHoldingId(addForm.holdingId);
      setAddForm(emptyForm);
      setShowAddForm(false);
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : "Unable to create thesis review.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(reviewId: string) {
    try {
      setSaving(true);
      setFormError(null);
      await onUpdateReview(reviewId, normalizeForm(editForm, holdings));
      setSelectedHoldingId(editForm.holdingId);
      setEditingId(null);
      setEditForm(emptyForm);
    } catch (updateError) {
      setFormError(updateError instanceof Error ? updateError.message : "Unable to update thesis review.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(review: ThesisReview) {
    setFormError(null);
    setShowAddForm(false);
    setEditingId(review.id);
    setEditForm(formFromReview(review));
    setSelectedHoldingId(review.holdingId);
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Thesis Reviews</h2>
          <p className="text-sm text-slate-400">Manually review whether a holding thesis remains intact based on your notes and journal.</p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setEditingId(null);
            setShowAddForm((current) => !current);
          }}
          className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950"
        >
          {showAddForm ? "Cancel" : "Add Review"}
        </button>
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-[320px_1fr]">
        <FieldLabel label="Context Holding">
          <select className={inputClassName()} value={selectedHoldingId} onChange={(event) => setSelectedHoldingId(event.target.value)}>
            <option value="">Select holding for context</option>
            {holdings.map((holding) => (
              <option key={holding.id} value={holding.id}>
                {holding.symbol} — {holding.name}
              </option>
            ))}
          </select>
        </FieldLabel>
        <HoldingContext holding={contextHolding} researchNotes={researchNotes} journalEntries={journalEntries} />
      </div>

      {formError ? <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{formError}</div> : null}

      {showAddForm ? (
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <h3 className="mb-4 text-sm font-semibold text-white">Add thesis review</h3>
          <ReviewForm form={addForm} holdings={holdings} setForm={setAddForm} />
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={saving} onClick={handleCreate} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60">
              {saving ? "Saving…" : "Save Review"}
            </button>
            <button disabled={saving} onClick={() => setShowAddForm(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-60">
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {loading ? <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">Loading thesis reviews…</div> : null}

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

      {!loading && !error && reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">
          No thesis reviews yet. Add one after reviewing your notes, risks, and journal entries for a holding.
        </div>
      ) : null}

      {!loading && !error && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              {editingId === review.id ? (
                <>
                  <ReviewForm form={editForm} holdings={holdings} setForm={setEditForm} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button disabled={saving} onClick={() => handleSaveEdit(review.id)} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60">
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
                        <span className="rounded-full bg-slate-800 px-2 py-1">{review.symbol}</span>
                        <span className="rounded-full bg-slate-800 px-2 py-1 capitalize">{thesisStatusLabels[review.thesisStatus]}</span>
                        <span className="rounded-full bg-slate-800 px-2 py-1">Conviction: {review.conviction ?? "Not set"}</span>
                        <span className="rounded-full bg-slate-800 px-2 py-1">Next: {review.nextReviewDate ?? "Not set"}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white">{review.symbol} thesis review</h3>
                    </div>
                    <button onClick={() => startEditing(review)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500">
                      Edit
                    </button>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{review.summary}</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Supporting evidence</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{review.supportingEvidence || "Not entered"}</p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Opposing evidence</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{review.opposingEvidence || "Not entered"}</p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Risk assessment</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{review.riskAssessment || "Not entered"}</p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Watch items</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{review.watchItems || "Not entered"}</p>
                    </div>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
