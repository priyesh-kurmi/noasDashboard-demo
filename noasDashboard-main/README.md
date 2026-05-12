# Noa's Café Analytics Dashboard

A multi-site café analytics platform built with Next.js 15, TypeScript, Tailwind CSS, and MongoDB. Designed for Noa's Café to track sales, purchasing, and operational performance across all sites.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (`noas_dashboard` database)
- **Authentication**: JWT with 3-day HTTP-only cookie sessions
- **Deployment**: Vercel-ready

## Features

### Sales & Analytics
- **Sales & Orders** — Total revenue, order count, AOV, week-on-week changes. Per-site filter with revenue table.
- **Revenue Breakdown** — Revenue by payment method and period. Per-site view with ranked bar chart.
- **Peak Hours Analysis** — Hourly demand heatmap with real-time data detection and site filter. Shows warning banner when raw timestamps are unavailable.
- **Trends & Patterns** — Monthly revenue trends, seasonal analysis, weekly patterns, and product category insights (Coffee, Tea, Bakery, etc.).

### Store Insights
- **Store Performance** — All-store ranked view with date range filter. Best-selling category per site.
- **Store Comparison** — Head-to-head comparison of any two sites with best-selling category.
- **Efficiency Metrics** — Performance scoring (Revenue 40% + Transactions 30% + Consistency 30%), sales summary, and a **Spend per Site** tab showing Booker purchasing costs.

### Purchasing
- **Purchasing** — Full Booker supplier spend analysis: total spend, spend by site, spend by category (Coffee, Tea, Hot Chocolate, Packaging, etc.), and monthly spend trends.

### Data Management
- **Upload Data** — Upload TakePayments or Booker CSV/XLSX exports. Data is parsed and stored in MongoDB.
- **Secure Authentication** — Single-user login, 3-day sessions.

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- MongoDB database (Atlas or local)

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

Edit `.env.local`:

```env
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
```

3. **Start the development server:**

```bash
npm run dev
```

4. **Open the dashboard:**

[http://localhost:3000](http://localhost:3000)

**Login credentials:**

- **Email:** `kpriyesh1908@gmail.com`
- **Password:** `12345678`

To change credentials, edit `lib/auth.ts`.

## Uploading Data

Navigate to **Upload Data** in the sidebar and upload your CSV exports.

### TakePayments CSV Format

TakePayments exports (from the TakePayments portal) are automatically detected. The expected columns are:

| Column | Description |
|---|---|
| `Date` | Transaction date & time (`DD/MM/YYYY HH:mm`) |
| `Sale Total` | Total transaction value |
| `Item Subtotal (gross)` | Subtotal before modifiers |
| `Payment Method` | Card type (Visa Debit, Mastercard, etc.) |
| `Note` | Customer/order note (often empty) |
| `Cashier Name` | Staff member name |
| `Device ID` | Terminal ID used to identify the site |

> **Note:** TakePayments exports do not include individual product/item names. Product categories (Coffee, Tea, Bakery, etc.) are assigned based on the `Note` field. Most transactions will appear as "Other" if the note is empty.

### Booker CSV Format

Booker purchasing exports are stored with `platform: 'booker'`. Booker transactions represent supply costs (not sales revenue). The expected columns include `Date`, `Amount`/`Total`, `Description`, and `Store Name`.

## Project Structure

```
noasDashboard/
├── app/
│   ├── api/
│   │   ├── analytics/
│   │   │   ├── sales-performance/   # Sales & orders with per-site view
│   │   │   ├── revenue/             # Revenue breakdown with per-site view
│   │   │   ├── time-demand/         # Hourly demand with real-time detection
│   │   │   ├── trends/              # Monthly trends + product categories
│   │   │   ├── site-comparison/     # Store performance with date filter
│   │   │   ├── sales/               # Sales summary with best-seller per store
│   │   │   ├── performance/         # Efficiency metrics + spend per site
│   │   │   └── purchasing/          # Booker spend by site and category
│   │   ├── auth/                    # Login / logout
│   │   ├── upload/                  # File upload and parsing
│   │   └── stats/                   # Quick stats
│   ├── components/
│   │   ├── DashboardLayout.tsx      # Sidebar navigation
│   │   └── ui.tsx                   # Shared UI components
│   ├── purchasing/                  # NEW: Purchasing page
│   ├── performance/                 # Efficiency Metrics page
│   ├── site-comparison/             # Store Performance page
│   ├── comparison/                  # Store Comparison page
│   ├── trends/                      # Trends & Patterns page
│   ├── time-demand/                 # Peak Hours page
│   ├── revenue/                     # Revenue Breakdown page
│   ├── sales-performance/           # Sales & Orders page
│   ├── upload/                      # Upload Data page
│   ├── login/                       # Login page
│   ├── layout.tsx
│   ├── page.tsx                     # Dashboard home
│   └── globals.css
├── lib/
│   ├── auth.ts                      # JWT auth helpers
│   ├── db.ts                        # Collection names
│   └── mongodb.ts                   # MongoDB client
├── middleware.ts                    # Route protection
└── .env.local                       # Environment variables
```

## MongoDB Collections

Database: `noas_dashboard`

| Collection | Contents |
|---|---|
| `TRANSACTIONS` | All parsed transactions from TakePayments and Booker. Key fields: `transactionId`, `date`, `amount`, `platform` (`takemypayments` or `booker`), `storeName`, `productType`, `cardType`, `cardScheme`, `description` |
| `UPLOADS` | Upload history and status |
| `USERS` | User accounts |
| `STORES` | Store/site configuration |

### Distinguishing Sales vs Purchasing

All transactions share one collection. Use the `platform` field to separate them:

- `platform: 'takemypayments'` → **Sales revenue** (TakePayments terminal transactions)
- `platform: 'booker'` → **Purchasing/supply costs** (Booker orders)

### TakePayments Sites
Bath Road · Bracknell · London (3) · London (4) · Stockley Park

### Booker Sites
Cannon Street · Bath Road · Bracknell · Bishopsgate · Stockley Park · Waterside · GX · Marlow

## Performance Score Methodology

Scores are calculated per sales site on a 0–100 scale:

| Component | Weight | Method |
|---|---|---|
| Revenue | 40% | Site revenue as % of top-earning store |
| Transactions | 30% | Order count as % of highest-volume store |
| Consistency | 30% | Low variance in transaction values = high score |

Scale: ≥80 = Excellent · ≥60 = Good · ≥40 = Fair · <40 = Needs Attention

## Deployment

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables: `MONGODB_URI`, `JWT_SECRET`
4. Deploy

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint
```

## Security Notes

- All routes except `/login` are protected by JWT middleware
- JWT tokens are HTTP-only cookies (not accessible via JavaScript)
- Session expires after 3 days
- Credentials are hardcoded for single-user access — edit `lib/auth.ts` to change them

## Contact

kpriyesh1908@gmail.com

