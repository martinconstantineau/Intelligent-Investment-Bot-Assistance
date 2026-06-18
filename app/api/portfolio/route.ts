import { NextResponse } from "next/server";
import { getDashboardHoldings } from "@/lib/database-data";

export async function GET() {
  const holdings = await getDashboardHoldings();

  return NextResponse.json({ holdings });
}
