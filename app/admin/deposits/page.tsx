import Link from "next/link";
import { list } from "@/lib/server/queries";
import { getPrices } from "@/lib/server/prices";
import type { DepositDoc } from "@/lib/types";
import { PageHeader } from "@/components/app/shell";
import { Card, Badge, statusTone, Empty } from "@/components/ui";
import { ReviewActions, FileLink } from "@/components/admin/review-actions";
import { StatusTabs, pickStatus } from "@/components/admin/status-tabs";
import { fmtAmount, fmtDate, fmtUsd } from "@/lib/utils";

const STATUSES = ["pending", "approved", "rejected"];

export default async function AdminDeposits({ searchParams }: PageProps<"/admin/deposits">) {
  const status = pickStatus(await searchParams, STATUSES);
  const [rows, prices] = await Promise.all([list<DepositDoc>("deposits", { where: [["status", "==", status]], limit: 100 }), getPrices()]);
  return (
    <>
      <PageHeader title="Deposits" text="Confirm on-chain receipt before approving. Approval credits the member's balance and pays any referral bonus." />
      <StatusTabs base="/admin/deposits" current={status} statuses={STATUSES} />
      <Card>
        {rows.length === 0 ? (
          <Empty title={`No ${status} deposits`} />
        ) : (
          <ul className="divide-y divide-white/6">
            {rows.map((d) => (
              <li key={d.id} className="py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">
                    {fmtAmount(d.amount, d.asset)} {d.asset} <span className="text-ink-400 font-normal">≈ {fmtUsd(d.amount * prices[d.asset].usd)} · {d.network}</span>
                  </p>
                  <p className="text-xs text-ink-300 mt-0.5">
                    <Link href={`/admin/users/${d.uid}`} className="text-brand-300 hover:underline">{d.userEmail}</Link> · {fmtDate(d.createdAt)}
                  </p>
                  {d.txHash && <p className="text-xs font-mono text-ink-300 mt-1 break-all">tx: {d.txHash}</p>}
                  <div className="mt-1 flex gap-3 items-center">
                    <FileLink fileKey={d.proofKey ?? ""} label="View payment proof" />
                    {d.adminNote && <span className="text-xs text-ink-400">Note: {d.adminNote}</span>}
                  </div>
                </div>
                {status === "pending" ? <ReviewActions kind="deposit" id={d.id} /> : <Badge tone={statusTone(d.status)}>{d.status}</Badge>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
