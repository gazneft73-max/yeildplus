import type { InvestmentDoc, MiningContractDoc, TransactionDoc, WithId } from "./types";

const DAY = 86_400_000;

/**
 * Reconstructs an approximate daily portfolio value for the last 30 days by walking
 * USDT-denominated ledger events backwards from the current value.
 */
export function buildPortfolioSeries(
  investments: WithId<InvestmentDoc>[],
  mining: WithId<MiningContractDoc>[],
  txs: WithId<TransactionDoc>[],
  current: number,
  now: number,
) {
  const events = [
    ...txs
      .filter((t) => t.asset === "USDT" && ["deposit", "withdrawal", "profit", "referral", "loan"].includes(t.type))
      .map((t) => ({ at: t.createdAt, delta: t.amount })),
    ...mining.map((m) => ({ at: m.createdAt, delta: -m.price })),
  ];
  void investments;
  const points: { d: string; v: number }[] = [];
  let v = current;
  for (let i = 0; i <= 30; i++) {
    const dayStart = now - i * DAY;
    points.unshift({ d: new Date(dayStart).toLocaleDateString("en-US", { month: "short", day: "numeric" }), v: Math.max(0, v) });
    for (const e of events) if (e.at <= dayStart && e.at > dayStart - DAY) v -= e.delta;
  }
  return points;
}

/** Daily USD value of earnings credited in the last 30 days. */
export function buildEarningsBuckets(txs: WithId<TransactionDoc>[], prices: Record<string, number>, now: number) {
  const buckets = Array.from({ length: 30 }, (_, i) => {
    const start = now - (29 - i) * DAY;
    return { d: new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" }), v: 0 };
  });
  for (const t of txs) {
    if (!["profit", "mining_payout", "referral", "capital_return"].includes(t.type) || t.status !== "completed") continue;
    const idx = Math.floor((t.createdAt - (now - 29 * DAY)) / DAY);
    if (idx < 0 || idx > 29) continue;
    buckets[idx].v += t.amount * (prices[t.asset] ?? 0);
  }
  return buckets;
}
