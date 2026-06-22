import { createClient } from "@supabase/supabase-js";
import { reports, theses } from "@/lib/mock-data";

function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false
    }
  });
}

export async function getDashboardHoldings() {
  const client = createServerClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("holdings")
    .select("symbol,name,asset_type,quantity,average_cost")
    .order("symbol", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((item, index) => ({
    symbol: item.symbol,
    name: item.name ?? item.symbol,
    assetType: item.asset_type === "crypto" ? "Crypto" : item.asset_type === "etf" ? "ETF" : "Stock",
    quantity: Number(item.quantity),
    averageCost: Number(item.average_cost),
    currentPrice: Number(item.average_cost),
    allocation: [32, 28, 18, 12, 10][index] ?? 0
  }));
}

export async function getDashboardTheses() {
  const client = createServerClient();

  if (!client) {
    return theses;
  }

  const { data, error } = await client
    .from("investment_theses")
    .select("symbol,bull_case,bear_case,thesis_break_conditions,confidence_score,last_reviewed_at")
    .order("symbol", { ascending: true });

  if (error || !data) {
    return theses;
  }

  return data.map((item) => ({
    symbol: item.symbol,
    bullCase: item.bull_case,
    bearCase: item.bear_case,
    breakCondition: item.thesis_break_conditions,
    confidence: item.confidence_score,
    lastReviewed: item.last_reviewed_at ? item.last_reviewed_at.slice(0, 10) : "Not reviewed"
  }));
}

export async function getDashboardReports() {
  const client = createServerClient();

  if (!client) {
    return reports;
  }

  const { data, error } = await client
    .from("ai_reports")
    .select("symbol,report_type,summary,thesis_impact,risk_level,suggested_action,created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) {
    return reports;
  }

  return data.map((item) => ({
    symbol: item.symbol ?? "Portfolio",
    type: item.report_type,
    summary: item.summary,
    impact: item.thesis_impact === "bullish" ? "Bullish" : item.thesis_impact === "bearish" ? "Bearish" : "Neutral",
    risk: item.risk_level === "high" ? "High" : item.risk_level === "low" ? "Low" : "Medium",
    action:
      item.suggested_action === "accumulate"
        ? "Accumulate"
        : item.suggested_action === "reduce"
          ? "Reduce"
          : item.suggested_action === "monitor"
            ? "Monitor"
            : "Hold",
    date: item.created_at ? item.created_at.slice(0, 10) : ""
  }));
}
