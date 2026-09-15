import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserDoc } from "./session";
import { getPrices, portfolioUsd } from "./prices";
import { list } from "./queries";
import type { InvestmentDoc, MiningContractDoc, TransactionDoc, WithId } from "../types";

/** Common data every member page needs. Cached per request. */
export const getMemberContext = cache(async () => {
  const [user, prices] = await Promise.all([getCurrentUserDoc(), getPrices()]);
  if (!user) redirect("/login");
  return { user, prices, totalUsd: portfolioUsd(user.balances ?? {}, prices), now: Date.now() };
});

export const getActiveHoldings = cache(async (uid: string) => {
  const [investments, mining] = await Promise.all([
    list<InvestmentDoc>("investments", { where: [["uid", "==", uid]], limit: 100 }),
    list<MiningContractDoc>("miningContracts", { where: [["uid", "==", uid]], limit: 100 }),
  ]);
  return { investments, mining };
});

export const getRecentTransactions = cache(async (uid: string, limit = 8): Promise<WithId<TransactionDoc>[]> => {
  return list<TransactionDoc>("transactions", { where: [["uid", "==", uid]], limit });
});
