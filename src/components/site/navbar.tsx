"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./logo";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#investing", label: "Investing" },
  { href: "/#mining", label: "Mining" },
  { href: "/#real-estate", label: "Real Estate" },
  { href: "/markets", label: "Markets" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-40 transition-all duration-300", scrolled ? "py-2" : "py-4")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={cn("flex items-center justify-between rounded-2xl px-4 sm:px-5 h-14 transition-all", scrolled ? "glass shadow-card" : "")}>
          <Logo />
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="px-3.5 py-2 text-sm text-ink-200 hover:text-white rounded-lg hover:bg-white/6 transition">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-2">
            {signedIn ? (
              <Button href="/dashboard" size="sm">Open dashboard</Button>
            ) : (
              <>
                <Button href="/login" variant="ghost" size="sm">Sign in</Button>
                <Button href="/register" size="sm">Create account</Button>
              </>
            )}
          </div>
          <button className="lg:hidden size-10 grid place-items-center rounded-lg hover:bg-white/8" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden mx-4 mt-2 glass rounded-2xl p-3 shadow-card"
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-ink-100 hover:bg-white/6">
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 p-2 pt-3">
              {signedIn ? (
                <Button href="/dashboard" className="flex-1">Open dashboard</Button>
              ) : (
                <>
                  <Button href="/login" variant="secondary" className="flex-1">Sign in</Button>
                  <Button href="/register" className="flex-1">Create account</Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
