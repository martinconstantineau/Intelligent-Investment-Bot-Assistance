import { canonicalHoldings, type Holding } from "@/lib/portfolio";
import { createClient } from "./client";

export type HoldingCreateInput = Omit<Holding, "id" | "userId" | "createdAt" | "updatedAt">;
export type HoldingUpdateInput = Partial<Omit<Holding, "id" | "userId" | "createdAt" | "updatedAt">>;

export type HoldingRow = {
  id: string;
  user_id: string;
  canonical_key: string | null;
  name: string;
  symbol: string;
  asset_type: Holding["assetType"];
  quantity: number | null;
  cost_basis: number | null;
  purchase_date: string | null;
  thesis: string | null;
  risk_level: Holding["riskLevel"];
  time_horizon: Holding["timeHorizon"];
  watch_status: Holding["watchStatus"];
  created_at: string;
  updated_at: string;
};

export function fromRow(row: HoldingRow): Holding {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    symbol: row.symbol,
    assetType: row.asset_type,
    quantity: row.quantity,
    costBasis: row.cost_basis,
    purchaseDate: row.purchase_date,
    thesis: row.thesis,
    riskLevel: row.risk_level,
    timeHorizon: row.time_horizon,
    watchStatus: row.watch_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toInsert(userId: string, holding: HoldingCreateInput, canonicalKey?: string) {
  return {
    user_id: userId,
    canonical_key: canonicalKey ?? null,
    name: holding.name,
    symbol: holding.symbol,
    asset_type: holding.assetType,
    quantity: holding.quantity,
    cost_basis: holding.costBasis,
    purchase_date: holding.purchaseDate,
    thesis: holding.thesis,
    risk_level: holding.riskLevel,
    time_horizon: holding.timeHorizon,
    watch_status: holding.watchStatus
  };
}

function toUpdate(updates: HoldingUpdateInput) {
  return {
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.symbol !== undefined ? { symbol: updates.symbol } : {}),
    ...(updates.assetType !== undefined ? { asset_type: updates.assetType } : {}),
    ...(updates.quantity !== undefined ? { quantity: updates.quantity } : {}),
    ...(updates.costBasis !== undefined ? { cost_basis: updates.costBasis } : {}),
    ...(updates.purchaseDate !== undefined ? { purchase_date: updates.purchaseDate } : {}),
    ...(updates.thesis !== undefined ? { thesis: updates.thesis } : {}),
    ...(updates.riskLevel !== undefined ? { risk_level: updates.riskLevel } : {}),
    ...(updates.timeHorizon !== undefined ? { time_horizon: updates.timeHorizon } : {}),
    ...(updates.watchStatus !== undefined ? { watch_status: updates.watchStatus } : {})
  };
}

async function loadHoldings(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("holdings").select("*").eq("user_id", userId).order("symbol", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as HoldingRow[]).map(fromRow);
}

export async function initializeCanonicalHoldingsIfEmpty(userId: string) {
  const supabase = createClient();
  const { count, error: countError } = await supabase.from("holdings").select("id", { count: "exact", head: true }).eq("user_id", userId);

  if (countError) throw countError;
  if ((count ?? 0) > 0) return;

  const rows = canonicalHoldings.map((holding) => toInsert(userId, holding, holding.id));
  const { error } = await supabase.from("holdings").upsert(rows, { onConflict: "user_id,canonical_key" });

  if (error) throw error;
}

export async function createHolding(userId: string, holding: HoldingCreateInput) {
  const supabase = createClient();
  const { error } = await supabase.from("holdings").insert(toInsert(userId, holding));

  if (error) throw error;
}

export async function updateHolding(userId: string, holdingId: string, updates: HoldingUpdateInput) {
  const supabase = createClient();
  const { error } = await supabase.from("holdings").update(toUpdate(updates)).eq("id", holdingId).eq("user_id", userId);

  if (error) throw error;
}

export function listenToHoldings(userId: string, onChange: (holdings: Holding[]) => void, onError: (message: string) => void) {
  const supabase = createClient();

  async function refresh() {
    try {
      onChange(await loadHoldings(userId));
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unable to load holdings.");
    }
  }

  refresh();

  const channel = supabase
    .channel(`holdings:${userId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "holdings", filter: `user_id=eq.${userId}` }, refresh)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
