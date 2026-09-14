import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDoc, list } from "@/lib/server/queries";
import { getPrices, portfolioUsd } from "@/lib/server/prices";
import type { InvestmentDoc, MiningContractDoc, TransactionDoc, UserDoc } from "@/lib/types";
import { Card, CardHeader, Badge, statusTone, Stat } from "@/components/ui";
import { BalanceList } from "@/components/app/balance-list";
import { TxList } from "@/components/app/tx-list";
import { HoldingsList } from "@/components/app/holdings-list";
import { UserActions } from "./user-actions";
import { fmtDate, fmtUsd } from "@/lib/utils";

export default async function AdminUserDetail({ params }: PageProps<"/admin/users/[uid]">) {
  const { uid } = await params;
  const user = await getDoc<UserDoc>("users", uid);
  if (!user) notFound();
  const [prices, txs, investments, mining] = await Promise.all([
    getPrices(),
    list<TransactionDoc>("transactions", { where: [["uid", "==", uid]], limit: 50 }),
    list<InvestmentDoc>("investments", { where: [["uid", "==", uid]], limit: 50 }),
    list<MiningContractDoc>("miningContracts", { where: [["uid", "==", uid]], limit: 50 }),
  ]);
  return (
    <>
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-ink-300 hover:text-white mb-4"><ArrowLeft className="size-4" /> Users</Link>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">{user.fullName}</h1>
          <p className="text-sm text-ink-300">{user.email} · @{user.username} · {user.phone} · {user.country} · {user.accountType}</p>
          <p className="text-xs text-ink-400 mt-1">Joined {fmtDate(user.createdAt)} · last login {fmtDate(user.lastLoginAt)} · referral {user.referralCode}{user.referredBy ? ` · referred by ${user.referredBy}` : ""}</p>
        </div>
        <div className="flex gap-2">
          <Badge tone={statusTone(user.status)}>{user.status}</Badge>
          <Badge tone={statusTone(user.kycStatus === "none" ? "" : user.kycStatus)}>KYC {user.kycStatus}</Badge>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Wallet value" value={fmtUsd(portfolioUsd(user.balances ?? {}, prices))} />
        <Stat label="Total deposited" value={fmtUsd(user.totalDeposited ?? 0)} accent="mint" />
        <Stat label="Total withdrawn" value={fmtUsd(user.totalWithdrawn ?? 0)} accent="rose" />
        <Stat label="Referral earnings" value={fmtUsd(user.referralEarnings ?? 0)} accent="gold" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Actions" />
            <UserActions uid={uid} status={user.status} kycStatus={user.kycStatus} notes={user.notes ?? ""} />
          </Card>
          <Card>
            <CardHeader title="Balances" />
            <BalanceList balances={user.balances ?? {}} prices={prices} showZero />
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Plans and contracts" />
            <HoldingsList investments={investments} mining={mining} />
          </Card>
          <Card>
            <CardHeader title="Ledger" />
            <TxList txs={txs} dense />
          </Card>
        </div>
      </div>
    </>
  );
}
