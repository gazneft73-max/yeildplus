"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Button ---------- */
type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "brand-gradient text-white shadow-[0_10px_30px_-10px_rgb(124_92_255/0.7)] hover:brightness-110 active:brightness-95",
  secondary: "bg-white/8 text-ink-100 border border-white/10 hover:bg-white/12",
  ghost: "text-ink-200 hover:bg-white/6 hover:text-white",
  danger: "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25",
  success: "bg-mint-500/15 text-mint-400 border border-mint-500/30 hover:bg-mint-500/25",
  outline: "border border-brand-500/50 text-brand-300 hover:bg-brand-500/10",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-13 px-7 text-base rounded-xl gap-2",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
}

export function Button({ className, variant = "primary", size = "md", loading, href, children, disabled, ...props }: ButtonProps) {
  const cls = cn(
    "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all duration-200 select-none",
    "disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-focus",
    variants[variant],
    sizes[size],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

/* ---------- Card ---------- */
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-ink-300 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Inputs ---------- */
const fieldBase =
  "w-full h-11 rounded-xl bg-ink-900/70 border border-white/10 px-4 text-sm text-ink-100 placeholder:text-ink-400 transition focus:ring-focus disabled:opacity-60";

export function Label({ children, hint, className }: { children: React.ReactNode; hint?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-1.5", className)}>
      <label className="text-xs font-medium uppercase tracking-wider text-ink-300">{children}</label>
      {hint && <span className="text-xs text-ink-400">{hint}</span>}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(fieldBase, className)} {...props} />;
});

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn(fieldBase, "appearance-none pr-9 bg-no-repeat bg-[right_0.9rem_center]", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238b95b0' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn(fieldBase, "h-auto min-h-28 py-3 resize-y", className)} {...props} />;
});

export function Field({ label, hint, error, children }: { label: React.ReactNode; hint?: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label hint={hint}>{label}</Label>
      {children}
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

/* ---------- Badge ---------- */
type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";
const tones: Record<Tone, string> = {
  neutral: "bg-white/8 text-ink-200 border-white/10",
  brand: "bg-brand-500/15 text-brand-300 border-brand-500/30",
  success: "bg-mint-500/15 text-mint-400 border-mint-500/30",
  warning: "bg-gold-500/15 text-gold-400 border-gold-500/30",
  danger: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  info: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};
export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", tones[tone], className)}>
      {children}
    </span>
  );
}

export function statusTone(s: string): Tone {
  switch (s) {
    case "approved":
    case "completed":
    case "active":
    case "answered":
      return "success";
    case "pending":
    case "open":
      return "warning";
    case "rejected":
    case "suspended":
    case "closed":
      return "danger";
    default:
      return "neutral";
  }
}

/* ---------- Stat ---------- */
export function Stat({ label, value, sub, icon, accent = "brand" }: { label: string; value: React.ReactNode; sub?: React.ReactNode; icon?: React.ReactNode; accent?: "brand" | "mint" | "gold" | "rose" }) {
  const ring = {
    brand: "from-brand-500/25 to-transparent text-brand-300",
    mint: "from-mint-500/25 to-transparent text-mint-400",
    gold: "from-gold-500/25 to-transparent text-gold-400",
    rose: "from-rose-500/25 to-transparent text-rose-400",
  }[accent];
  return (
    <div className="card p-5 relative overflow-hidden">
      <div className={cn("absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br blur-2xl", ring)} />
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-ink-300 font-medium">{label}</p>
        {icon && <span className={cn("size-9 rounded-xl bg-white/6 grid place-items-center", ring.split(" ").pop())}>{icon}</span>}
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-white tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-300">{sub}</p>}
    </div>
  );
}

/* ---------- Table ---------- */
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto -mx-6 px-6", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("text-left text-xs font-medium uppercase tracking-wider text-ink-400 py-2.5 pr-4 border-b border-white/8", className)}>{children}</th>;
}
export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("py-3 pr-4 border-b border-white/5 text-ink-200 align-middle", className)}>{children}</td>;
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto size-12 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-ink-400 mb-3">
        <span className="text-xl">◌</span>
      </div>
      <p className="font-medium text-ink-100">{title}</p>
      {hint && <p className="text-sm text-ink-400 mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative w-full card bg-ink-900 p-6 rounded-b-none sm:rounded-3xl max-h-[92vh] overflow-y-auto", wide ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="size-8 rounded-lg hover:bg-white/8 grid place-items-center text-ink-300" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Misc ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-lg", className)} />;
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-white/8", className)} />;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-xs bg-white/8 border border-white/10 rounded px-1.5 py-0.5 text-ink-200">{children}</code>;
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {}
      }}
      className="text-xs font-medium text-brand-300 hover:text-brand-200"
    >
      {done ? "Copied" : label}
    </button>
  );
}
