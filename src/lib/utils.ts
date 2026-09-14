import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { assetInfo, type Asset } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtUsd(n: number, opts: Intl.NumberFormatOptions = {}) {
  const abs = Math.abs(n);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: abs >= 1000 ? 0 : abs >= 1 ? 2 : 6,
    ...opts,
  }).format(n);
}

export function fmtCompact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
}

export function fmtAmount(n: number, asset?: Asset | string) {
  const d = asset ? (assetInfo(asset)?.decimals ?? 4) : 4;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: d }).format(n);
}

export function fmtPct(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

export function fmtDate(ts: number | undefined, withTime = true) {
  if (!ts) return "-";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  }).format(new Date(ts));
}

export function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  return d + "d ago";
}

export function shortId(id: string, n = 6) {
  return id.length <= n * 2 ? id : id.slice(0, n) + "..." + id.slice(-n);
}

export function randomCode(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function round(n: number, d = 8) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

export function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
