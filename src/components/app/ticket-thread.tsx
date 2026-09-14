import type { TicketMessageDoc, WithId } from "@/lib/types";
import { fmtDate, cn } from "@/lib/utils";

export function TicketThread({ messages, me }: { messages: WithId<TicketMessageDoc>[]; me: "user" | "admin" }) {
  return (
    <ul className="space-y-4">
      {messages.map((m) => {
        const mine = m.from === me;
        return (
          <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap", mine ? "bg-brand-500/20 text-white rounded-br-md" : "bg-white/6 text-ink-100 rounded-bl-md")}>
              <p className="text-[11px] uppercase tracking-wider mb-1 opacity-60">{m.from === "admin" ? "PlutoVest support" : "You"} · {fmtDate(m.createdAt)}</p>
              {m.body}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
