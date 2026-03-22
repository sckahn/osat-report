import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/yahoo-finance";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length < 1) {
    return NextResponse.json([]);
  }
  const results = await searchStocks(q);
  return NextResponse.json(results);
}
