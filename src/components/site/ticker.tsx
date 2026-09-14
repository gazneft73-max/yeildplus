import { ASSETS, type PriceMap } from "@/lib/types";
import { fmtPct, fmtUsd } from "@/lib/utils";
import { AssetIcon } from "@/components/app/asset-icon";
import { cn } from "@/lib/utils";

export function Ticker({ prices }: { prices: PriceMap }) {
  const items = ASSETS.filter((a) => a.symbol !== "USDT");
  const row = (
    <>
      {items.map((a) => {
        const p = prices[a.symbol];
        const up = p.change24h >= 0;
        return (
          <div key={a.symbol} className="flex items-center gap-2.5 px-6 shrink-0">
            <AssetIcon symbol={a.symbol} size={22} />
            <span className="text-sm font-medium text-white">{a.symbol}</span>
            <span className="text-sm text-ink-200 tabular-nums">{fmtUsd(p.usd)}</span>
            <span className={cn("text-xs font-medium tabular-nums", up ? "text-mint-400" : "text-rose-400")}>{fmtPct(p.change24h)}</span>
          </div>
        );
      })}
    </>
  );
  return (
    <div className="relative overflow-hidden border-y border-white/8 bg-ink-900/60 py-3">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink-950 to-transparent" />
    </div>
  );
}
