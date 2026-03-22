import { OsatNews } from "@/lib/types";

const categoryLabels: Record<string, string> = {
  market: "시장",
  earnings: "실적",
  technology: "기술",
  policy: "정책",
  merger: "M&A",
};

const categoryColors: Record<string, string> = {
  market: "bg-blue-500/20 text-blue-400",
  earnings: "bg-green-500/20 text-green-400",
  technology: "bg-purple-500/20 text-purple-400",
  policy: "bg-yellow-500/20 text-yellow-400",
  merger: "bg-orange-500/20 text-orange-400",
};

const sentimentIcons: Record<string, { icon: string; color: string }> = {
  positive: { icon: "^", color: "text-green-400" },
  negative: { icon: "v", color: "text-red-400" },
  neutral: { icon: "-", color: "text-gray-400" },
};

export default function NewsCard({ news }: { news: OsatNews }) {
  const sentiment = sentimentIcons[news.sentiment];

  return (
    <div className="rounded-xl bg-card border border-border p-5 hover:bg-card-hover transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[news.category]}`}
          >
            {categoryLabels[news.category]}
          </span>
          <span className={`text-sm font-bold ${sentiment.color}`}>
            {sentiment.icon === "^" ? "+" : sentiment.icon === "v" ? "-" : "~"}
          </span>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{news.source}</span>
      </div>
      <h3 className="text-base font-semibold text-white mb-2 leading-snug">
        {news.title}
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed mb-3">{news.summary}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {news.relatedCompanies.map((company) => (
          <span
            key={company}
            className="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-mono"
          >
            {company}
          </span>
        ))}
      </div>
    </div>
  );
}
