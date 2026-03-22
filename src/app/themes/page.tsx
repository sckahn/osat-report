"use client";

import { useEffect, useState } from "react";
import { StockAnalysis, OsatNews } from "@/lib/types";
import { THEMES, THEME_COLORS } from "@/lib/themes";
import NewsCard from "@/components/NewsCard";
import StockTable from "@/components/StockTable";
import AnalystPanel from "@/components/AnalystPanel";
import PriceChart from "@/components/PriceChart";
import AnalysisTools from "@/components/AnalysisTools";

function isKr(ticker: string) {
  return ticker.endsWith(".KS") || ticker.endsWith(".KQ");
}
function fmtPrice(v: number, kr: boolean) {
  return kr ? v.toLocaleString("ko-KR") + "원" : `$${v.toFixed(2)}`;
}

export default function ThemesPage() {
  const [activeTheme, setActiveTheme] = useState(THEMES[0].id);
  const [tab, setTab] = useState<"overview" | "news">("overview");
  const [stocks, setStocks] = useState<StockAnalysis[]>([]);
  const [news, setNews] = useState<OsatNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const theme = THEMES.find((t) => t.id === activeTheme)!;
  const colors = THEME_COLORS[theme.color];

  // Fetch stocks
  useEffect(() => {
    setLoading(true);
    setSelectedTicker(null);
    fetch(`/api/themes?id=${activeTheme}&type=stocks`)
      .then((r) => r.json())
      .then((data) => { setStocks(Array.isArray(data) ? data : []); setLoading(false); });
  }, [activeTheme]);

  // Fetch news
  useEffect(() => {
    setNewsLoading(true);
    fetch(`/api/themes?id=${activeTheme}&type=news`)
      .then((r) => r.json())
      .then((data) => { setNews(Array.isArray(data) ? data : []); setNewsLoading(false); });
  }, [activeTheme]);

  const buyStocks = stocks.filter((s) => s.signal === "buy").sort((a, b) => b.signalStrength - a.signalStrength);
  const sellStocks = stocks.filter((s) => s.signal === "sell").sort((a, b) => b.signalStrength - a.signalStrength);
  const avgChange = stocks.length > 0 ? stocks.reduce((s, st) => s + st.changePercent, 0) / stocks.length : 0;
  const positiveNews = news.filter((n) => n.sentiment === "positive").length;
  const negativeNews = news.filter((n) => n.sentiment === "negative").length;

  const selectedStock = stocks.find((s) => s.ticker === selectedTicker);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">테마별 시장 동향</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">투자 테마별 종목, 시그널, 뉴스 어그리게이션</p>
      </div>

      {/* Theme Selector - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
        {THEMES.map((t) => {
          const c = THEME_COLORS[t.color];
          const isActive = t.id === activeTheme;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTheme(t.id); setTab("overview"); }}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                isActive
                  ? `${c.bgLight} ${c.border} ${c.text}`
                  : "bg-card border-border text-gray-400 hover:text-white"
              }`}
            >
              {t.name}
            </button>
          );
        })}
      </div>

      {/* Theme Header Card */}
      <div className={`rounded-xl border ${colors.border} ${colors.bgLight} p-4 sm:p-5 mb-4 sm:mb-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className={`text-lg sm:text-xl font-bold ${colors.text}`}>{theme.name}</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{theme.description}</p>
          </div>
          <div className="flex gap-3 sm:gap-5">
            <div className="text-center">
              <div className="text-xs text-gray-500">종목수</div>
              <div className="text-lg font-bold text-white">{stocks.length}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">평균 등락</div>
              <div className={`text-lg font-bold font-mono ${avgChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">매수</div>
              <div className="text-lg font-bold text-green-400">{buyStocks.length}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">매도</div>
              <div className="text-lg font-bold text-red-400">{sellStocks.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-4 sm:mb-6">
        <button onClick={() => { setTab("overview"); setSelectedTicker(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "overview" ? "bg-accent text-white" : "text-gray-400 bg-card"}`}>
          종목/시그널
        </button>
        <button onClick={() => setTab("news")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "news" ? "bg-accent text-white" : "text-gray-400 bg-card"}`}>
          뉴스 ({news.length})
        </button>
      </div>

      {tab === "news" ? (
        /* News */
        newsLoading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" /></div>
        ) : (
          <div className="space-y-3">
            {/* Sentiment summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-card border border-border p-3 text-center">
                <div className="text-xs text-gray-500">전체</div>
                <div className="text-xl font-bold text-white">{news.length}</div>
              </div>
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
                <div className="text-xs text-gray-500">긍정</div>
                <div className="text-xl font-bold text-green-400">{positiveNews}</div>
              </div>
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                <div className="text-xs text-gray-500">부정</div>
                <div className="text-xl font-bold text-red-400">{negativeNews}</div>
              </div>
            </div>
            {news.map((item) => <NewsCard key={item.id} news={item} />)}
          </div>
        )
      ) : loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" /></div>
      ) : selectedStock ? (
        /* Stock Detail */
        <div className="space-y-4 sm:space-y-6">
          <button onClick={() => setSelectedTicker(null)} className="flex items-center gap-2 text-sm text-accent active:opacity-70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            종목 목록
          </button>

          <div className="rounded-xl bg-card border border-border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-white">{selectedStock.nameKr}</h2>
                  <span className="text-xs font-mono text-gray-500">{selectedStock.ticker}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                    selectedStock.signal === "buy" ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : selectedStock.signal === "sell" ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }`}>{selectedStock.signal === "buy" ? "매수" : selectedStock.signal === "sell" ? "매도" : "보유"}</span>
                </div>
              </div>
              <div className="sm:text-right">
                <div className="text-2xl sm:text-3xl font-bold text-white">{fmtPrice(selectedStock.price, isKr(selectedStock.ticker))}</div>
                <div className={`text-base font-mono ${selectedStock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {selectedStock.change >= 0 ? "+" : ""}{selectedStock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
            <PriceChart ticker={selectedStock.ticker} technicals={selectedStock.technicals} />
          </div>

          <AnalysisTools stock={selectedStock} />
          <AnalystPanel ticker={selectedStock.ticker} currentPrice={selectedStock.price} />
        </div>
      ) : (
        /* Overview */
        <div className="space-y-4 sm:space-y-6">
          {/* Buy/Sell Timing */}
          {(buyStocks.length > 0 || sellStocks.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {buyStocks.length > 0 && (
                <div className="rounded-xl bg-card border border-green-500/20 p-4">
                  <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3">매수 시그널</h3>
                  {buyStocks.slice(0, 5).map((s) => (
                    <button key={s.ticker} onClick={() => setSelectedTicker(s.ticker)}
                      className="w-full flex items-center justify-between border-b border-border/50 pb-2.5 mb-2.5 last:border-0 last:mb-0 last:pb-0 text-left hover:bg-card-hover rounded px-1 -mx-1 transition-colors">
                      <div className="min-w-0">
                        <span className="text-xs font-mono text-accent mr-1.5">{s.ticker.replace(".KS","").replace(".KQ","")}</span>
                        <span className="text-sm text-white">{s.nameKr}</span>
                        <div className="text-xs text-gray-500">RSI {s.technicals.rsi.toFixed(1)}</div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="text-sm font-mono text-white">{fmtPrice(s.price, isKr(s.ticker))}</div>
                        <div className="text-xs text-green-400">강도 {s.signalStrength.toFixed(0)}%</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {sellStocks.length > 0 && (
                <div className="rounded-xl bg-card border border-red-500/20 p-4">
                  <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3">매도 시그널</h3>
                  {sellStocks.slice(0, 5).map((s) => (
                    <button key={s.ticker} onClick={() => setSelectedTicker(s.ticker)}
                      className="w-full flex items-center justify-between border-b border-border/50 pb-2.5 mb-2.5 last:border-0 last:mb-0 last:pb-0 text-left hover:bg-card-hover rounded px-1 -mx-1 transition-colors">
                      <div className="min-w-0">
                        <span className="text-xs font-mono text-accent mr-1.5">{s.ticker.replace(".KS","").replace(".KQ","")}</span>
                        <span className="text-sm text-white">{s.nameKr}</span>
                        <div className="text-xs text-gray-500">RSI {s.technicals.rsi.toFixed(1)}</div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="text-sm font-mono text-white">{fmtPrice(s.price, isKr(s.ticker))}</div>
                        <div className="text-xs text-red-400">강도 {s.signalStrength.toFixed(0)}%</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Full Table */}
          <div className="rounded-xl bg-card border border-border p-3 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {theme.name} 전체 종목
            </h3>
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full text-xs sm:text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-border text-gray-400">
                    <th className="text-left py-2.5 px-2">종목</th>
                    <th className="text-right py-2.5 px-2">현재가</th>
                    <th className="text-right py-2.5 px-2">등락률</th>
                    <th className="text-center py-2.5 px-2">시그널</th>
                    <th className="text-center py-2.5 px-2">강도</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s) => {
                    const kr = isKr(s.ticker);
                    const signalStyle = s.signal === "buy" ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : s.signal === "sell" ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
                    return (
                      <tr key={s.ticker} onClick={() => setSelectedTicker(s.ticker)}
                        className="border-b border-border/50 hover:bg-card-hover active:bg-card-hover cursor-pointer transition-colors">
                        <td className="py-2.5 px-2">
                          <span className="text-xs font-mono text-accent mr-1.5">{s.ticker.replace(".KS","").replace(".KQ","")}</span>
                          <span className="text-white">{s.nameKr}</span>
                        </td>
                        <td className="text-right py-2.5 px-2 font-mono text-white whitespace-nowrap">{fmtPrice(s.price, kr)}</td>
                        <td className={`text-right py-2.5 px-2 font-mono ${s.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                        </td>
                        <td className="text-center py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${signalStyle}`}>
                            {s.signal === "buy" ? "매수" : s.signal === "sell" ? "매도" : "보유"}
                          </span>
                        </td>
                        <td className="text-center py-2.5 px-2">
                          <div className="w-12 sm:w-16 mx-auto h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${s.signal === "buy" ? "bg-green-500" : s.signal === "sell" ? "bg-red-500" : "bg-yellow-500"}`}
                              style={{ width: `${s.signalStrength}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
