import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import type { RiskLevel } from "@/lib/portfolio";
import { firestore } from "./client";

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
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type DecisionJournalCreateInput = Omit<DecisionJournalEntry, "id" | "userId" | "createdAt" | "updatedAt">;
export type DecisionJournalUpdateInput = Partial<DecisionJournalCreateInput>;

function decisionJournalCollection(userId: string) {
  return collection(firestore, "users", userId, "decisionJournal");
}

function decisionJournalDocument(userId: string, entryId: string) {
  return doc(firestore, "users", userId, "decisionJournal", entryId);
}

export async function createDecisionJournalEntry(userId: string, entry: DecisionJournalCreateInput) {
  const entryRef = doc(decisionJournalCollection(userId));

  await setDoc(entryRef, {
    ...entry,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateDecisionJournalEntry(userId: string, entryId: string, updates: DecisionJournalUpdateInput) {
  await updateDoc(decisionJournalDocument(userId, entryId), {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export function listenToDecisionJournalEntries(
  userId: string,
  onChange: (entries: DecisionJournalEntry[]) => void,
  onError: (message: string) => void
) {
  const journalQuery = query(decisionJournalCollection(userId), orderBy("createdAt", "desc"));

  return onSnapshot(
    journalQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((snapshotDoc) => {
          const data = snapshotDoc.data() as Omit<DecisionJournalEntry, "id">;

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
