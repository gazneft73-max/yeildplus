import Link from "next/link";
import { Logo } from "./logo";

export function AuthShell({ title, subtitle, children, footer, wide }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[36rem] rounded-full bg-brand-500/20 blur-[120px] pointer-events-none" />
      <header className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 flex items-center justify-between">
        <Logo />
        <Link href="/" className="text-sm text-ink-300 hover:text-white">
          Back to site
        </Link>
      </header>
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-16">
        <div className={"w-full " + (wide ? "max-w-2xl" : "max-w-md")}>
          <div className="card p-7 sm:p-9 bg-ink-900/70">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-ink-300">{subtitle}</p>}
            <div className="mt-7">{children}</div>
          </div>
          {footer && <p className="mt-5 text-center text-sm text-ink-300">{footer}</p>}
        </div>
      </main>
    </div>
  );
}
