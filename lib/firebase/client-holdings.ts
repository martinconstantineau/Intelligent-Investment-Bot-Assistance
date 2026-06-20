import { collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, writeBatch } from "firebase/firestore";
import { canonicalHoldings, type Holding } from "@/lib/portfolio";
import { firestore } from "./client";

function holdingsCollection(userId: string) {
  return collection(firestore, "users", userId, "holdings");
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
