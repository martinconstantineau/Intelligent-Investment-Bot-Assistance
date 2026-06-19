import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./admin";
import { canonicalHoldings, type Holding } from "../portfolio";

const holdingsPath = (userId: string) => adminDb.collection("users").doc(userId).collection("holdings");

export async function listHoldings(userId: string): Promise<Holding[]> {
  const snapshot = await holdingsPath(userId).orderBy("createdAt", "asc").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<Holding, "id">;

    return {
      ...data,
      id: doc.id
    };
  });
}

export async function seedCanonicalHoldings(userId: string): Promise<void> {
  const batch = adminDb.batch();
  const userRef = adminDb.collection("users").doc(userId);

  batch.set(
    userRef,
    {
      initializedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  canonicalHoldings.forEach((holding) => {
    const ref = holdingsPath(userId).doc(holding.id);

    batch.set(
      ref,
      {
        ...holding,
        userId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  });

  await batch.commit();
}
