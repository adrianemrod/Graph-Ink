# KUYA JE SARISARI STORE — POS & Store Manager

A simple point-of-sale and store management system for a small Filipino sari-sari store.
It covers five things: **Sales, Inventory, Expenses, GCash, Profit**. Nothing else.

Built with Next.js 16 (App Router, Server Actions), React 19, TypeScript, Tailwind CSS v4,
Prisma 7 + PostgreSQL, and Lucide icons. UI primitives are small shadcn-style components in
`src/components/ui`.

## Run it

Requirements: Node.js 20.9+ and PostgreSQL 14+.

```bash
cd sarisari-pos
npm install                 # also runs `prisma generate`
cp .env.example .env        # then edit DATABASE_URL and AUTH_SECRET
npm run db:deploy           # create the tables (use `npm run db:migrate` while developing)
npm run db:seed             # logins, settings, categories, sample products
npm run dev                 # http://localhost:3000
```

Production:

```bash
npm run build
npm start                   # add `-- -H 0.0.0.0` to use it from a tablet on the same Wi-Fi
```

## Environment variables

| Name | What it is |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@localhost:5432/kuyaje_pos?schema=public` |
| `AUTH_SECRET` | Long random string (16+ characters) used to sign login sessions |

## Development logins

| Role | Username | Password | Access |
| --- | --- | --- | --- |
| Owner | `owner` | `owner123` | Everything |
| Cashier | `cashier` | `cashier123` | POS, sales history, GCash form |

Change both passwords in **Settings → Accounts** before real use.

## Sample data

`npm run db:seed` adds 24 realistic sample products (Coca-Cola 1.5L, Lucky Me Pancit Canton,
Century Tuna, Surf, Safeguard…). They are marked `isSample` and show a **Sample** badge.
Remove them with:

```bash
npm run db:clear-samples    # deletes unsold samples; samples that were already sold are archived
```

The seed never creates fake sales — every number on the dashboard comes from real records.

## How the money works

| Activity | Counts as | Changes |
| --- | --- | --- |
| Product sale (Cash or GCash) | **Sales** | Stock ↓, revenue, cost of goods, gross profit |
| GCash **Cash In** | GCash service | GCash balance **+ amount**; fee is service income |
| GCash **Cash Out** | GCash service | GCash balance **− amount**; fee is service income |
| Expense | Expenses | Reduces estimated net profit |

- **GCash balance** = Starting balance + Cash In − Cash Out + product sales paid by GCash.
  The direction of Cash In / Cash Out lives in one place: `GCASH_BALANCE_DIRECTION` in
  `src/lib/services/gcash.ts`.
- GCash Cash In / Cash Out amounts are **never** counted as sales. Only the service fee is income.
- **Estimated net profit** = Gross profit + GCash service fees − Expenses. A simple estimate, not accounting.

### Accuracy safeguards

- Money is `Decimal(12,2)` in the database and integer centavos in code — no floating-point math.
- A sale (sale, items, stock decrease, inventory movements) is one database transaction. If any
  part fails — for example not enough stock — nothing is saved.
- Stock can't go below zero, even with two cashiers selling the last item at the same time.
- Each checkout and GCash entry carries a one-time request id, so double clicks or a retry after a
  dropped connection can't create duplicates.
- Every stock change (sale, stock added, damaged/expired/lost, manual correction) is recorded.
- Products with sales history can't be deleted, only archived.
- All dates and "today / this week / this month" use Asia/Manila time. Weeks start on Monday.

## Tests

```bash
# Runs the store's final test scenario against a real database and checks every number:
# sale of 2 × Coca-Cola (₱170, change ₱30, stock 20 → 18, profit ₱40), GCash Cash In ₱1,000 + ₱10,
# Cash Out ₱500 + ₱5, expense ₱300, plus double-click and rollback checks.
DATABASE_URL="postgresql://…/kuyaje_pos_test" npm run test:scenario
```

It adds records, so point it at a separate test database (run `db:deploy` and `db:seed` on it first).

```bash
npm run typecheck && npm run lint && npm run build
```

## Project map

```
prisma/schema.prisma        database tables
prisma/seed.ts              logins, settings, categories, sample products
src/lib/services/           business logic (sales, gcash, inventory, expenses, reports)
src/actions/                server actions — check login and role, then call services
src/app/(app)/              dashboard, pos, products, inventory, expenses, gcash, reports, settings
src/app/receipt/[id]        printable 80mm thermal receipt (product sales only)
src/proxy.ts                sends signed-out visitors to /login
```
