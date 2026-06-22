import { createClient } from "./client";
import type { Holding } from "@/lib/portfolio";
import type { ResearchNote } from "./research-notes";
import type { DecisionJournalEntry } from "./decision-journal";
import type { ThesisReview } from "./thesis-reviews";
import { type HoldingRow, fromRow as holdingFromRow } from "./holdings";
import { type ResearchNoteRow, fromRow as noteFromRow } from "./research-notes";
import { type DecisionJournalRow, fromRow as journalFromRow } from "./decision-journal";
import { type ThesisReviewRow, fromRow as reviewFromRow } from "./thesis-reviews";

/**
 * Fixes Issue #1 & #4: N+1 Query Pattern
 * Loads all dashboard data in a single batch instead of 3 separate queries
 */
export type DashboardData = {
  holdings: Holding[];
  researchNotes: ResearchNote[];
  journalEntries: DecisionJournalEntry[];
  thesisReviews: ThesisReview[];
};

export async function loadDashboardData(userId: string): Promise<DashboardData> {
  const supabase = createClient();

  // Batch load all data in parallel
  const [holdingsResult, notesResult, journalResult, reviewsResult] = await Promise.all([
    supabase.from("holdings").select("*").eq("user_id", userId).order("symbol", { ascending: true }),
    supabase.from("research_notes").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("decision_journal_entries").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("thesis_reviews").select("*").eq("user_id", userId).order("created_at", { ascending: false })
  ]);

  const errors = [holdingsResult.error, notesResult.error, journalResult.error, reviewsResult.error].filter(Boolean);
  if (errors.length > 0) throw errors[0];

  return {
    holdings: ((holdingsResult.data ?? []) as HoldingRow[]).map(holdingFromRow),
    researchNotes: ((notesResult.data ?? []) as ResearchNoteRow[]).map(noteFromRow),
    journalEntries: ((journalResult.data ?? []) as DecisionJournalRow[]).map(journalFromRow),
    thesisReviews: ((reviewsResult.data ?? []) as ThesisReviewRow[]).map(reviewFromRow)
  };
}
