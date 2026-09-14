"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, LifeBuoy, LogOut, Menu, Settings, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Logo } from "@/components/site/logo";
import { APP_NAV } from "./nav-config";
import { logout } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import type { KycStatus } from "@/lib/types";

export type ShellUser = { fullName: string; username: string; email: string; kycStatus: KycStatus; unread: number };

export function AppShell({ user, announcement, children }: { user: ShellUser; announcement?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function doLogout() {
    await logout();
    toast.success("Signed out");
    router.replace("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
      {APP_NAV.map((it) => {
        const active = it.href === "/dashboard" ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-brand-500/15 text-white border border-brand-500/30" : "text-ink-300 hover:bg-white/5 hover:text-white border border-transparent",
            )}
          >
            <it.icon className={cn("size-[18px]", active ? "text-brand-300" : "text-ink-400")} />
            {it.label}
          </Link>
        );
      })}
      <div className="pt-4 mt-4 border-t border-white/8 space-y-0.5">
        {[
          { href: "/dashboard/kyc", label: "Verification", icon: ShieldCheck },
          { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
          { href: "/dashboard/settings", label: "Settings", icon: Settings },
        ].map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-brand-500/15 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white")}>
              <it.icon className="size-[18px] text-ink-400" />
              {it.label}
            </Link>
          );
        })}
        <button onClick={doLogout} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-300 hover:bg-rose-500/10 hover:text-rose-300 transition">
          <LogOut className="size-[18px]" /> Log out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/8 bg-ink-900/60 sticky top-0 h-screen">
        <div className="px-5 h-16 flex items-center border-b border-white/8">
          <Logo href="/dashboard" />
        </div>
        {nav}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-ink-900 border-r border-white/10 lg:hidden">
              <div className="px-5 h-16 flex items-center justify-between border-b border-white/8">
                <Logo href="/dashboard" />
                <button onClick={() => setOpen(false)} className="size-9 grid place-items-center rounded-lg hover:bg-white/8" aria-label="Close menu">
                  <X className="size-5" />
                </button>
              </div>
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 border-b border-white/8 bg-ink-950/80 backdrop-blur-md flex items-center px-4 sm:px-6 gap-3">
          <button onClick={() => setOpen(true)} className="lg:hidden size-10 grid place-items-center rounded-lg hover:bg-white/8" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <div className="lg:hidden">
            <Logo href="/dashboard" size={28} wordmark={false} />
          </div>
          <div className="flex-1" />
          {user.kycStatus !== "approved" && (
            <Link href="/dashboard/kyc" className="hidden sm:block">
              <Badge tone={user.kycStatus === "pending" ? "warning" : "danger"}>{user.kycStatus === "pending" ? "KYC under review" : "Verify identity"}</Badge>
            </Link>
          )}
          <Link href="/dashboard/notifications" className="relative size-10 grid place-items-center rounded-lg hover:bg-white/8" aria-label="Notifications">
            <Bell className="size-5 text-ink-200" />
            {user.unread > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500" />}
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl pl-1 pr-3 py-1 hover:bg-white/6">
            <span className="size-8 rounded-full brand-gradient grid place-items-center text-sm font-semibold text-white">{user.fullName?.[0]?.toUpperCase() || "U"}</span>
            <span className="hidden md:block text-left leading-tight">
              <span className="block text-sm font-medium text-white">{user.fullName}</span>
              <span className="block text-xs text-ink-400">@{user.username}</span>
            </span>
          </Link>
        </header>
        {announcement && (
          <div className="bg-brand-500/15 border-b border-brand-500/30 px-4 sm:px-6 py-2 text-sm text-brand-200 text-center">{announcement}</div>
        )}
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">{title}</h1>
        {text && <p className="mt-1 text-sm text-ink-300">{text}</p>}
      </div>
      {action}
    </div>
  );
}
