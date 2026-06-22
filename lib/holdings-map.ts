/**
 * Fixes Issue #3: Inefficient O(n) Search on Every Holdings Selection
 * Create a holdings map for O(1) lookup instead of repeated .find() calls
 */

import type { Holding } from "@/lib/portfolio";

export function createHoldingsMap(holdings: Holding[]): Map<string, Holding> {
  const map = new Map<string, Holding>();
  for (const holding of holdings) {
    map.set(holding.id, holding);
  }
  return map;
}

export function getHoldingById(map: Map<string, Holding>, holdingId: string): Holding | null {
  return map.get(holdingId) ?? null;
}
