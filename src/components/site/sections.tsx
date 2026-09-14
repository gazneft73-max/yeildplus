"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, Banknote, Building2, ChevronDown, Clock, Coins, CreditCard, Gem, Globe2, Headphones, Landmark, LineChart,
  Lock, MessageSquare, Pickaxe, ShieldCheck, Sparkles, UserPlus, Wallet, Zap,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { Reveal, Stagger, Item, Tilt, motion } from "@/components/ui/motion";
import { cn, fmtUsd } from "@/lib/utils";
import type { InvestmentPlanDoc, MiningPlanDoc, WithId } from "@/lib/types";
import { AssetIcon } from "@/components/app/asset-icon";

/* ------------------------------------------------------------------ */
export function SectionHeading({ eyebrow, title, text, center = true }: { eyebrow: string; title: React.ReactNode; text?: string; center?: boolean }) {
  return (
    <Reveal className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">{title}</h2>
      {text && <p className="mt-4 text-ink-300 leading-relaxed">{text}</p>}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
export function Features() {
  const items = [
    { icon: LineChart, title: "Fixed-term investment plans", text: "Pick a term, know your return up front. Profits settle to your wallet daily or at maturity, exactly as promised." },
    { icon: Pickaxe, title: "Cloud mining in XAUT & XRP", text: "Rent hashpower and receive payouts in Tether Gold or XRP every day. No hardware, no electricity bills." },
    { icon: Building2, title: "Tokenised real estate", text: "Own a slice of income-producing property from as little as a few hundred dollars and collect rental yield." },
    { icon: CreditCard, title: "Spend with a PlutoVest card", text: "Top up a virtual or physical card straight from your USDT balance and spend anywhere cards are accepted." },
    { icon: Landmark, title: "Fast, fair loans", text: "Verified members can borrow against their track record with clear, fixed interest and no hidden fees." },
    { icon: Wallet, title: "Multi-asset wallet", text: "Hold BTC, ETH, USDT, XAUT, XRP and more in one place with live market pricing." },
  ];
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Everything in one account" title="Built for people who want their money to work harder" text="Six ways to grow and use your capital, managed from a single dashboard on any device." />
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Item key={it.title}>
              <Tilt className="h-full">
                <div className="card h-full p-6 hover:border-brand-500/40 transition-colors group">
                  <span className="size-11 rounded-xl brand-gradient grid place-items-center text-white shadow-glow">
                    <it.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">{it.title}</h3>
                  <p className="mt-2 text-sm text-ink-300 leading-relaxed">{it.text}</p>
                </div>
              </Tilt>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function HowItWorks() {
  const steps = [
    { icon: UserPlus, title: "Create your account", text: "Sign up in under a minute. Verify your identity when you are ready to withdraw." },
    { icon: Coins, title: "Fund your wallet", text: "Deposit USDT, BTC, ETH, XRP or XAUT to your personal deposit address. Confirmed within the hour." },
    { icon: Sparkles, title: "Choose a plan", text: "Pick an investment plan, a mining contract or a property. See the full return before you commit." },
    { icon: Banknote, title: "Collect and withdraw", text: "Earnings settle automatically. Withdraw to any wallet; requests are processed within 24 hours." },
  ];
  return (
    <section id="how-it-works" className="relative py-24 border-y border-white/6 bg-ink-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="How it works" title="From sign-up to first payout in four steps" />
        <div className="mt-14 relative grid gap-8 md:grid-cols-4">
          <div className="hidden md:block absolute left-[12.5%] right-[12.5%] top-7 h-px bg-gradient-to-r from-brand-500/0 via-brand-500/60 to-mint-500/0" />
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1} className="relative text-center md:text-left">
              <div className="relative inline-grid size-14 place-items-center rounded-2xl bg-ink-900 border border-brand-500/40 text-brand-300 shadow-glow">
                <s.icon className="size-6" />
                <span className="absolute -top-2 -right-2 size-6 rounded-full brand-gradient text-[11px] font-bold text-white grid place-items-center">{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-300 leading-relaxed">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function PlansShowcase({ plans, signedIn }: { plans: WithId<InvestmentPlanDoc>[]; signedIn: boolean }) {
  return (
    <section id="investing" className="relative py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Investment plans" title="Transparent returns. No surprises." text="Every plan states its total return, term and payout schedule up front. Capital is returned at maturity on plans marked as such." />
        {plans.length === 0 ? (
          <p className="mt-12 text-center text-ink-400">Plans are being prepared. Check back shortly.</p>
        ) : (
          <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <Item key={p.id}>
                <PlanCard plan={p} signedIn={signedIn} />
              </Item>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}

export function PlanCard({ plan, signedIn, onSelect }: { plan: WithId<InvestmentPlanDoc>; signedIn: boolean; onSelect?: () => void }) {
  const daily = plan.payout === "daily" ? plan.roiPercent / plan.durationDays : null;
  return (
    <div className={cn("card relative h-full p-6 flex flex-col", plan.featured && "border-brand-500/50 shadow-glow")}>
      {plan.featured && (
        <span className="absolute -top-3 left-6 rounded-full brand-gradient px-3 py-1 text-[11px] font-semibold text-white">Most popular</span>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-white">{plan.name}</h3>
          {plan.tagline && <p className="text-sm text-ink-300 mt-1">{plan.tagline}</p>}
        </div>
        <Badge tone={plan.payout === "daily" ? "success" : "info"}>{plan.payout === "daily" ? "Daily payout" : "Paid at maturity"}</Badge>
      </div>
      <div className="mt-6 flex items-end gap-2">
        <span className="font-display text-4xl font-semibold text-gradient">{plan.roiPercent}%</span>
        <span className="text-sm text-ink-300 mb-1.5">total return in {plan.durationDays} days</span>
      </div>
      <ul className="mt-6 space-y-2.5 text-sm text-ink-200">
        <li className="flex justify-between"><span className="text-ink-400">Minimum</span><span>{fmtUsd(plan.minAmount)}</span></li>
        <li className="flex justify-between"><span className="text-ink-400">Maximum</span><span>{plan.maxAmount > 0 ? fmtUsd(plan.maxAmount) : "Unlimited"}</span></li>
        {daily !== null && <li className="flex justify-between"><span className="text-ink-400">Daily profit</span><span className="text-mint-400">{daily.toFixed(2)}% / day</span></li>}
        <li className="flex justify-between"><span className="text-ink-400">Capital</span><span>{plan.capitalBack ? "Returned at maturity" : "Included in return"}</span></li>
      </ul>
      <div className="mt-auto pt-6">
        {onSelect ? (
          <Button className="w-full" onClick={onSelect} variant={plan.featured ? "primary" : "secondary"}>
            Invest in {plan.name}
          </Button>
        ) : (
          <Button className="w-full" href={signedIn ? "/dashboard/investing" : "/register"} variant={plan.featured ? "primary" : "secondary"}>
            {signedIn ? "Invest now" : "Get started"} <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function MiningShowcase({ plans, signedIn }: { plans: WithId<MiningPlanDoc>[]; signedIn: boolean }) {
  return (
    <section id="mining" className="relative py-24 border-y border-white/6 bg-ink-900/40 overflow-hidden">
      <div className="absolute -left-40 top-20 size-[30rem] rounded-full bg-gold-500/10 blur-[120px] pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-[1fr_1.3fr] gap-12 items-center">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Cloud mining</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">Mine gold and XRP without the hardware</h2>
          <p className="mt-4 text-ink-300 leading-relaxed">
            Reserve hashpower in our managed facilities and receive your share of output every day, paid in Tether Gold (XAUT) or XRP. Contracts start
            instantly and payouts show up in your wallet automatically.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-ink-200">
            {["Daily payouts in XAUT or XRP", "Transparent maintenance fee shown before purchase", "Stack contracts to scale your hashrate", "Live earnings tracking in your dashboard"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="size-5 rounded-full bg-gold-500/15 border border-gold-500/40 grid place-items-center text-gold-400 text-xs">✓</span>
                {t}
              </li>
            ))}
          </ul>
          <Button href={signedIn ? "/dashboard/mining" : "/register"} className="mt-8" variant="secondary">
            View mining contracts <ArrowRight className="size-4" />
          </Button>
        </Reveal>
        <Stagger className="grid gap-4 sm:grid-cols-2">
          {plans.length === 0 ? (
            <p className="text-ink-400">Mining contracts are being prepared.</p>
          ) : (
            plans.slice(0, 4).map((p) => (
              <Item key={p.id}>
                <MiningCard plan={p} />
              </Item>
            ))
          )}
        </Stagger>
      </div>
    </section>
  );
}

export function MiningCard({ plan, onSelect }: { plan: WithId<MiningPlanDoc>; onSelect?: () => void }) {
  const dailyUsd = plan.price * (plan.dailyReturnPercent / 100) * (1 - plan.maintenanceFeePercent / 100);
  const totalUsd = dailyUsd * plan.durationDays;
  return (
    <div className={cn("card p-5 h-full flex flex-col", plan.featured && "border-gold-500/40")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AssetIcon symbol={plan.minesAsset} size={36} />
          <div>
            <h3 className="font-display font-semibold text-white">{plan.name}</h3>
            <p className="text-xs text-ink-400">{plan.hashrate} · {plan.algorithm}</p>
          </div>
        </div>
        {plan.featured && <Badge tone="warning">Hot</Badge>}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-white/4 p-3">
          <p className="text-[11px] uppercase tracking-wider text-ink-400">Price</p>
          <p className="font-medium text-white">{fmtUsd(plan.price)}</p>
        </div>
        <div className="rounded-lg bg-white/4 p-3">
          <p className="text-[11px] uppercase tracking-wider text-ink-400">Term</p>
          <p className="font-medium text-white">{plan.durationDays} days</p>
        </div>
        <div className="rounded-lg bg-white/4 p-3">
          <p className="text-[11px] uppercase tracking-wider text-ink-400">Daily output</p>
          <p className="font-medium text-mint-400">≈ {fmtUsd(dailyUsd)} in {plan.minesAsset}</p>
        </div>
        <div className="rounded-lg bg-white/4 p-3">
          <p className="text-[11px] uppercase tracking-wider text-ink-400">Est. total</p>
          <p className="font-medium text-white">{fmtUsd(totalUsd)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-400">Maintenance fee {plan.maintenanceFeePercent}% · Output converted at market price when paid.</p>
      {onSelect && (
        <Button className="mt-4 w-full" variant="secondary" onClick={onSelect}>
          Start mining
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function RealEstateShowcase({ plans, signedIn }: { plans: WithId<InvestmentPlanDoc>[]; signedIn: boolean }) {
  return (
    <section id="real-estate" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Real estate" title="Property income, without the landlord headaches" text="Fractional ownership in vetted, income-producing buildings. Rental yield is distributed to your wallet and your capital is returned when the holding period ends." />
        {plans.length === 0 ? (
          <p className="mt-12 text-center text-ink-400">Property listings are being prepared.</p>
        ) : (
          <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {plans.slice(0, 3).map((p) => (
              <Item key={p.id}>
                <PropertyCard plan={p} signedIn={signedIn} />
              </Item>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}

export function PropertyCard({ plan, signedIn, onSelect }: { plan: WithId<InvestmentPlanDoc>; signedIn: boolean; onSelect?: () => void }) {
  return (
    <div className="card overflow-hidden h-full flex flex-col group">
      <div className="relative h-44 bg-gradient-to-br from-ink-700 to-ink-900 overflow-hidden">
        {plan.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={plan.imageUrl} alt={plan.name} className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink-500">
            <Building2 className="size-14" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">{plan.name}</h3>
            {plan.location && <p className="text-xs text-ink-300 flex items-center gap-1"><Globe2 className="size-3" /> {plan.location}</p>}
          </div>
          <Badge tone="brand">{plan.roiPercent}% yield</Badge>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        {plan.tagline && <p className="text-sm text-ink-300">{plan.tagline}</p>}
        <ul className="mt-4 space-y-2 text-sm text-ink-200">
          <li className="flex justify-between"><span className="text-ink-400">Entry from</span><span>{fmtUsd(plan.minAmount)}</span></li>
          <li className="flex justify-between"><span className="text-ink-400">Holding period</span><span>{plan.durationDays} days</span></li>
          <li className="flex justify-between"><span className="text-ink-400">Distribution</span><span>{plan.payout === "daily" ? "Daily" : "At exit"}</span></li>
        </ul>
        <div className="mt-auto pt-5">
          {onSelect ? (
            <Button className="w-full" variant="secondary" onClick={onSelect}>Invest in this property</Button>
          ) : (
            <Button className="w-full" variant="secondary" href={signedIn ? "/dashboard/real-estate" : "/register"}>View property</Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function Security() {
  const items = [
    { icon: Lock, title: "Cold storage", text: "Client assets are kept in offline, multi-signature wallets. Hot wallets hold only what is needed for daily withdrawals." },
    { icon: ShieldCheck, title: "Verified members", text: "KYC and AML checks on every account that withdraws, so bad actors never share the platform with you." },
    { icon: Zap, title: "Hardened infrastructure", text: "Encrypted in transit and at rest, session cookies that cannot be read by scripts, and every balance change recorded in an audit ledger." },
    { icon: Clock, title: "24-hour reviews", text: "Deposits are confirmed within the hour and withdrawals are reviewed by a human within one business day." },
  ];
  return (
    <section id="security" className="relative py-24 border-y border-white/6 bg-ink-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Security" title="Your assets, protected at every layer" />
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <Item key={it.title}>
              <div className="card p-6 h-full">
                <it.icon className="size-6 text-mint-400" />
                <h3 className="mt-4 font-display font-semibold text-white">{it.title}</h3>
                <p className="mt-2 text-sm text-ink-300 leading-relaxed">{it.text}</p>
              </div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function Testimonials() {
  const items = [
    { name: "Amara O.", role: "Product designer, Lagos", text: "I started with a 30-day plan just to test the water. Profits landed every morning like clockwork, so I moved my mining budget here too." },
    { name: "Daniel R.", role: "Retired engineer, Manchester", text: "The real estate packages are the first crypto product my wife actually understood. Clear numbers, clear dates, no jargon." },
    { name: "Priya S.", role: "Founder, Bengaluru", text: "Support answered my KYC question in under an hour and my first withdrawal was in my wallet the same day." },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Members" title="Trusted by investors in 60+ countries" />
        <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <Item key={t.name}>
              <figure className="card p-6 h-full flex flex-col">
                <div className="text-gold-400 text-sm tracking-widest">★★★★★</div>
                <blockquote className="mt-4 text-ink-200 leading-relaxed flex-1">“{t.text}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="size-10 rounded-full brand-gradient grid place-items-center font-semibold text-white">{t.name[0]}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-ink-400">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function Faq() {
  const items = [
    { q: "How do payouts work?", a: "Daily-payout plans credit profit to your USDT balance every 24 hours from the moment you invest. Maturity plans pay the full return, plus capital where stated, on the last day of the term. Mining contracts pay daily in XAUT or XRP at the market price at settlement." },
    { q: "Which assets can I deposit?", a: "USDT (TRC20), BTC, ETH, BNB, SOL, XRP, XAUT, ADA, DOGE, TRX and LTC. Send to the address shown in your wallet, add the transaction hash and your balance is credited once the network confirms." },
    { q: "How long do withdrawals take?", a: "Withdrawals are reviewed by our operations team and usually paid within 24 hours. A small network fee applies and is shown before you confirm. Identity verification is required before your first withdrawal." },
    { q: "Is my capital guaranteed?", a: "Plans marked \"capital returned at maturity\" return your principal at the end of the term. Digital assets remain volatile and no return is ever guaranteed by law; please read the risk disclosure and only invest what you can afford to hold." },
    { q: "How does the referral programme work?", a: "Share your link. When someone you refer makes their first confirmed deposit, you receive a percentage of it in USDT instantly. There is no cap on the number of people you can refer." },
    { q: "Who can open an account?", a: "Anyone aged 18 or over in a jurisdiction where digital-asset investing is permitted. Business accounts are available for companies and funds." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24 border-t border-white/6">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-12 divide-y divide-white/8 rounded-2xl border border-white/8 bg-ink-900/40">
          {items.map((it, i) => (
            <div key={it.q}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                <span className="font-medium text-white">{it.q}</span>
                <ChevronDown className={cn("size-5 text-ink-400 transition-transform", open === i && "rotate-180")} />
              </button>
              <motion.div initial={false} animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }} className="overflow-hidden">
                <p className="px-6 pb-5 text-sm text-ink-300 leading-relaxed">{it.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function SupportStrip() {
  return (
    <section id="contact" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: MessageSquare, t: "Support tickets", d: "Open a ticket from your dashboard. Median first reply under 2 hours." },
          { icon: Headphones, t: "Email", d: "support@plutovest.com for account and payment questions." },
          { icon: Gem, t: "Private clients", d: "Dedicated manager for portfolios above $100k." },
        ].map((c) => (
          <Reveal key={c.t}>
            <div className="card p-5 flex gap-4">
              <c.icon className="size-6 text-brand-300 shrink-0" />
              <div>
                <p className="font-medium text-white">{c.t}</p>
                <p className="text-sm text-ink-300 mt-1">{c.d}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function Cta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-brand-500/40 p-10 sm:p-14 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/40 via-ink-900 to-mint-600/25" />
            <div className="absolute inset-0 grid-bg opacity-60" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white">Start growing your capital today</h2>
              <p className="mt-4 text-ink-200 max-w-xl mx-auto">Open a free account, fund it in minutes and let your first plan start earning before the day is over.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button href={signedIn ? "/dashboard" : "/register"} size="lg">
                  {signedIn ? "Go to dashboard" : "Create free account"} <ArrowRight className="size-4" />
                </Button>
                <Link href="/markets" className="inline-flex h-13 items-center justify-center rounded-xl px-7 text-base font-semibold text-white/90 hover:bg-white/8 transition">
                  View live markets
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
