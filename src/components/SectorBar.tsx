import { SectorPerformance } from "@/lib/types";

export default function SectorBar({ sectors }: { sectors: SectorPerformance[] }) {
  return (
    <div className="space-y-3">
      {sectors.map((sector) => {
        const isPositive = sector.change >= 0;
        const width = Math.min(Math.abs(sector.change) * 15, 100);
        return (
          <div key={sector.sector} className="flex items-center gap-3">
            <span className="w-20 text-sm text-gray-400 text-right">{sector.sector}</span>
            <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all ${
                  isPositive ? "bg-green-500/60" : "bg-red-500/60"
                }`}
                style={{ width: `${width}%` }}
              />
            </div>
            <span
              className={`w-16 text-sm font-mono text-right ${
                isPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {sector.change.toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
