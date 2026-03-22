"use client";

import { useEffect, useState } from "react";
import { AnalystData } from "@/lib/types";

function isKr(ticker: string) {
  return ticker.endsWith(".KS") || ticker.endsWith(".KQ");
}

function fmt(value: number | null, kr: boolean) {
  if (value == null) return "-";
  if (kr) return value.toLocaleString("ko-KR") + "원";
  return `$${value.toFixed(2)}`;
}

const recLabels: Record<string, { text: string; color: string }> = {
  strong_buy: { text: "적극 매수", color: "text-green-400" },
  buy: { text: "매수", color: "text-green-300" },
  hold: { text: "보유", color: "text-yellow-400" },
  underperform: { text: "시장 하회", color: "text-orange-400" },
  sell: { text: "매도", color: "text-red-400" },
};

const actionLabels: Record<string, string> = {
  main: "유지",
  up: "상향",
  down: "하향",
  init: "커버리지 개시",
  reit: "재확인",
};

export default function AnalystPanel({
  ticker,
  currentPrice,
}: {
  ticker: string;
  currentPrice: number;
}) {
  const [data, setData] = useState<AnalystData | null>(null);
  const [loading, setLoading] = useState(true);
  const kr = isKr(ticker);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analyst?ticker=${encodeURIComponent(ticker)}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ticker]);

  if (loading) {
    return (
      <div className="rounded-xl bg-card border border-border p-6">
        <h3 className="text-lg font-semibold text-white mb-4">애널리스트 의견</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent" />
        </div>
      </div>
    );
  }

  if (!data || (!data.recommendation && !data.trend)) {
    return (
      <div className="rounded-xl bg-card border border-border p-6">
        <h3 className="text-lg font-semibold text-white mb-4">애널리스트 의견</h3>
        <p className="text-sm text-gray-500">애널리스트 데이터가 없습니다.</p>
      </div>
    );
  }

  const rec = recLabels[data.recommendation || ""] || { text: data.recommendation || "-", color: "text-gray-400" };
  const upside = data.targetMean ? ((data.targetMean - currentPrice) / currentPrice) * 100 : null;
  const totalVotes = data.trend ? data.trend.strongBuy + data.trend.buy + data.trend.hold + data.trend.sell + data.trend.strongSell : 0;

  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">애널리스트 의견</h3>
        <span className="text-xs text-gray-500">{data.numberOfAnalysts}명 참여</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Consensus */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">컨센서스</div>
          <div className={`text-2xl font-bold ${rec.color}`}>{rec.text}</div>
          {data.recommendationScore && (
            <div className="text-xs text-gray-500 mt-1">
              점수: {data.recommendationScore.toFixed(2)} / 5.0
            </div>
          )}
        </div>

        {/* Target Price */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">목표 주가</div>
          <div className="text-2xl font-bold text-white">{fmt(data.targetMean, kr)}</div>
          {upside != null && (
            <div className={`text-xs mt-1 ${upside >= 0 ? "text-green-400" : "text-red-400"}`}>
              {upside >= 0 ? "+" : ""}{upside.toFixed(1)}% 상승 여력
            </div>
          )}
        </div>
      </div>

      {/* Target Range */}
      {data.targetLow != null && data.targetHigh != null && (
        <div className="mb-5">
          <div className="text-xs text-gray-500 mb-2">목표가 범위</div>
          <div className="relative h-3 bg-gray-700 rounded-full">
            {/* Current price marker */}
            <div
              className="absolute top-0 h-full w-0.5 bg-white z-10"
              style={{
                left: `${Math.max(0, Math.min(100, ((currentPrice - data.targetLow) / (data.targetHigh - data.targetLow)) * 100))}%`,
              }}
            />
            {/* Mean target marker */}
            {data.targetMean && (
              <div
                className="absolute top-0 h-full w-0.5 bg-accent z-10"
                style={{
                  left: `${((data.targetMean - data.targetLow) / (data.targetHigh - data.targetLow)) * 100}%`,
                }}
              />
            )}
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500/40 via-yellow-500/40 to-green-500/40 rounded-full w-full" />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{fmt(data.targetLow, kr)}</span>
            <span className="text-white">현재: {fmt(currentPrice, kr)}</span>
            <span>{fmt(data.targetHigh, kr)}</span>
          </div>
        </div>
      )}

      {/* Recommendation Distribution */}
      {data.trend && totalVotes > 0 && (
        <div className="mb-5">
          <div className="text-xs text-gray-500 mb-2">투자의견 분포</div>
          <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
            {[
              { count: data.trend.strongBuy, color: "bg-green-500", label: "적극매수" },
              { count: data.trend.buy, color: "bg-green-400", label: "매수" },
              { count: data.trend.hold, color: "bg-yellow-500", label: "보유" },
              { count: data.trend.sell, color: "bg-orange-500", label: "매도" },
              { count: data.trend.strongSell, color: "bg-red-500", label: "적극매도" },
            ].filter((s) => s.count > 0).map((s, i) => (
              <div
                key={i}
                className={`${s.color} flex items-center justify-center text-xs font-bold text-black`}
                style={{ width: `${(s.count / totalVotes) * 100}%` }}
                title={`${s.label}: ${s.count}`}
              >
                {s.count}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>매수 {data.trend.strongBuy + data.trend.buy}</span>
            <span>보유 {data.trend.hold}</span>
            <span>매도 {data.trend.sell + data.trend.strongSell}</span>
          </div>
        </div>
      )}

      {/* Recent Upgrades/Downgrades */}
      {data.upgrades.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-2">최근 투자의견 변경</div>
          <div className="space-y-2">
            {data.upgrades.map((u, i) => (
              <div key={i} className="flex items-center justify-between text-sm bg-gray-800/30 rounded-lg px-3 py-2">
                <div>
                  <span className="text-white font-medium">{u.firm}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    u.action === "up" ? "bg-green-500/20 text-green-400" :
                    u.action === "down" ? "bg-red-500/20 text-red-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                    {actionLabels[u.action] || u.action}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-300">{u.toGrade}</span>
                  <span className="text-xs text-gray-600 ml-2">{u.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
