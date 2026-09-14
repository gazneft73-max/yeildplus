import Link from "next/link";
import { list } from "@/lib/server/queries";
import type { KycDoc } from "@/lib/types";
import { PageHeader } from "@/components/app/shell";
import { Card, Badge, statusTone, Empty } from "@/components/ui";
import { ReviewActions, FileLink } from "@/components/admin/review-actions";
import { StatusTabs, pickStatus } from "@/components/admin/status-tabs";
import { fmtDate, titleCase } from "@/lib/utils";

const STATUSES = ["pending", "approved", "rejected"];

export default async function AdminKyc({ searchParams }: PageProps<"/admin/kyc">) {
  const status = pickStatus(await searchParams, STATUSES);
  const rows = await list<KycDoc>("kyc", { where: [["status", "==", status]], limit: 100 });
  return (
    <>
      <PageHeader title="Identity verification" text="Check that the document is genuine, unexpired, and matches the selfie and the account name." />
      <StatusTabs base="/admin/kyc" current={status} statuses={STATUSES} />
      <Card>
        {rows.length === 0 ? (
          <Empty title={`No ${status} submissions`} />
        ) : (
          <ul className="divide-y divide-white/6">
            {rows.map((k) => (
              <li key={k.id} className="py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0 text-sm">
                  <p className="text-white font-medium">{k.fullName} <span className="text-ink-400 font-normal">· born {k.dateOfBirth}</span></p>
                  <p className="text-xs text-ink-300 mt-0.5">
                    <Link href={`/admin/users/${k.uid}`} className="text-brand-300 hover:underline">{k.userEmail}</Link> · {titleCase(k.documentType)} #{k.documentNumber} · submitted {fmtDate(k.createdAt)}
                  </p>
                  <p className="text-xs text-ink-300 mt-0.5">{k.address}</p>
                  <div className="mt-1.5 flex flex-wrap gap-4">
                    <FileLink fileKey={k.frontKey} label="Document front" />
                    <FileLink fileKey={k.backKey ?? ""} label="Document back" />
                    <FileLink fileKey={k.selfieKey} label="Selfie" />
                  </div>
                  {k.adminNote && <p className="text-xs text-ink-400 mt-1">Note: {k.adminNote}</p>}
                </div>
                {status === "pending" ? <ReviewActions kind="kyc" id={k.id} /> : <Badge tone={statusTone(k.status)}>{k.status}</Badge>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
