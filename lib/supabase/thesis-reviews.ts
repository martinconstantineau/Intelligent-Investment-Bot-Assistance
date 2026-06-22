import { createClient } from "./client";

export type ThesisStatus = "intact" | "strengthening" | "weakening" | "broken" | "needs_more_data";

export type ThesisReview = {
  id: string;
  userId?: string;
  holdingId: string;
  symbol: string;
  thesisStatus: ThesisStatus;
  summary: string;
  supportingEvidence: string;
  opposingEvidence: string;
  riskAssessment: string;
  watchItems: string;
  nextReviewDate: string | null;
  conviction: number | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ThesisReviewCreateInput = Omit<ThesisReview, "id" | "userId" | "createdAt" | "updatedAt">;
export type ThesisReviewUpdateInput = Partial<ThesisReviewCreateInput>;

type ThesisReviewRow = {
  id: string;
  user_id: string;
  holding_id: string;
  symbol: string;
  thesis_status: ThesisStatus;
  summary: string;
  supporting_evidence: string;
  opposing_evidence: string;
  risk_assessment: string;
  watch_items: string;
  next_review_date: string | null;
  conviction: number | null;
  created_at: string;
  updated_at: string;
};

function fromRow(row: ThesisReviewRow): ThesisReview {
  return {
    id: row.id,
    userId: row.user_id,
    holdingId: row.holding_id,
    symbol: row.symbol,
    thesisStatus: row.thesis_status,
    summary: row.summary,
    supportingEvidence: row.supporting_evidence,
    opposingEvidence: row.opposing_evidence,
    riskAssessment: row.risk_assessment,
    watchItems: row.watch_items,
    nextReviewDate: row.next_review_date,
    conviction: row.conviction,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toInsert(userId: string, review: ThesisReviewCreateInput) {
  return {
    user_id: userId,
    holding_id: review.holdingId,
    symbol: review.symbol,
    thesis_status: review.thesisStatus,
    summary: review.summary,
    supporting_evidence: review.supportingEvidence,
    opposing_evidence: review.opposingEvidence,
    risk_assessment: review.riskAssessment,
    watch_items: review.watchItems,
    next_review_date: review.nextReviewDate,
    conviction: review.conviction
  };
}

function toUpdate(updates: ThesisReviewUpdateInput) {
  return {
    ...(updates.holdingId !== undefined ? { holding_id: updates.holdingId } : {}),
    ...(updates.symbol !== undefined ? { symbol: updates.symbol } : {}),
    ...(updates.thesisStatus !== undefined ? { thesis_status: updates.thesisStatus } : {}),
    ...(updates.summary !== undefined ? { summary: updates.summary } : {}),
    ...(updates.supportingEvidence !== undefined ? { supporting_evidence: updates.supportingEvidence } : {}),
    ...(updates.opposingEvidence !== undefined ? { opposing_evidence: updates.opposingEvidence } : {}),
    ...(updates.riskAssessment !== undefined ? { risk_assessment: updates.riskAssessment } : {}),
    ...(updates.watchItems !== undefined ? { watch_items: updates.watchItems } : {}),
    ...(updates.nextReviewDate !== undefined ? { next_review_date: updates.nextReviewDate } : {}),
    ...(updates.conviction !== undefined ? { conviction: updates.conviction } : {})
  };
}

async function loadThesisReviews(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("thesis_reviews").select("*").eq("user_id", userId).order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ThesisReviewRow[]).map(fromRow);
}

export async function createThesisReview(userId: string, review: ThesisReviewCreateInput) {
  const supabase = createClient();
  const { error } = await supabase.from("thesis_reviews").insert(toInsert(userId, review));

  if (error) throw error;
}

export async function updateThesisReview(userId: string, reviewId: string, updates: ThesisReviewUpdateInput) {
  const supabase = createClient();
  const { error } = await supabase.from("thesis_reviews").update(toUpdate(updates)).eq("id", reviewId).eq("user_id", userId);

  if (error) throw error;
}

export function listenToThesisReviews(userId: string, onChange: (reviews: ThesisReview[]) => void, onError: (message: string) => void) {
  const supabase = createClient();

  async function refresh() {
    try {
      onChange(await loadThesisReviews(userId));
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unable to load thesis reviews.");
    }
  }

  refresh();

  const channel = supabase
    .channel(`thesis-reviews:${userId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "thesis_reviews", filter: `user_id=eq.${userId}` }, refresh)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
