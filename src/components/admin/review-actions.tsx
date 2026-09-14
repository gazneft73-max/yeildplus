"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";
import { api } from "@/lib/client-api";

type Kind = "deposit" | "withdrawal" | "kyc" | "loan" | "card";

export function ReviewActions({ kind, id, askTxHash }: { kind: Kind; id: string; askTxHash?: boolean }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  async function decide(decision: "approve" | "reject") {
    if (decision === "reject" && !note.trim()) return toast.error("Add a short reason for the rejection");
    setLoading(decision);
    try {
      await api("/api/admin/review", { kind, id, decision, note, txHash });
      toast.success(decision === "approve" ? "Approved" : "Rejected");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(null);
    }
  }
  return (
    <div className="flex flex-col gap-2 sm:min-w-64">
      {askTxHash && <Input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="Payout tx hash (optional)" className="h-9 text-xs font-mono" />}
      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note to user (required to reject)" className="h-9 text-xs" />
      <div className="flex gap-2">
        <Button size="sm" variant="success" className="flex-1" loading={loading === "approve"} onClick={() => decide("approve")}>Approve</Button>
        <Button size="sm" variant="danger" className="flex-1" loading={loading === "reject"} onClick={() => decide("reject")}>Reject</Button>
      </div>
    </div>
  );
}

export function FileLink({ fileKey, label }: { fileKey: string; label: string }) {
  const [loading, setLoading] = useState(false);
  if (!fileKey) return null;
  return (
    <button
      className="text-xs text-brand-300 hover:text-brand-200 underline-offset-2 hover:underline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const { url } = await api<{ url: string }>("/api/admin/misc", { action: "viewFile", key: fileKey });
          window.open(url, "_blank", "noopener");
        } catch (e) {
          toast.error((e as Error).message);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Opening…" : label}
    </button>
  );
}
