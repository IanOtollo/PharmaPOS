# PharmaPOS — Favil Chemist & Pharmacy

A point-of-sale system built for Favil Chemist & Pharmacy: fast checkout, drug inventory with expiry tracking, suppliers and purchase orders, customer records, sales reporting, and role-based staff access — all in a dark-mode-first, mobile-friendly interface.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Convex** — realtime database and backend functions
- **Tailwind CSS 4** — no component library; everything is hand-built
- Fonts: Playfair Display (display), DM Sans (body/UI), DM Mono (numbers/currency)

## Features

- **POS** — search/scan products, cart, checkout with cash / M-Pesa / card, discounts, change calculation, printable receipts
- **Products** — catalog with category, pricing, stock levels, expiry, batch numbers, prescription flag
- **Inventory** — stock levels, low-stock and expiry alerts, manual stock adjustments (restock/damage/return/correction)
- **Suppliers & Purchases** — supplier directory, purchase orders that restock and update cost price, returns-to-supplier with a required reason
- **Customers** — auto-created from checkout, purchase history, credit balances
- **Sales history** — searchable, filterable, void with reason, CSV export
- **Reports** — revenue trend, category/payment/staff/customer/supplier breakdowns, gross profit & margin, inventory valuation
- **Dashboard** — daily summary, revenue chart, recent transactions, low-stock/expiry shortcuts
- **Settings** — pharmacy name, VAT rate, admin passcode, staff & roles, categories, audit log
- **Auth & roles** — PIN-based login (no accounts/passwords). One shared admin passcode has full access; individual staff PINs map to one of four roles with distinct access:
  | Role | Access |
  |---|---|
  | Manager | POS, Sales, Inventory, Reports, Dashboard |
  | Cashier | POS, Sales |
  | Inventory Officer | Products, Inventory, Purchases, Dashboard |
  | Supervisor | Dashboard, Sales, Reports |
- **Audit log** — tracks logins, product/staff/settings changes, sale voids, purchases, and returns
- **Light/dark theme toggle**, persisted per browser

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Convex

This project uses [Convex](https://www.convex.dev) for its backend. You'll need your own Convex project:

```bash
npx convex dev
```

This will prompt you to log in and create (or link) a Convex project, then write your deployment's URL into `.env.local` automatically and push the schema/functions in `convex/`.

Copy `.env.example` for the shape of the required variables if you're wiring things up manually:

```bash
cp .env.example .env.local
```

`.env.local` is git-ignored — never commit it.

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/auth`.

### First login

A default admin passcode is baked in as a fallback (see `convex/settings.ts`) so you can get in on a fresh database. **Change it immediately** from Settings → General once you're in — the current passcode must be confirmed before a new one is accepted. Add real staff members and assign roles from Settings → Staff; each staff PIN must be unique and can't match the admin passcode (the backend rejects collisions).

## Project structure

```
convex/            Backend: schema + queries/mutations, one file per domain
src/
  app/              Routes (App Router) — one folder per page
  components/
    ui/             Generic primitives (Button, Input, Modal, Dropdown, ...)
    layout/         TopNav, BottomNav, PageHeader
    auth/           AppGate — session + role-based route enforcement
    pos/ products/ inventory/ sales/ reports/ settings/
                    Feature-specific components
  lib/              utils.ts (formatting helpers), auth.ts (roles), constants.ts
```

## Deployment

Deployed on [Vercel](https://vercel.com). To deploy your own instance:

1. Push this repo to GitHub and import it into Vercel.
2. Set the environment variables from `.env.example` in the Vercel project settings, pointing at your own Convex deployment.
3. Deploy. No custom build configuration is needed.

For a production Convex deployment (separate from your dev database), run `npx convex deploy --prod` and use its URL instead.

## Notes

- No seed/demo data — the catalog starts empty and is meant to be populated with real inventory.
- No third-party payment integration; payment methods are recorded, not processed.
- No barcode scanner hardware integration — barcodes are matched by manual entry/search.
