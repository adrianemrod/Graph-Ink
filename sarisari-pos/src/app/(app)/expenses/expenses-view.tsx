"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, ReceiptText, Trash2 } from "lucide-react";
import { addExpenseCategory, removeExpense, saveExpense } from "@/actions/expenses";
import { fromCents, pesoCents, toCents } from "@/lib/money";
import { formatDateKey } from "@/lib/time";
import { PageContainer } from "@/components/page";
import { RangeFilter } from "@/components/range-filter";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardHeader, EmptyState, PageHeader, Stat } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, FormError, Input, MoneyInput, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type Expense = { id: string; name: string; categoryId: string; category: string; amount: number; dateKey: string; notes: string | null };
type Cat = { id: string; name: string };

export function ExpensesView({
  totals,
  range,
  expenses,
  categories,
  autoOpen,
  todayKey,
}: {
  totals: { today: number; week: number; month: number };
  range: { preset: string; fromKey: string; toKey: string; label: string };
  expenses: Expense[];
  categories: Cat[];
  autoOpen: boolean;
  todayKey: string;
}) {
  const [editing, setEditing] = useState<Expense | "new" | null>(autoOpen ? "new" : null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const total = expenses.reduce((a, e) => a + e.amount, 0);

  function remove(e: Expense) {
    if (!confirm(`Delete expense "${e.name}" (${pesoCents(e.amount)})?`)) return;
    start(async () => {
      const r = await removeExpense(e.id);
      if (r.ok) toast({ title: "Expense deleted" });
      else toast({ title: r.error, tone: "error" });
    });
  }

  return (
    <PageContainer>
      <PageHeader
        title="Expenses"
        description="Electricity, water, transport, supplies and other store spending."
        actions={
          <Button variant="accent" onClick={() => setEditing("new")}>
            <Plus /> Record Expense
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Today" value={pesoCents(totals.today)} />
        <Stat label="This Week" value={pesoCents(totals.week)} />
        <Stat label="This Month" value={pesoCents(totals.month)} />
      </div>

      <Card className={pending ? "opacity-70" : ""}>
        <CardHeader
          title={range.label}
          description={`${expenses.length} expense${expenses.length === 1 ? "" : "s"} · ${pesoCents(total)}`}
          action={<RangeFilter preset={range.preset} fromKey={range.fromKey} toKey={range.toKey} />}
          className="flex-col sm:flex-row"
        />
        {expenses.length === 0 ? (
          <EmptyState icon={<ReceiptText />} title="No expenses recorded" />
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {expenses.map((e) => (
              <li key={e.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-20 shrink-0 text-xs text-slate-500">{formatDateKey(e.dateKey)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">{e.name}</p>
                    <Badge>{e.category}</Badge>
                  </div>
                  {e.notes ? <p className="mt-0.5 truncate text-xs text-slate-500">{e.notes}</p> : null}
                </div>
                <p className="num text-[15px] font-semibold">{pesoCents(e.amount)}</p>
                <div className="flex gap-1">
                  <Button size="icon-sm" variant="ghost" onClick={() => setEditing(e)} aria-label="Edit">
                    <Pencil />
                  </Button>
                  <Button size="icon-sm" variant="ghost" className="hover:text-red-600" onClick={() => remove(e)} aria-label="Delete">
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ExpenseDialog key={editing === "new" ? "new" : editing?.id ?? "x"} expense={editing} categories={categories} todayKey={todayKey} onClose={() => setEditing(null)} />
    </PageContainer>
  );
}

function ExpenseDialog({ expense, categories, todayKey, onClose }: { expense: Expense | "new" | null; categories: Cat[]; todayKey: string; onClose: () => void }) {
  const e = expense && expense !== "new" ? expense : null;
  const [form, setForm] = useState({
    name: e?.name ?? "",
    categoryId: e?.categoryId ?? categories[0]?.id ?? "",
    amount: e ? fromCents(e.amount) : "",
    date: e?.dateKey ?? todayKey,
    notes: e?.notes ?? "",
  });
  const [newCat, setNewCat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const set = (k: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: ev.target.value }));

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (pending) return;
    setError(null);
    start(async () => {
      const r = await saveExpense(e?.id ?? null, form);
      if (!r.ok) return setError(r.error);
      toast({ title: e ? "Expense saved" : "Expense recorded", description: `${form.name} · ${pesoCents(toCents(form.amount))}` });
      onClose();
    });
  }

  function createCategory() {
    if (!newCat?.trim()) return;
    start(async () => {
      const r = await addExpenseCategory(newCat);
      if (!r.ok) return setError(r.error);
      setForm((f) => ({ ...f, categoryId: r.data.id }));
      setNewCat(null);
    });
  }

  return (
    <Dialog
      open={expense !== null}
      onClose={onClose}
      title={e ? "Edit Expense" : "Record Expense"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="expense-form" loading={pending}>
            {e ? "Save Changes" : "Record Expense"}
          </Button>
        </>
      }
    >
      <form id="expense-form" onSubmit={submit} className="space-y-4">
        <Field label="Expense Name">
          <Input value={form.name} onChange={set("name")} placeholder="e.g. Electricity bill" autoFocus required />
        </Field>
        <Field label="Amount">
          <MoneyInput value={form.amount} onChange={set("amount")} placeholder="0.00" inputSize="lg" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-slate-600">Category</span>
            {newCat === null ? (
              <Select
                value={form.categoryId}
                onChange={(ev) => (ev.target.value === "__new" ? setNewCat("") : set("categoryId")(ev))}
                aria-label="Category"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="__new">+ New category…</option>
              </Select>
            ) : (
              <div className="flex gap-1.5">
                <Input value={newCat} onChange={(ev) => setNewCat(ev.target.value)} placeholder="Category name" autoFocus onKeyDown={(ev) => ev.key === "Enter" && (ev.preventDefault(), createCategory())} />
                <Button className="h-11" onClick={createCategory} disabled={!newCat.trim()}>
                  Add
                </Button>
              </div>
            )}
          </div>
          <Field label="Date">
            <Input type="date" value={form.date} max={todayKey} onChange={set("date")} required />
          </Field>
        </div>
        <Field label="Notes (optional)">
          <Textarea value={form.notes} onChange={set("notes")} />
        </Field>
        <FormError message={error} />
      </form>
    </Dialog>
  );
}
