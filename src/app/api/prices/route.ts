import { NextResponse } from "next/server";
import { getPrices } from "@/lib/server/prices";

export async function GET() {
  const prices = await getPrices();
  return NextResponse.json(prices, { headers: { "cache-control": "public, max-age=30, s-maxage=60" } });
}
