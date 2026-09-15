"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui";
import { Counter, fadeUp } from "@/components/ui/motion";
import { fmtUsd } from "@/lib/utils";
import type { PriceMap } from "@/lib/types";
import { AssetIcon } from "@/components/app/asset-icon";

export function Hero({ prices, signedIn }: { prices: PriceMap; signedIn: boolean }) {
  const cards = [
    { symbol: "BTC", label: "Bitcoin" },
    { symbol: "XAUT", label: "Tether Gold" },
    { symbol: "XRP", label: "XRP" },
  ] as const;

  return (
    <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[42rem] rounded-full bg-brand-500/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-40 right-[-10rem] size-[26rem] rounded-full bg-mint-500/12 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-[1.15fr_1fr] gap-14 items-center">
        <motion.div initial="hidden" animate="show" className="max-w-2xl">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium text-ink-200">
            <Sparkles className="size-3.5 text-mint-400" />
            Fixed-term plans, cloud mining and tokenised property
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight text-white">
            Put your capital to work. <span className="text-gradient">Every single day.</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg text-ink-300 leading-relaxed max-w-xl">
            PlutoVest turns idle crypto into predictable income. Choose a plan, fund it in minutes, and watch profits settle to your wallet automatically.
            Withdraw whenever you like.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="mt-9 flex flex-col sm:flex-row gap-3">
            <Button href={signedIn ? "/dashboard" : "/register"} size="lg">
              {signedIn ? "Open dashboard" : "Start investing"} <ArrowRight className="size-4" />
            </Button>
            <Button href="/#investing" variant="secondary" size="lg">
              Explore plans
            </Button>
          </motion.div>
          <motion.div variants={fadeUp} custom={4} className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
            {[
              { v: 48200, s: "+", l: "Active investors" },
              { v: 312, s: "M+", p: "$", l: "Assets under plan" },
              { v: 99.98, s: "%", d: 2, l: "Payout accuracy" },
            ].map((x) => (
              <div key={x.l}>
                <p className="font-display text-2xl sm:text-3xl font-semibold text-white">
                  <Counter value={x.v} prefix={x.p ?? ""} suffix={x.s} decimals={x.d ?? 0} />
                </p>
                <p className="text-xs text-ink-400 mt-1">{x.l}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }} className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-500/30 via-transparent to-mint-500/20 blur-2xl" />
          <div className="relative card p-6 sm:p-7 bg-ink-900/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-400">Portfolio value</p>
                <p className="mt-1 font-display text-3xl font-semibold text-white">{fmtUsd(128_640.22)}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-mint-500/15 border border-mint-500/30 px-2.5 py-1 text-xs font-medium text-mint-400">
                <TrendingUp className="size-3.5" /> +14.2% this month
              </span>
            </div>
            <MiniChart />
            <div className="mt-5 grid gap-2.5">
              {cards.map((c, i) => {
                const p = prices[c.symbol];
                return (
                  <motion.div key={c.symbol} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.12 }} className="flex items-center justify-between rounded-xl bg-white/4 border border-white/6 px-3.5 py-2.5">
                    <div className="flex items-center gap-3">
                      <AssetIcon symbol={c.symbol} size={30} />
                      <div>
                        <p className="text-sm font-medium text-white">{c.label}</p>
                        <p className="text-xs text-ink-400">{c.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white tabular-nums">{fmtUsd(p.usd)}</p>
                      <p className={"text-xs tabular-nums " + (p.change24h >= 0 ? "text-mint-400" : "text-rose-400")}>
                        {p.change24h >= 0 ? "+" : ""}
                        {p.change24h.toFixed(2)}%
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-ink-400">
              <ShieldCheck className="size-4 text-mint-400" /> Funds held in segregated cold wallets. Withdrawals reviewed within 24h.
            </div>
          </div>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-6 top-24 hidden sm:block card px-4 py-3 bg-ink-900/90">
            <p className="text-[11px] uppercase tracking-wider text-ink-400">Daily profit settled</p>
            <p className="font-display text-lg font-semibold text-mint-400">+ 412.50 USDT</p>
          </motion.div>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -right-4 -bottom-6 hidden sm:block card px-4 py-3 bg-ink-900/90">
            <p className="text-[11px] uppercase tracking-wider text-ink-400">Mining contract</p>
            <p className="font-display text-lg font-semibold text-gold-400">0.0128 XAUT / day</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function MiniChart() {
  const pts = [18, 22, 20, 26, 25, 31, 29, 36, 34, 41, 39, 46, 45, 52, 50, 58, 56, 63, 61, 70];
  const w = 520;
  const h = 140;
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const path = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / (max - min)) * (h - 16) - 8}`).join(" L ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-5 w-full h-32" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c5cff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#7c5cff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hero-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7c5cff" />
          <stop offset="1" stopColor="#3ee6b8" />
        </linearGradient>
      </defs>
      <motion.path d={`M ${path} L ${w},${h} L 0,${h} Z`} fill="url(#hero-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }} />
      <motion.path d={`M ${path}`} fill="none" stroke="url(#hero-line)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: "easeInOut", delay: 0.5 }} />
    </svg>
  );
}
