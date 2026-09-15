import { ASSETS, type Balances, type PriceMap } from "@/lib/types";
import { fmtAmount, fmtUsd } from "@/lib/utils";
import { AssetIcon } from "./asset-icon";
import { Empty } from "@/components/ui";

export function BalanceList({ balances, prices, limit, showZero = false }: { balances: Balances; prices: PriceMap; limit?: number; showZero?: boolean }) {
  const rows = ASSETS.map((a) => ({ ...a, amount: balances[a.symbol] ?? 0, usd: (balances[a.symbol] ?? 0) * prices[a.symbol].usd }))
    .filter((r) => showZero || r.amount > 0 || r.symbol === "USDT")
    .sort((a, b) => b.usd - a.usd)
    .slice(0, limit ?? 99);
  if (!rows.length) return <Empty title="No balances yet" hint="Make a deposit to get started." />;
  return (
    <ul className="divide-y divide-white/6">
      {rows.map((r) => (
        <li key={r.symbol} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <AssetIcon symbol={r.symbol} size={32} />
            <div>
              <p className="text-sm font-medium text-white">{r.name}</p>
              <p className="text-xs text-ink-400">{r.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-white tabular-nums">
              {fmtAmount(r.amount, r.symbol)} {r.symbol}
            </p>
            <p className="text-xs text-ink-400 tabular-nums">{fmtUsd(r.usd)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
