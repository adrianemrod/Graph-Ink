import type { Metadata } from "next";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCents } from "@/lib/money";
import { getExpenseSummary } from "@/lib/services/reports";
import { manilaDateKey, resolveRange } from "@/lib/time";
import { ExpensesView } from "./expenses-view";

export const metadata: Metadata = { title: "Expenses" };

export default async function ExpensesPage(props: PageProps<"/expenses">) {
  await requirePageUser("OWNER");
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const range = resolveRange({ preset: one(sp.range) ?? "month", from: one(sp.from), to: one(sp.to) });
  const [today, week, month, expenses, categories] = await Promise.all([
    getExpenseSummary(resolveRange({ preset: "today" })),
    getExpenseSummary(resolveRange({ preset: "week" })),
    getExpenseSummary(resolveRange({ preset: "month" })),
    db.expense.findMany({ where: { spentAt: { gte: range.from, lt: range.to } }, orderBy: [{ spentAt: "desc" }, { createdAt: "desc" }], include: { category: { select: { name: true } } } }),
    db.expenseCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <ExpensesView
      totals={{ today: today.total, week: week.total, month: month.total }}
      range={{ preset: range.preset, fromKey: range.fromKey, toKey: range.toKey, label: range.label }}
      autoOpen={one(sp.new) === "1"}
      todayKey={manilaDateKey()}
      categories={categories}
      expenses={expenses.map((e) => ({
        id: e.id,
        name: e.name,
        categoryId: e.categoryId,
        category: e.category.name,
        amount: toCents(e.amount),
        dateKey: manilaDateKey(e.spentAt),
        notes: e.notes,
      }))}
    />
  );
}
