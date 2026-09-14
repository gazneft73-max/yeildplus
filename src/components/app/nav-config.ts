import {
  ArrowDownToLine, ArrowUpFromLine, BarChart3, Brain, Building2, CreditCard, GraduationCap, Landmark, LayoutDashboard, LineChart,
  Pickaxe, Receipt, Users, Wallet, type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; short?: string };

/** Member navigation. Mirrors the client's approved feature list; trading features are intentionally absent. */
export const APP_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/deposit", label: "Deposit", icon: ArrowDownToLine },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { href: "/dashboard/investing", label: "Investing", icon: LineChart },
  { href: "/dashboard/cards", label: "Cards", icon: CreditCard },
  { href: "/dashboard/assets", label: "Assets", icon: Wallet },
  { href: "/dashboard/markets", label: "Markets", icon: BarChart3 },
  { href: "/dashboard/mining", label: "Mining", icon: Pickaxe },
  { href: "/dashboard/real-estate", label: "Real Estate", icon: Building2 },
  { href: "/dashboard/loans", label: "Loans", icon: Landmark },
  { href: "/dashboard/academy", label: "Academy", icon: GraduationCap },
  { href: "/dashboard/insights", label: "Insights", icon: Brain },
  { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { href: "/dashboard/referrals", label: "Referrals", icon: Users },
];
