import type { Metadata } from "next";
import { getPrices } from "@/lib/server/prices";
import { getSession } from "@/lib/server/session";
import { MarketsTable } from "@/components/app/markets-table";
import { Button } from "@/components/ui";

export const metadata: Metadata = { title: "Markets", description: "Live prices for the assets you can hold on PlutoVest." };
export const revalidate = 60;

export default async function MarketsPage() {
  const [prices, session] = await Promise.all([getPrices(), getSession().catch(() => null)]);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-32 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Markets</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-white">Live prices</h1>
          <p className="mt-2 text-ink-300">Every asset you can deposit, hold and withdraw. Updated every minute.</p>
        </div>
        <Button href={session ? "/dashboard/deposit" : "/register"}>{session ? "Deposit" : "Create account"}</Button>
      </div>
      <div className="card mt-8 p-6">
        <MarketsTable prices={prices} />
      </div>
    </div>
  );
}
