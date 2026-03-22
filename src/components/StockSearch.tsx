"use client";

import { useState, useRef, useEffect } from "react";
import { SearchResult } from "@/lib/types";

interface StockSearchProps {
  onSelect: (stock: { ticker: string; name: string; exchange: string }) => void;
  placeholder?: string;
}

export default function StockSearch({ onSelect, placeholder = "종목명 또는 티커 검색..." }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = (value: string) => {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);
    if (value.length < 1) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pl-10 rounded-lg bg-card border border-border text-white text-sm focus:outline-none focus:border-accent transition-colors"
        />
        <svg className="absolute left-3 top-3 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-accent" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg bg-card border border-border shadow-xl max-h-64 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.symbol}
              onClick={() => {
                onSelect({ ticker: r.symbol, name: r.name, exchange: r.exchange });
                setQuery("");
                setOpen(false);
                setResults([]);
              }}
              className="w-full text-left px-4 py-3 hover:bg-card-hover transition-colors flex items-center justify-between border-b border-border/50 last:border-0"
            >
              <div>
                <span className="text-sm font-medium text-white">{r.name}</span>
                <span className="text-xs text-gray-500 ml-2">{r.symbol}</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                {r.exchange}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
