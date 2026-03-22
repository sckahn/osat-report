import YahooFinance from "yahoo-finance2";
import type { StockAnalysis, PriceHistory, TechnicalIndicators, AnalysisReason, AnalystData, SearchResult } from "./types";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Simple in-memory cache (5min TTL)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

export async function fetchQuotes(tickers: string[]): Promise<StockAnalysis[]> {
  const cacheKey = `quotes:${tickers.join(",")}`;
  const cached = getCached<StockAnalysis[]>(cacheKey);
  if (cached) return cached;

  try {
    const quotes = await yf.quote(tickers);
    const quoteArray = Array.isArray(quotes) ? quotes : [quotes];

    // Fetch chart data for RSI calculation (30 days)
    const analyses = await Promise.all(
      quoteArray.map(async (q) => {
        const chart = await fetchChartForTechnicals(q.symbol);
        const technicals = computeTechnicals(chart, q.regularMarketPrice ?? 0);
        const signal = getSignal(technicals);
        const reasons = generateReasons(q, technicals);

        return {
          ticker: q.symbol,
          name: q.shortName || q.longName || q.symbol,
          nameKr: q.shortName || q.symbol,
          price: q.regularMarketPrice ?? 0,
          change: q.regularMarketChange ?? 0,
          changePercent: q.regularMarketChangePercent ?? 0,
          reasons,
          signal: signal.signal,
          signalStrength: signal.strength,
          technicals,
        } as StockAnalysis;
      })
    );

    setCache(cacheKey, analyses);
    return analyses;
  } catch (error) {
    console.error("Yahoo Finance quote error:", error);
    return [];
  }
}

async function fetchChartForTechnicals(ticker: string): Promise<number[]> {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 250); // 250 days for MA200
    const result = await yf.chart(ticker, {
      period1: start,
      interval: "1d",
    });
    return result.quotes.map((q) => q.close).filter((c): c is number => c != null);
  } catch {
    return [];
  }
}

function computeTechnicals(closes: number[], currentPrice: number): TechnicalIndicators {
  if (closes.length < 14) {
    return {
      rsi: 50,
      macd: 0,
      ma20: currentPrice,
      ma50: currentPrice,
      ma200: currentPrice,
      bollingerUpper: currentPrice * 1.02,
      bollingerLower: currentPrice * 0.98,
      supportLevel: currentPrice * 0.95,
      resistanceLevel: currentPrice * 1.05,
    };
  }

  // RSI (14-period)
  const rsiPeriod = 14;
  const recentCloses = closes.slice(-rsiPeriod - 1);
  let gains = 0, losses = 0;
  for (let i = 1; i < recentCloses.length; i++) {
    const diff = recentCloses[i] - recentCloses[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / rsiPeriod;
  const avgLoss = losses / rsiPeriod;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  // Moving averages
  const ma = (period: number) => {
    const slice = closes.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  };
  const ma20 = ma(Math.min(20, closes.length));
  const ma50 = ma(Math.min(50, closes.length));
  const ma200 = ma(Math.min(200, closes.length));

  // MACD (12, 26 EMA diff simplified)
  const ema = (period: number) => {
    const slice = closes.slice(-period);
    const k = 2 / (period + 1);
    let emaVal = slice[0];
    for (let i = 1; i < slice.length; i++) {
      emaVal = slice[i] * k + emaVal * (1 - k);
    }
    return emaVal;
  };
  const ema12 = ema(Math.min(12, closes.length));
  const ema26 = ema(Math.min(26, closes.length));
  const macd = ema12 - ema26;

  // Bollinger Bands (20-period, 2 std dev)
  const bb20 = closes.slice(-20);
  const bbMean = bb20.reduce((a, b) => a + b, 0) / bb20.length;
  const bbStd = Math.sqrt(bb20.reduce((a, b) => a + (b - bbMean) ** 2, 0) / bb20.length);
  const bollingerUpper = bbMean + 2 * bbStd;
  const bollingerLower = bbMean - 2 * bbStd;

  // Support/Resistance (recent 20-day low/high)
  const recent20 = closes.slice(-20);
  const supportLevel = Math.min(...recent20);
  const resistanceLevel = Math.max(...recent20);

  return {
    rsi,
    macd,
    ma20,
    ma50,
    ma200,
    bollingerUpper,
    bollingerLower,
    supportLevel,
    resistanceLevel,
  };
}

function getSignal(t: TechnicalIndicators): { signal: "buy" | "sell" | "hold"; strength: number } {
  let score = 0;

  // RSI
  if (t.rsi < 30) score += 3;
  else if (t.rsi < 40) score += 1;
  else if (t.rsi > 70) score -= 3;
  else if (t.rsi > 60) score -= 1;

  // MACD
  if (t.macd > 0) score += 1;
  else score -= 1;

  // Price vs MAs
  const price = t.ma20; // approximate
  if (price > t.ma50) score += 1;
  else score -= 1;
  if (price > t.ma200) score += 1;
  else score -= 1;

  const signal: "buy" | "sell" | "hold" =
    score >= 3 ? "buy" : score <= -3 ? "sell" : "hold";
  const strength = Math.min(Math.abs(score) * 15, 100);

  return { signal, strength };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateReasons(
  q: any,
  technicals: TechnicalIndicators
): AnalysisReason[] {
  const reasons: AnalysisReason[] = [];
  const pct = q.regularMarketChangePercent ?? 0;
  const price = q.regularMarketPrice ?? 0;

  // Price change reason
  if (Math.abs(pct) > 3) {
    reasons.push({
      type: "news",
      title: pct > 0 ? "급등 - 강한 매수세 유입" : "급락 - 강한 매도 압력",
      description: `${q.shortName || q.symbol}이(가) ${Math.abs(pct).toFixed(1)}% ${pct > 0 ? "상승" : "하락"}했습니다. ${pct > 0 ? "기관 및 외국인 매수세가 유입된 것으로 보입니다." : "시장 전반적인 약세와 함께 매도 압력이 강화되고 있습니다."}`,
      impact: pct > 0 ? "positive" : "negative",
    });
  }

  // RSI
  if (technicals.rsi < 30) {
    reasons.push({
      type: "technical",
      title: "RSI 과매도 구간 (반등 가능성)",
      description: `RSI가 ${technicals.rsi.toFixed(1)}로 과매도 구간에 진입했습니다. 기술적 반등 가능성이 높습니다.`,
      impact: "positive",
    });
  } else if (technicals.rsi > 70) {
    reasons.push({
      type: "technical",
      title: "RSI 과매수 구간 (조정 가능성)",
      description: `RSI가 ${technicals.rsi.toFixed(1)}로 과매수 구간입니다. 단기 조정 가능성에 유의하세요.`,
      impact: "negative",
    });
  }

  // 52-week range
  if (q.fiftyTwoWeekLow && price < q.fiftyTwoWeekLow * 1.05) {
    reasons.push({
      type: "technical",
      title: "52주 신저가 근접",
      description: `현재가($${price.toFixed(2)})가 52주 최저가($${q.fiftyTwoWeekLow.toFixed(2)})에 근접해 있습니다.`,
      impact: "negative",
    });
  }
  if (q.fiftyTwoWeekHigh && price > q.fiftyTwoWeekHigh * 0.95) {
    reasons.push({
      type: "technical",
      title: "52주 신고가 근접",
      description: `현재가($${price.toFixed(2)})가 52주 최고가($${q.fiftyTwoWeekHigh.toFixed(2)})에 근접해 있습니다.`,
      impact: "positive",
    });
  }

  // Volume spike
  if (q.regularMarketVolume && q.averageDailyVolume3Month && q.regularMarketVolume > q.averageDailyVolume3Month * 1.5) {
    reasons.push({
      type: "technical",
      title: "거래량 급증",
      description: `거래량이 3개월 평균 대비 ${((q.regularMarketVolume / q.averageDailyVolume3Month) * 100 - 100).toFixed(0)}% 증가했습니다. 큰 관심이 쏠리고 있습니다.`,
      impact: pct >= 0 ? "positive" : "negative",
    });
  }

  // MACD
  if (technicals.macd > 0) {
    reasons.push({
      type: "technical",
      title: "MACD 양전환",
      description: "단기 이동평균이 장기 이동평균을 상회하며 상승 모멘텀을 보이고 있습니다.",
      impact: "positive",
    });
  } else {
    reasons.push({
      type: "technical",
      title: "MACD 음전환",
      description: "단기 이동평균이 장기 이동평균 하회하며 하락 모멘텀입니다.",
      impact: "negative",
    });
  }

  // Sector context
  reasons.push({
    type: "sector",
    title: "반도체 섹터 동향",
    description: "AI 및 HPC 수요 증가로 OSAT/반도체 섹터 전반에 구조적 성장이 이어지고 있습니다.",
    impact: "positive",
  });

  return reasons;
}

export async function fetchPriceHistory(ticker: string): Promise<PriceHistory[]> {
  const cacheKey = `history:${ticker}`;
  const cached = getCached<PriceHistory[]>(cacheKey);
  if (cached) return cached;

  try {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);

    const result = await yf.chart(ticker, {
      period1: start,
      interval: "1d",
    });

    const history: PriceHistory[] = result.quotes
      .filter((q) => q.close != null)
      .map((q) => ({
        date: q.date instanceof Date ? q.date.toISOString().split("T")[0] : String(q.date).split("T")[0],
        open: q.open ?? 0,
        high: q.high ?? 0,
        low: q.low ?? 0,
        close: q.close ?? 0,
        volume: q.volume ?? 0,
      }));

    setCache(cacheKey, history);
    return history;
  } catch (error) {
    console.error("Yahoo Finance chart error:", error);
    return [];
  }
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  const cacheKey = `search:${query}`;
  const cached = getCached<SearchResult[]>(cacheKey);
  if (cached) return cached;

  try {
    const result = await yf.search(query);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allQuotes: any[] = result.quotes || [];
    const stocks: SearchResult[] = allQuotes
      .filter((q) => q.quoteType === "EQUITY")
      .slice(0, 10)
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp || "",
        type: q.quoteType || "EQUITY",
      }));

    setCache(cacheKey, stocks);
    return stocks;
  } catch (error) {
    console.error("Yahoo Finance search error:", error);
    return [];
  }
}

export async function fetchAnalystData(ticker: string): Promise<AnalystData> {
  const cacheKey = `analyst:${ticker}`;
  const cached = getCached<AnalystData>(cacheKey);
  if (cached) return cached;

  const empty: AnalystData = {
    targetMean: null, targetHigh: null, targetLow: null,
    recommendation: null, recommendationScore: null,
    numberOfAnalysts: 0, trend: null, upgrades: [],
  };

  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: ["recommendationTrend", "financialData", "upgradeDowngradeHistory"],
    });

    const fd = summary.financialData;
    const trend = summary.recommendationTrend?.trend?.[0];
    const history = summary.upgradeDowngradeHistory?.history || [];

    const data: AnalystData = {
      targetMean: fd?.targetMeanPrice ?? null,
      targetHigh: fd?.targetHighPrice ?? null,
      targetLow: fd?.targetLowPrice ?? null,
      recommendation: fd?.recommendationKey ?? null,
      recommendationScore: fd?.recommendationMean ?? null,
      numberOfAnalysts: fd?.numberOfAnalystOpinions ?? 0,
      trend: trend ? {
        strongBuy: trend.strongBuy ?? 0,
        buy: trend.buy ?? 0,
        hold: trend.hold ?? 0,
        sell: trend.sell ?? 0,
        strongSell: trend.strongSell ?? 0,
      } : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      upgrades: history.slice(0, 5).map((h: any) => ({
        firm: h.firm || "",
        toGrade: h.toGrade || "",
        fromGrade: h.fromGrade || "",
        action: h.action || "",
        date: h.epochGradeDate ? (h.epochGradeDate instanceof Date ? h.epochGradeDate.toISOString().split("T")[0] : new Date(h.epochGradeDate * 1000).toISOString().split("T")[0]) : "",
      })),
    };

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Analyst data error:", error);
    return empty;
  }
}
