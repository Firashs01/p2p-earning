You are a senior full-stack developer with 10 years of experience. I need you to generate a complete, production-ready web application for personal P2P trading earnings tracking.

**Project Constraints (Critical):**
- Personal use only (max 3 users).
- Deployed exclusively on Vercel (serverless).
- Only trades USDT (Tether) against fiat.
- The math is strictly: 
  Net Profit = (Sum of Sell Quantity * Sell Rate) - (Sum of Buy Quantity * Buy Rate) 
  Platform fees are optional and should be added to BUY costs and subtracted from SELL revenue.

**Tech Stack (Must use exactly these):**
- Next.js 14 (App Router) – use Server Actions for all data mutations (no API routes).
- Vercel Postgres (Neon) – serverless PostgreSQL.
- Drizzle ORM – lightweight, edge-compatible.
- decimal.js – for all financial math (NEVER use JavaScript Number for calculations).
- shadcn/ui – for UI components (Cards, Tables, Forms).
- Tailwind CSS – for styling.
- Authentication: Shared hardcoded password via environment variable and Next.js Middleware (set a cookie after login).

**Database Schema (Only ONE table):**
- Table name: `trades`
- Columns:
  - `id`: serial, primary key
  - `type`: varchar(4) – either 'BUY' or 'SELL'
  - `quantity`: decimal(20,8) – amount of USDT
  - `rate`: decimal(20,4) – price per USDT in your local fiat
  - `fee`: decimal(20,4), default '0' – optional platform/network fee
  - `created_at`: timestamp, default now()

**Features to implement (all in a single dashboard page '/'):**
1. A **summary cards section** displaying:
   - Total Buy Cost (sum of quantity * rate + fee for BUY trades)
   - Total Sell Revenue (sum of quantity * rate - fee for SELL trades)
   - Net Profit (Sell Revenue - Buy Cost)
   - Total trade count
   All numbers must be formatted with 2 decimal places and proper thousands separators.
2. A **form** (at the top or in a dialog) to add a new trade with fields: type (dropdown: BUY/SELL), quantity, rate, fee (optional, default 0).
3. A **table** below listing all trades with columns: ID, Type, Quantity, Rate, Fee, Total (quantity * rate), Created At, and a "Delete" button for each row.
4. **Real-time updates**: After adding or deleting a trade, use `revalidatePath('/')` to instantly refresh the dashboard.

**Authentication Implementation:**
- Use `middleware.ts` that checks for a cookie named `app_auth`.
- If the cookie value matches `process.env.APP_ACCESS_PASSWORD`, allow access to `/`.
- Otherwise, redirect to `/login`.
- The `/login` page should have a simple password field. On submit, set the cookie and redirect to `/`.

**Project Structure (Keep it flat and simple):**
- All database logic, schemas, and server actions in `/db` and `/app/actions.ts`.
- No repositories, DTOs, or complex layers – this is for 3 users.
- Use Drizzle migrations (`drizzle-kit push:pg`) for schema setup.

**Environment Variables Needed:**
- `POSTGRES_URL` (provided by Vercel Postgres)
- `APP_ACCESS_PASSWORD` (shared password, e.g., "MySecureP2P2025")

**Deliverables:**
Please generate the complete codebase including:
1. `package.json` with all dependencies.
2. `drizzle.config.ts` for Drizzle setup.
3. `db/schema.ts` and `db/index.ts`.
4. All Server Actions in `app/actions.ts` (addTrade, deleteTrade, getDashboardData).
5. `app/page.tsx` (the dashboard with cards, form, and table).
6. `app/login/page.tsx` (login page).
7. `middleware.ts` in the project root.
8. `.env.local` example file.

**Important constraints:**
- Use `use server` directives correctly.
- Use `decimal.js` for all calculations inside Server Actions – parse DB decimals into Decimal objects and return formatted strings or numbers.
- The form should be a Server Action form using `<form action={addTrade}>`.
- Keep UI responsive and clean using shadcn/ui components (Card, CardContent, Table, TableHead, TableRow, Button, Input, Select).
- No client-side state management libraries (React Query, Zustand) – keep it native Next.js with Server Actions and revalidation.

Write the full code for all files. Do not skip implementations. Ensure every import path is correct and the project runs immediately after `npm install` and setting up environment variables.