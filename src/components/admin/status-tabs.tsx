import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatusTabs({ base, current, statuses }: { base: string; current: string; statuses: string[] }) {
  return (
    <div className="flex gap-1 rounded-xl bg-white/5 p-1 w-fit mb-5">
      {statuses.map((s) => (
        <Link key={s} href={s === statuses[0] ? base : `${base}?status=${s}`} className={cn("rounded-lg px-3.5 py-1.5 text-sm font-medium capitalize transition", current === s ? "bg-ink-800 text-white shadow" : "text-ink-300 hover:text-white")}>
          {s}
        </Link>
      ))}
    </div>
  );
}

export function pickStatus(sp: Record<string, string | string[] | undefined>, allowed: string[]) {
  const s = typeof sp.status === "string" ? sp.status : allowed[0];
  return allowed.includes(s) ? s : allowed[0];
}
