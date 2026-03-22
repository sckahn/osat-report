import { NextRequest, NextResponse } from "next/server";
import { getTheme } from "@/lib/themes";
import { fetchQuotes } from "@/lib/yahoo-finance";
import type { OsatNews } from "@/lib/types";

const NEWS_CACHE: Map<string, { data: OsatNews[]; ts: number }> = new Map();
const CACHE_TTL = 15 * 60 * 1000;

function parseRssXml(xml: string) {
  const items: Array<{ title: string; link: string; pubDate: string; source: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const x = match[1];
    const title = x.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";
    const link = x.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || "#";
    const pubDate = x.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || "";
    const parts = title.split(" - ");
    const source = parts.length > 1 ? parts.pop()!.trim() : "News";
    items.push({ title: parts.join(" - ").trim(), link, pubDate, source });
  }
  return items;
}

function parseSentiment(title: string): OsatNews["sentiment"] {
  const l = title.toLowerCase();
  if (/growth|surge|rise|expand|record|strong|boost|상승|성장|호실적|급등|수주|증가/.test(l)) return "positive";
  if (/drop|fall|decline|cut|loss|weak|slump|하락|감소|악화|급락|둔화|우려/.test(l)) return "negative";
  return "neutral";
}

function parseCategory(title: string): OsatNews["category"] {
  const l = title.toLowerCase();
  if (/earnings|revenue|profit|실적|매출|영업이익/.test(l)) return "earnings";
  if (/merger|acqui|인수|합병/.test(l)) return "merger";
  if (/policy|tariff|sanction|regulation|규제|정책|수출/.test(l)) return "policy";
  if (/technology|기술|개발|특허/.test(l)) return "technology";
  return "market";
}

async function fetchThemeNews(themeId: string): Promise<OsatNews[]> {
  const cacheKey = `theme-news:${themeId}`;
  const cached = NEWS_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const theme = getTheme(themeId);
  if (!theme) return [];

  const queries = [...theme.newsQueries, ...theme.newsQueriesKr];
  const allNews: OsatNews[] = [];
  const seenTitles = new Set<string>();

  const results = await Promise.allSettled(
    queries.map(async (query) => {
      const isKr = /[가-힣]/.test(query);
      const hl = isKr ? "ko" : "en";
      const gl = isKr ? "KR" : "US";
      const ceid = isKr ? "KR:ko" : "US:en";
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      return parseRssXml(await res.text());
    })
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) {
      if (seenTitles.has(item.title)) continue;
      seenTitles.add(item.title);
      allNews.push({
        id: `tn-${allNews.length}-${Date.now()}`,
        date: item.pubDate ? new Date(item.pubDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        title: item.title, summary: item.title, source: item.source, url: item.link,
        category: parseCategory(item.title), sentiment: parseSentiment(item.title), relatedCompanies: [],
      });
    }
  }

  allNews.sort((a, b) => b.date.localeCompare(a.date));
  const limited = allNews.slice(0, 30);
  NEWS_CACHE.set(cacheKey, { data: limited, ts: Date.now() });
  return limited;
}

export async function GET(request: NextRequest) {
  const themeId = request.nextUrl.searchParams.get("id");
  const type = request.nextUrl.searchParams.get("type") || "stocks";

  if (!themeId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const theme = getTheme(themeId);
  if (!theme) return NextResponse.json({ error: "theme not found" }, { status: 404 });

  if (type === "news") {
    const news = await fetchThemeNews(themeId);
    return NextResponse.json(news);
  }

  try {
    const tickers = theme.stocks.map((s) => s.ticker);
    const analyses = await fetchQuotes(tickers);
    for (const a of analyses) {
      const s = theme.stocks.find((st) => st.ticker === a.ticker);
      if (s) a.nameKr = s.nameKr;
    }
    return NextResponse.json(analyses);
  } catch (e) {
    console.error("Theme stocks error:", e);
    return NextResponse.json([]);
  }
}
