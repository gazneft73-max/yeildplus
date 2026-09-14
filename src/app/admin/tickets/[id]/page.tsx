import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDoc } from "@/lib/server/queries";
import { db } from "@/lib/server/firebase-admin";
import type { TicketDoc, TicketMessageDoc } from "@/lib/types";
import { Card, Badge, statusTone } from "@/components/ui";
import { ReplyForm } from "@/app/dashboard/support/ticket-forms";
import { TicketThread } from "@/components/app/ticket-thread";
import { TicketStatusButtons } from "./status-buttons";

export default async function AdminTicket({ params }: PageProps<"/admin/tickets/[id]">) {
  const { id } = await params;
  const ticket = await getDoc<TicketDoc>("tickets", id);
  if (!ticket) notFound();
  const msgs = await db().collection("tickets").doc(id).collection("messages").orderBy("createdAt", "asc").get();
  const messages = msgs.docs.map((d) => ({ id: d.id, ...(d.data() as TicketMessageDoc) }));
  return (
    <>
      <Link href="/admin/tickets" className="inline-flex items-center gap-1.5 text-sm text-ink-300 hover:text-white mb-4"><ArrowLeft className="size-4" /> Tickets</Link>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
          <div>
            <h1 className="font-display text-xl font-semibold text-white">{ticket.subject}</h1>
            <p className="text-xs text-ink-400 mt-0.5">
              <Link href={`/admin/users/${ticket.uid}`} className="text-brand-300 hover:underline">{ticket.userEmail}</Link> · {ticket.priority} priority
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
            <TicketStatusButtons ticketId={id} status={ticket.status} />
          </div>
        </div>
        <TicketThread messages={messages} me="admin" />
        <div className="mt-6 pt-5 border-t border-white/8">
          <ReplyForm ticketId={id} endpoint="/api/admin/tickets" />
        </div>
      </Card>
    </>
  );
}
