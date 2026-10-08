import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { requirePageUser } from "@/lib/auth";
import { pesoCents } from "@/lib/money";
import { getSalesSummary, listSales } from "@/lib/services/reports";
import { formatReceiptNo } from "@/lib/services/sales";
import { formatShortDate, formatTime, resolveRange } from "@/lib/time";
import { PageContainer } from "@/components/page";
import { PaymentBadge } from "@/components/payment-badge";
import { RangeFilter } from "@/components/range-filter";
import { Card, EmptyState, PageHeader, Stat } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sales history" };

export default async function SalesHistoryPage(props: PageProps<"/pos/history">) {
  await requirePageUser();
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const range = resolveRange({ preset: one(sp.range), from: one(sp.from), to: one(sp.to) });
  const [summary, sales] = await Promise.all([getSalesSummary(range), listSales(range)]);

  return (
    <PageContainer>
      <Link href="/pos" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-ink-900">
        <ArrowLeft className="size-4" /> Back to POS
      </Link>
      <PageHeader title="Sales History" description={range.label} actions={<RangeFilter preset={range.preset} fromKey={range.fromKey} toKey={range.toKey} />} />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total Sales" value={pesoCents(summary.totalSales)} />
        <Stat label="Transactions" value={summary.transactions} />
        <Stat label="Cash" value={pesoCents(summary.cashSales)} />
        <Stat label="GCash" value={pesoCents(summary.gcashSales)} />
      </div>

      <Card>
        {sales.length === 0 ? (
          <EmptyState icon={<ReceiptText />} title="No sales in this period" />
        ) : (
          <ul className="divide-y divide-line">
            {sales.map((s) => (
              <li key={s.id}>
                <Link href={`/receipt/${s.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                  <div className="w-24 shrink-0">
                    <p className="font-mono text-[12px] font-medium text-slate-500">{formatReceiptNo(s.receiptNo)}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {range.preset === "today" ? formatTime(s.createdAt) : `${formatShortDate(s.createdAt)} · ${formatTime(s.createdAt)}`}
                    </p>
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm">{s.itemsLabel}</p>
                  <PaymentBadge method={s.paymentMethod} />
                  <p className="num w-24 text-right text-[15px] font-semibold">{pesoCents(s.total)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageContainer>
  );
}
