"use client";

import { StockAnalysis } from "@/lib/types";

function isKr(ticker: string) {
  return ticker.endsWith(".KS") || ticker.endsWith(".KQ");
}

function fmt(value: number, kr: boolean) {
  if (kr) return value.toLocaleString("ko-KR") + "원";
  return `$${value.toFixed(2)}`;
}

export default function AnalysisTools({ stock }: { stock: StockAnalysis }) {
  const kr = isKr(stock.ticker);
  const t = stock.technicals;

  // Position analysis
  const priceVsMa20 = ((stock.price - t.ma20) / t.ma20) * 100;
  const priceVsMa50 = ((stock.price - t.ma50) / t.ma50) * 100;
  const priceVsMa200 = ((stock.price - t.ma200) / t.ma200) * 100;
  const bbPosition =
    ((stock.price - t.bollingerLower) / (t.bollingerUpper - t.bollingerLower)) * 100;

  // Risk/Reward
  const downside = ((stock.price - t.supportLevel) / stock.price) * 100;
  const upside = ((t.resistanceLevel - stock.price) / stock.price) * 100;
  const rrRatio = upside / (downside || 0.01);

  // Trend strength
  const trendScore =
    (priceVsMa20 > 0 ? 1 : 0) +
    (priceVsMa50 > 0 ? 1 : 0) +
    (priceVsMa200 > 0 ? 1 : 0) +
    (t.macd > 0 ? 1 : 0);
  const trendLabel =
    trendScore >= 3 ? "강한 상승" : trendScore >= 2 ? "상승" : trendScore >= 1 ? "혼조" : "하락";
  const trendColor =
    trendScore >= 3
      ? "text-green-400"
      : trendScore >= 2
      ? "text-green-300"
      : trendScore >= 1
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="rounded-xl bg-card border border-border p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">분석 도구</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Trend Analysis */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            추세 분석
          </div>
          <div className={`text-xl font-bold ${trendColor} mb-2`}>
            {trendLabel}
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>vs MA20</span>
              <span className={priceVsMa20 >= 0 ? (kr ? "text-red-400" : "text-green-400") : (kr ? "text-blue-400" : "text-red-400")}>
                {priceVsMa20 >= 0 ? "+" : ""}{priceVsMa20.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>vs MA50</span>
              <span className={priceVsMa50 >= 0 ? (kr ? "text-red-400" : "text-green-400") : (kr ? "text-blue-400" : "text-red-400")}>
                {priceVsMa50 >= 0 ? "+" : ""}{priceVsMa50.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>vs MA200</span>
              <span className={priceVsMa200 >= 0 ? (kr ? "text-red-400" : "text-green-400") : (kr ? "text-blue-400" : "text-red-400")}>
                {priceVsMa200 >= 0 ? "+" : ""}{priceVsMa200.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Risk/Reward */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            위험/보상 비율
          </div>
          <div className={`text-xl font-bold mb-2 ${rrRatio >= 2 ? "text-green-400" : rrRatio >= 1 ? "text-yellow-400" : "text-red-400"}`}>
            {rrRatio.toFixed(2)} : 1
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>상승 여력 (저항선)</span>
              <span className="text-green-400">+{upside.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>하락 위험 (지지선)</span>
              <span className="text-red-400">-{downside.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>저항선</span>
              <span className="text-white">{fmt(t.resistanceLevel, kr)}</span>
            </div>
            <div className="flex justify-between">
              <span>지지선</span>
              <span className="text-white">{fmt(t.supportLevel, kr)}</span>
            </div>
          </div>
        </div>

        {/* Bollinger Position */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            볼린저 밴드 위치
          </div>
          <div className="mb-2">
            <div className="h-3 bg-gray-700 rounded-full relative">
              <div
                className="absolute top-0 h-full w-1 bg-accent rounded-full"
                style={{ left: `${Math.max(0, Math.min(100, bbPosition))}%` }}
              />
              <div className="absolute top-0 left-0 h-full w-1 bg-green-500 rounded-full" />
              <div className="absolute top-0 right-0 h-full w-1 bg-red-500 rounded-full" />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>하단</span>
              <span>{bbPosition.toFixed(0)}%</span>
              <span>상단</span>
            </div>
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>상단</span>
              <span>{fmt(t.bollingerUpper, kr)}</span>
            </div>
            <div className="flex justify-between">
              <span>하단</span>
              <span>{fmt(t.bollingerLower, kr)}</span>
            </div>
          </div>
        </div>

        {/* Signal Summary */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            종합 시그널
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`text-xl font-bold ${
                stock.signal === "buy"
                  ? "text-green-400"
                  : stock.signal === "sell"
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              {stock.signal === "buy" ? "매수" : stock.signal === "sell" ? "매도" : "보유"}
            </span>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  stock.signal === "buy"
                    ? "bg-green-500"
                    : stock.signal === "sell"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
                style={{ width: `${stock.signalStrength}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{stock.signalStrength.toFixed(0)}%</span>
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>RSI</span>
              <span className={t.rsi < 30 || t.rsi > 70 ? "text-yellow-400" : "text-white"}>
                {t.rsi.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>MACD</span>
              <span className={t.macd > 0 ? "text-green-400" : "text-red-400"}>
                {t.macd.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>추세 점수</span>
              <span className={trendColor}>{trendScore}/4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
