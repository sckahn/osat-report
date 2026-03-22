"use client";

import { StockAnalysis } from "@/lib/types";
import Link from "next/link";

const signalLabels = {
  buy: { text: "매수", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  sell: { text: "매도", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  hold: { text: "보유", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

function isKr(ticker: string) {
  return ticker.endsWith(".KS") || ticker.endsWith(".KQ");
}

function fmtPrice(price: number, kr: boolean) {
  return kr ? price.toLocaleString("ko-KR") + "원" : `$${price.toFixed(2)}`;
}

export default function StockTable({
  stocks,
  showSignal = false,
}: {
  stocks: StockAnalysis[];
  showSignal?: boolean;
}) {
  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      <table className="w-full text-xs sm:text-sm min-w-[500px]">
        <thead>
          <tr className="border-b border-border text-gray-400">
            <th className="text-left py-2.5 sm:py-3 px-2">종목</th>
            <th className="text-right py-2.5 sm:py-3 px-2">현재가</th>
            <th className="text-right py-2.5 sm:py-3 px-2 hidden sm:table-cell">등락</th>
            <th className="text-right py-2.5 sm:py-3 px-2">등락률</th>
            <th className="text-right py-2.5 sm:py-3 px-2 hidden sm:table-cell">RSI</th>
            {showSignal && <th className="text-center py-2.5 sm:py-3 px-2">시그널</th>}
            <th className="text-center py-2.5 sm:py-3 px-2">강도</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const isPositive = stock.change >= 0;
            const signal = signalLabels[stock.signal];
            const kr = isKr(stock.ticker);
            const linkHref = kr ? `/kr` : `/portfolio?ticker=${stock.ticker}`;
            return (
              <tr key={stock.ticker} className="border-b border-border/50 hover:bg-card-hover active:bg-card-hover transition-colors">
                <td className="py-2.5 sm:py-3 px-2">
                  <Link href={linkHref} className="hover:text-accent transition-colors">
                    <span className="font-mono text-accent text-xs mr-1.5">
                      {stock.ticker.replace(".KS", "").replace(".KQ", "")}
                    </span>
                    <span className="text-white">{stock.nameKr}</span>
                  </Link>
                </td>
                <td className="text-right py-2.5 sm:py-3 px-2 font-mono text-white whitespace-nowrap">
                  {fmtPrice(stock.price, kr)}
                </td>
                <td className={`text-right py-2.5 sm:py-3 px-2 font-mono hidden sm:table-cell ${isPositive ? "text-green-400" : "text-red-400"}`}>
                  {isPositive ? "+" : ""}{kr ? fmtPrice(stock.change, true) : stock.change.toFixed(2)}
                </td>
                <td className={`text-right py-2.5 sm:py-3 px-2 font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
                  {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                </td>
                <td className="text-right py-2.5 sm:py-3 px-2 font-mono text-gray-300 hidden sm:table-cell">
                  {stock.technicals.rsi.toFixed(1)}
                </td>
                {showSignal && (
                  <td className="text-center py-2.5 sm:py-3 px-2">
                    <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-bold border ${signal.color}`}>
                      {signal.text}
                    </span>
                  </td>
                )}
                <td className="text-center py-2.5 sm:py-3 px-2">
                  <div className="w-12 sm:w-16 mx-auto h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stock.signal === "buy" ? "bg-green-500" : stock.signal === "sell" ? "bg-red-500" : "bg-yellow-500"}`}
                      style={{ width: `${stock.signalStrength}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
