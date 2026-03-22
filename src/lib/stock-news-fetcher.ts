import type { OsatNews } from "./types";

const CACHE: Map<string, { data: OsatNews[]; ts: number }> = new Map();
const CACHE_TTL = 10 * 60 * 1000;

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

function parseSentiment(title: string): OsatNews["sentiment"] {
  const lower = title.toLowerCase();
  const pos = ["growth", "surge", "rise", "expand", "record", "strong", "boost", "상승", "성장", "호실적", "확장", "급등", "수주", "증가"];
  const neg = ["drop", "fall", "decline", "cut", "loss", "weak", "slump", "하락", "감소", "악화", "급락", "둔화", "우려"];
  if (pos.some((w) => lower.includes(w))) return "positive";
  if (neg.some((w) => lower.includes(w))) return "negative";
  return "neutral";
}

function parseCategory(title: string): OsatNews["category"] {
  const lower = title.toLowerCase();
  if (/earnings|revenue|profit|실적|매출|영업이익/.test(lower)) return "earnings";
  if (/merger|acqui|인수|합병/.test(lower)) return "merger";
  if (/policy|tariff|sanction|regulation|규제|정책|수출/.test(lower)) return "policy";
  if (/technology|cowos|hbm|chiplet|packaging|기술|패키징|공정/.test(lower)) return "technology";
  return "market";
}

export async function fetchStockNews(stockName: string, isKr: boolean): Promise<OsatNews[]> {
  const cacheKey = `stock-news:${stockName}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const lang = isKr ? "ko" : "en";
    const gl = isKr ? "KR" : "US";
    const ceid = isKr ? "KR:ko" : "US:en";
    const query = isKr ? `${stockName} 주가 분석` : `${stockName} stock analysis`;
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${lang}&gl=${gl}&ceid=${ceid}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const xml = await res.text();
    const items = parseRssXml(xml);

    const news: OsatNews[] = items.slice(0, 10).map((item, i) => ({
      id: `sn-${i}-${Date.now()}`,
      date: item.pubDate ? new Date(item.pubDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      title: item.title,
      summary: item.title,
      source: item.source,
      url: item.link,
      category: parseCategory(item.title),
      sentiment: parseSentiment(item.title),
      relatedCompanies: [],
    }));

    CACHE.set(cacheKey, { data: news, ts: Date.now() });
    return news;
  } catch (error) {
    console.error(`Stock news fetch error for ${stockName}:`, error);
    return [];
  }
}
