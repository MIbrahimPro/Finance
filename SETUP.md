# Setup Guide

## Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free tier works)
- A [Resend](https://resend.com) account (free tier — 100 emails/day)

## Step 1: Clone & Install

```bash
git clone <repo-url> finance
cd finance
npm install
```

## Step 2: Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values:

### Auth.js

```bash
# Generate with: npx auth secret
AUTH_SECRET=your-generated-secret-here
AUTH_URL=http://localhost:3000
```

Generate the secret:
```bash
npx auth secret
```

### Magic Link (Resend)

1. Go to [resend.com](https://resend.com) → API Keys → Create API Key
2. Verify a domain (for production) or use Resend's test mode

```bash
AUTH_RESEND_KEY=re_xxxxxxxxxxxx
AUTH_EMAIL_FROM=Finance <noreply@yourdomain.com>
```

### Neon Postgres

1. Go to [neon.tech](https://neon.tech) → Create Project
2. Copy the connection string from "Connect" → "Prisma" / "Connection string"

```bash
DATABASE_URL=postgresql://user:pass@ep-xxxx.us-east-2.aws.neon.tech/financedb?sslmode=require
```

### App URL

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Database Setup

Generate and apply the Drizzle migrations to create the Neon schema:

```bash
npm run db:generate
npm run db:migrate
```

This creates all tables:
- `user`, `account`, `session`, `verificationToken`, `authenticator` (Auth.js)
- `transaction`, `loan`, `dashboardLayout` (app data)

## Step 4: PWA Icons

Replace the SVG placeholder icons in `public/icons/` with proper PNG icons:

- `icon-192x192.png` (192×192, maskable)
- `icon-512x512.png` (512×512, maskable)

You can generate these with tools like:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Maskable.app](https://maskable.app)
- Figma / Canva

## Step 5: Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be prompted to sign in via Magic Link.

## Step 6: PWA Installation

When visiting the app on Android (Chrome) or Linux (Chrome/Edge), you'll see an install prompt in the address bar. On desktop, click the install icon in the URL bar.

## Production Deployment (Vercel)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel Dashboard → Project Settings → Environment Variables
4. Add a `postinstall` script to `package.json`:

```json
"scripts": {
  "postinstall": "npx drizzle-kit push"
}
```

This automatically applies migrations on Vercel deployment.

## Troubleshooting

| Problem | Solution |
|---|---|
| Magic Link not sending | Check Resend API key and verified domain |
| Database connection failed | Verify `DATABASE_URL` is correct and Neon IP allowlist includes Vercel |
| PWA not installable | Ensure HTTPS (or localhost), valid manifest, and icon files exist |
| Sync not working | Check console for `AUTH_SECRET` misconfiguration |
