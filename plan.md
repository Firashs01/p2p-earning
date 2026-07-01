# Plan - P2P Trading Earnings Tracking App

## Project Overview
A personal P2P trading earnings tracking web application built with Next.js 14 (App Router), Vercel Postgres, Drizzle ORM, and shadcn/ui. Tracks USDT/fiat trades and calculates net profit.

## Tech Stack
- Next.js 14 (App Router) with Server Actions
- Vercel Postgres (Neon) - serverless PostgreSQL
- Drizzle ORM (edge-compatible)
- decimal.js (for all financial math)
- shadcn/ui + Tailwind CSS
- Authentication via hardcoded password + Middleware cookie

## Formula
```
Net Profit = (Sum of Sell Quantity * Sell Rate - Sell Fees) - (Sum of Buy Quantity * Buy Rate + Buy Fees)
```

---

## Task 1: Project Initialization & Configuration

**Goal:** Set up the project skeleton with all dependencies and config files.

**Deliverables:**
- `package.json` - dependencies (next, drizzle-orm, decimal.js, shadcn/ui deps, tailwind, etc.)
- `next.config.mjs` - Next.js config
- `tsconfig.json` - TypeScript config with path aliases (@/*)
- `tailwind.config.ts` - Tailwind config
- `postcss.config.mjs` - PostCSS config
- `drizzle.config.ts` - Drizzle Kit config for PostgreSQL
- `.env.local` - environment variables (POSTGRES_URL, APP_ACCESS_PASSWORD)
- `.env.example` - example env file
- `.gitignore`
- `components.json` - shadcn/ui config
- `app/globals.css` - Tailwind directives + shadcn theme variables

**Verification:**
- `npm install` runs without errors
- Project structure is correct

---

## Task 2: Database Layer & Server Actions

**Goal:** Create the database schema, connection, and all server actions with decimal.js math.

**Deliverables:**
- `db/schema.ts` - Drizzle schema for `trades` table:
  - `id` (serial, PK)
  - `type` (varchar(4), 'BUY' | 'SELL')
  - `quantity` (decimal(20,8))
  - `rate` (decimal(20,4))
  - `fee` (decimal(20,4), default '0')
  - `created_at` (timestamp, default now())
- `db/index.ts` - Drizzle connection using `POSTGRES_URL`
- `app/actions.ts` - Server Actions:
  - `addTrade(formData)` - insert a new trade, then `revalidatePath('/')`
  - `deleteTrade(id)` - delete a trade by ID, then `revalidatePath('/')`
  - `getDashboardData()` - fetch all trades, compute totals using `decimal.js`:
    - Total Buy Cost = sum(quantity * rate + fee) for BUY
    - Total Sell Revenue = sum(quantity * rate - fee) for SELL
    - Net Profit = Sell Revenue - Buy Cost
    - Total trade count
    - Return formatted strings with 2 decimals + thousands separators

**Verification:**
- All imports resolve correctly
- decimal.js is used for every calculation
- `revalidatePath('/')` is called after mutations

---

## Task 3: Authentication

**Goal:** Implement shared password authentication using Middleware and a login page.

**Deliverables:**
- `middleware.ts` (project root):
  - Check for cookie `app_auth`
  - If cookie value === `process.env.APP_ACCESS_PASSWORD` -> allow access to `/`
  - Otherwise redirect to `/login`
- `app/login/page.tsx`:
  - Simple password input form
  - On submit (Server Action), set cookie `app_auth` = password value
  - Redirect to `/`
- Login server action (can live in `app/login/actions.ts` or inline)

**Verification:**
- Unauthenticated users are redirected to `/login`
- After login, user can access `/`
- Cookie is set correctly

---

## Task 4: Dashboard UI

**Goal:** Build the single dashboard page with summary cards, trade form, and trades table.

**Deliverables:**
- `app/layout.tsx` - root layout with global styles
- `app/page.tsx` - dashboard page (Server Component):
  - Calls `getDashboardData()` server action
  - **Summary Cards Section** (shadcn Card):
    - Total Buy Cost
    - Total Sell Revenue
    - Net Profit
    - Total Trade Count
    - All formatted with 2 decimals + thousands separators
  - **Add Trade Form** (using `<form action={addTrade}>`):
    - Type dropdown (BUY / SELL) - shadcn Select
    - Quantity input - shadcn Input
    - Rate input - shadcn Input
    - Fee input (optional, default 0) - shadcn Input
    - Submit button - shadcn Button
  - **Trades Table** (shadcn Table):
    - Columns: ID, Type, Quantity, Rate, Fee, Total (quantity * rate), Created At, Delete button
    - Delete button uses `deleteTrade` server action
- shadcn/ui components needed:
  - `components/ui/card.tsx`
  - `components/ui/table.tsx`
  - `components/ui/button.tsx`
  - `components/ui/input.tsx`
  - `components/ui/select.tsx`

**Verification:**
- Dashboard renders with real data
- Adding a trade refreshes the page instantly (revalidatePath)
- Deleting a trade refreshes the page instantly
- All numbers are formatted correctly

---

## File Structure (Final)
```
p2p-app/
├── app/
│   ├── actions.ts          # Server Actions (Task 2)
│   ├── globals.css         # Task 1
│   ├── layout.tsx          # Task 4
│   ├── login/
│   │   └── page.tsx        # Task 3
│   └── page.tsx            # Dashboard (Task 4)
├── components/
│   └── ui/                 # shadcn components (Task 4)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── table.tsx
├── db/
│   ├── index.ts            # DB connection (Task 2)
│   └── schema.ts           # Drizzle schema (Task 2)
├── middleware.ts           # Auth middleware (Task 3)
├── .env.local              # Env vars (Task 1)
├── .env.example            # (Task 1)
├── .gitignore              # (Task 1)
├── components.json         # shadcn config (Task 1)
├── drizzle.config.ts       # Drizzle config (Task 1)
├── next.config.mjs         # (Task 1)
├── package.json            # (Task 1)
├── postcss.config.mjs      # (Task 1)
├── tailwind.config.ts      # (Task 1)
└── tsconfig.json           # (Task 1)
```

## Execution Order
Task 1 -> Task 2 -> Task 3 -> Task 4
