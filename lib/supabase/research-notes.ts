import { createClient } from "./client";

export type SourceType = "article" | "earnings" | "filing" | "press_release" | "analyst_note" | "podcast" | "video" | "personal_note" | "other";
export type ThesisImpact = "bullish" | "neutral" | "bearish" | "mixed";
export type RiskImpact = "lower" | "unchanged" | "higher";

export type ResearchNote = {
  id: string;
  userId?: string;
  holdingId: string | null;
  symbol: string | null;
  title: string;
  sourceType: SourceType;
  sourceUrl: string | null;
  summary: string;
  thesisImpact: ThesisImpact | null;
  riskImpact: RiskImpact | null;
  tags: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ResearchNoteCreateInput = Omit<ResearchNote, "id" | "userId" | "createdAt" | "updatedAt">;
export type ResearchNoteUpdateInput = Partial<ResearchNoteCreateInput>;

export type ResearchNoteRow = {
  id: string;
  user_id: string;
  holding_id: string | null;
  symbol: string | null;
  title: string;
  source_type: SourceType;
  source_url: string | null;
  summary: string;
  thesis_impact: ThesisImpact | null;
  risk_impact: RiskImpact | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export function fromRow(row: ResearchNoteRow): ResearchNote {
  return {
    id: row.id,
    userId: row.user_id,
    holdingId: row.holding_id,
    symbol: row.symbol,
    title: row.title,
    sourceType: row.source_type,
    sourceUrl: row.source_url,
    summary: row.summary,
    thesisImpact: row.thesis_impact,
    riskImpact: row.risk_impact,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toInsert(userId: string, note: ResearchNoteCreateInput) {
  return {
    user_id: userId,
    holding_id: note.holdingId,
    symbol: note.symbol,
    title: note.title,
    source_type: note.sourceType,
    source_url: note.sourceUrl,
    summary: note.summary,
    thesis_impact: note.thesisImpact,
    risk_impact: note.riskImpact,
    tags: note.tags
  };
}

function toUpdate(updates: ResearchNoteUpdateInput) {
  return {
    ...(updates.holdingId !== undefined ? { holding_id: updates.holdingId } : {}),
    ...(updates.symbol !== undefined ? { symbol: updates.symbol } : {}),
    ...(updates.title !== undefined ? { title: updates.title } : {}),
    ...(updates.sourceType !== undefined ? { source_type: updates.sourceType } : {}),
    ...(updates.sourceUrl !== undefined ? { source_url: updates.sourceUrl } : {}),
    ...(updates.summary !== undefined ? { summary: updates.summary } : {}),
    ...(updates.thesisImpact !== undefined ? { thesis_impact: updates.thesisImpact } : {}),
    ...(updates.riskImpact !== undefined ? { risk_impact: updates.riskImpact } : {}),
    ...(updates.tags !== undefined ? { tags: updates.tags } : {})
  };
}

async function loadResearchNotes(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("research_notes").select("*").eq("user_id", userId).order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ResearchNoteRow[]).map(fromRow);
}

export async function createResearchNote(userId: string, note: ResearchNoteCreateInput) {
  const supabase = createClient();
  const { error } = await supabase.from("research_notes").insert(toInsert(userId, note));

  if (error) throw error;
}

export async function updateResearchNote(userId: string, noteId: string, updates: ResearchNoteUpdateInput) {
  const supabase = createClient();
  const { error } = await supabase.from("research_notes").update(toUpdate(updates)).eq("id", noteId).eq("user_id", userId);

  if (error) throw error;
}

export function listenToResearchNotes(userId: string, onChange: (notes: ResearchNote[]) => void, onError: (message: string) => void) {
  const supabase = createClient();

  async function refresh() {
    try {
      onChange(await loadResearchNotes(userId));
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unable to load research notes.");
    }
  }

  refresh();

  const channel = supabase
    .channel(`research-notes:${userId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "research_notes", filter: `user_id=eq.${userId}` }, refresh)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
