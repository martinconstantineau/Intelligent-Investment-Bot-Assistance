import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "./client";

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

function researchNotesCollection(userId: string) {
  return collection(firestore, "users", userId, "researchNotes");
}

function researchNoteDocument(userId: string, noteId: string) {
  return doc(firestore, "users", userId, "researchNotes", noteId);
}

export async function createResearchNote(userId: string, note: ResearchNoteCreateInput) {
  const noteRef = doc(researchNotesCollection(userId));

  await setDoc(noteRef, {
    ...note,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateResearchNote(userId: string, noteId: string, updates: ResearchNoteUpdateInput) {
  await updateDoc(researchNoteDocument(userId, noteId), {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export function listenToResearchNotes(userId: string, onChange: (notes: ResearchNote[]) => void, onError: (message: string) => void) {
  const notesQuery = query(researchNotesCollection(userId), orderBy("createdAt", "desc"));

  return onSnapshot(
    notesQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((snapshotDoc) => {
          const data = snapshotDoc.data() as Omit<ResearchNote, "id">;

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
