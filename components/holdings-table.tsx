"use client";

import { useState } from "react";
import type { AssetType, Holding, RiskLevel, TimeHorizon, WatchStatus } from "@/lib/portfolio";
import type { HoldingCreateInput, HoldingUpdateInput } from "@/lib/firebase/client-holdings";

type HoldingsTableProps = {
  holdings: Holding[];
  loading: boolean;
  error: string | null;
  onCreateHolding: (input: HoldingCreateInput) => Promise<void>;
  onUpdateHolding: (holdingId: string, updates: HoldingUpdateInput) => Promise<void>;
};

type HoldingFormState = {
  symbol: string;
  name: string;
  assetType: AssetType;
  quantity: string;
  costBasis: string;
  purchaseDate: string;
  thesis: string;
  riskLevel: RiskLevel | "";
  timeHorizon: TimeHorizon | "";
  watchStatus: WatchStatus | "";
};

const emptyForm: HoldingFormState = {
  symbol: "",
  name: "",
  assetType: "stock",
  quantity: "",
  costBasis: "",
  purchaseDate: "",
  thesis: "",
  riskLevel: "",
  timeHorizon: "",
  watchStatus: "active"
};

function formFromHolding(holding: Holding): HoldingFormState {
  return {
    symbol: holding.symbol,
    name: holding.name,
    assetType: holding.assetType,
    quantity: holding.quantity === null ? "" : String(holding.quantity),
    costBasis: holding.costBasis === null ? "" : String(holding.costBasis),
    purchaseDate: holding.purchaseDate ?? "",
    thesis: holding.thesis ?? "",
    riskLevel: holding.riskLevel ?? "",
    timeHorizon: holding.timeHorizon ?? "",
    watchStatus: holding.watchStatus ?? ""
  };
}

function parseNullableNumber(value: string, label: string) {
  if (value.trim() === "") return null;

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a valid number.`);
  }

  if (parsed < 0) {
    throw new Error(`${label} cannot be negative.`);
  }

  return parsed;
}

function normalizeForm(form: HoldingFormState): HoldingCreateInput {
  const symbol = form.symbol.trim().toUpperCase();
  const name = form.name.trim();

  if (!symbol) {
    throw new Error("Symbol is required.");
  }

  if (!name) {
    throw new Error("Name is required.");
  }

  if (form.assetType !== "stock" && form.assetType !== "crypto") {
    throw new Error("Asset type must be stock or crypto.");
  }

  return {
    symbol,
    name,
    assetType: form.assetType,
    quantity: parseNullableNumber(form.quantity, "Quantity"),
    costBasis: parseNullableNumber(form.costBasis, "Cost basis"),
    purchaseDate: form.purchaseDate || null,
    thesis: form.thesis.trim() || null,
    riskLevel: form.riskLevel || null,
    timeHorizon: form.timeHorizon || null,
    watchStatus: form.watchStatus || null
  };
}

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

function formatEnum(value: string | null) {
  return value ? value.replace(/_/g, " ") : "Not set";
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-xs text-slate-400">
      <span>{label}</span>
      {children}
    </label>
  );
}

function inputClassName() {
  return "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-500";
}

function HoldingForm({ form, setForm }: { form: HoldingFormState; setForm: (next: HoldingFormState) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <FieldLabel label="Symbol">
        <input className={inputClassName()} value={form.symbol} onChange={(event) => setForm({ ...form, symbol: event.target.value })} placeholder="AMD" />
      </FieldLabel>
      <FieldLabel label="Name">
        <input className={inputClassName()} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Advanced Micro Devices" />
      </FieldLabel>
      <FieldLabel label="Asset Type">
        <select className={inputClassName()} value={form.assetType} onChange={(event) => setForm({ ...form, assetType: event.target.value as AssetType })}>
          <option value="stock">Stock</option>
          <option value="crypto">Crypto</option>
        </select>
      </FieldLabel>
      <FieldLabel label="Quantity">
        <input className={inputClassName()} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} inputMode="decimal" placeholder="Optional" />
      </FieldLabel>
      <FieldLabel label="Cost Basis">
        <input className={inputClassName()} value={form.costBasis} onChange={(event) => setForm({ ...form, costBasis: event.target.value })} inputMode="decimal" placeholder="Optional" />
      </FieldLabel>
      <FieldLabel label="Purchase Date">
        <input className={inputClassName()} value={form.purchaseDate} onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })} type="date" />
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
      <FieldLabel label="Time Horizon">
        <select className={inputClassName()} value={form.timeHorizon} onChange={(event) => setForm({ ...form, timeHorizon: event.target.value as TimeHorizon | "" })}>
          <option value="">Not set</option>
          <option value="short_term">Short term</option>
          <option value="medium_term">Medium term</option>
          <option value="long_term">Long term</option>
        </select>
      </FieldLabel>
      <FieldLabel label="Watch Status">
        <select className={inputClassName()} value={form.watchStatus} onChange={(event) => setForm({ ...form, watchStatus: event.target.value as WatchStatus | "" })}>
          <option value="">Not set</option>
          <option value="active">Active</option>
          <option value="watch">Watch</option>
          <option value="review">Review</option>
          <option value="exit_candidate">Exit candidate</option>
        </select>
      </FieldLabel>
      <label className="space-y-1 text-xs text-slate-400 md:col-span-2 xl:col-span-3">
        <span>Thesis</span>
        <textarea
          className={`${inputClassName()} min-h-24 resize-y`}
          value={form.thesis}
          onChange={(event) => setForm({ ...form, thesis: event.target.value })}
          placeholder="Optional thesis notes"
        />
      </label>
    </div>
  );
}

export function HoldingsTable({ holdings, loading, error, onCreateHolding, onUpdateHolding }: HoldingsTableProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<HoldingFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<HoldingFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate() {
    try {
      setSaving(true);
      setFormError(null);
      await onCreateHolding(normalizeForm(addForm));
      setAddForm(emptyForm);
      setShowAddForm(false);
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : "Unable to create holding.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(holdingId: string) {
    try {
      setSaving(true);
      setFormError(null);
      await onUpdateHolding(holdingId, normalizeForm(editForm));
      setEditingId(null);
      setEditForm(emptyForm);
    } catch (updateError) {
      setFormError(updateError instanceof Error ? updateError.message : "Unable to update holding.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(holding: Holding) {
    setFormError(null);
    setShowAddForm(false);
    setEditingId(holding.id);
    setEditForm(formFromHolding(holding));
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Holdings</h2>
          <p className="text-sm text-slate-400">User-specific Firestore holdings. Position details remain blank until entered.</p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setEditingId(null);
            setShowAddForm((current) => !current);
          }}
          className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950"
        >
          {showAddForm ? "Cancel" : "Add Holding"}
        </button>
      </div>

      {formError ? <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{formError}</div> : null}

      {showAddForm ? (
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <h3 className="mb-4 text-sm font-semibold text-white">Add holding</h3>
          <HoldingForm form={addForm} setForm={setAddForm} />
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={saving} onClick={handleCreate} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60">
              {saving ? "Saving…" : "Save Holding"}
            </button>
            <button disabled={saving} onClick={() => setShowAddForm(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-60">
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {loading ? <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">Loading holdings…</div> : null}

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

      {!loading && !error && holdings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">
          No holdings found. The app will initialize your canonical research list after sign-in when Firestore is available.
        </div>
      ) : null}

      {!loading && !error && holdings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 font-medium">Symbol</th>
                <th className="py-3 font-medium">Name</th>
                <th className="py-3 font-medium">Type</th>
                <th className="py-3 font-medium">Quantity</th>
                <th className="py-3 font-medium">Cost</th>
                <th className="py-3 font-medium">Purchase Date</th>
                <th className="py-3 font-medium">Risk</th>
                <th className="py-3 font-medium">Horizon</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {holdings.map((holding) => (
                <tr key={holding.id} className="align-top text-slate-200">
                  {editingId === holding.id ? (
                    <td colSpan={10} className="py-4">
                      <HoldingForm form={editForm} setForm={setEditForm} />
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button disabled={saving} onClick={() => handleSaveEdit(holding.id)} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60">
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button disabled={saving} onClick={() => setEditingId(null)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-60">
                          Cancel
                        </button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="py-3 font-semibold text-white">{holding.symbol}</td>
                      <td className="py-3">{holding.name}</td>
                      <td className="py-3 capitalize">{holding.assetType}</td>
                      <td className="py-3 text-slate-400">{formatNumber(holding.quantity)}</td>
                      <td className="py-3 text-slate-400">{formatCurrency(holding.costBasis)}</td>
                      <td className="py-3 text-slate-400">{holding.purchaseDate ?? "Not entered"}</td>
                      <td className="py-3 capitalize text-slate-400">{formatEnum(holding.riskLevel)}</td>
                      <td className="py-3 capitalize text-slate-400">{formatEnum(holding.timeHorizon)}</td>
                      <td className="py-3 capitalize text-slate-400">{formatEnum(holding.watchStatus)}</td>
                      <td className="py-3">
                        <button onClick={() => startEditing(holding)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500">
                          Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
