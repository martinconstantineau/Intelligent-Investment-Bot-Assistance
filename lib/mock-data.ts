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

export const theses: Thesis[] = [];
export const reports: ResearchReport[] = [];
