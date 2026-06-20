import { collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { canonicalHoldings, type Holding } from "@/lib/portfolio";
import { firestore } from "./client";

export type HoldingCreateInput = Omit<Holding, "id" | "userId" | "createdAt" | "updatedAt">;
export type HoldingUpdateInput = Partial<Omit<Holding, "id" | "userId" | "createdAt" | "updatedAt">>;

function holdingsCollection(userId: string) {
  return collection(firestore, "users", userId, "holdings");
}

function holdingDocument(userId: string, holdingId: string) {
  return doc(firestore, "users", userId, "holdings", holdingId);
}

export async function initializeCanonicalHoldingsIfEmpty(userId: string) {
  const holdingsRef = holdingsCollection(userId);
  const existing = await getDocs(holdingsRef);

  if (!existing.empty) {
    return;
  }

  const batch = writeBatch(firestore);

  canonicalHoldings.forEach((holding) => {
    const holdingRef = doc(holdingsRef, holding.id);

    batch.set(holdingRef, {
      ...holding,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  await batch.commit();
}

export async function createHolding(userId: string, holding: HoldingCreateInput) {
  const holdingRef = doc(holdingsCollection(userId));

  await setDoc(holdingRef, {
    ...holding,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateHolding(userId: string, holdingId: string, updates: HoldingUpdateInput) {
  await updateDoc(holdingDocument(userId, holdingId), {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export function listenToHoldings(userId: string, onChange: (holdings: Holding[]) => void, onError: (message: string) => void) {
  const holdingsQuery = query(holdingsCollection(userId), orderBy("symbol", "asc"));

  return onSnapshot(
    holdingsQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((snapshotDoc) => {
          const data = snapshotDoc.data() as Omit<Holding, "id">;

          return {
            ...data,
            id: snapshotDoc.id,
            createdAt: undefined,
            updatedAt: undefined
          };
        })
      );
    },
    (error) => {
      onError(error.message);
    }
  );
}
