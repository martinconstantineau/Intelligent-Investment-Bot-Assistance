import type { RiskLevel } from "@/lib/portfolio";
import { createClient } from "./client";

export type DecisionType =
  | "buy_consideration"
  | "hold"
  | "add"
  | "trim"
  | "sell_consideration"
  | "watch"
  | "thesis_update"
  | "risk_review";

export type DecisionJournalEntry = {
  id: string;
  userId?: string;
  holdingId: string | null;
  symbol: string | null;
  decisionType: DecisionType;
  title: string;
  reasoning: string;
  confidence: number | null;
  riskLevel: RiskLevel | null;
  thesisSnapshot: string | null;
  outcome: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DecisionJournalCreateInput = Omit<DecisionJournalEntry, "id" | "userId" | "createdAt" | "updatedAt">;
export type DecisionJournalUpdateInput = Partial<DecisionJournalCreateInput>;

export type DecisionJournalRow = {
  id: string;
  user_id: string;
  holding_id: string | null;
  symbol: string | null;
  decision_type: DecisionType;
  title: string;
  reasoning: string;
  confidence: number | null;
  risk_level: RiskLevel | null;
  thesis_snapshot: string | null;
  outcome: string | null;
  created_at: string;
  updated_at: string;
};

export function fromRow(row: DecisionJournalRow): DecisionJournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    holdingId: row.holding_id,
    symbol: row.symbol,
    decisionType: row.decision_type,
    title: row.title,
    reasoning: row.reasoning,
    confidence: row.confidence,
    riskLevel: row.risk_level,
    thesisSnapshot: row.thesis_snapshot,
    outcome: row.outcome,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toInsert(userId: string, entry: DecisionJournalCreateInput) {
  return {
    user_id: userId,
    holding_id: entry.holdingId,
    symbol: entry.symbol,
    decision_type: entry.decisionType,
    title: entry.title,
    reasoning: entry.reasoning,
    confidence: entry.confidence,
    risk_level: entry.riskLevel,
    thesis_snapshot: entry.thesisSnapshot,
    outcome: entry.outcome
  };
}

function toUpdate(updates: DecisionJournalUpdateInput) {
  return {
    ...(updates.holdingId !== undefined ? { holding_id: updates.holdingId } : {}),
    ...(updates.symbol !== undefined ? { symbol: updates.symbol } : {}),
    ...(updates.decisionType !== undefined ? { decision_type: updates.decisionType } : {}),
    ...(updates.title !== undefined ? { title: updates.title } : {}),
    ...(updates.reasoning !== undefined ? { reasoning: updates.reasoning } : {}),
    ...(updates.confidence !== undefined ? { confidence: updates.confidence } : {}),
    ...(updates.riskLevel !== undefined ? { risk_level: updates.riskLevel } : {}),
    ...(updates.thesisSnapshot !== undefined ? { thesis_snapshot: updates.thesisSnapshot } : {}),
    ...(updates.outcome !== undefined ? { outcome: updates.outcome } : {})
  };
}

async function loadDecisionJournalEntries(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("decision_journal_entries").select("*").eq("user_id", userId).order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as DecisionJournalRow[]).map(fromRow);
}

export async function createDecisionJournalEntry(userId: string, entry: DecisionJournalCreateInput) {
  const supabase = createClient();
  const { error } = await supabase.from("decision_journal_entries").insert(toInsert(userId, entry));

  if (error) throw error;
}

export async function updateDecisionJournalEntry(userId: string, entryId: string, updates: DecisionJournalUpdateInput) {
  const supabase = createClient();
  const { error } = await supabase.from("decision_journal_entries").update(toUpdate(updates)).eq("id", entryId).eq("user_id", userId);

  if (error) throw error;
}

export function listenToDecisionJournalEntries(
  userId: string,
  onChange: (entries: DecisionJournalEntry[]) => void,
  onError: (message: string) => void
) {
  const supabase = createClient();

  async function refresh() {
    try {
      onChange(await loadDecisionJournalEntries(userId));
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unable to load decision journal.");
    }
  }

  void refresh();

  const channel = supabase
    .channel(`decision-journal:${userId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "decision_journal_entries", filter: `user_id=eq.${userId}` }, refresh)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
