import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();

export const dailyPortfolioReportPlaceholder = onSchedule("every day 08:00", async () => {
  const db = getFirestore();

  await db.collection("systemJobs").doc("dailyPortfolioReportPlaceholder").set(
    {
      status: "placeholder_only",
      message: "Daily portfolio reports are not active yet. Add market data and AI provider configuration before enabling report generation.",
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
});
