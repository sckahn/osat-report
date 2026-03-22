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
} from "recharts";

export default function OsatIndexChart() {
  const [data, setData] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    fetch("/api/market?type=index-history")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data.length) return <div className="h-64 flex items-center justify-center text-gray-500">Loading...</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
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
        <YAxis stroke="#64748b" fontSize={11} domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#e2e8f0",
          }}
          formatter={(value) => [Number(value).toFixed(2), "OSAT Index"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          fill="url(#indexGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
