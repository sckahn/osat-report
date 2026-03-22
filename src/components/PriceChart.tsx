"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PriceHistory, TechnicalIndicators } from "@/lib/types";

function isKrTicker(ticker: string) {
  return ticker.endsWith(".KS") || ticker.endsWith(".KQ");
}

function formatPrice(value: number, kr: boolean) {
  if (kr) return value.toLocaleString("ko-KR") + "원";
  return `$${value.toFixed(2)}`;
}

export default function PriceChart({
  ticker,
  technicals,
}: {
  ticker: string;
  technicals?: TechnicalIndicators;
}) {
  const [data, setData] = useState<PriceHistory[]>([]);
  const kr = isKrTicker(ticker);

  useEffect(() => {
    const apiBase = kr ? "/api/kr" : "/api/stocks";
    fetch(`${apiBase}?type=price-history&ticker=${ticker}`)
      .then((r) => r.json())
      .then(setData);
  }, [ticker, kr]);

  if (!data.length)
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`priceGrad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="date"
          stroke="#64748b"
          fontSize={11}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis
          stroke="#64748b"
          fontSize={11}
          domain={["auto", "auto"]}
          tickFormatter={(v) => kr ? `${(v / 1000).toFixed(0)}K` : `$${v}`}
        />
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#e2e8f0",
          }}
          formatter={(value) => [formatPrice(Number(value), kr), "종가"]}
        />
        {technicals && (
          <>
            <ReferenceLine
              y={technicals.supportLevel}
              stroke="#22c55e"
              strokeDasharray="5 5"
              label={{ value: "지지선", fill: "#22c55e", fontSize: 10 }}
            />
            <ReferenceLine
              y={technicals.resistanceLevel}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ value: "저항선", fill: "#ef4444", fontSize: 10 }}
            />
          </>
        )}
        <Area
          type="monotone"
          dataKey="close"
          stroke="#3b82f6"
          fill={`url(#priceGrad-${ticker})`}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
