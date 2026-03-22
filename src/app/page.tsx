"use client";

import { useEffect, useState } from "react";
import { OsatNews, MarketOverview } from "@/lib/types";
import DatePicker from "@/components/DatePicker";
import NewsCard from "@/components/NewsCard";
import OsatIndexChart from "@/components/OsatIndexChart";
import SectorBar from "@/components/SectorBar";

export default function MarketPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [news, setNews] = useState<OsatNews[]>([]);
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/market?type=news&date=${date}`).then((r) => r.json()),
      fetch(`/api/market?type=overview&date=${date}`).then((r) => r.json()),
    ]).then(([newsData, overviewData]) => {
      setNews(newsData);
      setOverview(overviewData);
      setLoading(false);
    });
  }, [date]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">OSAT 국제 시장 동향</h1>
          <p className="text-sm text-gray-400 mt-1">
            날짜별 OSAT 반도체 패키징/테스트 시장 뉴스 및 분석
          </p>
        </div>
        <DatePicker value={date} onChange={setDate} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: News */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              {date} 주요 뉴스 ({news.length}건)
            </h2>
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>

          {/* Right: Overview */}
          <div className="space-y-6">
            {/* OSAT Index */}
            {overview && (
              <div className="rounded-xl bg-card border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    OSAT Index
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {overview.osatIndex.toFixed(2)}
                    </div>
                    <div
                      className={`text-sm font-mono ${
                        overview.osatIndexChange >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {overview.osatIndexChange >= 0 ? "+" : ""}
                      {overview.osatIndexChange.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <OsatIndexChart />
              </div>
            )}

            {/* Sector Performance */}
            {overview && (
              <div className="rounded-xl bg-card border border-border p-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                  섹터별 등락
                </h3>
                <SectorBar sectors={overview.sectorPerformance} />
              </div>
            )}

            {/* Quick Stats */}
            <div className="rounded-xl bg-card border border-border p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                시장 요약
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">전체 뉴스</div>
                  <div className="text-xl font-bold text-white">{news.length}건</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">긍정 뉴스</div>
                  <div className="text-xl font-bold text-green-400">
                    {news.filter((n) => n.sentiment === "positive").length}건
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">부정 뉴스</div>
                  <div className="text-xl font-bold text-red-400">
                    {news.filter((n) => n.sentiment === "negative").length}건
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">중립 뉴스</div>
                  <div className="text-xl font-bold text-gray-300">
                    {news.filter((n) => n.sentiment === "neutral").length}건
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
