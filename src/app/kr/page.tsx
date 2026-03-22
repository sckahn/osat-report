"use client";

import { useEffect, useState, useCallback } from "react";
import { StockAnalysis } from "@/lib/types";
import { OsatNews } from "@/lib/types";
import NewsCard from "@/components/NewsCard";
import PriceChart from "@/components/PriceChart";
import StockNewsPanel from "@/components/StockNewsPanel";
import AnalysisTools from "@/components/AnalysisTools";
import AnalystPanel from "@/components/AnalystPanel";
import StockSearch from "@/components/StockSearch";

interface WatchlistItem { ticker: string; name: string; nameKr: string; sector: string; }

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { ticker: "005930.KS", name: "Samsung Electronics", nameKr: "삼성전자", sector: "IDM" },
  { ticker: "000660.KS", name: "SK Hynix", nameKr: "SK하이닉스", sector: "Memory" },
  { ticker: "042700.KS", name: "Hanmi Semiconductor", nameKr: "한미반도체", sector: "장비" },
  { ticker: "058470.KS", name: "LEENO Industrial", nameKr: "리노공업", sector: "부품" },
  { ticker: "166090.KS", name: "Hana Materials", nameKr: "하나머티리얼즈", sector: "소재" },
  { ticker: "036930.KS", name: "Jusung Engineering", nameKr: "주성엔지니어링", sector: "장비" },
  { ticker: "403870.KS", name: "HPSP", nameKr: "HPSP", sector: "장비" },
  { ticker: "217190.KQ", name: "Genersem", nameKr: "제너셈", sector: "OSAT" },
  { ticker: "404950.KQ", name: "APACT", nameKr: "에이팩트", sector: "OSAT" },
  { ticker: "357780.KQ", name: "Soulbrain", nameKr: "솔브레인", sector: "소재" },
];

const STORAGE_KEY = "osat-kr-watchlist";

function loadWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return DEFAULT_WATCHLIST;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) { try { return JSON.parse(saved); } catch { return DEFAULT_WATCHLIST; } }
  return DEFAULT_WATCHLIST;
}

function formatKRW(value: number): string {
  return value.toLocaleString("ko-KR") + "원";
}

const impactColors: Record<string, string> = { positive: "border-green-500/30 bg-green-500/10", negative: "border-red-500/30 bg-red-500/10", neutral: "border-gray-500/30 bg-gray-500/10" };
const impactLabels: Record<string, { text: string; color: string }> = { positive: { text: "호재", color: "text-green-400" }, negative: { text: "악재", color: "text-red-400" }, neutral: { text: "중립", color: "text-gray-400" } };
const typeLabels: Record<string, string> = { earnings: "실적", news: "뉴스", sector: "섹터", technical: "기술적", macro: "거시경제" };

export default function KrMarketPage() {
  const [stocks, setStocks] = useState<StockAnalysis[]>([]);
  const [news, setNews] = useState<OsatNews[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [tab, setTab] = useState<"stocks" | "news">("stocks");
  const [newTicker, setNewTicker] = useState("");
  const [newNameKr, setNewNameKr] = useState("");
  const [newSector, setNewSector] = useState("OSAT");
  const [market, setMarket] = useState<"KS" | "KQ">("KS");

  useEffect(() => { setWatchlist(loadWatchlist()); }, []);

  const saveWatchlist = useCallback((list: WatchlistItem[]) => {
    setWatchlist(list); localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }, []);

  useEffect(() => {
    if (watchlist.length === 0) return;
    setLoading(true);
    const customParam = encodeURIComponent(JSON.stringify(watchlist));
    Promise.all([
      fetch(`/api/kr?custom=${customParam}`).then((r) => r.json()),
      fetch("/api/kr?type=news").then((r) => r.json()),
    ]).then(([stockData, newsData]) => { setStocks(stockData); setNews(newsData); setLoading(false); });
  }, [watchlist]);

  const addStock = () => {
    const code = newTicker.trim();
    if (!code) return;
    const ticker = code.includes(".") ? code : `${code}.${market}`;
    if (watchlist.some((w) => w.ticker === ticker)) return;
    saveWatchlist([...watchlist, { ticker, name: newNameKr.trim() || ticker, nameKr: newNameKr.trim() || ticker, sector: newSector }]);
    setNewTicker(""); setNewNameKr(""); setShowAddModal(false);
  };

  const removeStock = (ticker: string) => {
    saveWatchlist(watchlist.filter((w) => w.ticker !== ticker));
    if (selected === ticker) setSelected(null);
  };

  const selectedStock = stocks.find((s) => s.ticker === selected);
  const changeColor = (val: number) => val >= 0 ? "text-red-400" : "text-blue-400";

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">한국 증시 - 반도체/OSAT</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">한국 반도체 관련 종목 실시간 분석 및 뉴스</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => { setTab("stocks"); setSelected(null); }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "stocks" ? "bg-accent text-white" : "text-gray-400 bg-card"}`}>종목 분석</button>
          <button onClick={() => setTab("news")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "news" ? "bg-accent text-white" : "text-gray-400 bg-card"}`}>뉴스 ({news.length})</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" /></div>
      ) : tab === "news" ? (
        <div className="space-y-3 sm:space-y-4">
          {news.length === 0 ? <div className="text-center py-20 text-gray-500">뉴스를 불러오는 중이거나 결과가 없습니다.</div>
          : news.map((item) => <NewsCard key={item.id} news={item} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Stock List */}
          <div className={`space-y-2 ${selected ? "hidden lg:block" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">종목 ({watchlist.length})</h2>
              <div className="flex gap-1">
                <button onClick={() => setShowManage(!showManage)} className="px-2 py-1 rounded text-xs text-gray-400 hover:text-white transition-colors">{showManage ? "완료" : "관리"}</button>
                <button onClick={() => setShowAddModal(true)} className="px-2 py-1 rounded text-xs bg-accent/20 text-accent">+ 추가</button>
              </div>
            </div>

            {showAddModal && (
              <div className="rounded-xl bg-card border border-accent/30 p-4 space-y-3 mb-2">
                <h3 className="text-sm font-semibold text-white">한국 종목 추가</h3>
                <input type="text" value={newTicker} onChange={(e) => setNewTicker(e.target.value)} placeholder="종목코드 (예: 005930)"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-accent" />
                <div className="flex gap-2">
                  <button onClick={() => setMarket("KS")} className={`flex-1 px-3 py-2 rounded-lg text-sm border ${market === "KS" ? "bg-accent/20 border-accent/50 text-accent" : "bg-card border-border text-gray-400"}`}>KOSPI</button>
                  <button onClick={() => setMarket("KQ")} className={`flex-1 px-3 py-2 rounded-lg text-sm border ${market === "KQ" ? "bg-accent/20 border-accent/50 text-accent" : "bg-card border-border text-gray-400"}`}>KOSDAQ</button>
                </div>
                <input type="text" value={newNameKr} onChange={(e) => setNewNameKr(e.target.value)} placeholder="종목명 (예: 삼성전자)"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-accent" />
                <select value={newSector} onChange={(e) => setNewSector(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm">
                  <option value="OSAT">OSAT/후공정</option><option value="IDM">IDM</option><option value="Memory">메모리</option>
                  <option value="장비">장비</option><option value="소재">소재</option><option value="부품">부품</option><option value="기타">기타</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={addStock} disabled={!newTicker.trim()} className="flex-1 px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-40">추가</button>
                  <button onClick={() => setShowAddModal(false)} className="px-3 py-2 rounded-lg bg-card-hover text-gray-300 text-sm">취소</button>
                </div>
              </div>
            )}

            <div className="mb-2">
              <StockSearch placeholder="종목명으로 검색하여 추가..." onSelect={(stock) => {
                if (watchlist.some((w) => w.ticker === stock.ticker)) { setSelected(stock.ticker); return; }
                saveWatchlist([...watchlist, { ticker: stock.ticker, name: stock.name, nameKr: stock.name, sector: "Custom" }]);
                setSelected(stock.ticker);
              }} />
            </div>

            {showManage && (
              <button onClick={() => { saveWatchlist(DEFAULT_WATCHLIST); setSelected(null); setShowManage(false); }}
                className="w-full px-3 py-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs mb-2">기본 종목으로 초기화</button>
            )}

            {stocks.map((stock) => (
              <div key={stock.ticker} className={`relative rounded-lg border transition-colors ${stock.ticker === selected ? "bg-accent/20 border-accent/50" : "bg-card border-border hover:bg-card-hover active:bg-card-hover"}`}>
                <button onClick={() => setSelected(stock.ticker)} className="w-full text-left px-3 sm:px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="text-xs font-mono text-gray-500">{stock.ticker.replace(".KS", "").replace(".KQ", "")}</span>
                      <div className="text-sm text-white font-medium truncate">{stock.nameKr}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-sm font-mono text-white">{formatKRW(stock.price)}</div>
                      <div className={`text-xs font-mono ${changeColor(stock.change)}`}>{stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%</div>
                    </div>
                  </div>
                </button>
                {showManage && (
                  <button onClick={() => removeStock(stock.ticker)} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center">x</button>
                )}
              </div>
            ))}
          </div>

          {/* Detail */}
          <div className={`lg:col-span-3 space-y-4 sm:space-y-6 ${!selected ? "hidden lg:block" : ""}`}>
            {selectedStock ? (
              <>
                <button onClick={() => setSelected(null)} className="lg:hidden flex items-center gap-2 text-sm text-accent mb-2 active:opacity-70">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  종목 목록
                </button>

                <div className="rounded-xl bg-card border border-border p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-bold text-white">{selectedStock.nameKr}</h2>
                        <span className="text-xs sm:text-sm font-mono text-gray-500">{selectedStock.ticker.replace(".KS", " KOSPI").replace(".KQ", " KOSDAQ")}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                          selectedStock.signal === "buy" ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : selectedStock.signal === "sell" ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }`}>{selectedStock.signal === "buy" ? "매수" : selectedStock.signal === "sell" ? "매도" : "보유"}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">{selectedStock.name}</p>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-white">{formatKRW(selectedStock.price)}</div>
                      <div className={`text-base sm:text-lg font-mono ${changeColor(selectedStock.change)}`}>
                        {selectedStock.change >= 0 ? "+" : ""}{formatKRW(selectedStock.change)} ({selectedStock.change >= 0 ? "+" : ""}{selectedStock.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                  <PriceChart ticker={selectedStock.ticker} technicals={selectedStock.technicals} />
                </div>

                <div className="rounded-xl bg-card border border-border p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3">등락 원인 분석</h3>
                  <div className="space-y-3">
                    {selectedStock.reasons.map((reason, i) => (
                      <div key={i} className={`rounded-lg border p-3 sm:p-4 ${impactColors[reason.impact]}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 rounded bg-gray-700/50 text-xs text-gray-300">{typeLabels[reason.type] || reason.type}</span>
                          <span className={`text-xs font-bold ${impactLabels[reason.impact].color}`}>{impactLabels[reason.impact].text}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-1">{reason.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-400">{reason.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-card border border-border p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3">기술적 지표</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "RSI", value: selectedStock.technicals.rsi.toFixed(1), warn: selectedStock.technicals.rsi < 30 || selectedStock.technicals.rsi > 70 },
                      { label: "MACD", value: selectedStock.technicals.macd.toFixed(1) },
                      { label: "MA20", value: formatKRW(selectedStock.technicals.ma20) },
                      { label: "MA50", value: formatKRW(selectedStock.technicals.ma50) },
                      { label: "MA200", value: formatKRW(selectedStock.technicals.ma200) },
                      { label: "지지선", value: formatKRW(selectedStock.technicals.supportLevel) },
                      { label: "저항선", value: formatKRW(selectedStock.technicals.resistanceLevel) },
                      { label: "볼린저 폭", value: formatKRW(selectedStock.technicals.bollingerUpper - selectedStock.technicals.bollingerLower) },
                    ].map((item) => (
                      <div key={item.label} className="bg-gray-800/50 rounded-lg p-2.5 sm:p-3">
                        <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                        <div className={`text-xs sm:text-sm font-mono font-bold truncate ${item.warn ? "text-yellow-400" : "text-white"}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <AnalysisTools stock={selectedStock} />
                <AnalystPanel ticker={selectedStock.ticker} currentPrice={selectedStock.price} />
                <StockNewsPanel stockName={selectedStock.nameKr} ticker={selectedStock.ticker} />
              </>
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center py-20 text-gray-500">
                <p>왼쪽에서 종목을 선택하세요</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
