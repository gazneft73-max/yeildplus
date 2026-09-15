import "server-only";
import { ASSETS, type Asset, type PriceInfo, type PriceMap } from "../types";

// Fallback snapshot used only when the public price API is unreachable.
const FALLBACK: Record<Asset, number> = {
  USDT: 1, BTC: 64000, ETH: 3200, BNB: 580, SOL: 150, XRP: 0.55, XAUT: 2400, ADA: 0.42, DOGE: 0.13, TRX: 0.12, LTC: 75,
};

let cache: { at: number; data: PriceMap } | null = null;
const TTL = 60_000;

function synthSparkline(base: number, change: number): number[] {
  const out: number[] = [];
  const start = base / (1 + change / 100);
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    const wobble = Math.sin(i * 1.7) * 0.004 + Math.cos(i * 0.9) * 0.003;
    out.push(start + (base - start) * t + base * wobble);
  }
  return out;
}

export async function getPrices(): Promise<PriceMap> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  const ids = ASSETS.map((a) => a.geckoId).join(",");
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" +
    ids +
    "&sparkline=true&price_change_percentage=24h";
  try {
    const res = await fetch(url, { next: { revalidate: 60 }, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error("price api " + res.status);
    const rows = (await res.json()) as Array<{
      id: string;
      current_price: number;
      price_change_percentage_24h: number | null;
      market_cap: number;
      total_volume: number;
      high_24h: number;
      low_24h: number;
      sparkline_in_7d?: { price: number[] };
    }>;
    const map = {} as PriceMap;
    for (const a of ASSETS) {
      const r = rows.find((x) => x.id === a.geckoId);
      const usd = r?.current_price ?? FALLBACK[a.symbol];
      const change = r?.price_change_percentage_24h ?? 0;
      const spark = r?.sparkline_in_7d?.price?.length ? r.sparkline_in_7d.price.slice(-48) : synthSparkline(usd, change);
      map[a.symbol] = {
        usd,
        change24h: change,
        marketCap: r?.market_cap ?? 0,
        volume24h: r?.total_volume ?? 0,
        high24h: r?.high_24h ?? usd,
        low24h: r?.low_24h ?? usd,
        sparkline: spark,
      };
    }
    cache = { at: Date.now(), data: map };
    return map;
  } catch {
    if (cache) return cache.data;
    const map = {} as PriceMap;
    for (const a of ASSETS) {
      const usd = FALLBACK[a.symbol];
      const info: PriceInfo = { usd, change24h: 0, marketCap: 0, volume24h: 0, high24h: usd, low24h: usd, sparkline: synthSparkline(usd, 0) };
      map[a.symbol] = info;
    }
    return map;
  }
}

export function portfolioUsd(balances: Partial<Record<Asset, number>>, prices: PriceMap) {
  let total = 0;
  for (const a of ASSETS) total += (balances[a.symbol] ?? 0) * (prices[a.symbol]?.usd ?? 0);
  return total;
}
