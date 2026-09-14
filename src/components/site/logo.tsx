import Link from "next/link";
import { cn } from "@/lib/utils";

/** The PlutoVest mark: a planet carrying a rising growth path, wrapped by an orbital ring. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} className={className} aria-hidden>
      <defs>
        <linearGradient id="pv-core" x1="18" y1="18" x2="78" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9d84ff" />
          <stop offset="0.55" stopColor="#7c5cff" />
          <stop offset="1" stopColor="#3b2aa8" />
        </linearGradient>
        <linearGradient id="pv-ring" x1="8" y1="70" x2="90" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#14d19c" stopOpacity="0.15" />
          <stop offset="0.45" stopColor="#3ee6b8" />
          <stop offset="1" stopColor="#b8a5ff" />
        </linearGradient>
        <radialGradient id="pv-shine" cx="0.32" cy="0.28" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M12 62 C 22 32, 74 20, 88 34" fill="none" stroke="url(#pv-ring)" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
      <circle cx="48" cy="48" r="24" fill="url(#pv-core)" />
      <circle cx="48" cy="48" r="24" fill="url(#pv-shine)" />
      <path d="M34 58 L42 49 L49 54 L62 38" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M56 38 H62 V44" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 62 C 30 78, 66 84, 88 66" fill="none" stroke="url(#pv-ring)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="88" cy="34" r="4.5" fill="#3ee6b8" />
      <circle cx="88" cy="34" r="8" fill="none" stroke="#3ee6b8" strokeOpacity="0.35" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({ className, href = "/", size = 34, wordmark = true }: { className?: string; href?: string; size?: number; wordmark?: boolean }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 font-display font-bold text-white", className)} aria-label="PlutoVest home">
      <LogoMark size={size} />
      {wordmark && (
        <span className="text-[1.15rem] tracking-tight leading-none">
          Pluto<span className="text-gradient">Vest</span>
        </span>
      )}
    </Link>
  );
}
