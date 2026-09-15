import { ASSETS, type PriceMap } from "@/lib/types";
import { fmtCompact, fmtPct, fmtUsd } from "@/lib/utils";
import { AssetIcon } from "./asset-icon";
import { Sparkline } from "./sparkline";
import { Table, Th, Td } from "@/components/ui";
import { cn } from "@/lib/utils";

export function MarketsTable({ prices, compact = false }: { prices: PriceMap; compact?: boolean }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Asset</Th>
          <Th className="text-right">Price</Th>
          <Th className="text-right">24h</Th>
          {!compact && <Th className="text-right hidden md:table-cell">24h high / low</Th>}
          {!compact && <Th className="text-right hidden lg:table-cell">Market cap</Th>}
          {!compact && <Th className="text-right hidden lg:table-cell">Volume</Th>}
          <Th className="text-right">7d</Th>
        </tr>
      </thead>
      <tbody>
        {ASSETS.map((a) => {
          const p = prices[a.symbol];
          const up = p.change24h >= 0;
          return (
            <tr key={a.symbol} className="hover:bg-white/3 transition">
              <Td>
                <div className="flex items-center gap-3">
                  <AssetIcon symbol={a.symbol} size={32} />
                  <div>
                    <p className="font-medium text-white">{a.name}</p>
                    <p className="text-xs text-ink-400">{a.symbol}</p>
                  </div>
                </div>
              </Td>
              <Td className="text-right font-medium text-white tabular-nums">{fmtUsd(p.usd)}</Td>
              <Td className={cn("text-right tabular-nums font-medium", up ? "text-mint-400" : "text-rose-400")}>{fmtPct(p.change24h)}</Td>
              {!compact && (
                <Td className="text-right tabular-nums hidden md:table-cell text-ink-300">
                  {fmtUsd(p.high24h)} / {fmtUsd(p.low24h)}
                </Td>
              )}
              {!compact && <Td className="text-right tabular-nums hidden lg:table-cell text-ink-300">{p.marketCap ? "$" + fmtCompact(p.marketCap) : "-"}</Td>}
              {!compact && <Td className="text-right tabular-nums hidden lg:table-cell text-ink-300">{p.volume24h ? "$" + fmtCompact(p.volume24h) : "-"}</Td>}
              <Td className="text-right">
                <div className="inline-block w-24 h-8">
                  <Sparkline data={p.sparkline} positive={up} />
                </div>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
