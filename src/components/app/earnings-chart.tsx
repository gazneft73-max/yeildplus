"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TransactionDoc, WithId } from "@/lib/types";
import { buildEarningsBuckets } from "@/lib/charts";
import { fmtUsd } from "@/lib/utils";
import { Empty } from "@/components/ui";

export function EarningsChart({ txs, prices, now }: { txs: WithId<TransactionDoc>[]; prices: Record<string, number>; now: number }) {
  const buckets = buildEarningsBuckets(txs, prices, now);
  const total = buckets.reduce((s, b) => s + b.v, 0);
  if (total === 0) return <Empty title="No earnings yet" hint="Once a plan or mining contract pays out, it will chart here." />;
  return (
    <div className="h-64 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buckets} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
          <XAxis dataKey="d" tick={{ fill: "#5b6784", fontSize: 11 }} axisLine={false} tickLine={false} interval={6} />
          <YAxis hide />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#101627", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, fontSize: 12 }} formatter={(v) => [fmtUsd(Number(v)), "Earned"]} />
          <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="#3ee6b8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
