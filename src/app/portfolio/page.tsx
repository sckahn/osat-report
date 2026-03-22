"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StockAnalysis } from "@/lib/types";
import DatePicker from "@/components/DatePicker";
import PriceChart from "@/components/PriceChart";
import StockNewsPanel from "@/components/StockNewsPanel";
import AnalysisTools from "@/components/AnalysisTools";
import AnalystPanel from "@/components/AnalystPanel";
import StockSearch from "@/components/StockSearch";

interface WatchlistItem {
  ticker: string;
  name: string;
  nameKr: string;
  sector: string;
}

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { ticker: "ASX", name: "ASE Technology", nameKr: "ASE 테크놀로지", sector: "OSAT" },
  { ticker: "AMKR", name: "Amkor Technology", nameKr: "앰코 테크놀로지", sector: "OSAT" },
  { ticker: "TSM", name: "TSMC", nameKr: "TSMC", sector: "Foundry" },
  { ticker: "NVDA", name: "NVIDIA", nameKr: "엔비디아", sector: "Fabless" },
  { ticker: "AMD", name: "AMD", nameKr: "AMD", sector: "Fabless" },
];

const STORAGE_KEY = "osat-watchlist";

function loadWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return DEFAULT_WATCHLIST;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch { return DEFAULT_WATCHLIST; }
  }
  return DEFAULT_WATCHLIST;
}

const impactColors: Record<string, string> = {
  positive: "border-green-500/30 bg-green-500/10",
  negative: "border-red-500/30 bg-red-500/10",
  neutral: "border-gray-500/30 bg-gray-500/10",
};

const impactLabels: Record<string, { text: string; color: string }> = {
  positive: { text: "호재", color: "text-green-400" },
  negative: { text: "악재", color: "text-red-400" },
  neutral: { text: "중립", color: "text-gray-400" },
};

const typeLabels: Record<string, string> = {
  earnings: "실적", news: "뉴스", sector: "섹터",
  technical: "기술적", macro: "거시경제",
};

export default function PortfolioPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" /></div>}>
      <PortfolioContent />
    </Suspense>
  );
}

function PortfolioContent() {
  const searchParams = useSearchParams();
  const initialTicker = searchParams.get("ticker");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [stocks, setStocks] = useState<StockAnalysis[]>([]);
  const [selected, setSelected] = useState<string | null>(initialTicker);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [newTicker, setNewTicker] = useState("");
  const [newName, setNewName] = useState("");
  const [newNameKr, setNewNameKr] = useState("");
  const [newSector, setNewSector] = useState("OSAT");

  useEffect(() => { setWatchlist(loadWatchlist()); }, []);

  const saveWatchlist = useCallback((list: WatchlistItem[]) => {
    setWatchlist(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }, []);

  useEffect(() => {
    if (watchlist.length === 0) return;
    setLoading(true);
    const customParam = encodeURIComponent(JSON.stringify(watchlist));
    fetch(`/api/stocks?date=${date}&custom=${customParam}`)
      .then((r) => r.json())
      .then((data) => { setStocks(data); setLoading(false); });
  }, [date, watchlist]);

  const addStock = () => {
    const ticker = newTicker.trim().toUpperCase();
    if (!ticker || watchlist.some((w) => w.ticker === ticker)) return;
    saveWatchlist([...watchlist, { ticker, name: newName.trim() || ticker, nameKr: newNameKr.trim() || ticker, sector: newSector || "Custom" }]);
    setNewTicker(""); setNewName(""); setNewNameKr(""); setNewSector("OSAT"); setShowAddModal(false);
  };

  const removeStock = (ticker: string) => {
    saveWatchlist(watchlist.filter((w) => w.ticker !== ticker));
    if (selected === ticker) setSelected(null);
  };

  const selectedStock = stocks.find((s) => s.ticker === selected);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">종목 등락 원인 분석 리포트</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">나의 보유 종목을 추가하고 등락 원인을 분석합니다</p>
        </div>
        <DatePicker value={date} onChange={setDate} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Stock List - hidden on mobile when stock is selected */}
          <div className={`space-y-2 ${selected ? "hidden lg:block" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">내 종목 ({watchlist.length})</h2>
              <div className="flex gap-1">
                <button onClick={() => setShowManage(!showManage)} className="px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-card-hover transition-colors">
                  {showManage ? "완료" : "관리"}
                </button>
                <button onClick={() => setShowAddModal(true)} className="px-2 py-1 rounded text-xs bg-accent/20 text-accent hover:bg-accent/30 transition-colors">+ 추가</button>
              </div>
            </div>

            {showAddModal && (
              <div className="rounded-xl bg-card border border-accent/30 p-4 space-y-3 mb-2">
                <h3 className="text-sm font-semibold text-white">종목 추가</h3>
                <input type="text" value={newTicker} onChange={(e) => setNewTicker(e.target.value.toUpperCase())} placeholder="티커 (예: AAPL)"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-accent" />
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="영문명"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-accent" />
                <input type="text" value={newNameKr} onChange={(e) => setNewNameKr(e.target.value)} placeholder="한글명"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:outline-none focus:border-accent" />
                <select value={newSector} onChange={(e) => setNewSector(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm">
                  <option value="OSAT">OSAT</option><option value="Foundry">Foundry</option><option value="Fabless">Fabless</option>
                  <option value="IDM">IDM</option><option value="Memory">Memory</option><option value="Custom">기타</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={addStock} disabled={!newTicker.trim()} className="flex-1 px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-40">추가</button>
                  <button onClick={() => setShowAddModal(false)} className="px-3 py-2 rounded-lg bg-card-hover text-gray-300 text-sm">취소</button>
                </div>
              </div>
            )}

            <div className="mb-2">
              <StockSearch placeholder="종목명/티커로 검색하여 추가..." onSelect={(stock) => {
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
                      <span className="text-xs font-mono text-accent">{stock.ticker}</span>
                      <div className="text-sm text-white truncate">{stock.nameKr}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-sm font-mono text-white">${stock.price.toFixed(2)}</div>
                      <div className={`text-xs font-mono ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </button>
                {showManage && (
                  <button onClick={() => removeStock(stock.ticker)} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center">x</button>
                )}
              </div>
            ))}
          </div>

          {/* Detail - full width on mobile when selected */}
          <div className={`lg:col-span-3 space-y-4 sm:space-y-6 ${!selected ? "hidden lg:block" : ""}`}>
            {selectedStock ? (
              <>
                {/* Back button - mobile only */}
                <button onClick={() => setSelected(null)} className="lg:hidden flex items-center gap-2 text-sm text-accent mb-2 active:opacity-70">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  종목 목록
                </button>

                {/* Stock Header */}
                <div className="rounded-xl bg-card border border-border p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-bold text-white">{selectedStock.nameKr}</h2>
                        <span className="text-sm font-mono text-accent">{selectedStock.ticker}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                          selectedStock.signal === "buy" ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : selectedStock.signal === "sell" ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }`}>{selectedStock.signal === "buy" ? "매수" : selectedStock.signal === "sell" ? "매도" : "보유"}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">{selectedStock.name}</p>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-white">${selectedStock.price.toFixed(2)}</div>
                      <div className={`text-base sm:text-lg font-mono ${selectedStock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {selectedStock.change >= 0 ? "+" : ""}{selectedStock.change.toFixed(2)} ({selectedStock.change >= 0 ? "+" : ""}{selectedStock.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                  <PriceChart ticker={selectedStock.ticker} technicals={selectedStock.technicals} />
                </div>

                {/* Reasons */}
                <div className="rounded-xl bg-card border border-border p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">등락 원인 분석</h3>
                  <div className="space-y-3">
                    {selectedStock.reasons.map((reason, i) => (
                      <div key={i} className={`rounded-lg border p-3 sm:p-4 ${impactColors[reason.impact]}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 rounded bg-gray-700/50 text-xs text-gray-300">{typeLabels[reason.type]}</span>
                          <span className={`text-xs font-bold ${impactLabels[reason.impact].color}`}>{impactLabels[reason.impact].text}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-1">{reason.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-400">{reason.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technicals */}
                <div className="rounded-xl bg-card border border-border p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">기술적 지표</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { label: "RSI", value: selectedStock.technicals.rsi.toFixed(1), warn: selectedStock.technicals.rsi < 30 || selectedStock.technicals.rsi > 70 },
                      { label: "MACD", value: selectedStock.technicals.macd.toFixed(3) },
                      { label: "MA20", value: `$${selectedStock.technicals.ma20.toFixed(2)}` },
                      { label: "MA50", value: `$${selectedStock.technicals.ma50.toFixed(2)}` },
                      { label: "MA200", value: `$${selectedStock.technicals.ma200.toFixed(2)}` },
                      { label: "지지선", value: `$${selectedStock.technicals.supportLevel.toFixed(2)}` },
                      { label: "저항선", value: `$${selectedStock.technicals.resistanceLevel.toFixed(2)}` },
                      { label: "볼린저 폭", value: `${(selectedStock.technicals.bollingerUpper - selectedStock.technicals.bollingerLower).toFixed(2)}` },
                    ].map((item) => (
                      <div key={item.label} className="bg-gray-800/50 rounded-lg p-2.5 sm:p-3">
                        <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                        <div className={`text-xs sm:text-sm font-mono font-bold ${item.warn ? "text-yellow-400" : "text-white"}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <AnalysisTools stock={selectedStock} />
                <AnalystPanel ticker={selectedStock.ticker} currentPrice={selectedStock.price} />
                <StockNewsPanel stockName={selectedStock.name} ticker={selectedStock.ticker} />
              </>
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center py-20 text-gray-500">
                <p className="mb-2">왼쪽에서 종목을 선택하면 상세 분석 리포트를 확인할 수 있습니다.</p>
                <p className="text-xs text-gray-600">&quot;+ 추가&quot; 버튼으로 원하는 종목을 추가하세요</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
