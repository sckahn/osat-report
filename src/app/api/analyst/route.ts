import { NextRequest, NextResponse } from "next/server";
import { fetchAnalystData } from "@/lib/yahoo-finance";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "ticker required" }, { status: 400 });
  }
  const data = await fetchAnalystData(ticker);
  return NextResponse.json(data);
}
