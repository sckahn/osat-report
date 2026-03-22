import { NextRequest, NextResponse } from "next/server";
import { fetchQuotes, fetchPriceHistory } from "@/lib/yahoo-finance";
import { generateStockAnalyses, generatePriceHistory as mockPriceHistory } from "@/lib/mock-data";
import type { CustomCompany } from "@/lib/mock-data";

const DEFAULT_TICKERS = ["ASX", "AMKR", "TSM", "NVDA", "AMD", "INTC"];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const ticker = searchParams.get("ticker");
  const type = searchParams.get("type") || "analyses";
  const customParam = searchParams.get("custom");

  // Price history for a single ticker
  if (type === "price-history" && ticker) {
    try {
      const history = await fetchPriceHistory(ticker);
      if (history.length > 0) return NextResponse.json(history);
    } catch (e) {
      console.error("Price history fallback to mock:", e);
    }
    return NextResponse.json(mockPriceHistory(ticker));
  }

  // Parse custom watchlist or use defaults
  let tickers = DEFAULT_TICKERS;
  let customCompanies: CustomCompany[] | undefined;

  if (customParam) {
    try {
      const parsed: CustomCompany[] = JSON.parse(decodeURIComponent(customParam));
      tickers = parsed.map((c) => c.ticker);
      customCompanies = parsed;
    } catch {
      // ignore
    }
  }

  // Single ticker query
  if (ticker && !customParam) {
    tickers = [ticker];
  }

  // Try real data first
  try {
    const analyses = await fetchQuotes(tickers);
    if (analyses.length > 0) {
      // Merge Korean names from custom companies if available
      if (customCompanies) {
        for (const a of analyses) {
          const custom = customCompanies.find((c) => c.ticker === a.ticker);
          if (custom) {
            a.nameKr = custom.nameKr || a.nameKr;
          }
        }
      }

      if (ticker && !customParam) {
        return NextResponse.json(analyses[0]);
      }
      return NextResponse.json(analyses);
    }
  } catch (e) {
    console.error("Yahoo Finance fallback to mock:", e);
  }

  // Fallback to mock
  const mockData = generateStockAnalyses(date, customCompanies);
  if (ticker) {
    const stock = mockData.find((a) => a.ticker === ticker);
    return stock
      ? NextResponse.json(stock)
      : NextResponse.json(mockData[0] || { error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(mockData);
}
