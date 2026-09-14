"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, CreditCard, Landmark, LayoutDashboard, LifeBuoy, LogOut, Menu, Package, Settings, ShieldCheck, Users, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { logout } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/deposits", label: "Deposits", icon: ArrowDownToLine },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { href: "/admin/kyc", label: "KYC", icon: ShieldCheck },
  { href: "/admin/loans", label: "Loans", icon: Landmark },
  { href: "/admin/cards", label: "Cards", icon: CreditCard },
  { href: "/admin/plans", label: "Plans", icon: Package },
  { href: "/admin/tickets", label: "Tickets", icon: LifeBuoy },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {NAV.map((it) => {
        const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-gold-500/15 text-white border border-gold-500/30" : "text-ink-300 hover:bg-white/5 hover:text-white border border-transparent")}>
            <it.icon className={cn("size-[18px]", active ? "text-gold-400" : "text-ink-400")} /> {it.label}
          </Link>
        );
      })}
      <button onClick={async () => { await logout(); router.replace("/"); router.refresh(); }} className="mt-4 w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-300 hover:bg-rose-500/10 hover:text-rose-300">
        <LogOut className="size-[18px]" /> Log out
      </button>
    </nav>
  );
  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-white/8 bg-ink-900/60 sticky top-0 h-screen">
        <div className="px-5 h-16 flex items-center gap-2 border-b border-white/8">
          <Logo href="/admin" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-400 bg-gold-500/15 rounded px-1.5 py-0.5">Admin</span>
        </div>
        {nav}
      </aside>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-ink-900 border-r border-white/10 lg:hidden">
            <div className="px-5 h-16 flex items-center justify-between border-b border-white/8">
              <Logo href="/admin" />
              <button onClick={() => setOpen(false)} className="size-9 grid place-items-center rounded-lg hover:bg-white/8"><X className="size-5" /></button>
            </div>
            {nav}
          </aside>
        </>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 border-b border-white/8 bg-ink-950/80 backdrop-blur-md flex items-center px-4 sm:px-6 gap-3">
          <button onClick={() => setOpen(true)} className="lg:hidden size-10 grid place-items-center rounded-lg hover:bg-white/8"><Menu className="size-5" /></button>
          <p className="text-sm text-ink-300">Operations portal</p>
          <div className="flex-1" />
          <p className="text-xs text-ink-400">{email}</p>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
