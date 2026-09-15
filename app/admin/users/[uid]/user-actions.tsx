"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Field, Input, Select, Textarea, CopyButton } from "@/components/ui";
import { api } from "@/lib/client-api";
import { ASSETS, type KycStatus, type UserStatus } from "@/lib/types";

export function UserActions({ uid, status, kycStatus, notes }: { uid: string; status: UserStatus; kycStatus: KycStatus; notes: string }) {
  const router = useRouter();
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [nText, setNText] = useState(notes);
  const [nTitle, setNTitle] = useState("");
  const [nBody, setNBody] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function run(key: string, fn: () => Promise<unknown>, ok: string) {
    setBusy(key);
    try {
      await fn();
      toast.success(ok);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6 text-sm">
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-400 mb-2">Balance adjustment</p>
        <div className="grid grid-cols-[6rem_1fr] gap-2">
          <Select value={asset} onChange={(e) => setAsset(e.target.value)} className="h-10">{ASSETS.map((a) => <option key={a.symbol}>{a.symbol}</option>)}</Select>
          <Input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="+ credit / - debit" className="h-10" />
        </div>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason (shown in the member's ledger)" className="h-10 mt-2" />
        <Button size="sm" className="mt-2" loading={busy === "adjust"} disabled={!Number(amount) || note.trim().length < 2} onClick={() => run("adjust", () => api("/api/admin/users", { action: "adjust", uid, asset, amount: Number(amount), note }), "Balance adjusted")}>
          Apply adjustment
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant={status === "active" ? "danger" : "success"} loading={busy === "status"} onClick={() => run("status", () => api("/api/admin/users", { action: "status", uid, status: status === "active" ? "suspended" : "active" }), status === "active" ? "Account suspended" : "Account reactivated")}>
          {status === "active" ? "Suspend account" : "Reactivate account"}
        </Button>
        <Button size="sm" variant="secondary" loading={busy === "reset"} onClick={() => run("reset", async () => { const r = await api<{ link: string }>("/api/admin/users", { action: "resetPassword", uid }); setResetLink(r.link); }, "Reset link generated")}>
          Password reset link
        </Button>
      </div>
      {resetLink && <p className="text-xs break-all text-ink-300">{resetLink} <CopyButton text={resetLink} /></p>}

      <Field label="KYC status override">
        <div className="flex gap-2">
          <Select defaultValue={kycStatus} id="kyc-sel" className="h-10">
            {["none", "pending", "approved", "rejected"].map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Button size="sm" variant="secondary" loading={busy === "kyc"} onClick={() => run("kyc", () => api("/api/admin/users", { action: "kyc", uid, kycStatus: (document.getElementById("kyc-sel") as HTMLSelectElement).value }), "KYC status updated")}>Set</Button>
        </div>
      </Field>

      <Field label="Internal notes">
        <Textarea value={nText} onChange={(e) => setNText(e.target.value)} className="min-h-20" />
        <Button size="sm" variant="secondary" className="mt-2" loading={busy === "notes"} onClick={() => run("notes", () => api("/api/admin/users", { action: "notes", uid, notes: nText }), "Notes saved")}>Save notes</Button>
      </Field>

      <Field label="Send notification">
        <Input value={nTitle} onChange={(e) => setNTitle(e.target.value)} placeholder="Title" className="h-10 mb-2" />
        <Textarea value={nBody} onChange={(e) => setNBody(e.target.value)} placeholder="Message" className="min-h-16" />
        <Button size="sm" variant="secondary" className="mt-2" loading={busy === "notify"} disabled={nTitle.length < 2 || nBody.length < 2} onClick={() => run("notify", () => api("/api/admin/misc", { action: "notify", uid, title: nTitle, body: nBody }).then(() => { setNTitle(""); setNBody(""); }), "Notification sent")}>Send</Button>
      </Field>
    </div>
  );
}
