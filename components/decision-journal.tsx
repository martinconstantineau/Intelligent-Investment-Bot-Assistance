"use client";

import { useMemo, useState } from "react";
import type { Holding, RiskLevel } from "@/lib/portfolio";
import type { DecisionJournalCreateInput, DecisionJournalEntry, DecisionJournalUpdateInput, DecisionType } from "@/lib/firebase/decision-journal";

type DecisionJournalProps = {
  holdings: Holding[];
  entries: DecisionJournalEntry[];
  loading: boolean;
  error: string | null;
  onCreateEntry: (entry: DecisionJournalCreateInput) => Promise<void>;
  onUpdateEntry: (entryId: string, updates: DecisionJournalUpdateInput) => Promise<void>;
};

type JournalFormState = {
  holdingId: string;
  decisionType: DecisionType;
  title: string;
  reasoning: string;
  confidence: string;
  riskLevel: RiskLevel | "";
  thesisSnapshot: string;
  outcome: string;
};

const decisionTypeLabels: Record<DecisionType, string> = {
  buy_consideration: "Buy consideration",
  hold: "Hold",
  add: "Add",
  trim: "Trim",
  sell_consideration: "Sell consideration",
  watch: "Watch",
  thesis_update: "Thesis update",
  risk_review: "Risk review"
};

const emptyForm: JournalFormState = {
  holdingId: "",
  decisionType: "hold",
  title: "",
  reasoning: "",
  confidence: "",
  riskLevel: "",
  thesisSnapshot: "",
  outcome: ""
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

function formFromEntry(entry: DecisionJournalEntry): JournalFormState {
  return {
    holdingId: entry.holdingId ?? "",
    decisionType: entry.decisionType,
    title: entry.title,
    reasoning: entry.reasoning,
    confidence: entry.confidence === null ? "" : String(entry.confidence),
    riskLevel: entry.riskLevel ?? "",
    thesisSnapshot: entry.thesisSnapshot ?? "",
    outcome: entry.outcome ?? ""
  };
}

function normalizeForm(form: JournalFormState, holdings: Holding[]): DecisionJournalCreateInput {
  const title = form.title.trim();
  const reasoning = form.reasoning.trim();

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!reasoning) {
    throw new Error("Reasoning is required.");
  }

  const allowedDecisionTypes = Object.keys(decisionTypeLabels);

  if (!allowedDecisionTypes.includes(form.decisionType)) {
    throw new Error("Decision type is invalid.");
  }

  const confidence = form.confidence.trim() === "" ? null : Number(form.confidence);

  if (confidence !== null && (!Number.isInteger(confidence) || confidence < 1 || confidence > 10)) {
    throw new Error("Confidence must be blank or a whole number between 1 and 10.");
  }

  const selectedHolding = holdings.find((holding) => holding.id === form.holdingId) ?? null;

  return {
    holdingId: selectedHolding?.id ?? null,
    symbol: selectedHolding?.symbol ?? null,
    decisionType: form.decisionType,
    title,
    reasoning,
    confidence,
    riskLevel: form.riskLevel || null,
    thesisSnapshot: form.thesisSnapshot.trim() || null,
    outcome: form.outcome.trim() || null
  };
}

function JournalForm({ form, holdings, setForm }: { form: JournalFormState; holdings: Holding[]; setForm: (next: JournalFormState) => void }) {
  const selectedHolding = useMemo(() => holdings.find((holding) => holding.id === form.holdingId) ?? null, [holdings, form.holdingId]);

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <FieldLabel label="Related Holding">
        <select
          className={inputClassName()}
          value={form.holdingId}
          onChange={(event) => {
            const holding = holdings.find((item) => item.id === event.target.value) ?? null;
            setForm({
              ...form,
              holdingId: event.target.value,
              thesisSnapshot: holding?.thesis ?? form.thesisSnapshot
            });
          }}
        >
          <option value="">No related holding</option>
          {holdings.map((holding) => (
            <option key={holding.id} value={holding.id}>
              {holding.symbol} — {holding.name}
            </option>
          ))}
        </select>
      </FieldLabel>
      <FieldLabel label="Decision Type">
        <select className={inputClassName()} value={form.decisionType} onChange={(event) => setForm({ ...form, decisionType: event.target.value as DecisionType })}>
          {Object.entries(decisionTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FieldLabel>
      <FieldLabel label="Confidence">
        <input className={inputClassName()} value={form.confidence} onChange={(event) => setForm({ ...form, confidence: event.target.value })} inputMode="numeric" placeholder="1–10 or blank" />
      </FieldLabel>
      <FieldLabel label="Risk Level">
        <select className={inputClassName()} value={form.riskLevel} onChange={(event) => setForm({ ...form, riskLevel: event.target.value as RiskLevel | "" })}>
          <option value="">Not set</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="very_high">Very high</option>
        </select>
      </FieldLabel>
      <FieldLabel label="Title">
        <input className={inputClassName()} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Why this decision matters" />
      </FieldLabel>
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-400">
        <span className="font-medium text-slate-300">Selected:</span> {selectedHolding ? `${selectedHolding.symbol} — ${selectedHolding.name}` : "None"}
      </div>
      <label className="space-y-1 text-xs text-slate-400 md:col-span-2 xl:col-span-3">
        <span>Reasoning</span>
        <textarea className={`${inputClassName()} min-h-24 resize-y`} value={form.reasoning} onChange={(event) => setForm({ ...form, reasoning: event.target.value })} placeholder="Document the reasoning, assumptions, risks, and what would change your view." />
      </label>
      <label className="space-y-1 text-xs text-slate-400 md:col-span-2 xl:col-span-3">
        <span>Thesis Snapshot</span>
        <textarea className={`${inputClassName()} min-h-20 resize-y`} value={form.thesisSnapshot} onChange={(event) => setForm({ ...form, thesisSnapshot: event.target.value })} placeholder="Optional snapshot of the thesis at the time of decision." />
      </label>
      <label className="space-y-1 text-xs text-slate-400 md:col-span-2 xl:col-span-3">
        <span>Outcome Notes</span>
        <textarea className={`${inputClassName()} min-h-20 resize-y`} value={form.outcome} onChange={(event) => setForm({ ...form, outcome: event.target.value })} placeholder="Optional outcome or follow-up notes." />
      </label>
    </div>
  );
}

export function DecisionJournal({ holdings, entries, loading, error, onCreateEntry, onUpdateEntry }: DecisionJournalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<JournalFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<JournalFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate() {
    try {
      setSaving(true);
      setFormError(null);
      await onCreateEntry(normalizeForm(addForm, holdings));
      setAddForm(emptyForm);
      setShowAddForm(false);
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : "Unable to create journal entry.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(entryId: string) {
    try {
      setSaving(true);
      setFormError(null);
      await onUpdateEntry(entryId, normalizeForm(editForm, holdings));
      setEditingId(null);
      setEditForm(emptyForm);
    } catch (updateError) {
      setFormError(updateError instanceof Error ? updateError.message : "Unable to update journal entry.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(entry: DecisionJournalEntry) {
    setFormError(null);
    setShowAddForm(false);
    setEditingId(entry.id);
    setEditForm(formFromEntry(entry));
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Decision Journal</h2>
          <p className="text-sm text-slate-400">Record why a portfolio decision or thesis change was considered.</p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setEditingId(null);
            setShowAddForm((current) => !current);
          }}
          className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950"
        >
          {showAddForm ? "Cancel" : "Add Entry"}
        </button>
      </div>

      {formError ? <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{formError}</div> : null}

      {showAddForm ? (
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <h3 className="mb-4 text-sm font-semibold text-white">Add journal entry</h3>
          <JournalForm form={addForm} holdings={holdings} setForm={setAddForm} />
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={saving} onClick={handleCreate} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60">
              {saving ? "Saving…" : "Save Entry"}
            </button>
            <button disabled={saving} onClick={() => setShowAddForm(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-60">
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {loading ? <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">Loading journal entries…</div> : null}

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

      {!loading && !error && entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">
          No journal entries yet. Add one when you review a thesis, change a risk view, or document a portfolio decision.
        </div>
      ) : null}

      {!loading && !error && entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map((entry) => (
            <article key={entry.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              {editingId === entry.id ? (
                <>
                  <JournalForm form={editForm} holdings={holdings} setForm={setEditForm} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button disabled={saving} onClick={() => handleSaveEdit(entry.id)} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60">
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
                        <span className="rounded-full bg-slate-800 px-2 py-1 capitalize">{decisionTypeLabels[entry.decisionType]}</span>
                        {entry.symbol ? <span className="rounded-full bg-slate-800 px-2 py-1">{entry.symbol}</span> : null}
                        <span className="rounded-full bg-slate-800 px-2 py-1 capitalize">Risk: {formatEnum(entry.riskLevel)}</span>
                        <span className="rounded-full bg-slate-800 px-2 py-1">Confidence: {entry.confidence ?? "Not set"}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white">{entry.title}</h3>
                    </div>
                    <button onClick={() => startEditing(entry)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500">
                      Edit
                    </button>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{entry.reasoning}</p>
                  {entry.thesisSnapshot ? (
                    <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Thesis snapshot</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{entry.thesisSnapshot}</p>
                    </div>
                  ) : null}
                  {entry.outcome ? (
                    <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Outcome notes</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{entry.outcome}</p>
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
