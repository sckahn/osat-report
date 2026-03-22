"use client";

import { useEffect, useState } from "react";
import { StockAnalysis } from "@/lib/types";
import StockTable from "@/components/StockTable";

interface WatchlistItem {
  ticker: string;
  name: string;
  nameKr: string;
  sector: string;
}

function loadAllWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  const kr = localStorage.getItem("osat-kr-watchlist");
  const us = localStorage.getItem("osat-watchlist");
  const items: WatchlistItem[] = [];
  if (kr) try { items.push(...JSON.parse(kr)); } catch { /* */ }
  if (us) try { items.push(...JSON.parse(us)); } catch { /* */ }
  // dedupe
  const seen = new Set<string>();
  return items.filter((i) => { if (seen.has(i.ticker)) return false; seen.add(i.ticker); return true; });
}

// Popular OSAT/semiconductor tickers for recommendations
const RECOMMEND_TICKERS = [
  { ticker: "ASX", name: "ASE Technology", nameKr: "ASE 테크놀로지", sector: "OSAT" },
  { ticker: "AMKR", name: "Amkor Technology", nameKr: "앰코 테크놀로지", sector: "OSAT" },
  { ticker: "TSM", name: "TSMC", nameKr: "TSMC", sector: "Foundry" },
  { ticker: "NVDA", name: "NVIDIA", nameKr: "엔비디아", sector: "Fabless" },
  { ticker: "AMD", name: "AMD", nameKr: "AMD", sector: "Fabless" },
  { ticker: "INTC", name: "Intel", nameKr: "인텔", sector: "IDM" },
  { ticker: "AVGO", name: "Broadcom", nameKr: "브로드컴", sector: "Fabless" },
  { ticker: "QCOM", name: "Qualcomm", nameKr: "퀄컴", sector: "Fabless" },
  { ticker: "MU", name: "Micron Technology", nameKr: "마이크론", sector: "Memory" },
  { ticker: "LRCX", name: "Lam Research", nameKr: "램리서치", sector: "Equipment" },
  { ticker: "AMAT", name: "Applied Materials", nameKr: "어플라이드", sector: "Equipment" },
  { ticker: "KLAC", name: "KLA Corporation", nameKr: "KLA", sector: "Equipment" },
  { ticker: "005930.KS", name: "Samsung Electronics", nameKr: "삼성전자", sector: "IDM" },
  { ticker: "000660.KS", name: "SK Hynix", nameKr: "SK하이닉스", sector: "Memory" },
  { ticker: "042700.KS", name: "Hanmi Semiconductor", nameKr: "한미반도체", sector: "Equipment" },
];

function isKr(ticker: string) {
  return ticker.endsWith(".KS") || ticker.endsWith(".KQ");
}

function formatPrice(price: number, kr: boolean) {
  return kr ? price.toLocaleString("ko-KR") + "원" : `$${price.toFixed(2)}`;
}

export default function SignalsPage() {
  const [tab, setTab] = useState<"my" | "recommend">("my");
  const [stocks, setStocks] = useState<StockAnalysis[]>([]);
  const [recStocks, setRecStocks] = useState<StockAnalysis[]>([]);
  const [filter, setFilter] = useState<"all" | "buy" | "sell" | "hold">("all");
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Load my watchlist
  useEffect(() => {
    const wl = loadAllWatchlist();
    setWatchlist(wl);
  }, []);

  // Fetch my stocks
  useEffect(() => {
    if (watchlist.length === 0) { setLoading(false); return; }
    setLoading(true);
    const krItems = watchlist.filter((w) => isKr(w.ticker));
    const usItems = watchlist.filter((w) => !isKr(w.ticker));

    const fetches: Promise<StockAnalysis[]>[] = [];
    if (usItems.length > 0) {
      const param = encodeURIComponent(JSON.stringify(usItems));
      fetches.push(fetch(`/api/stocks?custom=${param}`).then((r) => r.json()));
    }
    if (krItems.length > 0) {
      const param = encodeURIComponent(JSON.stringify(krItems));
      fetches.push(fetch(`/api/kr?custom=${param}`).then((r) => r.json()));
    }

    Promise.all(fetches).then((results) => {
      const all = results.flat();
      // apply Korean names
      for (const s of all) {
        const wl = watchlist.find((w) => w.ticker === s.ticker);
        if (wl) s.nameKr = wl.nameKr || s.nameKr;
      }
      setStocks(all);
      setLoading(false);
    });
  }, [watchlist]);

  // Fetch recommended stocks (excluding my watchlist)
  useEffect(() => {
    if (tab !== "recommend") return;
    if (recStocks.length > 0) return;
    setRecLoading(true);
    const myTickers = new Set(watchlist.map((w) => w.ticker));
    const filteredRec = RECOMMEND_TICKERS.filter((t) => !myTickers.has(t.ticker));
    const krRec = filteredRec.filter((t) => isKr(t.ticker));
    const usRec = filteredRec.filter((t) => !isKr(t.ticker));

    const fetches: Promise<StockAnalysis[]>[] = [];
    if (usRec.length > 0) {
      const param = encodeURIComponent(JSON.stringify(usRec));
      fetches.push(fetch(`/api/stocks?custom=${param}`).then((r) => r.json()));
    }
    if (krRec.length > 0) {
      const param = encodeURIComponent(JSON.stringify(krRec));
      fetches.push(fetch(`/api/kr?custom=${param}`).then((r) => r.json()));
    }

    Promise.all(fetches).then((results) => {
      const all = results.flat();
      for (const s of all) {
        const rec = RECOMMEND_TICKERS.find((r) => r.ticker === s.ticker);
        if (rec) s.nameKr = rec.nameKr;
      }
      setRecStocks(all);
      setRecLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, watchlist]);

  const currentStocks = tab === "my" ? stocks : recStocks;
  const currentLoading = tab === "my" ? loading : recLoading;
  const filtered = filter === "all" ? currentStocks : currentStocks.filter((s) => s.signal === filter);

  const buyStocks = currentStocks.filter((s) => s.signal === "buy").sort((a, b) => b.signalStrength - a.signalStrength);
  const sellStocks = currentStocks.filter((s) => s.signal === "sell").sort((a, b) => b.signalStrength - a.signalStrength);
  const buyCount = buyStocks.length;
  const sellCount = sellStocks.length;
  const holdCount = currentStocks.filter((s) => s.signal === "hold").length;

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">매수/매도 타이밍 시그널</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">기술적 분석 기반 매수/매도 시그널 및 타이밍 분석</p>
        </div>
        {/* Tab */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setTab("my")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "my" ? "bg-accent text-white" : "text-gray-400 bg-card hover:text-white"}`}>
            내 종목
          </button>
          <button onClick={() => setTab("recommend")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "recommend" ? "bg-accent text-white" : "text-gray-400 bg-card hover:text-white"}`}>
            추천 종목
          </button>
        </div>
      </div>

      {currentLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" />
        </div>
      ) : currentStocks.length === 0 && tab === "my" ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-2">등록된 종목이 없습니다.</p>
          <p className="text-xs text-gray-600">한국 증시 페이지에서 종목을 추가하면 여기에 자동으로 표시됩니다.</p>
        </div>
      ) : (
        <>
          {/* Signal Summary */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 sm:p-5">
              <div className="text-xs sm:text-sm text-green-400 font-medium mb-1">매수</div>
              <div className="text-2xl sm:text-3xl font-bold text-green-400">{buyCount}</div>
              <div className="text-xs text-gray-500 mt-1 truncate hidden sm:block">
                {buyCount > 0 && `최강: ${buyStocks[0]?.nameKr}`}
              </div>
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 sm:p-5">
              <div className="text-xs sm:text-sm text-red-400 font-medium mb-1">매도</div>
              <div className="text-2xl sm:text-3xl font-bold text-red-400">{sellCount}</div>
              <div className="text-xs text-gray-500 mt-1 truncate hidden sm:block">
                {sellCount > 0 && `최강: ${sellStocks[0]?.nameKr}`}
              </div>
            </div>
            <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 sm:p-5">
              <div className="text-xs sm:text-sm text-yellow-400 font-medium mb-1">보유</div>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{holdCount}</div>
              <div className="text-xs text-gray-500 mt-1 hidden sm:block">관망 추천</div>
            </div>
          </div>

          {/* Timing Alerts */}
          {(buyStocks.length > 0 || sellStocks.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {buyStocks.length > 0 && (
                <div className="rounded-xl bg-card border border-green-500/20 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3 sm:mb-4">매수 추천 타이밍</h3>
                  <div className="space-y-3">
                    {buyStocks.map((stock) => (
                      <div key={stock.ticker} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-accent text-xs">{stock.ticker.replace(".KS", "").replace(".KQ", "")}</span>
                            <span className="text-white text-sm font-medium truncate">{stock.nameKr}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            RSI {stock.technicals.rsi.toFixed(1)} | 지지선 {formatPrice(stock.technicals.supportLevel, isKr(stock.ticker))}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className="text-sm font-mono text-white">{formatPrice(stock.price, isKr(stock.ticker))}</div>
                          <div className="text-xs text-green-400">강도: {stock.signalStrength.toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2.5 sm:p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                    <p className="text-xs text-gray-400">
                      <span className="text-green-400 font-bold">매수 타이밍:</span> RSI 과매도 구간 진입 종목으로 반등 가능성이 높습니다. 지지선 근처에서 분할 매수를 권장합니다.
                    </p>
                  </div>
                </div>
              )}

              {sellStocks.length > 0 && (
                <div className="rounded-xl bg-card border border-red-500/20 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3 sm:mb-4">매도 고려 타이밍</h3>
                  <div className="space-y-3">
                    {sellStocks.map((stock) => (
                      <div key={stock.ticker} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-accent text-xs">{stock.ticker.replace(".KS", "").replace(".KQ", "")}</span>
                            <span className="text-white text-sm font-medium truncate">{stock.nameKr}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            RSI {stock.technicals.rsi.toFixed(1)} | 저항선 {formatPrice(stock.technicals.resistanceLevel, isKr(stock.ticker))}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className="text-sm font-mono text-white">{formatPrice(stock.price, isKr(stock.ticker))}</div>
                          <div className="text-xs text-red-400">강도: {stock.signalStrength.toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2.5 sm:p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-xs text-gray-400">
                      <span className="text-red-400 font-bold">매도 타이밍:</span> RSI 과매수 구간 종목으로 조정 가능성이 있습니다. 저항선 근처에서 부분 익절을 고려하세요.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filter + Table */}
          <div className="rounded-xl bg-card border border-border p-3 sm:p-5">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto">
              {(["all", "buy", "sell", "hold"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === f ? "bg-accent text-white" : "text-gray-400 hover:text-white hover:bg-card-hover"
                  }`}>
                  {f === "all" ? "전체" : f === "buy" ? "매수" : f === "sell" ? "매도" : "보유"}
                </button>
              ))}
            </div>
            <StockTable stocks={filtered} showSignal />
          </div>

          {/* Disclaimer */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-gray-800/30 border border-border">
            <p className="text-xs text-gray-500">
              본 시그널은 기술적 분석(RSI, MACD, 이동평균선 등)에 기반한 참고 자료이며, 투자 권유가 아닙니다. 투자 판단은 본인의 책임 하에 이루어져야 합니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
