import type { OsatNews } from "./types";

const NEWS_CACHE: Map<string, { data: OsatNews[]; ts: number }> = new Map();
const CACHE_TTL = 15 * 60 * 1000;

const SEARCH_QUERIES_KR = [
  "OSAT 반도체 패키징",
  "반도체 후공정 OSAT",
  "삼성전자 SK하이닉스 반도체",
  "HBM 패키징 반도체",
  "반도체 장비 소부장",
];

function parseCategory(title: string): OsatNews["category"] {
  if (/실적|매출|영업이익|분기|어닝/.test(title)) return "earnings";
  if (/인수|합병|M&A/.test(title)) return "merger";
  if (/규제|정책|수출|관세|제재/.test(title)) return "policy";
  if (/기술|패키징|CoWoS|HBM|chiplet|공정|개발/.test(title)) return "technology";
  return "market";
}

function parseSentiment(title: string): OsatNews["sentiment"] {
  if (/상승|성장|호실적|확장|신고가|호재|급등|수주|증가|기대/.test(title)) return "positive";
  if (/하락|감소|악화|위기|부진|급락|악재|둔화|우려/.test(title)) return "negative";
  return "neutral";
}

function extractCompanies(text: string): string[] {
  const mapping: Record<string, string> = {
    삼성전자: "005930.KS",
    SK하이닉스: "000660.KS",
    하이닉스: "000660.KS",
    네이버: "035420.KS",
    카카오: "035720.KS",
    한미반도체: "042700.KS",
    리노공업: "058470.KS",
    TSMC: "TSM",
    ASE: "ASX",
    앰코: "AMKR",
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
    const source = parts.length > 1 ? parts.pop()!.trim() : "뉴스";
    const cleanTitle = parts.join(" - ").trim();

    items.push({ title: cleanTitle, link, pubDate, source });
  }

  return items;
}

export async function fetchKrNews(): Promise<OsatNews[]> {
  const cacheKey = "kr-news";
  const cached = NEWS_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const allNews: OsatNews[] = [];

  try {
    const results = await Promise.allSettled(
      SEARCH_QUERIES_KR.map(async (query) => {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
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

        const itemDate = item.pubDate
          ? new Date(item.pubDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        allNews.push({
          id: `kr-${allNews.length}-${Date.now()}`,
          date: itemDate,
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
    const limited = allNews.slice(0, 40);

    NEWS_CACHE.set(cacheKey, { data: limited, ts: Date.now() });
    return limited;
  } catch (error) {
    console.error("KR news fetch error:", error);
    return [];
  }
}
