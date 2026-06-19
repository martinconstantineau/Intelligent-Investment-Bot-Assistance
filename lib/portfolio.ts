export type AssetType = "stock" | "crypto";
export type RiskLevel = "low" | "medium" | "high" | "very_high";
export type TimeHorizon = "short_term" | "medium_term" | "long_term";
export type WatchStatus = "active" | "watch" | "review" | "exit_candidate";

export type Holding = {
  id: string;
  userId?: string;
  name: string;
  symbol: string;
  assetType: AssetType;
  quantity: number | null;
  costBasis: number | null;
  purchaseDate: string | null;
  thesis: string | null;
  riskLevel: RiskLevel | null;
  timeHorizon: TimeHorizon | null;
  watchStatus: WatchStatus | null;
  createdAt?: string;
  updatedAt?: string;
};

export const canonicalHoldings: Holding[] = [
  {
    id: "amd",
    name: "Advanced Micro Devices",
    symbol: "AMD",
    assetType: "stock",
    quantity: null,
    costBasis: null,
    purchaseDate: null,
    thesis: null,
    riskLevel: null,
    timeHorizon: null,
    watchStatus: "active"
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    assetType: "crypto",
    quantity: null,
    costBasis: null,
    purchaseDate: null,
    thesis: null,
    riskLevel: null,
    timeHorizon: null,
    watchStatus: "active"
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    assetType: "crypto",
    quantity: null,
    costBasis: null,
    purchaseDate: null,
    thesis: null,
    riskLevel: null,
    timeHorizon: null,
    watchStatus: "active"
  },
  {
    id: "sandisk",
    name: "SanDisk",
    symbol: "SNDK",
    assetType: "stock",
    quantity: null,
    costBasis: null,
    purchaseDate: null,
    thesis: null,
    riskLevel: null,
    timeHorizon: null,
    watchStatus: "active"
  },
  {
    id: "amat",
    name: "Applied Materials",
    symbol: "AMAT",
    assetType: "stock",
    quantity: null,
    costBasis: null,
    purchaseDate: null,
    thesis: null,
    riskLevel: null,
    timeHorizon: null,
    watchStatus: "active"
  },
  {
    id: "asts",
    name: "AST SpaceMobile",
    symbol: "ASTS",
    assetType: "stock",
    quantity: null,
    costBasis: null,
    purchaseDate: null,
    thesis: null,
    riskLevel: null,
    timeHorizon: null,
    watchStatus: "active"
  },
  {
    id: "qbts",
    name: "Quantum Computing Inc.",
    symbol: "QUBT",
    assetType: "stock",
    quantity: null,
    costBasis: null,
    purchaseDate: null,
    thesis: null,
    riskLevel: null,
    timeHorizon: null,
    watchStatus: "active"
  },
  {
    id: "arm",
    name: "Arm Holdings",
    symbol: "ARM",
    assetType: "stock",
    quantity: null,
    costBasis: null,
    purchaseDate: null,
    thesis: null,
    riskLevel: null,
    timeHorizon: null,
    watchStatus: "active"
  }
];

export const portfolioDisclaimer =
  "This tool is for informational and research purposes only. It does not provide financial, investment, legal, tax, or professional advice.";
