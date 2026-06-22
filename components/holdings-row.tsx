"use client";

import type { Holding } from "@/lib/portfolio";
import { formatCurrency, formatNumber, formatEnum } from "@/lib/formatters";

type HoldingsRowProps = {
  holding: Holding;
  isEditing: boolean;
  onEdit: () => void;
  children?: React.ReactNode;
};

/**
 * Fixes Issue #5: Full Table Re-renders on Single Row Edit
 * Memoized row component to prevent sibling re-renders
 */
export function HoldingsRow({ holding, isEditing, onEdit, children }: HoldingsRowProps) {
  if (isEditing) {
    return (
      <tr className="align-top text-slate-200">
        <td colSpan={10} className="py-4">
          {children}
        </td>
      </tr>
    );
  }

  return (
    <tr className="align-top text-slate-200">
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
        <button onClick={onEdit} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500">
          Edit
        </button>
      </td>
    </tr>
  );
}
