import { NextRequest, NextResponse } from "next/server";
import { fetchStockNews } from "@/lib/stock-news-fetcher";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  const ticker = request.nextUrl.searchParams.get("ticker") || "";
  if (!name) {
    return NextResponse.json({ error: "name parameter required" }, { status: 400 });
  }

  const isKr = ticker.endsWith(".KS") || ticker.endsWith(".KQ");
  const news = await fetchStockNews(name, isKr);
  return NextResponse.json(news);
}
