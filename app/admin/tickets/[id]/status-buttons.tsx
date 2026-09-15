"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { api } from "@/lib/client-api";

export function TicketStatusButtons({ ticketId, status }: { ticketId: string; status: string }) {
  const router = useRouter();
  const set = async (next: "open" | "closed") => {
    try {
      await api("/api/admin/tickets", { ticketId, status: next });
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  return status === "closed" ? (
    <Button size="sm" variant="secondary" onClick={() => set("open")}>Reopen</Button>
  ) : (
    <Button size="sm" variant="danger" onClick={() => set("closed")}>Close</Button>
  );
}
