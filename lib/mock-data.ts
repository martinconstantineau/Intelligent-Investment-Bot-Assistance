export type Holding = {
  symbol: string;
  name: string;
  assetType: "Stock" | "Crypto" | "ETF";
  quantity: number;
  averageCost: number;
  currentPrice: number;
  allocation: number;
};

export type Thesis = {
  symbol: string;
  bullCase: string;
  bearCase: string;
  breakCondition: string;
  confidence: number;
  lastReviewed: string;
};

export type ResearchReport = {
  symbol: string;
  type: string;
  summary: string;
  impact: "Bullish" | "Neutral" | "Bearish";
  risk: "Low" | "Medium" | "High";
  action: "Accumulate" | "Hold" | "Monitor" | "Reduce";
  date: string;
};

export const holdings: Holding[] = [
  { symbol: "AMD", name: "Advanced Micro Devices", assetType: "Stock", quantity: 15, averageCost: 142.5, currentPrice: 164.2, allocation: 32 },
  { symbol: "ETH", name: "Ethereum", assetType: "Crypto", quantity: 1.8, averageCost: 2850, currentPrice: 3450, allocation: 28 },
  { symbol: "SOL", name: "Solana", assetType: "Crypto", quantity: 25, averageCost: 132, currentPrice: 158, allocation: 18 },
  { symbol: "ARM", name: "Arm Holdings", assetType: "Stock", quantity: 8, averageCost: 118, currentPrice: 126, allocation: 12 },
  { symbol: "AMAT", name: "Applied Materials", assetType: "Stock", quantity: 5, averageCost: 204, currentPrice: 218, allocation: 10 }
];

export const theses: Thesis[] = [
  {
    symbol: "AMD",
    bullCase: "AI accelerator adoption, data centre growth, and server CPU share gains remain the core long-term thesis.",
    bearCase: "Nvidia dominance, execution risk, and margin pressure could limit upside.",
    breakCondition: "Data centre growth materially slows or MI-series adoption fails to scale.",
    confidence: 8,
    lastReviewed: "2026-06-18"
  },
  {
    symbol: "ETH",
    bullCase: "Ethereum remains core infrastructure for settlement, DeFi, tokenization, and layer-two ecosystems.",
    bearCase: "Fee pressure, regulatory risk, and alternative chains could reduce value capture.",
    breakCondition: "Developer activity and settlement demand materially deteriorate.",
    confidence: 7,
    lastReviewed: "2026-06-18"
  }
];

export const reports: ResearchReport[] = [
  {
    symbol: "AMD",
    type: "Thesis Review",
    summary: "No thesis break identified. Market weakness appears sector-driven rather than company-specific.",
    impact: "Neutral",
    risk: "Medium",
    action: "Hold",
    date: "2026-06-18"
  },
  {
    symbol: "SOL",
    type: "Risk Review",
    summary: "Volatility remains elevated. Position sizing should be monitored against crypto allocation limits.",
    impact: "Neutral",
    risk: "High",
    action: "Monitor",
    date: "2026-06-18"
  }
];

export const allocationData = holdings.map((holding) => ({
  name: holding.symbol,
  value: holding.allocation
}));
