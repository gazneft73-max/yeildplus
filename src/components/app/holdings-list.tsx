import type { InvestmentDoc, MiningContractDoc, WithId } from "@/lib/types";
import { fmtAmount, fmtDate, fmtUsd } from "@/lib/utils";
import { Badge, Empty, statusTone } from "@/components/ui";
import { AssetIcon } from "./asset-icon";

function progress(startAt: number, endAt: number) {
  return Math.min(100, Math.max(0, ((Date.now() - startAt) / (endAt - startAt)) * 100));
}

export function ProgressBar({ value, tone = "brand" }: { value: number; tone?: "brand" | "gold" }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
      <div className={tone === "gold" ? "h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400" : "h-full rounded-full brand-gradient"} style={{ width: `${value}%` }} />
    </div>
  );
}

export function HoldingsList({ investments, mining }: { investments: WithId<InvestmentDoc>[]; mining: WithId<MiningContractDoc>[] }) {
  if (!investments.length && !mining.length) return <Empty title="No active plans" hint="Choose an investment plan or mining contract to start earning." />;
  return (
    <ul className="space-y-3">
      {investments.map((i) => {
        const pct = progress(i.startAt, i.endAt);
        return (
          <li key={i.id} className="rounded-xl bg-white/4 border border-white/6 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{i.planName}</p>
                <p className="text-xs text-ink-400">
                  {fmtUsd(i.amount)} · {i.roiPercent}% · ends {fmtDate(i.endAt, false)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-mint-400 tabular-nums">+{fmtUsd(i.paidProfit)}</p>
                <p className="text-xs text-ink-400">of {fmtUsd(i.totalProfit)}</p>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={pct} />
            </div>
          </li>
        );
      })}
      {mining.map((m) => {
        const pct = progress(m.startAt, m.endAt);
        return (
          <li key={m.id} className="rounded-xl bg-white/4 border border-white/6 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AssetIcon symbol={m.minesAsset} size={30} />
                <div>
                  <p className="text-sm font-medium text-white">{m.planName}</p>
                  <p className="text-xs text-ink-400">{m.hashrate} · ≈ {fmtUsd(m.dailyUsd)}/day</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gold-400 tabular-nums">+{fmtAmount(m.paidAsset, m.minesAsset)} {m.minesAsset}</p>
                <Badge tone={statusTone(m.status)}>{m.status}</Badge>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={pct} tone="gold" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
