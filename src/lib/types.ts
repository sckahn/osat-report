export interface OsatNews {
  id: string;
  date: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  category: "market" | "earnings" | "technology" | "policy" | "merger";
  sentiment: "positive" | "negative" | "neutral";
  relatedCompanies: string[];
}

export interface StockInfo {
  ticker: string;
  name: string;
  nameKr: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  sector: string;
}

export interface StockAnalysis {
  ticker: string;
  name: string;
  nameKr: string;
  price: number;
  change: number;
  changePercent: number;
  reasons: AnalysisReason[];
  signal: "buy" | "sell" | "hold";
  signalStrength: number; // 0-100
  technicals: TechnicalIndicators;
}

export interface AnalysisReason {
  type: "earnings" | "news" | "sector" | "technical" | "macro";
  title: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
}

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  ma20: number;
  ma50: number;
  ma200: number;
  bollingerUpper: number;
  bollingerLower: number;
  supportLevel: number;
  resistanceLevel: number;
}

export interface MarketOverview {
  date: string;
  osatIndex: number;
  osatIndexChange: number;
  topMovers: StockInfo[];
  sectorPerformance: SectorPerformance[];
}

export interface SectorPerformance {
  sector: string;
  change: number;
  volume: number;
}

export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AnalystData {
  targetMean: number | null;
  targetHigh: number | null;
  targetLow: number | null;
  recommendation: string | null;
  recommendationScore: number | null;
  numberOfAnalysts: number;
  trend: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  } | null;
  upgrades: Array<{
    firm: string;
    toGrade: string;
    fromGrade: string;
    action: string;
    date: string;
  }>;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}
