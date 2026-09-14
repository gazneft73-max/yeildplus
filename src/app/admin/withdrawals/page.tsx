import Link from "next/link";
import { list } from "@/lib/server/queries";
import { getPrices } from "@/lib/server/prices";
import type { WithdrawalDoc } from "@/lib/types";
import { PageHeader } from "@/components/app/shell";
import { Card, Badge, statusTone, Empty, CopyButton } from "@/components/ui";
import { ReviewActions } from "@/components/admin/review-actions";
import { StatusTabs, pickStatus } from "@/components/admin/status-tabs";
import { fmtAmount, fmtDate, fmtUsd } from "@/lib/utils";

const STATUSES = ["pending", "approved", "rejected"];

export default async function AdminWithdrawals({ searchParams }: PageProps<"/admin/withdrawals">) {
  const status = pickStatus(await searchParams, STATUSES);
  const [rows, prices] = await Promise.all([list<WithdrawalDoc>("withdrawals", { where: [["status", "==", status]], limit: 100 }), getPrices()]);
  return (
    <>
      <PageHeader title="Withdrawals" text="Funds are already held. Send the payout on-chain, then approve with the tx hash. Rejecting refunds the member." />
      <StatusTabs base="/admin/withdrawals" current={status} statuses={STATUSES} />
      <Card>
        {rows.length === 0 ? (
          <Empty title={`No ${status} withdrawals`} />
        ) : (
          <ul className="divide-y divide-white/6">
            {rows.map((w) => (
              <li key={w.id} className="py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">
                    Send {fmtAmount(w.amount - w.fee, w.asset)} {w.asset} <span className="text-ink-400 font-normal">(requested {fmtAmount(w.amount, w.asset)}, fee {fmtAmount(w.fee, w.asset)} · ≈ {fmtUsd(w.amount * prices[w.asset].usd)})</span>
                  </p>
                  <p className="text-xs text-ink-300 mt-0.5">
                    <Link href={`/admin/users/${w.uid}`} className="text-brand-300 hover:underline">{w.userEmail}</Link> · {w.network} · {fmtDate(w.createdAt)}
                  </p>
                  <p className="text-xs font-mono text-ink-200 mt-1 break-all">{w.address} <CopyButton text={w.address} /></p>
                  {w.txHash && <p className="text-xs font-mono text-ink-400 mt-1 break-all">paid: {w.txHash}</p>}
                  {w.adminNote && <p className="text-xs text-ink-400 mt-1">Note: {w.adminNote}</p>}
                </div>
                {status === "pending" ? <ReviewActions kind="withdrawal" id={w.id} askTxHash /> : <Badge tone={statusTone(w.status)}>{w.status}</Badge>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
