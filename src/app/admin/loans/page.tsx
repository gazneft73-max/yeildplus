import Link from "next/link";
import { list } from "@/lib/server/queries";
import type { LoanDoc } from "@/lib/types";
import { PageHeader } from "@/components/app/shell";
import { Card, Badge, statusTone, Empty } from "@/components/ui";
import { ReviewActions } from "@/components/admin/review-actions";
import { StatusTabs, pickStatus } from "@/components/admin/status-tabs";
import { fmtDate, fmtUsd } from "@/lib/utils";

const STATUSES = ["pending", "approved", "repaid", "rejected"];

export default async function AdminLoans({ searchParams }: PageProps<"/admin/loans">) {
  const status = pickStatus(await searchParams, STATUSES);
  const rows = await list<LoanDoc>("loans", { where: [["status", "==", status]], limit: 100 });
  return (
    <>
      <PageHeader title="Loans" text="Approval disburses the amount to the member's USDT balance immediately." />
      <StatusTabs base="/admin/loans" current={status} statuses={STATUSES} />
      <Card>
        {rows.length === 0 ? (
          <Empty title={`No ${status} loans`} />
        ) : (
          <ul className="divide-y divide-white/6">
            {rows.map((l) => (
              <li key={l.id} className="py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0 text-sm">
                  <p className="text-white font-medium">{fmtUsd(l.amount)} for {l.durationMonths} months <span className="text-ink-400 font-normal">· repayable {fmtUsd(l.totalRepayable)} · repaid {fmtUsd(l.repaid)}</span></p>
                  <p className="text-xs text-ink-300 mt-0.5">
                    <Link href={`/admin/users/${l.uid}`} className="text-brand-300 hover:underline">{l.userEmail}</Link> · applied {fmtDate(l.createdAt)}{l.dueAt ? ` · due ${fmtDate(l.dueAt, false)}` : ""}
                  </p>
                  <p className="text-xs text-ink-300 mt-1 italic">“{l.purpose}”</p>
                  {l.adminNote && <p className="text-xs text-ink-400 mt-1">Note: {l.adminNote}</p>}
                </div>
                {status === "pending" ? <ReviewActions kind="loan" id={l.id} /> : <Badge tone={statusTone(l.status === "repaid" ? "completed" : l.status)}>{l.status}</Badge>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
