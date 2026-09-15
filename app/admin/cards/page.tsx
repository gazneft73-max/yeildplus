import Link from "next/link";
import { list } from "@/lib/server/queries";
import type { CardDoc } from "@/lib/types";
import { PageHeader } from "@/components/app/shell";
import { Card, Badge, statusTone, Empty } from "@/components/ui";
import { ReviewActions } from "@/components/admin/review-actions";
import { StatusTabs, pickStatus } from "@/components/admin/status-tabs";
import { fmtDate, fmtUsd } from "@/lib/utils";

const STATUSES = ["pending", "active", "frozen", "rejected"];

export default async function AdminCards({ searchParams }: PageProps<"/admin/cards">) {
  const status = pickStatus(await searchParams, STATUSES);
  const rows = await list<CardDoc>("cards", { where: [["status", "==", status]], limit: 100 });
  return (
    <>
      <PageHeader title="Cards" text="Approve to activate. Rejecting refunds the issue fee." />
      <StatusTabs base="/admin/cards" current={status} statuses={STATUSES} />
      <Card>
        {rows.length === 0 ? (
          <Empty title={`No ${status} cards`} />
        ) : (
          <ul className="divide-y divide-white/6">
            {rows.map((c) => (
              <li key={c.id} className="py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0 text-sm">
                  <p className="text-white font-medium capitalize">{c.type} card · {c.holderName} <span className="text-ink-400 font-normal">· **** {c.last4} · balance {fmtUsd(c.balance)}</span></p>
                  <p className="text-xs text-ink-300 mt-0.5">
                    <Link href={`/admin/users/${c.uid}`} className="text-brand-300 hover:underline">{c.userEmail}</Link> · requested {fmtDate(c.createdAt)}
                  </p>
                </div>
                {status === "pending" ? <ReviewActions kind="card" id={c.id} /> : <Badge tone={statusTone(c.status)}>{c.status}</Badge>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
