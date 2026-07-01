# P2P Trading Earning Tracker

A high-precision, premium peer-to-peer (P2P) trading ledger and dashboard designed to track USDT transactions and calculate earnings over time in Tunisian Dinars (TND).

---

## 🚀 Key Features

*   **Frontend-Only JSON Architecture**: High-speed runtime filesystem queries and updates reading and writing from a local `db/data.json` file. Zero external database dependencies (e.g., PostgreSQL or Vercel Postgres) are required.
*   **Automatic Monthly Revenue Archiving**: Continuous, automated calendar month monitoring. When a new month begins, the system automatically packages the completed month's active trades, computes total monthly profits, commits it to the archive, and resets the active ledger—without requiring any administrator action.
*   **Daily Earnings Tracking**: Real-time evaluation of today's purchased USDT inventory value calculated using the latest exit (selling) exchange rate.
*   **Intuitive Fintech UI**: A dark-themed, premium design utilizing card metrics, custom Tailwind CSS bar charts, interactive tables, and a responsive transaction entry form.
*   **Password Authentication**: Gatekept access powered by robust cookies-based middleware using a secure system password.

---

## 🧮 Calculations & Formulas

### 1. Active Period Profit Equation
Calculated dynamically across the active calendar period using the weighted average method for realized gains:
$$\text{Profit (TND)} = \text{USDT Sold} \times (\text{Average Sell Rate} - \text{Average Buy Rate})$$

Where:
*   **Average Buy Rate** $= \frac{\text{Total Buy Cost} + \text{Fees}}{\text{Total Buy Quantity}}$
*   **Average Sell Rate** $= \frac{\text{Total Sell Revenue} - \text{Fees}}{\text{Total Sell Quantity}}$

### 2. Daily Earnings Equation
Tracks the unrealized or realized profit built into today's purchased volume against the latest system sell rate:
$$\text{Daily Earnings} = (\text{Total USDT Purchased Today} \times \text{Latest Sell Rate}) - \text{Total Purchase Cost Today}$$

Where:
*   **Latest Sell Rate** is the exchange rate of the newest `SELL` trade logged in the system.
*   **Total Purchase Cost Today** $= \sum (\text{Quantity Purchased Today} \times \text{Purchase Exchange Rate})$.

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
*   **Decimals**: [Decimal.js](https://mikemcl.github.io/decimal.js/) (ensuring float precision for financial data)
*   **Storage**: Local JSON database (`db/data.json`)
*   **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Structure

```
├── app/
│   ├── actions.ts       # Server Actions (JSON CRUD, checkAndArchive, calculations)
│   ├── globals.css      # Core styles
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main dashboard page
│   └── login/           # Auth login screen page
├── components/
│   └── ui/              # shadcn UI components (Card, Button, Table, Input, Select)
├── db/
│   └── data.json        # Unified persistent JSON database store
├── lib/
│   └── utils.ts         # Utility class merger (cn)
├── middleware.ts        # Access control middleware
└── package.json         # Scripts and project dependencies
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed.

### 2. Environment Variables
Create a `.env.local` file at the root of the project:
```env
APP_ACCESS_PASSWORD="YourSecurePasswordGoesHere"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser. Enter your password configured in `.env.local` to access the trading ledger.

---

## 📈 Auto-Archive Testing

To verify the automatic monthly rollover in a development environment:
1. Open `db/data.json`.
2. Insert a mock trade under `trades` with a `createdAt` timestamp from a previous calendar month:
   ```json
   {
     "id": 99,
     "type": "BUY",
     "quantity": "100.00000000",
     "rate": "3.1000",
     "fee": "0.0000",
     "createdAt": "2026-06-15T12:00:00.000Z"
   }
   ```
3. Refresh the browser.
4. The system will detect the past trade, compute June's profit, append it to `archive` (rendering it in both the history table and bar chart), reset the active ledger, and save the updated state back to `db/data.json`.
