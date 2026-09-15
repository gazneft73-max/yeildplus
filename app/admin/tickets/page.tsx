import Link from "next/link";
import { list } from "@/lib/server/queries";
import type { TicketDoc } from "@/lib/types";
import { PageHeader } from "@/components/app/shell";
import { Card, Badge, statusTone, Empty } from "@/components/ui";
import { StatusTabs, pickStatus } from "@/components/admin/status-tabs";
import { fmtDate } from "@/lib/utils";

const STATUSES = ["open", "answered", "closed"];

export default async function AdminTickets({ searchParams }: PageProps<"/admin/tickets">) {
  const status = pickStatus(await searchParams, STATUSES);
  const rows = await list<TicketDoc>("tickets", { where: [["status", "==", status]], limit: 100, orderBy: "updatedAt" });
  return (
    <>
      <PageHeader title="Support tickets" />
      <StatusTabs base="/admin/tickets" current={status} statuses={STATUSES} />
      <Card>
        {rows.length === 0 ? (
          <Empty title={`No ${status} tickets`} />
        ) : (
          <ul className="divide-y divide-white/6">
            {rows.map((t) => (
              <li key={t.id}>
                <Link href={`/admin/tickets/${t.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-white/3 -mx-2 px-2 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{t.subject} <Badge tone={t.priority === "high" ? "danger" : "neutral"} className="ml-1">{t.priority}</Badge></p>
                    <p className="text-xs text-ink-400 truncate">{t.userEmail} · {t.lastMessage} · {fmtDate(t.updatedAt)}</p>
                  </div>
                  <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
