"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { Banknote, Check, ChevronUp, History, Minus, PackageSearch, Plus, Printer, ScanBarcode, Search, ShoppingCart, Smartphone, Tag, Trash2, X } from "lucide-react";
import { completeSale } from "@/actions/sales";
import { computeDiscountCents, fromCents, pesoCents, toCents, type DiscountKind } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormError, MoneyInput } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";

export type PosProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number; // centavos
  stock: number;
  lowStockLevel: number;
  categoryId: string;
};

type CartLine = { productId: string; quantity: number };
type Done = { saleId: string; receiptNo: number; total: number; change: number; method: "CASH" | "GCASH" };

function newRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PosScreen({ products, categories }: { products: PosProduct[]; categories: { id: string; name: string }[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discountType, setDiscountType] = useState<DiscountKind>("NONE");
  const [discountValue, setDiscountValue] = useState("");
  const [discountOpen, setDiscountOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [cartSheet, setCartSheet] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.categoryId !== category) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.sku?.toLowerCase() === q || p.barcode === q || p.barcode?.includes(q) || p.sku?.toLowerCase().includes(q);
    });
  }, [products, query, category]);

  const lines = cart
    .map((l) => ({ ...l, product: byId.get(l.productId) }))
    .filter((l): l is CartLine & { product: PosProduct } => Boolean(l.product));
  const itemCount = lines.reduce((a, l) => a + l.quantity, 0);
  const subtotal = lines.reduce((a, l) => a + l.product.price * l.quantity, 0);
  const discountValueCents = discountType === "NONE" ? 0 : Math.max(0, toCents(discountValue) || 0);
  const discount = computeDiscountCents(subtotal, discountType, discountValueCents);
  const total = subtotal - discount;

  function addToCart(p: PosProduct) {
    const inCart = cart.find((l) => l.productId === p.id)?.quantity ?? 0;
    if (inCart >= p.stock) {
      setFlash(p.stock <= 0 ? `${p.name} is out of stock` : `Only ${p.stock} ${p.name} in stock`);
      setTimeout(() => setFlash(null), 1800);
      return;
    }
    setCart((c) => (c.some((l) => l.productId === p.id) ? c.map((l) => (l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l)) : [...c, { productId: p.id, quantity: 1 }]));
  }

  function setQty(productId: string, qty: number) {
    const p = byId.get(productId);
    if (!p) return;
    const capped = Math.min(Math.max(qty, 0), p.stock);
    setCart((c) => (capped === 0 ? c.filter((l) => l.productId !== productId) : c.map((l) => (l.productId === productId ? { ...l, quantity: capped } : l))));
  }

  function clearSale() {
    setCart([]);
    setDiscountType("NONE");
    setDiscountValue("");
  }

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const q = query.trim().toLowerCase();
    if (!q) return;
    // Barcode scanners type the code and press Enter.
    const exact = products.find((p) => p.barcode === q || p.sku?.toLowerCase() === q) ?? (filtered.length === 1 ? filtered[0] : undefined);
    if (exact) {
      addToCart(exact);
      setQuery("");
    }
  }

  const cartPanel = (
    <CartPanel
      lines={lines}
      setQty={setQty}
      subtotal={subtotal}
      discount={discount}
      discountType={discountType}
      discountValue={discountValue}
      total={total}
      onDiscount={() => setDiscountOpen(true)}
      onClear={clearSale}
      onCharge={() => {
        setCartSheet(false);
        setPayOpen(true);
      }}
    />
  );

  return (
    <div className="lg:grid lg:h-dvh lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px]">
      {/* Products */}
      <section className="flex min-w-0 flex-col lg:h-dvh">
        <div className="sticky top-14 z-10 space-y-3 border-b border-line bg-white/90 px-4 pb-3 pt-4 backdrop-blur lg:static">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKey}
                placeholder="Search product, SKU or barcode"
                className="h-12 w-full rounded-2xl border border-line bg-white pl-12 pr-11 text-[15px] shadow-soft outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10"
                autoComplete="off"
                aria-label="Search product"
              />
              {query ? (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Clear search">
                  <X className="size-4" />
                </button>
              ) : (
                <ScanBarcode className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-300" />
              )}
            </div>
            <Link href="/pos/history" className="flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-4 text-sm font-semibold text-slate-600 shadow-soft hover:text-ink-900">
              <History className="size-[18px]" />
              <span className="hidden sm:inline">Sales</span>
            </Link>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6">
            {[{ id: "all", name: "All" }, ...categories].map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold transition",
                  category === c.id ? "bg-ink-900 text-white shadow-soft" : "border border-line bg-white text-slate-600 hover:text-ink-900",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:px-6 lg:pb-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <PackageSearch className="size-9 text-slate-300" />
              <p className="mt-3 text-sm font-semibold">No products found</p>
              <p className="mt-1 text-[13px] text-slate-500">Try another name or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filtered.map((p) => {
                const inCart = cart.find((l) => l.productId === p.id)?.quantity ?? 0;
                const out = p.stock <= 0;
                const low = !out && p.stock <= p.lowStockLevel;
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    disabled={out}
                    className={cn(
                      "group relative flex min-h-[124px] flex-col justify-between rounded-2xl border bg-white p-4 text-left shadow-soft transition active:scale-[0.98]",
                      inCart ? "border-accent-500 ring-2 ring-accent-500/15" : "border-line hover:border-slate-300 hover:shadow-lift",
                      out && "cursor-not-allowed opacity-50",
                    )}
                  >
                    {inCart ? (
                      <span className="num absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-accent-600 text-xs font-bold text-white">{inCart}</span>
                    ) : null}
                    <p className="line-clamp-2 pr-6 text-[14px] font-semibold leading-snug text-ink-900">{p.name}</p>
                    <div className="mt-3">
                      <p className="num text-xl font-semibold tracking-[-0.02em]">{pesoCents(p.price, { compact: true })}</p>
                      <p className={cn("mt-0.5 text-xs font-medium", out ? "text-red-600" : low ? "text-amber-600" : "text-slate-500")}>
                        {out ? "Out of stock" : `Stock: ${p.stock}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Cart — desktop / tablet landscape */}
      <aside className="hidden border-l border-line bg-white lg:flex lg:h-dvh lg:flex-col">{cartPanel}</aside>

      {/* Cart — mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
        <button
          onClick={() => setCartSheet(true)}
          className="flex h-14 w-full items-center justify-between rounded-2xl bg-ink-900 px-5 text-white shadow-lift active:scale-[0.99]"
        >
          <span className="flex items-center gap-3 text-sm font-semibold">
            <ShoppingCart className="size-5" />
            {itemCount === 0 ? "Cart is empty" : `${itemCount} item${itemCount > 1 ? "s" : ""}`}
          </span>
          <span className="flex items-center gap-2">
            <span className="num text-lg font-semibold">{pesoCents(total)}</span>
            <ChevronUp className="size-5 text-slate-400" />
          </span>
        </button>
      </div>
      {cartSheet ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink-950/40" onClick={() => setCartSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 flex h-[88dvh] animate-slide-up flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift">
            <div className="grid grid-cols-[40px_1fr_40px] items-center px-3 pt-2">
              <span />
              <span className="mx-auto h-1 w-10 rounded-full bg-slate-200" />
              <button onClick={() => setCartSheet(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close cart">
                <X className="size-5" />
              </button>
            </div>
            {cartPanel}
          </div>
        </div>
      ) : null}

      {flash ? (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-pop-in rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white shadow-lift">{flash}</div>
      ) : null}

      <DiscountDialog
        open={discountOpen}
        onClose={() => setDiscountOpen(false)}
        subtotal={subtotal}
        type={discountType}
        value={discountValue}
        onApply={(t, v) => {
          setDiscountType(t);
          setDiscountValue(v);
          setDiscountOpen(false);
        }}
      />

      <PaymentDialog
        open={payOpen}
        onClose={() => setPayOpen(false)}
        lines={lines}
        total={total}
        discountType={discountType}
        discountValue={discountValue}
        onDone={(d) => {
          setPayOpen(false);
          setDone(d);
          clearSale();
        }}
      />

      <Dialog
        open={done !== null}
        onClose={() => {
          setDone(null);
          searchRef.current?.focus();
        }}
        title="Sale complete"
        size="sm"
      >
        {done ? (
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-50 text-accent-600">
              <Check className="size-7" strokeWidth={2.5} />
            </div>
            <p className="mt-4 text-[13px] text-slate-500">Receipt R-{String(done.receiptNo).padStart(6, "0")} · {done.method === "CASH" ? "Cash" : "GCash"}</p>
            <p className="num mt-1 text-[34px] font-semibold tracking-[-0.03em]">{pesoCents(done.total)}</p>
            {done.method === "CASH" ? (
              <div className="mt-4 rounded-2xl bg-ink-900 px-5 py-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Change</p>
                <p className="num mt-1 text-[30px] font-semibold text-accent-500">{pesoCents(done.change)}</p>
              </div>
            ) : null}
            <div className="mt-6 grid grid-cols-2 gap-2">
              <a href={`/receipt/${done.saleId}?print=1`} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm font-semibold shadow-soft hover:bg-slate-50">
                <Printer className="size-4" /> Print
              </a>
              <Button
                size="lg"
                variant="accent"
                onClick={() => {
                  setDone(null);
                  searchRef.current?.focus();
                }}
              >
                New Sale
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

function CartPanel({
  lines,
  setQty,
  subtotal,
  discount,
  discountType,
  discountValue,
  total,
  onDiscount,
  onClear,
  onCharge,
}: {
  lines: (CartLine & { product: PosProduct })[];
  setQty: (id: string, q: number) => void;
  subtotal: number;
  discount: number;
  discountType: DiscountKind;
  discountValue: string;
  total: number;
  onDiscount: () => void;
  onClear: () => void;
  onCharge: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">Current Sale</h2>
        {lines.length > 0 ? (
          <button onClick={onClear} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium text-slate-500 hover:bg-slate-100 hover:text-red-600">
            <Trash2 className="size-3.5" /> Clear
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {lines.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ShoppingCart className="size-5" />
            </div>
            <p className="mt-3 text-sm font-semibold">No items yet</p>
            <p className="mt-1 text-[13px] text-slate-500">Tap a product to add it.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {lines.map((l) => (
              <li key={l.productId} className="py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug">{l.product.name}</p>
                    <p className="num mt-0.5 text-[13px] text-slate-500">
                      {l.quantity} × {pesoCents(l.product.price)}
                    </p>
                  </div>
                  <p className="num text-[15px] font-semibold">{pesoCents(l.product.price * l.quantity)}</p>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <button onClick={() => setQty(l.productId, l.quantity - 1)} className="flex size-9 items-center justify-center rounded-xl border border-line bg-white text-slate-600 hover:bg-slate-50" aria-label="Decrease">
                    <Minus className="size-4" />
                  </button>
                  <input
                    value={l.quantity}
                    inputMode="numeric"
                    onChange={(e) => {
                      const n = parseInt(e.target.value.replace(/\D/g, "") || "0", 10);
                      setQty(l.productId, n);
                    }}
                    className="num h-9 w-12 rounded-xl border border-line text-center text-sm font-semibold outline-none focus:border-accent-500"
                    aria-label={`Quantity of ${l.product.name}`}
                  />
                  <button
                    onClick={() => setQty(l.productId, l.quantity + 1)}
                    disabled={l.quantity >= l.product.stock}
                    className="flex size-9 items-center justify-center rounded-xl border border-line bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    aria-label="Increase"
                  >
                    <Plus className="size-4" />
                  </button>
                  <span className="ml-1 text-xs text-slate-400">of {l.product.stock}</span>
                  <button onClick={() => setQty(l.productId, 0)} className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove">
                    <X className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-line bg-slate-50/70 px-5 pb-5 pt-3">
        <div className="flex items-center justify-between py-1.5 text-sm">
          <span className="text-slate-500">Subtotal</span>
          <span className="num font-medium">{pesoCents(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between py-1.5 text-sm">
          <button onClick={onDiscount} disabled={lines.length === 0} className="flex items-center gap-1.5 font-medium text-accent-700 hover:underline disabled:text-slate-400 disabled:no-underline">
            <Tag className="size-3.5" />
            {discountType === "NONE" ? "Add discount" : `Discount${discountType === "PERCENT" ? ` (${discountValue}%)` : ""}`}
          </button>
          <span className="num font-medium text-slate-600">{discount > 0 ? `−${pesoCents(discount)}` : "₱0.00"}</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Total</span>
          <span className="num text-[32px] font-semibold tracking-[-0.03em]">{pesoCents(total)}</span>
        </div>
        <Button size="xl" variant="accent" className="mt-4 w-full" disabled={lines.length === 0} onClick={onCharge}>
          Charge {pesoCents(total)}
        </Button>
      </div>
    </>
  );
}

function DiscountDialog({
  open,
  onClose,
  subtotal,
  type,
  value,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  subtotal: number;
  type: DiscountKind;
  value: string;
  onApply: (t: DiscountKind, v: string) => void;
}) {
  const [t, setT] = useState<DiscountKind>(type === "NONE" ? "PERCENT" : type);
  const [v, setV] = useState(value);
  const [synced, setSynced] = useState(open);
  if (open !== synced) {
    setSynced(open);
    if (open) {
      setT(type === "NONE" ? "PERCENT" : type);
      setV(value);
    }
  }
  const cents = toCents(v);
  const error =
    v.trim() === "" ? null : Number.isNaN(cents) || cents < 0 ? "Enter a valid number." : t === "PERCENT" && cents > 100_00 ? "Maximum is 100%." : t === "FIXED" && cents > subtotal ? "Discount is bigger than the subtotal." : null;
  const preview = !error && v.trim() !== "" ? computeDiscountCents(subtotal, t, cents) : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Discount"
      description={`Subtotal ${pesoCents(subtotal)}`}
      size="sm"
      footer={
        <>
          {type !== "NONE" ? (
            <Button variant="danger" onClick={() => onApply("NONE", "")}>
              Remove discount
            </Button>
          ) : null}
          <Button variant="primary" disabled={!!error || v.trim() === ""} onClick={() => onApply(t, fromCents(cents).replace(/\.00$/, ""))}>
            Apply
          </Button>
        </>
      }
    >
      <Segmented
        className="w-full"
        value={t}
        onChange={(x) => setT(x)}
        options={[
          { value: "PERCENT", label: "Percent (%)" },
          { value: "FIXED", label: "Fixed (₱)" },
        ]}
      />
      <div className="relative mt-4">
        <input
          autoFocus
          value={v}
          onChange={(e) => setV(e.target.value)}
          inputMode="decimal"
          placeholder={t === "PERCENT" ? "10" : "20.00"}
          className="num h-14 w-full rounded-xl border border-line px-4 text-2xl font-semibold outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">{t === "PERCENT" ? "%" : "₱"}</span>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : <p className="mt-2 text-sm text-slate-500">Discount: {pesoCents(preview)}</p>}
    </Dialog>
  );
}

function quickCash(total: number): number[] {
  const bills = [2000, 5000, 10000, 20000, 50000, 100000]; // ₱20 … ₱1,000 in centavos
  const out = new Set<number>([total]);
  for (const b of bills) {
    const v = Math.ceil(total / b) * b;
    if (v > total) out.add(v);
    if (out.size >= 4) break;
  }
  return [...out].sort((a, b) => a - b);
}

function PaymentDialog({
  open,
  onClose,
  lines,
  total,
  discountType,
  discountValue,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  lines: (CartLine & { product: PosProduct })[];
  total: number;
  discountType: DiscountKind;
  discountValue: string;
  onDone: (d: Done) => void;
}) {
  const [method, setMethod] = useState<"CASH" | "GCASH">("CASH");
  const [received, setReceived] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const requestId = useRef<string>("");
  const [synced, setSynced] = useState(false);
  if (open !== synced) {
    setSynced(open);
    if (open) {
      setMethod("CASH");
      setReceived("");
      setError(null);
    }
  }

  const receivedCents = toCents(received);
  const validReceived = !Number.isNaN(receivedCents) && received.trim() !== "";
  const change = validReceived ? receivedCents - total : 0;
  const canConfirm = method === "GCASH" || (validReceived && receivedCents >= total);

  function confirm() {
    if (!canConfirm || pending) return;
    setError(null);
    // One id per checkout attempt; repeated clicks or a retry after a network error reuse it.
    if (!requestId.current) requestId.current = newRequestId();
    start(async () => {
      let res: Awaited<ReturnType<typeof completeSale>>;
      try {
        res = await completeSale({
        clientRequestId: requestId.current,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        discountType,
        discountValue,
        paymentMethod: method,
        amountReceived: method === "CASH" ? received : fromCents(total),
        });
      } catch {
        // Connection problem: we don't know if the sale was saved, so keep the same id.
        // Pressing Confirm again returns the saved sale instead of creating a duplicate.
        setError("Connection problem. Press Confirm Sale again — it will not be charged twice.");
        return;
      }
      if (!res.ok) {
        setError(res.error);
        requestId.current = ""; // the sale was not saved; a corrected attempt gets a new id
        return;
      }
      requestId.current = "";
      onDone({ saleId: res.data.saleId, receiptNo: res.data.receiptNo, total, change: method === "CASH" ? receivedCents - total : 0, method });
    });
  }

  return (
    <Dialog open={open} onClose={() => !pending && onClose()} title="Payment" size="sm">
      <div className="rounded-2xl bg-slate-50 px-5 py-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Total</p>
        <p className="num mt-1 text-[36px] font-semibold leading-none tracking-[-0.03em]">{pesoCents(total)}</p>
      </div>

      <Segmented
        size="lg"
        className="mt-5 w-full"
        value={method}
        onChange={(m) => {
          setMethod(m);
          setError(null);
        }}
        options={[
          { value: "CASH", label: <><Banknote className="size-5" /> Cash</> },
          { value: "GCASH", label: <><Smartphone className="size-5" /> GCash</> },
        ]}
      />

      {method === "CASH" ? (
        <div className="mt-5">
          <label className="mb-1.5 block text-[13px] font-medium text-slate-600" htmlFor="received">
            Customer gives
          </label>
          <MoneyInput
            id="received"
            inputSize="lg"
            autoFocus
            value={received}
            onChange={(e) => setReceived(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirm()}
            placeholder="0.00"
          />
          <div className="mt-2.5 grid grid-cols-4 gap-2">
            {quickCash(total).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setReceived(fromCents(v))}
                className="num h-11 rounded-xl border border-line bg-white text-sm font-semibold shadow-soft hover:border-slate-300"
              >
                {v === total ? "Exact" : pesoCents(v, { compact: true })}
              </button>
            ))}
          </div>
          <div className={cn("mt-4 flex items-center justify-between rounded-2xl px-5 py-4", change < 0 ? "bg-red-50" : "bg-ink-900 text-white")}>
            <span className={cn("text-[13px] font-semibold uppercase tracking-[0.08em]", change < 0 ? "text-red-600" : "text-slate-400")}>
              {change < 0 ? "Kulang (short)" : "Change"}
            </span>
            <span className={cn("num text-[28px] font-semibold", change < 0 ? "text-red-600" : "text-accent-500")}>{pesoCents(Math.abs(change))}</span>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/60 px-5 py-4">
          <p className="text-sm font-semibold text-ink-900">Payment Method: GCash</p>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
            Check that you received <span className="font-semibold">{pesoCents(total)}</span> in the store&apos;s GCash before confirming.
          </p>
        </div>
      )}

      <div className="mt-4">
        <FormError message={error} />
      </div>

      <Button size="xl" variant="accent" className="mt-4 w-full" disabled={!canConfirm} loading={pending} onClick={confirm}>
        Confirm Sale
      </Button>
    </Dialog>
  );
}
