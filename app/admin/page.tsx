import Link from "next/link";
import { count, list } from "@/lib/server/queries";
import { db } from "@/lib/server/firebase-admin";
import { getPrices } from "@/lib/server/prices";
import type { DepositDoc, TransactionDoc, WithdrawalDoc } from "@/lib/types";
import { PageHeader } from "@/components/app/shell";
import { Card, CardHeader, Stat, Badge, statusTone } from "@/components/ui";
import { TxList } from "@/components/app/tx-list";
import { SettleButton } from "./settle-button";
import { fmtAmount, fmtDate, fmtUsd } from "@/lib/utils";

export default async function AdminOverview() {
  const [users, pendingDeposits, pendingWithdrawals, pendingKyc, pendingLoans, pendingCards, openTickets, activeInv, activeMine, deposits, withdrawals, txs, prices] = await Promise.all([
    count("users"),
    count("deposits", [["status", "==", "pending"]]),
    count("withdrawals", [["status", "==", "pending"]]),
    count("kyc", [["status", "==", "pending"]]),
    count("loans", [["status", "==", "pending"]]),
    count("cards", [["status", "==", "pending"]]),
    count("tickets", [["status", "==", "open"]]),
    count("investments", [["status", "==", "active"]]),
    count("miningContracts", [["status", "==", "active"]]),
    list<DepositDoc>("deposits", { where: [["status", "==", "pending"]], limit: 5 }),
    list<WithdrawalDoc>("withdrawals", { where: [["status", "==", "pending"]], limit: 5 }),
    list<TransactionDoc>("transactions", { limit: 10 }),
    getPrices(),
  ]);
  const invSnap = await db().collection("investments").where("status", "==", "active").select("amount").get();
  const aum = invSnap.docs.reduce((s, d) => s + (d.data().amount as number), 0);

  const queues = [
    { href: "/admin/deposits", label: "Deposits", n: pendingDeposits },
    { href: "/admin/withdrawals", label: "Withdrawals", n: pendingWithdrawals },
    { href: "/admin/kyc", label: "KYC", n: pendingKyc },
    { href: "/admin/loans", label: "Loans", n: pendingLoans },
    { href: "/admin/cards", label: "Cards", n: pendingCards },
    { href: "/admin/tickets", label: "Open tickets", n: openTickets },
  ];

  return (
    <>
      <PageHeader title="Overview" text="Platform health and everything waiting on you." action={<SettleButton />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Members" value={users} />
        <Stat label="Capital in plans" value={fmtUsd(aum)} sub={`${activeInv} active investments`} accent="mint" />
        <Stat label="Mining contracts" value={activeMine} sub="Active" accent="gold" />
        <Stat label="Awaiting review" value={pendingDeposits + pendingWithdrawals + pendingKyc + pendingLoans + pendingCards} sub={`${openTickets} open tickets`} accent="rose" />
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {queues.map((q) => (
          <Link key={q.href} href={q.href} className="card p-4 hover:border-gold-500/40 transition">
            <p className="text-xs text-ink-400">{q.label}</p>
            <p className={"font-display text-2xl font-semibold " + (q.n > 0 ? "text-gold-400" : "text-white")}>{q.n}</p>
          </Link>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Pending deposits" action={<Link href="/admin/deposits" className="text-xs text-brand-300">Review</Link>} />
          <ul className="divide-y divide-white/6 text-sm">
            {deposits.length === 0 && <li className="py-3 text-ink-400">Queue is empty.</li>}
            {deposits.map((d) => (
              <li key={d.id} className="py-2.5 flex justify-between gap-2">
                <span className="truncate text-ink-200">{d.userEmail}</span>
                <span className="text-white shrink-0">{fmtAmount(d.amount, d.asset)} {d.asset} <span className="text-ink-400">≈ {fmtUsd(d.amount * prices[d.asset].usd)}</span></span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Pending withdrawals" action={<Link href="/admin/withdrawals" className="text-xs text-brand-300">Review</Link>} />
          <ul className="divide-y divide-white/6 text-sm">
            {withdrawals.length === 0 && <li className="py-3 text-ink-400">Queue is empty.</li>}
            {withdrawals.map((w) => (
              <li key={w.id} className="py-2.5 flex justify-between gap-2">
                <span className="truncate text-ink-200">{w.userEmail}</span>
                <span className="text-white shrink-0">{fmtAmount(w.amount, w.asset)} {w.asset} <Badge tone={statusTone(w.status)}>{fmtDate(w.createdAt, false)}</Badge></span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Latest ledger entries" />
          <TxList txs={txs} dense />
        </Card>
      </div>
    </>
  );
}
