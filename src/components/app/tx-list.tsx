import { ArrowDownLeft, ArrowUpRight, Coins, CreditCard, Gift, Landmark, LineChart, Pickaxe, RotateCcw, Settings2 } from "lucide-react";
import type { TransactionDoc, TxType, WithId } from "@/lib/types";
import { fmtAmount, fmtDate, titleCase, cn } from "@/lib/utils";
import { Badge, Empty, statusTone } from "@/components/ui";

const meta: Record<TxType, { icon: React.ElementType; label: string; tone: string }> = {
  deposit: { icon: ArrowDownLeft, label: "Deposit", tone: "text-mint-400 bg-mint-500/15" },
  withdrawal: { icon: ArrowUpRight, label: "Withdrawal", tone: "text-rose-400 bg-rose-500/15" },
  invest: { icon: LineChart, label: "Investment", tone: "text-brand-300 bg-brand-500/15" },
  profit: { icon: Coins, label: "Profit", tone: "text-mint-400 bg-mint-500/15" },
  capital_return: { icon: RotateCcw, label: "Capital returned", tone: "text-sky-300 bg-sky-500/15" },
  mining: { icon: Pickaxe, label: "Mining contract", tone: "text-gold-400 bg-gold-500/15" },
  mining_payout: { icon: Pickaxe, label: "Mining payout", tone: "text-gold-400 bg-gold-500/15" },
  referral: { icon: Gift, label: "Referral bonus", tone: "text-mint-400 bg-mint-500/15" },
  adjustment: { icon: Settings2, label: "Adjustment", tone: "text-ink-200 bg-white/8" },
  loan: { icon: Landmark, label: "Loan", tone: "text-sky-300 bg-sky-500/15" },
  loan_repayment: { icon: Landmark, label: "Loan repayment", tone: "text-rose-400 bg-rose-500/15" },
  card_funding: { icon: CreditCard, label: "Card", tone: "text-brand-300 bg-brand-500/15" },
};

export function TxList({ txs, dense = false }: { txs: WithId<TransactionDoc>[]; dense?: boolean }) {
  if (!txs.length) return <Empty title="No activity yet" hint="Deposits, profits and payouts will appear here." />;
  return (
    <ul className="divide-y divide-white/6">
      {txs.map((t) => {
        const m = meta[t.type] ?? meta.adjustment;
        const credit = t.amount >= 0;
        return (
          <li key={t.id} className={cn("flex items-center gap-3", dense ? "py-2.5" : "py-3")}>
            <span className={cn("size-9 rounded-xl grid place-items-center shrink-0", m.tone)}>
              <m.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{m.label}</p>
              <p className="text-xs text-ink-400 truncate">{t.note || titleCase(t.type)} · {fmtDate(t.createdAt)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={cn("text-sm font-medium tabular-nums", credit ? "text-mint-400" : "text-ink-100")}>
                {credit ? "+" : "-"}
                {fmtAmount(Math.abs(t.amount), t.asset)} {t.asset}
              </p>
              {t.status !== "completed" && <Badge tone={statusTone(t.status)} className="mt-0.5">{t.status}</Badge>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
