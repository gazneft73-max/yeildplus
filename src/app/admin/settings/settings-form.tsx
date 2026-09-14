"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Card, CardHeader, Field, Input, Textarea } from "@/components/ui";
import { AssetIcon } from "@/components/app/asset-icon";
import { api } from "@/lib/client-api";
import { ASSETS, type Asset, type SettingsDoc } from "@/lib/types";

export function SettingsForm({ settings }: { settings: SettingsDoc }) {
  const router = useRouter();
  const [s, setS] = useState<SettingsDoc>(settings);
  const [loading, setLoading] = useState(false);
  const num = (k: keyof SettingsDoc) => (e: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, [k]: Number(e.target.value) });
  const addr = (a: Asset, k: "address" | "network" | "memo", v: string) =>
    setS({ ...s, depositAddresses: { ...s.depositAddresses, [a]: { address: "", network: ASSETS.find((x) => x.symbol === a)!.network, memo: "", ...s.depositAddresses[a], [k]: v } } });

  async function save() {
    setLoading(true);
    try {
      const depositAddresses = Object.fromEntries(Object.entries(s.depositAddresses).filter(([, v]) => v && (v.address || v.network)).map(([k, v]) => [k, { address: v!.address, network: v!.network, memo: v!.memo || "" }]));
      await api("/api/admin/settings", { ...s, depositAddresses });
      toast.success("Settings saved");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Deposit addresses" subtitle="Leave the address empty to disable deposits for that asset." />
        <div className="grid gap-4 md:grid-cols-2">
          {ASSETS.map((a) => (
            <div key={a.symbol} className="rounded-xl bg-white/4 border border-white/6 p-4">
              <div className="flex items-center gap-2 mb-3"><AssetIcon symbol={a.symbol} size={24} /><span className="text-sm font-medium text-white">{a.name} ({a.symbol})</span></div>
              <div className="grid gap-2">
                <Input value={s.depositAddresses[a.symbol]?.address ?? ""} onChange={(e) => addr(a.symbol, "address", e.target.value)} placeholder="Wallet address" className="h-10 font-mono text-xs" />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={s.depositAddresses[a.symbol]?.network ?? a.network} onChange={(e) => addr(a.symbol, "network", e.target.value)} placeholder="Network" className="h-10 text-xs" />
                  <Input value={s.depositAddresses[a.symbol]?.memo ?? ""} onChange={(e) => addr(a.symbol, "memo", e.target.value)} placeholder="Memo / tag (optional)" className="h-10 text-xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Limits and fees" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Min deposit (USD)"><Input type="number" value={s.minDeposit} onChange={num("minDeposit")} /></Field>
          <Field label="Min withdrawal (USD)"><Input type="number" value={s.minWithdrawal} onChange={num("minWithdrawal")} /></Field>
          <Field label="Withdrawal fee (%)"><Input type="number" step="any" value={s.withdrawalFeePercent} onChange={num("withdrawalFeePercent")} /></Field>
          <Field label="Referral bonus (%)"><Input type="number" step="any" value={s.referralPercent} onChange={num("referralPercent")} /></Field>
          <Field label="Loan interest (%)"><Input type="number" step="any" value={s.loanInterestPercent} onChange={num("loanInterestPercent")} /></Field>
          <Field label="Max loan (USDT)"><Input type="number" value={s.maxLoanAmount} onChange={num("maxLoanAmount")} /></Field>
          <Field label="Card issue fee (USDT)"><Input type="number" step="any" value={s.cardIssueFee} onChange={num("cardIssueFee")} /></Field>
          <Field label="Support email"><Input type="email" value={s.supportEmail} onChange={(e) => setS({ ...s, supportEmail: e.target.value })} /></Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Announcements" />
        <Field label="Banner shown to all signed-in members" hint="leave empty to hide">
          <Textarea value={s.announcement ?? ""} onChange={(e) => setS({ ...s, announcement: e.target.value })} className="min-h-16" />
        </Field>
        <label className="mt-4 flex items-center gap-2 text-sm text-ink-200">
          <input type="checkbox" checked={s.maintenanceMode} onChange={(e) => setS({ ...s, maintenanceMode: e.target.checked })} className="accent-brand-500" /> Maintenance mode (pauses deposits and withdrawals)
        </label>
      </Card>

      <Button size="lg" loading={loading} onClick={save}>Save all settings</Button>
    </div>
  );
}
