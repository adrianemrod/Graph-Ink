"use client";

import { useMemo, useState, useTransition } from "react";
import { Boxes, PackagePlus, Search, SlidersHorizontal } from "lucide-react";
import { addStock, adjustStock } from "@/actions/products";
import { pesoCents } from "@/lib/money";
import { formatShortDate, formatTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { StockStatus } from "@/lib/services/reports";
import { PageContainer } from "@/components/page";
import { StockBadge } from "@/components/stock-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type Row = { id: string; name: string; category: string; stock: number; lowStockLevel: number; sellingPrice: number; status: StockStatus };
type Movement = { id: string; product: string; type: "SALE" | "STOCK_IN" | "ADJUSTMENT"; quantity: number; stockAfter: number; reason: string | null; notes: string | null; receiptNo: number | null; user: string; createdAt: string };

const REASONS = ["Damaged", "Expired", "Lost", "Manual Correction"] as const;

export function InventoryView({ rows, counts, movements, initialFilter }: { rows: Row[]; counts: { total: number; low: number; out: number }; movements: Movement[]; initialFilter: "all" | "low" | "out" }) {
  const [filter, setFilter] = useState(initialFilter);
  const [query, setQuery] = useState("");
  const [stockIn, setStockIn] = useState<Row | null>(null);
  const [adjust, setAdjust] = useState<Row | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) => (filter === "all" || (filter === "low" ? r.status === "LOW_STOCK" : r.status === "OUT_OF_STOCK")) && (!q || r.name.toLowerCase().includes(q)),
    );
  }, [rows, filter, query]);

  const tabs = [
    { v: "all" as const, label: "All", n: counts.total },
    { v: "low" as const, label: "Low Stock", n: counts.low },
    { v: "out" as const, label: "Out of Stock", n: counts.out },
  ];

  return (
    <PageContainer>
      <PageHeader title="Inventory" description="Add stock when deliveries arrive. Record damaged, expired or lost items." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex rounded-xl border border-line bg-white p-1 shadow-soft">
          {tabs.map((t) => (
            <button
              key={t.v}
              onClick={() => setFilter(t.v)}
              className={cn("flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition", filter === t.v ? "bg-ink-900 text-white" : "text-slate-500 hover:text-ink-900")}
            >
              {t.label}
              <span className={cn("num rounded-full px-1.5 text-[11px]", filter === t.v ? "bg-white/15" : "bg-slate-100")}>{t.n}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product" className="pl-10" />
        </div>
      </div>

      <Card className="overflow-hidden">
        {list.length === 0 ? (
          <EmptyState icon={<Boxes />} title="Nothing here" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3 text-right">Current Stock</th>
                  <th className="px-3 py-3 text-right">Selling Price</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-semibold">{r.name}</td>
                    <td className="px-3 py-3 text-slate-600">{r.category}</td>
                    <td className="num px-3 py-3 text-right text-base font-semibold">{r.stock}</td>
                    <td className="num px-3 py-3 text-right text-slate-600">{pesoCents(r.sellingPrice)}</td>
                    <td className="px-3 py-3">
                      <StockBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="accent" onClick={() => setStockIn(r)}>
                          <PackagePlus /> Add Stock
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setAdjust(r)} title="Stock adjustment">
                          <SlidersHorizontal /> Adjust
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <CardHeader title="Stock History" description="Every stock change is recorded" />
        {movements.length === 0 ? (
          <EmptyState title="No stock changes yet" />
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {movements.map((m) => (
              <li key={m.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                <span className={cn("num w-14 shrink-0 text-right font-semibold", m.quantity > 0 ? "text-accent-700" : "text-slate-600")}>
                  {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{m.product}</p>
                  <p className="truncate text-xs text-slate-500">
                    {m.type === "SALE" ? `Sale R-${String(m.receiptNo).padStart(6, "0")}` : m.type === "STOCK_IN" ? "Stock added" : m.reason}
                    {m.notes ? ` · ${m.notes}` : ""} · {m.user}
                  </p>
                </div>
                <span className="hidden text-xs text-slate-500 sm:block">Now {m.stockAfter}</span>
                <span className="w-24 text-right text-xs text-slate-400">
                  {formatShortDate(m.createdAt)} {formatTime(m.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AddStockDialog key={`in-${stockIn?.id}`} row={stockIn} onClose={() => setStockIn(null)} />
      <AdjustDialog key={`adj-${adjust?.id}`} row={adjust} onClose={() => setAdjust(null)} />
    </PageContainer>
  );
}

function AddStockDialog({ row, onClose }: { row: Row | null; onClose: () => void }) {
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const n = parseInt(qty, 10);
  const valid = Number.isInteger(n) && n > 0 && String(n) === qty.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!row || pending) return;
    start(async () => {
      const r = await addStock({ productId: row.id, quantity: qty, notes });
      if (!r.ok) return setError(r.error);
      toast({ title: "Stock added", description: `${row.name}: now ${r.data.after}` });
      onClose();
    });
  }

  return (
    <Dialog
      open={row !== null}
      onClose={onClose}
      title="Add Stock"
      description={row?.name}
      size="sm"
      footer={
        <Button type="submit" form="stock-in" variant="accent" size="lg" disabled={!valid} loading={pending}>
          Add Stock
        </Button>
      }
    >
      <form id="stock-in" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-3 items-end gap-3 text-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Current</p>
            <p className="num mt-1 text-2xl font-semibold">{row?.stock}</p>
          </div>
          <Field label="Add">
            <Input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="numeric" autoFocus className="num h-12 text-center text-xl font-semibold" placeholder="0" />
          </Field>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">New Stock</p>
            <p className="num mt-1 text-2xl font-semibold text-accent-700">{valid && row ? row.stock + n : "—"}</p>
          </div>
        </div>
        <Field label="Note (optional)">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Delivery from supplier" />
        </Field>
        <FormError message={error} />
      </form>
    </Dialog>
  );
}

function AdjustDialog({ row, onClose }: { row: Row | null; onClose: () => void }) {
  const [reason, setReason] = useState<(typeof REASONS)[number]>("Damaged");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const isCount = reason === "Manual Correction";
  const n = parseInt(value, 10);
  const valid = Number.isInteger(n) && String(n) === value.trim() && (isCount ? n >= 0 : n > 0 && n <= (row?.stock ?? 0));
  const after = row && valid ? (isCount ? n : row.stock - n) : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!row || pending) return;
    start(async () => {
      const r = await adjustStock({ productId: row.id, reason, quantity: isCount ? undefined : value, actualCount: isCount ? value : undefined, notes });
      if (!r.ok) return setError(r.error);
      toast({ title: "Adjustment recorded", description: `${row.name}: now ${r.data.after}` });
      onClose();
    });
  }

  return (
    <Dialog
      open={row !== null}
      onClose={onClose}
      title="Stock Adjustment"
      description={row ? `${row.name} · current stock ${row.stock}` : undefined}
      size="sm"
      footer={
        <Button type="submit" form="adjust" size="lg" disabled={!valid} loading={pending}>
          Save Adjustment
        </Button>
      }
    >
      <form id="adjust" onSubmit={submit} className="space-y-4">
        <Field label="Reason">
          <Select value={reason} onChange={(e) => { setReason(e.target.value as typeof reason); setValue(""); }}>
            {REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </Field>
        <Field label={isCount ? "Actual count on the shelf" : "How many to remove?"}>
          <Input value={value} onChange={(e) => setValue(e.target.value)} inputMode="numeric" className="num h-12 text-xl font-semibold" placeholder="0" autoFocus />
        </Field>
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
          <span className="text-slate-600">New stock</span>
          <span className="num font-semibold">{after ?? "—"}</span>
        </div>
        <Field label="Note (optional)">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <FormError message={error} />
      </form>
    </Dialog>
  );
}
