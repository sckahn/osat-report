import { NextRequest, NextResponse } from "next/server";
import { fetchQuotes, fetchPriceHistory } from "@/lib/yahoo-finance";
import { fetchKrNews } from "@/lib/kr-news-fetcher";

const DEFAULT_KR_TICKERS = [
  "005930.KS", // 삼성전자
  "000660.KS", // SK하이닉스
  "042700.KS", // 한미반도체
  "058470.KS", // 리노공업
  "166090.KS", // 하나머티리얼즈
  "036930.KS", // 주성엔지니어링
  "403870.KS", // HPSP
  "217190.KQ", // 제너셈
  "404950.KQ", // 에이팩트
  "357780.KQ", // 솔브레인
];

const KR_NAME_MAP: Record<string, string> = {
  "005930.KS": "삼성전자",
  "000660.KS": "SK하이닉스",
  "042700.KS": "한미반도체",
  "058470.KS": "리노공업",
  "166090.KS": "하나머티리얼즈",
  "036930.KS": "주성엔지니어링",
  "403870.KS": "HPSP",
  "217190.KQ": "제너셈",
  "404950.KQ": "에이팩트",
  "357780.KQ": "솔브레인",
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "all";
  const ticker = searchParams.get("ticker");
  const customParam = searchParams.get("custom");

  if (type === "price-history" && ticker) {
    try {
      const history = await fetchPriceHistory(ticker);
      return NextResponse.json(history);
    } catch {
      return NextResponse.json([]);
    }
  }

  if (type === "news") {
    try {
      const news = await fetchKrNews();
      return NextResponse.json(news);
    } catch {
      return NextResponse.json([]);
    }
  }

  // Stocks
  let tickers = DEFAULT_KR_TICKERS;
  let customNames: Record<string, string> = { ...KR_NAME_MAP };

  if (customParam) {
    try {
      const parsed = JSON.parse(decodeURIComponent(customParam));
      tickers = parsed.map((c: { ticker: string }) => c.ticker);
      for (const c of parsed) {
        customNames[c.ticker] = c.nameKr || c.name || c.ticker;
      }
    } catch {
      // ignore
    }
  }

  try {
    const analyses = await fetchQuotes(tickers);
    // Apply Korean names
    for (const a of analyses) {
      if (customNames[a.ticker]) {
        a.nameKr = customNames[a.ticker];
      }
    }
    if (ticker) {
      const stock = analyses.find((a) => a.ticker === ticker);
      return NextResponse.json(stock || analyses[0]);
    }
    return NextResponse.json(analyses);
  } catch (e) {
    console.error("KR stocks error:", e);
    return NextResponse.json([]);
  }
}
