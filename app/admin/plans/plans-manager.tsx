"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge, Button, Card, CardHeader, Field, Input, Modal, Select, Table, Th, Td } from "@/components/ui";
import { api } from "@/lib/client-api";
import { MINING_ASSETS, type InvestmentPlanDoc, type MiningPlanDoc, type WithId } from "@/lib/types";
import { fmtUsd } from "@/lib/utils";

type Inv = Partial<WithId<InvestmentPlanDoc>>;
type Mine = Partial<WithId<MiningPlanDoc>>;

const emptyInv: Inv = { name: "", tagline: "", category: "investing", location: "", imageUrl: "", minAmount: 100, maxAmount: 0, roiPercent: 10, durationDays: 30, payout: "daily", capitalBack: true, featured: false, active: true, sortOrder: 0 };
const emptyMine: Mine = { name: "", hashrate: "10 TH/s", algorithm: "SHA-256", minesAsset: "XAUT", price: 500, durationDays: 90, dailyReturnPercent: 1, maintenanceFeePercent: 5, featured: false, active: true, sortOrder: 0 };

export function PlansManager({ investment, mining }: { investment: WithId<InvestmentPlanDoc>[]; mining: WithId<MiningPlanDoc>[] }) {
  const router = useRouter();
  const [inv, setInv] = useState<Inv | null>(null);
  const [mine, setMine] = useState<Mine | null>(null);
  const [loading, setLoading] = useState(false);

  async function save(kind: "investment" | "mining", data: Inv | Mine) {
    setLoading(true);
    try {
      const { createdAt: _c, ...rest } = data as Record<string, unknown>;
      void _c;
      await api("/api/admin/plans", { kind, ...rest });
      toast.success("Saved");
      setInv(null); setMine(null);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  async function remove(kind: "investment" | "mining", id: string) {
    if (!confirm("Delete this plan? Existing contracts are unaffected.")) return;
    try {
      await api("/api/admin/plans", { kind, id }, "DELETE");
      toast.success("Deleted");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  const num = (v: string) => (v === "" ? 0 : Number(v));

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Investment & real-estate plans" action={<Button size="sm" onClick={() => setInv({ ...emptyInv })}>New plan</Button>} />
        <Table>
          <thead><tr><Th>Name</Th><Th>Category</Th><Th>Return</Th><Th>Term</Th><Th>Payout</Th><Th>Range</Th><Th>Status</Th><Th></Th></tr></thead>
          <tbody>
            {investment.map((p) => (
              <tr key={p.id}>
                <Td className="text-white">{p.name}{p.featured && <Badge tone="brand" className="ml-2">featured</Badge>}</Td>
                <Td className="capitalize">{(p.category ?? "investing").replace("_", " ")}</Td>
                <Td>{p.roiPercent}%</Td>
                <Td>{p.durationDays}d</Td>
                <Td className="capitalize">{p.payout}{p.capitalBack ? " · capital back" : ""}</Td>
                <Td>{fmtUsd(p.minAmount)} – {p.maxAmount ? fmtUsd(p.maxAmount) : "∞"}</Td>
                <Td><Badge tone={p.active ? "success" : "neutral"}>{p.active ? "active" : "hidden"}</Badge></Td>
                <Td className="text-right whitespace-nowrap">
                  <button className="text-xs text-brand-300 mr-3" onClick={() => setInv({ ...p })}>Edit</button>
                  <button className="text-xs text-rose-400" onClick={() => remove("investment", p.id)}>Delete</button>
                </Td>
              </tr>
            ))}
            {investment.length === 0 && <tr><Td className="text-ink-400">No plans yet. Create the first one.</Td></tr>}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader title="Mining contracts" subtitle="Payouts are restricted to XAUT and XRP." action={<Button size="sm" onClick={() => setMine({ ...emptyMine })}>New contract</Button>} />
        <Table>
          <thead><tr><Th>Name</Th><Th>Hashrate</Th><Th>Pays in</Th><Th>Price</Th><Th>Term</Th><Th>Daily</Th><Th>Fee</Th><Th>Status</Th><Th></Th></tr></thead>
          <tbody>
            {mining.map((p) => (
              <tr key={p.id}>
                <Td className="text-white">{p.name}{p.featured && <Badge tone="warning" className="ml-2">hot</Badge>}</Td>
                <Td>{p.hashrate} · {p.algorithm}</Td>
                <Td>{p.minesAsset}</Td>
                <Td>{fmtUsd(p.price)}</Td>
                <Td>{p.durationDays}d</Td>
                <Td>{p.dailyReturnPercent}%</Td>
                <Td>{p.maintenanceFeePercent}%</Td>
                <Td><Badge tone={p.active ? "success" : "neutral"}>{p.active ? "active" : "hidden"}</Badge></Td>
                <Td className="text-right whitespace-nowrap">
                  <button className="text-xs text-brand-300 mr-3" onClick={() => setMine({ ...p })}>Edit</button>
                  <button className="text-xs text-rose-400" onClick={() => remove("mining", p.id)}>Delete</button>
                </Td>
              </tr>
            ))}
            {mining.length === 0 && <tr><Td className="text-ink-400">No mining contracts yet.</Td></tr>}
          </tbody>
        </Table>
      </Card>

      <Modal open={Boolean(inv)} onClose={() => setInv(null)} title={inv?.id ? "Edit plan" : "New plan"} wide>
        {inv && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name"><Input value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} /></Field>
            <Field label="Category">
              <Select value={inv.category} onChange={(e) => setInv({ ...inv, category: e.target.value as "investing" | "real_estate" })}>
                <option value="investing">Investing</option>
                <option value="real_estate">Real estate</option>
              </Select>
            </Field>
            <div className="sm:col-span-2"><Field label="Tagline"><Input value={inv.tagline ?? ""} onChange={(e) => setInv({ ...inv, tagline: e.target.value })} /></Field></div>
            {inv.category === "real_estate" && (
              <>
                <Field label="Location"><Input value={inv.location ?? ""} onChange={(e) => setInv({ ...inv, location: e.target.value })} placeholder="Dubai Marina, UAE" /></Field>
                <Field label="Image URL"><Input value={inv.imageUrl ?? ""} onChange={(e) => setInv({ ...inv, imageUrl: e.target.value })} placeholder="https://…" /></Field>
              </>
            )}
            <Field label="Min amount (USDT)"><Input type="number" value={inv.minAmount} onChange={(e) => setInv({ ...inv, minAmount: num(e.target.value) })} /></Field>
            <Field label="Max amount (0 = unlimited)"><Input type="number" value={inv.maxAmount} onChange={(e) => setInv({ ...inv, maxAmount: num(e.target.value) })} /></Field>
            <Field label="Total return (%)"><Input type="number" step="any" value={inv.roiPercent} onChange={(e) => setInv({ ...inv, roiPercent: num(e.target.value) })} /></Field>
            <Field label="Term (days)"><Input type="number" value={inv.durationDays} onChange={(e) => setInv({ ...inv, durationDays: num(e.target.value) })} /></Field>
            <Field label="Payout">
              <Select value={inv.payout} onChange={(e) => setInv({ ...inv, payout: e.target.value as "daily" | "end" })}>
                <option value="daily">Daily</option>
                <option value="end">At maturity</option>
              </Select>
            </Field>
            <Field label="Sort order"><Input type="number" value={inv.sortOrder} onChange={(e) => setInv({ ...inv, sortOrder: num(e.target.value) })} /></Field>
            <div className="sm:col-span-2 flex flex-wrap gap-5 text-sm text-ink-200">
              <label className="flex items-center gap-2"><input type="checkbox" checked={inv.capitalBack} onChange={(e) => setInv({ ...inv, capitalBack: e.target.checked })} className="accent-brand-500" /> Capital returned at maturity</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={inv.featured} onChange={(e) => setInv({ ...inv, featured: e.target.checked })} className="accent-brand-500" /> Featured</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={inv.active} onChange={(e) => setInv({ ...inv, active: e.target.checked })} className="accent-brand-500" /> Active</label>
            </div>
            <div className="sm:col-span-2"><Button className="w-full" loading={loading} onClick={() => save("investment", inv)}>Save plan</Button></div>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(mine)} onClose={() => setMine(null)} title={mine?.id ? "Edit contract" : "New mining contract"} wide>
        {mine && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name"><Input value={mine.name} onChange={(e) => setMine({ ...mine, name: e.target.value })} /></Field>
            <Field label="Pays out in">
              <Select value={mine.minesAsset} onChange={(e) => setMine({ ...mine, minesAsset: e.target.value as "XAUT" | "XRP" })}>
                {MINING_ASSETS.map((a) => <option key={a} value={a}>{a}</option>)}
              </Select>
            </Field>
            <Field label="Hashrate (display)"><Input value={mine.hashrate} onChange={(e) => setMine({ ...mine, hashrate: e.target.value })} /></Field>
            <Field label="Algorithm (display)"><Input value={mine.algorithm} onChange={(e) => setMine({ ...mine, algorithm: e.target.value })} /></Field>
            <Field label="Price (USDT)"><Input type="number" step="any" value={mine.price} onChange={(e) => setMine({ ...mine, price: num(e.target.value) })} /></Field>
            <Field label="Term (days)"><Input type="number" value={mine.durationDays} onChange={(e) => setMine({ ...mine, durationDays: num(e.target.value) })} /></Field>
            <Field label="Daily return (% of price)"><Input type="number" step="any" value={mine.dailyReturnPercent} onChange={(e) => setMine({ ...mine, dailyReturnPercent: num(e.target.value) })} /></Field>
            <Field label="Maintenance fee (%)"><Input type="number" step="any" value={mine.maintenanceFeePercent} onChange={(e) => setMine({ ...mine, maintenanceFeePercent: num(e.target.value) })} /></Field>
            <Field label="Sort order"><Input type="number" value={mine.sortOrder} onChange={(e) => setMine({ ...mine, sortOrder: num(e.target.value) })} /></Field>
            <div className="sm:col-span-2 flex flex-wrap gap-5 text-sm text-ink-200">
              <label className="flex items-center gap-2"><input type="checkbox" checked={mine.featured} onChange={(e) => setMine({ ...mine, featured: e.target.checked })} className="accent-brand-500" /> Featured</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={mine.active} onChange={(e) => setMine({ ...mine, active: e.target.checked })} className="accent-brand-500" /> Active</label>
            </div>
            <div className="sm:col-span-2"><Button className="w-full" loading={loading} onClick={() => save("mining", mine)}>Save contract</Button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
