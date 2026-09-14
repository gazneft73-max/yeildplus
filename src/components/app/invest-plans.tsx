"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Field, Input, Modal } from "@/components/ui";
import { PlanCard, PropertyCard } from "@/components/site/sections";
import { api } from "@/lib/client-api";
import { fmtUsd } from "@/lib/utils";
import type { InvestmentPlanDoc, WithId } from "@/lib/types";

export function InvestPlans({ plans, usdt, variant }: { plans: WithId<InvestmentPlanDoc>[]; usdt: number; variant: "plan" | "property" }) {
  const router = useRouter();
  const [sel, setSel] = useState<WithId<InvestmentPlanDoc> | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const amt = Number(amount) || 0;
  const profit = sel ? amt * (sel.roiPercent / 100) : 0;

  async function confirm() {
    if (!sel) return;
    setLoading(true);
    try {
      await api("/api/investments", { planId: sel.id, amount: amt });
      toast.success(`Invested ${fmtUsd(amt)} in ${sel.name}`);
      setSel(null);
      setAmount("");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) =>
          variant === "property" ? (
            <PropertyCard key={p.id} plan={p} signedIn onSelect={() => { setSel(p); setAmount(String(p.minAmount)); }} />
          ) : (
            <PlanCard key={p.id} plan={p} signedIn onSelect={() => { setSel(p); setAmount(String(p.minAmount)); }} />
          ),
        )}
      </div>
      <Modal open={Boolean(sel)} onClose={() => setSel(null)} title={sel ? `Invest in ${sel.name}` : ""}>
        {sel && (
          <div className="space-y-5">
            <Field label="Amount (USDT)" hint={`Available ${fmtUsd(usdt)}`}>
              <Input type="number" min={sel.minAmount} max={sel.maxAmount || undefined} step="any" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <div className="rounded-xl bg-white/4 border border-white/6 p-4 text-sm space-y-1.5">
              <div className="flex justify-between text-ink-300"><span>Term</span><span className="text-white">{sel.durationDays} days</span></div>
              <div className="flex justify-between text-ink-300"><span>Total return</span><span className="text-white">{sel.roiPercent}%</span></div>
              <div className="flex justify-between text-ink-300"><span>Expected profit</span><span className="text-mint-400 font-medium">{fmtUsd(profit)}</span></div>
              {sel.payout === "daily" && <div className="flex justify-between text-ink-300"><span>Paid daily</span><span className="text-white">{fmtUsd(profit / sel.durationDays)}</span></div>}
              <div className="flex justify-between text-ink-300"><span>Capital at maturity</span><span className="text-white">{sel.capitalBack ? fmtUsd(amt) : "Included in return"}</span></div>
              <div className="flex justify-between text-ink-300 pt-1 border-t border-white/8 mt-1"><span>Total back</span><span className="text-white font-medium">{fmtUsd(profit + (sel.capitalBack ? amt : 0))}</span></div>
            </div>
            <Button className="w-full" size="lg" loading={loading} onClick={confirm} disabled={amt < sel.minAmount || amt > usdt || (sel.maxAmount > 0 && amt > sel.maxAmount)}>
              {amt > usdt ? "Insufficient USDT balance" : "Confirm investment"}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
