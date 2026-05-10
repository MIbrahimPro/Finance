# Finance — Local-First Personal Finance PWA

A privacy-first, offline-capable personal finance tracker built with **Next.js**, **Tailwind CSS v4**, **Dexie.js** (IndexedDB), and **Neon** (Serverless Postgres).

## Features

- **Offline-First:** All data stored in IndexedDB via Dexie.js — works without internet
- **Bento Dashboard:** 2×2 customizable grid with drag-and-drop via `@dnd-kit`
- **Net Worth Tracking:** Real-time calculation from income, expenses, loans
- **6-Month Chart:** Interactive AreaChart via `recharts`
- **Burn Rate:** Circular progress indicator (monthly expenses ÷ income)
- **Transaction Ledger:** Virtualized list with quick-add FAB
- **Loan & Debt Engine:** Grouped by entity with "Mark as Settled"
- **Magic Link Auth:** Passwordless login via Resend
- **Cloud Sync:** Push/pull sync with Neon Postgres via Server Actions
- **Multi-Tenant:** All data scoped by `userId` — safe to share with friends
- **PWA:** Installable on desktop & Android

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Local DB | Dexie.js (IndexedDB) |
| Cloud DB | Neon (Serverless Postgres) |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 (next-auth@beta) — Magic Link |
| Charts | Recharts |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Virtual List | @tanstack/react-virtual |
| PWA | Serwist + Manual SW |

## Project Structure

```
src/
├── app/
│   ├── (app)/               # Protected routes (sidebar layout)
│   │   ├── page.tsx         # Dashboard
│   │   ├── transactions/    # Transaction Ledger
│   │   └── loans/           # Loan & Debt Engine
│   ├── (auth)/              # Public routes
│   │   └── login/           # Magic Link sign-in
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   └── sync/            # Pull/Push sync endpoints
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── dashboard/           # Widgets + DraggableGrid
│   ├── layout/              # Sidebar, Header, SyncIndicator
│   ├── loans/               # LoanTabs, EntityGroup, SettleButton
│   └── transactions/        # TransactionRow, List, QuickAddForm
├── hooks/                   # useNetWorth, useSync, useOnlineStatus...
├── lib/
│   ├── auth.ts              # Auth.js config
│   ├── db.ts                # Dexie schema
│   ├── types.ts             # TypeScript types
│   ├── utils.ts             # Currency formatting, net worth calc
│   └── server/              # Neon Drizzle schema + actions
└── middleware.ts            # Route protection
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Apply migrations to Neon
```
