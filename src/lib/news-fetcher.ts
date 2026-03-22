import type { OsatNews } from "./types";

const NEWS_CACHE: Map<string, { data: OsatNews[]; ts: number }> = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15min

const SEARCH_QUERIES = [
  "OSAT semiconductor packaging",
  "ASE Amkor semiconductor",
  "advanced packaging CoWoS HBM",
];

function parseCategory(title: string): OsatNews["category"] {
  const lower = title.toLowerCase();
  if (lower.includes("earnings") || lower.includes("revenue") || lower.includes("profit"))
    return "earnings";
  if (lower.includes("merger") || lower.includes("acqui"))
    return "merger";
  if (lower.includes("policy") || lower.includes("tariff") || lower.includes("sanction") || lower.includes("regulation"))
    return "policy";
  if (lower.includes("technology") || lower.includes("cowos") || lower.includes("hbm") || lower.includes("chiplet"))
    return "technology";
  return "market";
}

function parseSentiment(title: string): OsatNews["sentiment"] {
  const lower = title.toLowerCase();
  const positive = ["growth", "surge", "rise", "expand", "record", "strong", "boost"];
  const negative = ["drop", "fall", "decline", "cut", "loss", "weak", "slump"];
  if (positive.some((w) => lower.includes(w))) return "positive";
  if (negative.some((w) => lower.includes(w))) return "negative";
  return "neutral";
}

function extractCompanies(text: string): string[] {
  const mapping: Record<string, string> = {
    ASE: "ASX",
    Amkor: "AMKR",
    JCET: "JECT",
    Tongfu: "TFII",
    KYEC: "KYEC",
    SPIL: "SPIL",
    UTAC: "UTAC",
    Powertech: "PTI",
    TSMC: "TSM",
    Intel: "INTC",
    NVIDIA: "NVDA",
    AMD: "AMD",
  };
  const found: string[] = [];
  for (const [keyword, ticker] of Object.entries(mapping)) {
    if (text.includes(keyword) && !found.includes(ticker)) {
      found.push(ticker);
    }
  }
  return found;
}

function parseRssXml(xml: string): Array<{ title: string; link: string; pubDate: string; source: string }> {
  const items: Array<{ title: string; link: string; pubDate: string; source: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";
    const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || "#";
    const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || "";
    const parts = title.split(" - ");
    const source = parts.length > 1 ? parts.pop()!.trim() : "News";
    const cleanTitle = parts.join(" - ").trim();

    items.push({ title: cleanTitle, link, pubDate, source });
  }

  return items;
}

export async function fetchOsatNews(date?: string): Promise<OsatNews[]> {
  const cacheKey = `news:${date || "latest"}`;
  const cached = NEWS_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const allNews: OsatNews[] = [];

  try {
    const results = await Promise.allSettled(
      SEARCH_QUERIES.map(async (query) => {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=US&ceid=US:en`;
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        const xml = await res.text();
        return parseRssXml(xml);
      })
    );

    const seenTitles = new Set<string>();

    for (const result of results) {
      if (result.status !== "fulfilled") continue;

      for (const item of result.value) {
        if (seenTitles.has(item.title)) continue;
        seenTitles.add(item.title);

        const itemDate = item.pubDate ? new Date(item.pubDate).toISOString().split("T")[0] : "";

        if (date && itemDate && itemDate !== date) continue;

        allNews.push({
          id: `news-${allNews.length}-${Date.now()}`,
          date: itemDate || new Date().toISOString().split("T")[0],
          title: item.title,
          summary: item.title,
          source: item.source,
          url: item.link,
          category: parseCategory(item.title),
          sentiment: parseSentiment(item.title),
          relatedCompanies: extractCompanies(item.title),
        });
      }
    }

    allNews.sort((a, b) => b.date.localeCompare(a.date));
    const limited = allNews.slice(0, 30);

    NEWS_CACHE.set(cacheKey, { data: limited, ts: Date.now() });
    return limited;
  } catch (error) {
    console.error("News fetch error:", error);
    return [];
  }
}
