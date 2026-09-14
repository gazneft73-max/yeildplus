import Link from "next/link";
import { Logo } from "./logo";
import { SITE_NAME } from "@/lib/env";

const cols = [
  {
    title: "Products",
    links: [
      { href: "/#investing", label: "Investment plans" },
      { href: "/#mining", label: "Cloud mining" },
      { href: "/#real-estate", label: "Real estate" },
      { href: "/markets", label: "Markets" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#about", label: "About us" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#security", label: "Security" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of service" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/aml", label: "AML & KYC policy" },
      { href: "/risk", label: "Risk disclosure" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/8 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-ink-300 max-w-xs leading-relaxed">
            Fixed-term investment plans, cloud mining contracts and tokenised real estate. Transparent returns, fast withdrawals, human support.
          </p>
          <p className="mt-6 text-xs text-ink-400">Support: support@plutovest.com</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold text-white mb-3">{c.title}</h4>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-300 hover:text-white transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-ink-400">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p className="max-w-xl text-center sm:text-right">
            Digital assets are volatile and returns are not guaranteed. Only invest what you can afford to lose. {SITE_NAME} is not a bank.
          </p>
        </div>
      </div>
    </footer>
  );
}
