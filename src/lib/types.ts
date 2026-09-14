export type Asset = "USDT" | "BTC" | "ETH" | "BNB" | "SOL" | "XRP" | "XAUT" | "ADA" | "DOGE" | "TRX" | "LTC";

export const ASSETS: { symbol: Asset; name: string; geckoId: string; network: string; decimals: number; color: string }[] = [
  { symbol: "USDT", name: "Tether", geckoId: "tether", network: "TRC20", decimals: 2, color: "#26A17B" },
  { symbol: "BTC", name: "Bitcoin", geckoId: "bitcoin", network: "Bitcoin", decimals: 6, color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum", geckoId: "ethereum", network: "ERC20", decimals: 5, color: "#627EEA" },
  { symbol: "BNB", name: "BNB", geckoId: "binancecoin", network: "BEP20", decimals: 4, color: "#F3BA2F" },
  { symbol: "SOL", name: "Solana", geckoId: "solana", network: "Solana", decimals: 4, color: "#9945FF" },
  { symbol: "XRP", name: "XRP", geckoId: "ripple", network: "XRP Ledger", decimals: 2, color: "#346AA9" },
  { symbol: "XAUT", name: "Tether Gold", geckoId: "tether-gold", network: "ERC20", decimals: 5, color: "#C9A227" },
  { symbol: "ADA", name: "Cardano", geckoId: "cardano", network: "Cardano", decimals: 2, color: "#0033AD" },
  { symbol: "DOGE", name: "Dogecoin", geckoId: "dogecoin", network: "Dogecoin", decimals: 2, color: "#C2A633" },
  { symbol: "TRX", name: "TRON", geckoId: "tron", network: "TRC20", decimals: 2, color: "#EF0027" },
  { symbol: "LTC", name: "Litecoin", geckoId: "litecoin", network: "Litecoin", decimals: 4, color: "#BFBBBB" },
];

export const ASSET_SYMBOLS = ASSETS.map((a) => a.symbol) as [Asset, ...Asset[]];
export const assetInfo = (s: string) => ASSETS.find((a) => a.symbol === s);

/** Cloud mining contracts pay out only in these assets. */
export const MINING_ASSETS = ["XAUT", "XRP"] as const satisfies readonly Asset[];
export type MiningAsset = (typeof MINING_ASSETS)[number];

export type Balances = Partial<Record<Asset, number>>;

export type AccountType = "personal" | "business";
export type KycStatus = "none" | "pending" | "approved" | "rejected";
export type UserStatus = "active" | "suspended";
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface UserDoc {
  email: string;
  fullName: string;
  username: string;
  phone: string;
  gender: string;
  country: string;
  currency: string;
  accountType: AccountType;
  referralCode: string;
  referredBy: string | null;
  balances: Balances;
  kycStatus: KycStatus;
  status: UserStatus;
  createdAt: number;
  lastLoginAt?: number;
  totalDeposited?: number;
  totalWithdrawn?: number;
  referralEarnings?: number;
  referralPaid?: boolean;
  notes?: string;
}

export type TxType =
  | "deposit" | "withdrawal" | "invest" | "profit" | "capital_return" | "mining" | "mining_payout"
  | "referral" | "adjustment" | "loan" | "loan_repayment" | "card_funding";

export interface TransactionDoc {
  uid: string;
  type: TxType;
  asset: Asset;
  amount: number; // positive = credit, negative = debit
  status: "completed" | "pending" | "rejected";
  note?: string;
  refId?: string;
  createdAt: number;
}

export interface DepositDoc {
  uid: string;
  userEmail: string;
  asset: Asset;
  network: string;
  amount: number;
  txHash?: string;
  proofKey?: string;
  status: ReviewStatus;
  adminNote?: string;
  createdAt: number;
  reviewedAt?: number;
}

export interface WithdrawalDoc {
  uid: string;
  userEmail: string;
  asset: Asset;
  network: string;
  address: string;
  amount: number;
  fee: number;
  status: ReviewStatus;
  adminNote?: string;
  txHash?: string;
  createdAt: number;
  reviewedAt?: number;
}

export interface KycDoc {
  uid: string;
  userEmail: string;
  fullName: string;
  dateOfBirth: string;
  documentType: "passport" | "national_id" | "drivers_license";
  documentNumber: string;
  address: string;
  frontKey: string;
  backKey?: string;
  selfieKey: string;
  status: ReviewStatus;
  adminNote?: string;
  createdAt: number;
  reviewedAt?: number;
}

export type PayoutMode = "daily" | "end";

export type PlanCategory = "investing" | "real_estate";

export interface InvestmentPlanDoc {
  name: string;
  tagline?: string;
  category: PlanCategory;
  location?: string; // real estate only
  imageUrl?: string; // real estate only
  minAmount: number; // USDT
  maxAmount: number; // USDT (0 = unlimited)
  roiPercent: number; // total return over the term, percent of capital
  durationDays: number;
  payout: PayoutMode;
  capitalBack: boolean;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: number;
}

export interface InvestmentDoc {
  uid: string;
  userEmail: string;
  planId: string;
  planName: string;
  category: PlanCategory;
  amount: number; // USDT
  roiPercent: number;
  durationDays: number;
  payout: PayoutMode;
  capitalBack: boolean;
  dailyProfit: number; // USDT, for daily payout plans
  totalProfit: number; // USDT expected over the term
  startAt: number;
  endAt: number;
  settledDays: number;
  paidProfit: number;
  status: "active" | "completed";
  createdAt: number;
}

export interface MiningPlanDoc {
  name: string;
  hashrate: string; // display only, e.g. "50 TH/s"
  algorithm: string; // e.g. "SHA-256"
  minesAsset: MiningAsset; // XAUT or XRP only
  price: number; // USDT
  durationDays: number;
  dailyReturnPercent: number; // percent of price paid per day (USD value)
  maintenanceFeePercent: number;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: number;
}

export interface MiningContractDoc {
  uid: string;
  userEmail: string;
  planId: string;
  planName: string;
  hashrate: string;
  minesAsset: MiningAsset;
  price: number;
  durationDays: number;
  dailyUsd: number; // USD value paid per day after maintenance fee
  startAt: number;
  endAt: number;
  settledDays: number;
  paidUsd: number;
  paidAsset: number;
  status: "active" | "completed";
  createdAt: number;
}

export interface LoanDoc {
  uid: string;
  userEmail: string;
  amount: number; // USDT
  durationMonths: number;
  interestPercent: number; // total interest over the term
  purpose: string;
  totalRepayable: number;
  repaid: number;
  status: "pending" | "approved" | "rejected" | "repaid";
  adminNote?: string;
  createdAt: number;
  reviewedAt?: number;
  dueAt?: number;
}

export interface CardDoc {
  uid: string;
  userEmail: string;
  holderName: string;
  type: "virtual" | "physical";
  currency: "USD";
  balance: number;
  last4: string;
  expMonth: number;
  expYear: number;
  status: "pending" | "active" | "frozen" | "rejected";
  adminNote?: string;
  createdAt: number;
  reviewedAt?: number;
}

export interface NotificationDoc {
  uid: string; // "all" for broadcast
  title: string;
  body: string;
  createdAt: number;
  read?: boolean;
}

export interface TicketDoc {
  uid: string;
  userEmail: string;
  subject: string;
  status: "open" | "answered" | "closed";
  priority: "low" | "normal" | "high";
  createdAt: number;
  updatedAt: number;
  lastMessage?: string;
}

export interface TicketMessageDoc {
  from: "user" | "admin";
  body: string;
  createdAt: number;
}

export interface SettingsDoc {
  depositAddresses: Partial<Record<Asset, { address: string; network: string; memo?: string }>>;
  minDeposit: number; // USD equivalent
  minWithdrawal: number; // USD equivalent
  withdrawalFeePercent: number;
  referralPercent: number; // % of first approved deposit paid to referrer (in USDT)
  loanInterestPercent: number; // total interest charged on approved loans
  maxLoanAmount: number;
  cardIssueFee: number; // USDT
  maintenanceMode: boolean;
  supportEmail: string;
  announcement?: string;
}

export const DEFAULT_SETTINGS: SettingsDoc = {
  depositAddresses: {},
  minDeposit: 10,
  minWithdrawal: 10,
  withdrawalFeePercent: 1,
  referralPercent: 5,
  loanInterestPercent: 8,
  maxLoanAmount: 50000,
  cardIssueFee: 10,
  maintenanceMode: false,
  supportEmail: "support@plutovest.com",
};

export interface PriceInfo {
  usd: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  sparkline: number[];
}
export type PriceMap = Record<Asset, PriceInfo>;

export type WithId<T> = T & { id: string };
