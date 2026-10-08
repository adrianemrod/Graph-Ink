import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Boxes, ReceiptText } from "lucide-react";
import { requirePageUser } from "@/lib/auth";
import { pesoCents } from "@/lib/money";
import { getExpenseSummary, getGcashSummary, getInventorySummary, getProfitSummary, getSalesSummary, listSales } from "@/lib/services/reports";
import { formatReceiptNo } from "@/lib/services/sales";
import { formatShortDate, formatTime, resolveRange, type DateRange } from "@/lib/time";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/page";
import { PaymentBadge } from "@/components/payment-badge";
import { RangeFilter } from "@/components/range-filter";
import { StockBadge } from "@/components/stock-badge";
import { Card, CardHeader, EmptyState, PageHeader, Row, Stat } from "@/components/ui/card";

export const metadata: Metadata = { title: "Reports" };

const TABS = [
  { v: "sales", label: "Sales" },
  { v: "expenses", label: "Expenses" },
  { v: "gcash", label: "GCash" },
  { v: "inventory", label: "Inventory" },
  { v: "profit", label: "Profit Summary" },
] as const;
type Tab = (typeof TABS)[number]["v"];

export default async function ReportsPage(props: PageProps<"/reports">) {
  await requirePageUser("OWNER");
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const tab: Tab = (TABS.find((t) => t.v === one(sp.tab))?.v ?? "sales") as Tab;
  const range = resolveRange({ preset: one(sp.range), from: one(sp.from), to: one(sp.to) });
  const rangeQs = new URLSearchParams(Object.entries({ range: range.preset, ...(range.preset === "custom" ? { from: range.fromKey, to: range.toKey } : {}) })).toString();

  return (
    <PageContainer>
      <PageHeader title="Reports" description={tab === "inventory" ? "Current stock" : range.label} />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
          {TABS.map((t) => (
            <Link
              key={t.v}
              href={`/reports?tab=${t.v}&${rangeQs}`}
              scroll={false}
              className={cn(
                "h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold leading-9 transition",
                tab === t.v ? "bg-ink-900 text-white" : "text-slate-500 hover:bg-white hover:text-ink-900",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
        {tab !== "inventory" ? <RangeFilter key={tab} preset={range.preset} fromKey={range.fromKey} toKey={range.toKey} /> : null}
      </div>

      {tab === "sales" && <SalesReport range={range} />}
      {tab === "expenses" && <ExpenseReport range={range} />}
      {tab === "gcash" && <GcashReport range={range} />}
      {tab === "inventory" && <InventoryReport />}
      {tab === "profit" && <ProfitReport range={range} />}
    </PageContainer>
  );
}

async function SalesReport({ range }: { range: DateRange }) {
  const [s, sales] = await Promise.all([getSalesSummary(range), listSales(range, 500)]);
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <Stat label="Total Sales" value={pesoCents(s.totalSales)} hint={`${s.transactions} transactions`} className="col-span-2 lg:col-span-1" />
        <Stat label="Cash Sales" value={pesoCents(s.cashSales)} />
        <Stat label="GCash Sales" value={pesoCents(s.gcashSales)} />
        <Stat label="Cost of Goods" value={pesoCents(s.costOfGoods)} />
        <Stat label="Gross Profit" value={pesoCents(s.grossProfit)} tone="accent" />
      </div>
      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Transactions" description={s.discounts > 0 ? `Includes ${pesoCents(s.discounts)} in discounts` : undefined} />
        {sales.length === 0 ? (
          <EmptyState icon={<ReceiptText />} title="No sales in this period" />
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-y border-line bg-slate-50/60 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <th className="px-5 py-2.5">Receipt</th>
                  <th className="px-3 py-2.5">Date &amp; Time</th>
                  <th className="px-3 py-2.5">Items</th>
                  <th className="px-3 py-2.5">Payment</th>
                  <th className="px-3 py-2.5 text-right">Total</th>
                  <th className="px-5 py-2.5 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sales.map((x) => (
                  <tr key={x.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <Link href={`/receipt/${x.id}`} className="font-mono text-[12px] font-medium text-accent-700 hover:underline">
                        {formatReceiptNo(x.receiptNo)}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                      {formatShortDate(x.createdAt)} · {formatTime(x.createdAt)}
                    </td>
                    <td className="max-w-[280px] truncate px-3 py-3">{x.itemsLabel}</td>
                    <td className="px-3 py-3">
                      <PaymentBadge method={x.paymentMethod} />
                    </td>
                    <td className="num px-3 py-3 text-right font-semibold">{pesoCents(x.total)}</td>
                    <td className="num px-5 py-3 text-right text-accent-700">{pesoCents(x.grossProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

async function ExpenseReport({ range }: { range: DateRange }) {
  const e = await getExpenseSummary(range);
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Stat label="Total Expenses" value={pesoCents(e.total)} className="self-start" />
      <Card>
        <CardHeader title="By Category" />
        {e.byCategory.length === 0 ? (
          <EmptyState icon={<ReceiptText />} title="No expenses in this period" />
        ) : (
          <div className="px-5 pb-3 pt-2">
            {e.byCategory.map((c) => (
              <div key={c.category} className="border-b border-line py-3 last:border-0">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium">
                    {c.category} <span className="text-xs font-normal text-slate-400">· {c.count}</span>
                  </span>
                  <span className="num text-sm font-semibold">{pesoCents(c.amount)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-ink-800" style={{ width: `${e.total ? Math.max(2, (c.amount / e.total) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

async function GcashReport({ range }: { range: DateRange }) {
  const g = await getGcashSummary(range);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader title="GCash Balance" description="Money movement in the store's GCash wallet" />
        <div className="px-5 pb-5 pt-3">
          <Row label="Opening GCash Balance" value={pesoCents(g.openingBalance)} strong />
          <div className="divide-y divide-line border-y border-line">
            <Row label={`Cash In (${g.cashInCount})`} value={pesoCents(g.cashIn)} sign="+" />
            <Row label={`Cash Out (${g.cashOutCount})`} value={pesoCents(g.cashOut)} sign="−" />
            {g.gcashProductSales > 0 ? <Row label="Product sales paid by GCash" value={pesoCents(g.gcashProductSales)} sign="+" /> : null}
          </div>
          <div className="mt-2 flex items-baseline justify-between rounded-xl bg-ink-900 px-4 py-3.5 text-white">
            <span className="text-sm font-semibold">Closing GCash Balance</span>
            <span className="num text-xl font-semibold">{pesoCents(g.closingBalance)}</span>
          </div>
        </div>
      </Card>
      <Stat label="Service Fees (Income)" value={pesoCents(g.serviceFees)} tone="accent" hint="Only the fee is store income — not the Cash In / Cash Out amounts." className="self-start" />
    </div>
  );
}

async function InventoryReport() {
  const inv = await getInventorySummary();
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Total Products" value={inv.totalProducts} />
        <Stat label="Low Stock" value={inv.lowStock} />
        <Stat label="Out of Stock" value={inv.outOfStock} />
        <Stat label="Estimated Inventory Cost" value={pesoCents(inv.inventoryCost)} tone="dark" />
      </div>
      <Card className="mt-6 overflow-hidden">
        {inv.rows.length === 0 ? (
          <EmptyState icon={<Boxes />} title="No products" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3 text-right">Stock</th>
                  <th className="px-3 py-3 text-right">Cost</th>
                  <th className="px-3 py-3 text-right">Stock Value (cost)</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {inv.rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 font-medium">{r.name}</td>
                    <td className="px-3 py-3 text-slate-600">{r.category}</td>
                    <td className="num px-3 py-3 text-right font-semibold">{r.stock}</td>
                    <td className="num px-3 py-3 text-right text-slate-600">{pesoCents(r.costPrice)}</td>
                    <td className="num px-3 py-3 text-right">{pesoCents(r.stockCost)}</td>
                    <td className="px-5 py-3">
                      <StockBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

async function ProfitReport({ range }: { range: DateRange }) {
  const p = await getProfitSummary(range);
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader title="Profit Summary" description={range.label} action={<BarChart3 className="size-5 text-slate-300" />} />
      <div className="px-5 pb-6 pt-3">
        <Row label="Product Sales" value={pesoCents(p.productSales)} />
        <Row label="Cost of Products Sold" value={pesoCents(p.costOfGoods)} sign="−" className="border-b border-line" />
        <Row label="Gross Profit" value={pesoCents(p.grossProfit)} strong />
        <Row label="GCash Service Fees" value={pesoCents(p.gcashFees)} sign="+" className="mt-3" />
        <Row label="Store Expenses" value={pesoCents(p.expenses)} sign="−" className="border-b border-line" />
        <div className={cn("mt-4 rounded-2xl px-5 py-4", p.estimatedNetProfit < 0 ? "bg-red-50" : "bg-accent-50")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Estimated Net Profit</p>
          <p className={cn("num mt-1 text-[32px] font-semibold tracking-[-0.03em]", p.estimatedNetProfit < 0 ? "text-red-600" : "text-accent-700")}>{pesoCents(p.estimatedNetProfit)}</p>
        </div>
        <p className="mt-3 text-xs text-slate-500">A simple business estimate — not formal accounting.</p>
      </div>
    </Card>
  );
}
