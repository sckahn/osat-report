import { NextRequest, NextResponse } from "next/server";
import { fetchOsatNews } from "@/lib/news-fetcher";
import { fetchKrNews } from "@/lib/kr-news-fetcher";
import { fetchQuotes } from "@/lib/yahoo-finance";
import { generateNews, generateMarketOverview, generateOsatIndexHistory } from "@/lib/mock-data";
import type { OsatNews } from "@/lib/types";

const OSAT_TICKERS = ["ASX", "AMKR", "TSM", "NVDA", "AMD", "INTC"];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const type = searchParams.get("type") || "all";

  if (type === "news") {
    // Fetch both Korean and English news
    try {
      const [krNews, enNews] = await Promise.all([
        fetchKrNews().catch(() => [] as OsatNews[]),
        fetchOsatNews().catch(() => [] as OsatNews[]),
      ]);
      // Merge, dedupe by title, sort by date
      const seenTitles = new Set<string>();
      const merged: OsatNews[] = [];
      for (const n of [...krNews, ...enNews]) {
        if (seenTitles.has(n.title)) continue;
        seenTitles.add(n.title);
        merged.push(n);
      }
      merged.sort((a, b) => b.date.localeCompare(a.date));
      if (merged.length > 0) return NextResponse.json(merged.slice(0, 40));
    } catch (e) {
      console.error("News fallback to mock:", e);
    }
    return NextResponse.json(generateNews(date));
  }

  if (type === "overview") {
    try {
      const quotes = await fetchQuotes(OSAT_TICKERS);
      if (quotes.length > 0) {
        // Build real sector performance
        const sectors = new Map<string, { totalChange: number; count: number; volume: number }>();
        const sectorMap: Record<string, string> = {
          ASX: "OSAT", AMKR: "OSAT", TSM: "Foundry",
          NVDA: "Fabless", AMD: "Fabless", INTC: "IDM",
        };

        for (const q of quotes) {
          const sector = sectorMap[q.ticker] || "Other";
          const existing = sectors.get(sector) || { totalChange: 0, count: 0, volume: 0 };
          existing.totalChange += q.changePercent;
          existing.count += 1;
          sectors.set(sector, existing);
        }

        // OSAT index = average of OSAT stocks price
        const osatStocks = quotes.filter((q) => sectorMap[q.ticker] === "OSAT");
        const osatIndex = osatStocks.reduce((sum, q) => sum + q.price, 0) / (osatStocks.length || 1);
        const osatIndexChange = osatStocks.reduce((sum, q) => sum + q.changePercent, 0) / (osatStocks.length || 1);

        return NextResponse.json({
          date,
          osatIndex: osatIndex * 10, // Scale for display
          osatIndexChange,
          topMovers: quotes.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 5),
          sectorPerformance: Array.from(sectors.entries()).map(([sector, data]) => ({
            sector,
            change: data.totalChange / data.count,
            volume: data.volume,
          })),
        });
      }
    } catch (e) {
      console.error("Overview fallback to mock:", e);
    }
    return NextResponse.json(generateMarketOverview(date));
  }

  if (type === "index-history") {
    // Try to build from real price history
    try {
      const { fetchPriceHistory } = await import("@/lib/yahoo-finance");
      const [asxHistory, amkrHistory] = await Promise.all([
        fetchPriceHistory("ASX"),
        fetchPriceHistory("AMKR"),
      ]);

      if (asxHistory.length > 0 && amkrHistory.length > 0) {
        const indexHistory = asxHistory.map((asx, i) => {
          const amkr = amkrHistory[i];
          const value = ((asx.close + (amkr?.close || 0)) / 2) * 10;
          return { date: asx.date, value: Math.round(value * 100) / 100 };
        });
        return NextResponse.json(indexHistory);
      }
    } catch (e) {
      console.error("Index history fallback to mock:", e);
    }
    return NextResponse.json(generateOsatIndexHistory());
  }

  // type === "all"
  try {
    const [news, overview] = await Promise.all([
      (async () => {
        const [kr, en] = await Promise.all([
          fetchKrNews().catch(() => [] as OsatNews[]),
          fetchOsatNews().catch(() => [] as OsatNews[]),
        ]);
        const seen = new Set<string>();
        const merged: OsatNews[] = [];
        for (const n of [...kr, ...en]) { if (!seen.has(n.title)) { seen.add(n.title); merged.push(n); } }
        merged.sort((a, b) => b.date.localeCompare(a.date));
        return merged.length > 0 ? merged.slice(0, 40) : generateNews(date);
      })(),
      (async () => {
        const quotes = await fetchQuotes(OSAT_TICKERS);
        if (quotes.length === 0) return generateMarketOverview(date);
        const osatStocks = quotes.filter((q) => ["ASX", "AMKR"].includes(q.ticker));
        const osatIndex = osatStocks.reduce((sum, q) => sum + q.price, 0) / (osatStocks.length || 1);
        const osatIndexChange = osatStocks.reduce((sum, q) => sum + q.changePercent, 0) / (osatStocks.length || 1);
        return {
          date,
          osatIndex: osatIndex * 10,
          osatIndexChange,
          topMovers: [],
          sectorPerformance: [
            { sector: "OSAT", change: osatIndexChange, volume: 0 },
            { sector: "Foundry", change: quotes.find((q) => q.ticker === "TSM")?.changePercent || 0, volume: 0 },
            { sector: "Fabless", change: ((quotes.find((q) => q.ticker === "NVDA")?.changePercent || 0) + (quotes.find((q) => q.ticker === "AMD")?.changePercent || 0)) / 2, volume: 0 },
            { sector: "IDM", change: quotes.find((q) => q.ticker === "INTC")?.changePercent || 0, volume: 0 },
          ],
        };
      })(),
    ]);

    return NextResponse.json({
      news,
      overview,
      indexHistory: generateOsatIndexHistory(), // will be fetched separately
    });
  } catch (e) {
    console.error("All data fallback to mock:", e);
    return NextResponse.json({
      news: generateNews(date),
      overview: generateMarketOverview(date),
      indexHistory: generateOsatIndexHistory(),
    });
  }
}
