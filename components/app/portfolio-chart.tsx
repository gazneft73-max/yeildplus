"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { InvestmentDoc, MiningContractDoc, TransactionDoc, WithId } from "@/lib/types";
import { buildPortfolioSeries } from "@/lib/charts";
import { fmtUsd } from "@/lib/utils";

export function PortfolioChart({ investments, mining, txs, current, now }: { investments: WithId<InvestmentDoc>[]; mining: WithId<MiningContractDoc>[]; txs: WithId<TransactionDoc>[]; current: number; now: number }) {
  const data = buildPortfolioSeries(investments, mining, txs, current, now);
  const min = Math.min(...data.map((p) => p.v));
  const max = Math.max(...data.map((p) => p.v));

  return (
    <div className="h-64 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="d" tick={{ fill: "#5b6784", fontSize: 11 }} axisLine={false} tickLine={false} interval={6} />
          <YAxis hide domain={[min * 0.95, max * 1.05 || 1]} />
          <Tooltip
            contentStyle={{ background: "#101627", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: "#8b95b0" }}
            formatter={(val) => [fmtUsd(Number(val)), "Value"]}
          />
          <Area type="monotone" dataKey="v" stroke="#9d84ff" strokeWidth={2.5} fill="url(#pf)" dot={false} activeDot={{ r: 4, fill: "#3ee6b8" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
