import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "./client";

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

function thesisReviewsCollection(userId: string) {
  return collection(firestore, "users", userId, "thesisReviews");
}

function thesisReviewDocument(userId: string, reviewId: string) {
  return doc(firestore, "users", userId, "thesisReviews", reviewId);
}

export async function createThesisReview(userId: string, review: ThesisReviewCreateInput) {
  const reviewRef = doc(thesisReviewsCollection(userId));

  await setDoc(reviewRef, {
    ...review,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateThesisReview(userId: string, reviewId: string, updates: ThesisReviewUpdateInput) {
  await updateDoc(thesisReviewDocument(userId, reviewId), {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export function listenToThesisReviews(userId: string, onChange: (reviews: ThesisReview[]) => void, onError: (message: string) => void) {
  const reviewsQuery = query(thesisReviewsCollection(userId), orderBy("createdAt", "desc"));

  return onSnapshot(
    reviewsQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((snapshotDoc) => {
          const data = snapshotDoc.data() as Omit<ThesisReview, "id">;

          return {
            ...data,
            id: snapshotDoc.id
          };
        })
      );
    },
    (error) => {
      onError(error.message);
    }
  );
}
