import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/yahoo-finance";
import { searchKrStocks } from "@/lib/kr-stocks-db";
import type { SearchResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length < 1) {
    return NextResponse.json([]);
  }

  // Search local Korean stocks DB first (supports Korean names)
  const krResults = searchKrStocks(q).map((s): SearchResult => ({
    symbol: `${s.code}.${s.market}`,
    name: s.name,
    exchange: s.market === "KS" ? "KOSPI" : "KOSDAQ",
    type: "EQUITY",
  }));

  // Also search Yahoo Finance (supports English names/tickers)
  let yfResults: SearchResult[] = [];
  try {
    yfResults = await searchStocks(q);
  } catch {
    // ignore
  }

  // Merge: Korean DB first, then Yahoo results (deduped)
  const seenSymbols = new Set(krResults.map((r) => r.symbol));
  const merged = [...krResults];
  for (const r of yfResults) {
    if (!seenSymbols.has(r.symbol)) {
      seenSymbols.add(r.symbol);
      merged.push(r);
    }
  }

  return NextResponse.json(merged.slice(0, 15));
}
