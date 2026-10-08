"use client";

import { useMemo, useState, useTransition } from "react";
import { Archive, ArchiveRestore, FolderCog, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { archiveProduct, deleteCategory, deleteProduct, saveCategory, saveProduct } from "@/actions/products";
import { fromCents, pesoCents, toCents } from "@/lib/money";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, FormError, Input, MoneyInput, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export type ProductRow = {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  cost: number;
  price: number;
  stock: number;
  lowStockLevel: number;
  barcode: string | null;
  sku: string | null;
  archived: boolean;
  isSample: boolean;
  hasSales: boolean;
};
type Cat = { id: string; name: string; count: number };

export function ProductsView({ products, categories }: { products: ProductRow[]; categories: Cat[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<ProductRow | "new" | null>(null);
  const [catsOpen, setCatsOpen] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.archived === showArchived &&
        (cat === "all" || p.categoryId === cat) &&
        (!q || p.name.toLowerCase().includes(q) || p.barcode?.includes(q) || p.sku?.toLowerCase().includes(q)),
    );
  }, [products, query, cat, showArchived]);
  const archivedCount = products.filter((p) => p.archived).length;

  function toggleArchive(p: ProductRow) {
    start(async () => {
      const r = await archiveProduct(p.id, !p.archived);
      if (r.ok) toast({ title: p.archived ? "Product restored" : "Product archived", description: p.name });
      else toast({ title: r.error, tone: "error" });
    });
  }

  function remove(p: ProductRow) {
    if (!confirm(`Delete ${p.name}? This cannot be undone.`)) return;
    start(async () => {
      const r = await deleteProduct(p.id);
      if (r.ok) toast({ title: "Product deleted", description: p.name });
      else toast({ title: r.error, tone: "error" });
    });
  }

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        description={`${products.length - archivedCount} active products`}
        actions={
          <>
            <Button variant="outline" onClick={() => setCatsOpen(true)}>
              <FolderCog /> Categories
            </Button>
            <Button variant="accent" onClick={() => setEditing("new")}>
              <Plus /> Add Product
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, barcode or SKU" className="pl-10" />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="sm:w-52" aria-label="Category filter">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Button variant={showArchived ? "primary" : "outline"} className="h-11" onClick={() => setShowArchived((v) => !v)}>
          <Archive /> Archived{archivedCount ? ` (${archivedCount})` : ""}
        </Button>
      </div>

      <Card className={cn("overflow-hidden", pending && "opacity-70")}>
        {list.length === 0 ? (
          <EmptyState icon={<Package />} title={showArchived ? "No archived products" : "No products found"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3 text-right">Cost</th>
                  <th className="px-3 py-3 text-right">Selling</th>
                  <th className="px-3 py-3 text-right">Profit / item</th>
                  <th className="px-3 py-3 text-right">Stock</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink-900">{p.name}</span>
                        {p.isSample ? <Badge>Sample</Badge> : null}
                      </div>
                      {p.barcode || p.sku ? <p className="mt-0.5 font-mono text-[11px] text-slate-400">{[p.sku, p.barcode].filter(Boolean).join(" · ")}</p> : null}
                    </td>
                    <td className="px-3 py-3.5 text-slate-600">{p.category}</td>
                    <td className="num px-3 py-3.5 text-right text-slate-600">{pesoCents(p.cost)}</td>
                    <td className="num px-3 py-3.5 text-right font-medium">{pesoCents(p.price)}</td>
                    <td className={cn("num px-3 py-3.5 text-right font-semibold", p.price - p.cost < 0 ? "text-red-600" : "text-accent-700")}>{pesoCents(p.price - p.cost)}</td>
                    <td className={cn("num px-3 py-3.5 text-right font-medium", p.stock <= 0 ? "text-red-600" : p.stock <= p.lowStockLevel ? "text-amber-600" : "")}>{p.stock}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`} title="Edit">
                          <Pencil />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => toggleArchive(p)} aria-label={p.archived ? "Restore" : "Archive"} title={p.archived ? "Restore" : "Archive"}>
                          {p.archived ? <ArchiveRestore /> : <Archive />}
                        </Button>
                        {!p.hasSales ? (
                          <Button size="icon-sm" variant="ghost" className="hover:text-red-600" onClick={() => remove(p)} aria-label="Delete" title="Delete (only for products never sold)">
                            <Trash2 />
                          </Button>
                        ) : (
                          <span className="size-8" aria-hidden />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <p className="mt-3 text-xs text-slate-500">Products that were already sold can only be archived, so your sales history stays complete.</p>

      <ProductDialog key={editing === "new" ? "new" : editing?.id ?? "closed"} product={editing} categories={categories} onClose={() => setEditing(null)} />
      <CategoriesDialog open={catsOpen} onClose={() => setCatsOpen(false)} categories={categories} />
    </PageContainer>
  );
}

function ProductDialog({ product, categories, onClose }: { product: ProductRow | "new" | null; categories: Cat[]; onClose: () => void }) {
  const isNew = product === "new";
  const p = product && product !== "new" ? product : null;
  const [form, setForm] = useState({
    name: p?.name ?? "",
    categoryId: p?.categoryId ?? categories[0]?.id ?? "",
    costPrice: p ? fromCents(p.cost) : "",
    sellingPrice: p ? fromCents(p.price) : "",
    stock: "0",
    lowStockLevel: String(p?.lowStockLevel ?? 5),
    barcode: p?.barcode ?? "",
    sku: p?.sku ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const cost = toCents(form.costPrice);
  const sell = toCents(form.sellingPrice);
  const profit = !Number.isNaN(cost) && !Number.isNaN(sell) && form.sellingPrice ? sell - cost : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await saveProduct(p?.id ?? null, form);
      if (!r.ok) return setError(r.error);
      toast({ title: isNew ? "Product added" : "Product saved", description: form.name });
      onClose();
    });
  }

  return (
    <Dialog
      open={product !== null}
      onClose={onClose}
      title={isNew ? "Add Product" : "Edit Product"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" loading={pending}>
            {isNew ? "Add Product" : "Save Changes"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="space-y-4">
        <Field label="Product Name">
          <Input value={form.name} onChange={set("name")} placeholder="e.g. Coca-Cola 1.5L" autoFocus required />
        </Field>
        <Field label="Category">
          <Select value={form.categoryId} onChange={set("categoryId")} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cost Price">
            <MoneyInput value={form.costPrice} onChange={set("costPrice")} placeholder="0.00" required />
          </Field>
          <Field label="Selling Price">
            <MoneyInput value={form.sellingPrice} onChange={set("sellingPrice")} placeholder="0.00" required />
          </Field>
        </div>
        <div className={cn("flex items-center justify-between rounded-xl px-4 py-3 text-sm", profit !== null && profit < 0 ? "bg-red-50" : "bg-accent-50")}>
          <span className="font-medium text-slate-600">Profit per item</span>
          <span className={cn("num font-semibold", profit !== null && profit < 0 ? "text-red-600" : "text-accent-700")}>{profit === null ? "—" : pesoCents(profit)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {isNew ? (
            <Field label="Starting Stock">
              <Input value={form.stock} onChange={set("stock")} inputMode="numeric" className="num" />
            </Field>
          ) : (
            <Field label="Stock" hint="Change stock in Inventory">
              <Input value={p?.stock ?? 0} disabled className="num" />
            </Field>
          )}
          <Field label="Low Stock Level" hint="Warn me at this count">
            <Input value={form.lowStockLevel} onChange={set("lowStockLevel")} inputMode="numeric" className="num" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Barcode (optional)">
            <Input value={form.barcode} onChange={set("barcode")} inputMode="numeric" className="font-mono" />
          </Field>
          <Field label="SKU (optional)">
            <Input value={form.sku} onChange={set("sku")} className="font-mono" />
          </Field>
        </div>
        <FormError message={error} />
      </form>
    </Dialog>
  );
}

function CategoriesDialog({ open, onClose, categories }: { open: boolean; onClose: () => void; categories: Cat[] }) {
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    setError(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Error");
      else after?.();
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Product Categories" description="These are the category buttons in the POS.">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => saveCategory(null, name), () => setName(""));
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" />
        <Button type="submit" loading={pending} disabled={!name.trim()} className="h-11">
          <Plus /> Add
        </Button>
      </form>
      <div className="mt-3">
        <FormError message={error} />
      </div>
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-2 px-4 py-2.5">
            {editId === c.id ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => saveCategory(c.id, editName), () => setEditId(null));
                }}
              >
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus className="h-9" />
                <Button type="submit" size="sm" className="h-9">
                  Save
                </Button>
              </form>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium">{c.name}</span>
                <span className="text-xs text-slate-400">{c.count} items</span>
                <Button size="icon-sm" variant="ghost" onClick={() => { setEditId(c.id); setEditName(c.name); }} aria-label={`Rename ${c.name}`}>
                  <Pencil />
                </Button>
                <Button size="icon-sm" variant="ghost" className="hover:text-red-600" disabled={c.count > 0} onClick={() => run(() => deleteCategory(c.id))} aria-label={`Delete ${c.name}`} title={c.count > 0 ? "Move products out first" : "Delete"}>
                  <Trash2 />
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
