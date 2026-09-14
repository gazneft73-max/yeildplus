# PlutoVest setup guide

PlutoVest is a single Next.js 16 application. The public site, the member dashboard (`/dashboard`) and the hidden admin portal (`/admin`) all run on one domain.

## 1. Firebase

1. Create a Firebase project. Enable **Authentication → Email/Password** and **Firestore** (production mode).
2. Project settings → *Your apps* → add a Web app. Copy the config values into `NEXT_PUBLIC_FIREBASE_*` in `.env.local`.
3. Project settings → *Service accounts* → **Generate new private key**. Paste the JSON as one line into `FIREBASE_SERVICE_ACCOUNT` (base64 of the file also works).
4. Deploy the security rules and indexes (all data access goes through the server, so the database is closed to clients):
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use <project-id>
   firebase deploy --only firestore
   ```
   If you skip the index deploy, Firestore prints a one-click "create index" link in the server log the first time each query runs.

## 2. Cloudflare R2 (KYC documents and deposit proofs)

1. Cloudflare dashboard → **R2** → create bucket `plutovest-private` (keep it private).
2. **Manage R2 API tokens** → create a token with *Object Read & Write* on that bucket. Copy the Account ID, Access Key ID and Secret Access Key into `.env.local`.
3. On the bucket → **Settings → CORS policy**, add:
   ```json
   [{ "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"], "AllowedMethods": ["PUT"], "AllowedHeaders": ["content-type"], "MaxAgeSeconds": 3600 }]
   ```
   Uploads use short-lived presigned URLs; nothing in the bucket is ever public.

## 3. Admin access

The admin portal at `/admin` is never linked from the site. It returns the normal 404 page unless the signed-in user is an admin. Two ways to grant it:

- Set `ADMIN_EMAIL=you@example.com` (comma-separate for several). The account must also exist as a normal registered member.
- Or run `npm run set-admin -- you@example.com` to add a permanent `admin` custom claim.

Sign in at `/login` as that user, then type `/admin` in the address bar.

## 4. Run locally

```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

## 5. Deploy to Vercel

1. Import the GitHub repository in Vercel. Framework preset: Next.js. No build settings need changing.
2. Add every variable from `.env.example` in **Settings → Environment Variables**. Set `NEXT_PUBLIC_SITE_URL` to the production URL and pick a long random `CRON_SECRET`.
3. `vercel.json` schedules `GET /api/cron/settle` every six hours. Vercel sends the `Authorization: Bearer <CRON_SECRET>` header automatically when `CRON_SECRET` is set as an environment variable. Earnings also settle whenever a member opens the dashboard, so the cron is a safety net for inactive accounts.
4. Point your domain at Vercel (Cloudflare DNS: CNAME to `cname.vercel-dns.com`, proxy off or "DNS only").

## 6. First-run checklist (in `/admin`)

1. **Settings** → paste your deposit wallet addresses per asset and set limits and fees.
2. **Plans** → create investment plans, real-estate packages and mining contracts (mining pays out in XAUT or XRP only).
3. Register a test member, deposit, approve it in **Deposits**, buy a plan, and press **Settle earnings now** on the overview after 24 hours to see profit land.

## Data model (Firestore collections)

`users`, `transactions` (immutable ledger), `deposits`, `withdrawals`, `kyc`, `investmentPlans`, `investments`, `miningPlans`, `miningContracts`, `loans`, `cards`, `tickets/{id}/messages`, `notifications`, `settings/general`.

Every balance change is applied inside a Firestore transaction and writes a matching ledger row, so balances can always be reconciled from `transactions`.
