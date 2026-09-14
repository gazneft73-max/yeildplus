# PlutoVest

Investment, cloud-mining and tokenised real-estate platform. Public site, member dashboard and a hidden admin portal in one Next.js app.

- **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion, Recharts, Firebase Auth + Firestore (Admin SDK on the server), Cloudflare R2 for private files, Vercel hosting.
- **Products:** fixed-term investment plans (daily or maturity payout), cloud mining contracts paying in XAUT / XRP, real-estate packages, cards, loans, referrals, KYC, support tickets, academy and insights.
- **Admin:** `/admin` on the same domain, unlinked, 404 for anyone but the configured admin.

See [docs/SETUP.md](docs/SETUP.md) for configuration and deployment.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm run set-admin -- <email>`.
