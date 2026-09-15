"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { fmtUsd } from "@/lib/utils";
import { Empty } from "@/components/ui";

export function AllocationChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  if (!data.length) return <Empty title="Nothing to show yet" hint="Deposit funds to see your allocation." />;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={3} stroke="none">
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#101627", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, fontSize: 12 }} formatter={(v) => fmtUsd(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 space-y-1.5">
        {data
          .sort((a, b) => b.value - a.value)
          .map((d) => (
            <li key={d.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-ink-200">
                <span className="size-2.5 rounded-full" style={{ background: d.color }} /> {d.name}
              </span>
              <span className="text-ink-300 tabular-nums">{((d.value / total) * 100).toFixed(1)}%</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
