"use client";

import { useEffect, useState } from "react";
import { StockAnalysis } from "@/lib/types";
import DatePicker from "@/components/DatePicker";
import StockTable from "@/components/StockTable";

export default function SignalsPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [stocks, setStocks] = useState<StockAnalysis[]>([]);
  const [filter, setFilter] = useState<"all" | "buy" | "sell" | "hold">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stocks?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        setStocks(data);
        setLoading(false);
      });
  }, [date]);

  const filtered =
    filter === "all" ? stocks : stocks.filter((s) => s.signal === filter);

  const buyCount = stocks.filter((s) => s.signal === "buy").length;
  const sellCount = stocks.filter((s) => s.signal === "sell").length;
  const holdCount = stocks.filter((s) => s.signal === "hold").length;

  const strongBuys = stocks
    .filter((s) => s.signal === "buy")
    .sort((a, b) => b.signalStrength - a.signalStrength);
  const strongSells = stocks
    .filter((s) => s.signal === "sell")
    .sort((a, b) => b.signalStrength - a.signalStrength);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">매수/매도 타이밍 시그널</h1>
          <p className="text-sm text-gray-400 mt-1">
            기술적 분석 기반 매수/매도 시그널 및 타이밍 분석
          </p>
        </div>
        <DatePicker value={date} onChange={setDate} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" />
        </div>
      ) : (
        <>
          {/* Signal Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-5">
              <div className="text-sm text-green-400 font-medium mb-1">매수 시그널</div>
              <div className="text-3xl font-bold text-green-400">{buyCount}</div>
              <div className="text-xs text-gray-500 mt-1">
                {buyCount > 0 && `최강: ${strongBuys[0]?.nameKr}`}
              </div>
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5">
              <div className="text-sm text-red-400 font-medium mb-1">매도 시그널</div>
              <div className="text-3xl font-bold text-red-400">{sellCount}</div>
              <div className="text-xs text-gray-500 mt-1">
                {sellCount > 0 && `최강: ${strongSells[0]?.nameKr}`}
              </div>
            </div>
            <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-5">
              <div className="text-sm text-yellow-400 font-medium mb-1">보유 시그널</div>
              <div className="text-3xl font-bold text-yellow-400">{holdCount}</div>
              <div className="text-xs text-gray-500 mt-1">관망 추천 종목</div>
            </div>
          </div>

          {/* Timing Alerts */}
          {(strongBuys.length > 0 || strongSells.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {strongBuys.length > 0 && (
                <div className="rounded-xl bg-card border border-green-500/20 p-5">
                  <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-4">
                    매수 추천 타이밍
                  </h3>
                  <div className="space-y-3">
                    {strongBuys.map((stock) => (
                      <div
                        key={stock.ticker}
                        className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-accent text-xs">
                              {stock.ticker}
                            </span>
                            <span className="text-white text-sm font-medium">
                              {stock.nameKr}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            RSI {stock.technicals.rsi.toFixed(1)} | 지지선 $
                            {stock.technicals.supportLevel.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-white">
                            ${stock.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-green-400">
                            강도: {stock.signalStrength.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                    <p className="text-xs text-gray-400">
                      <span className="text-green-400 font-bold">매수 타이밍:</span>{" "}
                      RSI 과매도 구간 진입 종목으로 반등 가능성이 높습니다. 지지선
                      근처에서 분할 매수를 권장합니다.
                    </p>
                  </div>
                </div>
              )}

              {strongSells.length > 0 && (
                <div className="rounded-xl bg-card border border-red-500/20 p-5">
                  <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-4">
                    매도 고려 타이밍
                  </h3>
                  <div className="space-y-3">
                    {strongSells.map((stock) => (
                      <div
                        key={stock.ticker}
                        className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-accent text-xs">
                              {stock.ticker}
                            </span>
                            <span className="text-white text-sm font-medium">
                              {stock.nameKr}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            RSI {stock.technicals.rsi.toFixed(1)} | 저항선 $
                            {stock.technicals.resistanceLevel.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-white">
                            ${stock.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-red-400">
                            강도: {stock.signalStrength.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-xs text-gray-400">
                      <span className="text-red-400 font-bold">매도 타이밍:</span>{" "}
                      RSI 과매수 구간 종목으로 조정 가능성이 있습니다. 저항선 근처에서
                      부분 익절을 고려하세요.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filter Tabs + Table */}
          <div className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              {(["all", "buy", "sell", "hold"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? "bg-accent text-white"
                      : "text-gray-400 hover:text-white hover:bg-card-hover"
                  }`}
                >
                  {f === "all"
                    ? "전체"
                    : f === "buy"
                    ? "매수"
                    : f === "sell"
                    ? "매도"
                    : "보유"}
                </button>
              ))}
            </div>
            <StockTable stocks={filtered} showSignal />
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 rounded-lg bg-gray-800/30 border border-border">
            <p className="text-xs text-gray-500">
              본 시그널은 기술적 분석(RSI, MACD, 이동평균선 등)에 기반한 참고 자료이며,
              투자 권유가 아닙니다. 투자 판단은 본인의 책임 하에 이루어져야 합니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
