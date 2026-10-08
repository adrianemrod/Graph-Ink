import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, PackageOpen, Plus, ReceiptText, ShoppingCart } from "lucide-react";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pesoCents } from "@/lib/money";
import { getDashboard } from "@/lib/services/reports";
import { formatReceiptNo } from "@/lib/services/sales";
import { formatTime, formatShortDate, manilaDateKey, TIMEZONE } from "@/lib/time";
import { PageContainer } from "@/components/page";
import { PaymentBadge } from "@/components/payment-badge";
import { Card, CardHeader, EmptyState, Row, Stat } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requirePageUser("OWNER");
  const [data, settings] = await Promise.all([getDashboard(), db.storeSettings.findUnique({ where: { id: 1 } })]);
  const today = new Intl.DateTimeFormat("en-PH", { timeZone: TIMEZONE, weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const todayKey = manilaDateKey();
  const m = data.movement;

  return (
    <PageContainer>
      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-slate-500">{today}</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.03em] text-ink-900 sm:text-[32px]">{settings?.storeName ?? "KUYA JE SARISARI STORE"}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pos" className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent-600 px-4 text-sm font-semibold text-white shadow-soft hover:bg-accent-700">
            <ShoppingCart className="size-4" /> Make Sale
          </Link>
          <Link href="/gcash" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold shadow-soft hover:bg-slate-50">
            GCash
          </Link>
          <Link href="/expenses?new=1" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold shadow-soft hover:bg-slate-50">
            <Plus className="size-4" /> Expense
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Today's Sales" value={pesoCents(data.todaySales)} hint="Product sales only" />
        <Stat label="Today's Expenses" value={pesoCents(data.todayExpenses)} />
        <Stat label="Today's Gross Profit" value={pesoCents(data.todayGrossProfit)} tone="accent" hint="Sales minus product cost" />
        <Stat label="GCash Balance" value={pesoCents(data.gcashBalance)} tone="dark" hint="Current wallet" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="min-w-0">
          <CardHeader
            title="Recent Sales"
            description="Latest product transactions"
            action={
              <Link href={`/reports?tab=sales&range=custom&from=${todayKey}&to=${todayKey}`} className="text-[13px] font-semibold text-accent-700 hover:underline">
                View all
              </Link>
            }
          />
          {data.recentSales.length === 0 ? (
            <EmptyState icon={<ReceiptText />} title="No sales yet">
              Sales made in the POS will show here.
            </EmptyState>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {data.recentSales.map((s) => (
                <li key={s.id}>
                  <Link href={`/receipt/${s.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] font-medium text-slate-500">{formatReceiptNo(s.receiptNo)}</span>
                        <PaymentBadge method={s.paymentMethod} />
                      </div>
                      <p className="mt-1 truncate text-sm text-ink-900">{s.itemsLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="num text-[15px] font-semibold">{pesoCents(s.total)}</p>
                      <p className="text-xs text-slate-500">
                        {manilaDateKey(new Date(s.createdAt)) === todayKey ? formatTime(s.createdAt) : formatShortDate(s.createdAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Today's Money Movement" />
            <div className="px-5 pb-4 pt-2">
              <p className="pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Product Sales</p>
              <div className="divide-y divide-line">
                <Row label="Cash Sales" value={pesoCents(m.cashSales)} />
                <Row label="GCash Sales" value={pesoCents(m.gcashSales)} />
              </div>
              <p className="pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">GCash Service</p>
              <div className="divide-y divide-line">
                <Row label={<span className="inline-flex items-center gap-1.5"><ArrowDownLeft className="size-3.5 text-accent-600" />GCash Cash In</span>} value={pesoCents(m.gcashCashIn)} />
                <Row label={<span className="inline-flex items-center gap-1.5"><ArrowUpRight className="size-3.5 text-slate-400" />GCash Cash Out</span>} value={pesoCents(m.gcashCashOut)} />
                <Row label="Service Fees earned" value={pesoCents(m.serviceFees)} />
              </div>
              <p className="pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Spending</p>
              <Row label="Expenses" value={pesoCents(m.expenses)} />
              <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-semibold text-ink-900">Estimated Net Profit</span>
                  <span className={`num text-lg font-semibold ${m.estimatedNetProfit < 0 ? "text-red-600" : "text-accent-700"}`}>{pesoCents(m.estimatedNetProfit)}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">Gross profit + GCash fees − expenses</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Low Stock"
              action={
                <Link href="/inventory?filter=low" className="text-[13px] font-semibold text-accent-700 hover:underline">
                  Restock
                </Link>
              }
            />
            {data.lowStock.length === 0 ? (
              <EmptyState icon={<PackageOpen />} title="All stocked up" />
            ) : (
              <ul className="mt-2 divide-y divide-line px-5 pb-2">
                {data.lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="truncate text-sm text-ink-900">{p.name}</span>
                    <span className={`num shrink-0 text-sm font-semibold ${p.stock <= 0 ? "text-red-600" : "text-amber-600"}`}>
                      {p.stock <= 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
