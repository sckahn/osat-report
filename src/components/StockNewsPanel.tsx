"use client";

import { useEffect, useState } from "react";
import { OsatNews } from "@/lib/types";
import NewsCard from "./NewsCard";

export default function StockNewsPanel({
  stockName,
  ticker,
}: {
  stockName: string;
  ticker: string;
}) {
  const [news, setNews] = useState<OsatNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stockName) return;
    setLoading(true);
    fetch(
      `/api/stock-news?name=${encodeURIComponent(stockName)}&ticker=${encodeURIComponent(ticker)}`
    )
      .then((r) => r.json())
      .then((data) => {
        setNews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [stockName, ticker]);

  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        {stockName} 관련 뉴스
      </h3>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent" />
        </div>
      ) : news.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">관련 뉴스가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      )}
    </div>
  );
}
