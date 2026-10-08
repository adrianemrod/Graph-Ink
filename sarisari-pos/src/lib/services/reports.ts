// Read-only summaries. All money values are returned in centavos (integers).
import { db } from "@/lib/db";
import { toCents } from "@/lib/money";
import { todayRange, type DateRange } from "@/lib/time";
import { getGcashBalance } from "./gcash";

type Range = Pick<DateRange, "from" | "to">;
const inRange = (r: Range) => ({ gte: r.from, lt: r.to });

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
export function stockStatus(stock: number, lowStockLevel: number): StockStatus {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= lowStockLevel) return "LOW_STOCK";
  return "IN_STOCK";
}

export async function getSalesSummary(range: Range) {
  const grouped = await db.sale.groupBy({
    by: ["paymentMethod"],
    where: { createdAt: inRange(range) },
    _sum: { total: true, costTotal: true, grossProfit: true, discountAmount: true },
    _count: { _all: true },
  });
  const pick = (m: "CASH" | "GCASH") => grouped.find((g) => g.paymentMethod === m);
  const sum = (key: "total" | "costTotal" | "grossProfit" | "discountAmount") =>
    grouped.reduce((acc, g) => acc + toCents(g._sum[key] ?? 0), 0);
  return {
    totalSales: sum("total"),
    cashSales: toCents(pick("CASH")?._sum.total ?? 0),
    gcashSales: toCents(pick("GCASH")?._sum.total ?? 0),
    costOfGoods: sum("costTotal"),
    grossProfit: sum("grossProfit"),
    discounts: sum("discountAmount"),
    transactions: grouped.reduce((acc, g) => acc + g._count._all, 0),
  };
}

export async function listSales(range: Range | null, take = 200) {
  const sales = await db.sale.findMany({
    where: range ? { createdAt: inRange(range) } : undefined,
    orderBy: { createdAt: "desc" },
    take,
    include: { items: { select: { productName: true, quantity: true } }, cashier: { select: { name: true } } },
  });
  return sales.map((s) => ({
    id: s.id,
    receiptNo: s.receiptNo,
    createdAt: s.createdAt.toISOString(),
    paymentMethod: s.paymentMethod,
    total: toCents(s.total),
    costTotal: toCents(s.costTotal),
    grossProfit: toCents(s.grossProfit),
    itemCount: s.items.reduce((a, i) => a + i.quantity, 0),
    itemsLabel: s.items.map((i) => `${i.productName} ×${i.quantity}`).join(", "),
    cashier: s.cashier.name,
  }));
}

export async function getExpenseSummary(range: Range) {
  const [grouped, categories] = await Promise.all([
    db.expense.groupBy({ by: ["categoryId"], where: { spentAt: inRange(range) }, _sum: { amount: true }, _count: { _all: true } }),
    db.expenseCategory.findMany({ select: { id: true, name: true } }),
  ]);
  const names = new Map(categories.map((c) => [c.id, c.name]));
  const byCategory = grouped
    .map((g) => ({ category: names.get(g.categoryId) ?? "Other", amount: toCents(g._sum.amount ?? 0), count: g._count._all }))
    .sort((a, b) => b.amount - a.amount);
  return { total: byCategory.reduce((a, c) => a + c.amount, 0), byCategory };
}

export async function getGcashSummary(range: Range) {
  const [opening, closing, grouped] = await Promise.all([
    getGcashBalance(range.from),
    getGcashBalance(range.to),
    db.gcashTransaction.groupBy({
      by: ["type"],
      where: { createdAt: inRange(range) },
      _sum: { amount: true, serviceFee: true },
      _count: { _all: true },
    }),
  ]);
  const pick = (t: "CASH_IN" | "CASH_OUT") => grouped.find((g) => g.type === t);
  return {
    openingBalance: opening.balance,
    cashIn: toCents(pick("CASH_IN")?._sum.amount ?? 0),
    cashOut: toCents(pick("CASH_OUT")?._sum.amount ?? 0),
    gcashProductSales: closing.gcashSales - opening.gcashSales,
    serviceFees: grouped.reduce((a, g) => a + toCents(g._sum.serviceFee ?? 0), 0),
    cashInCount: pick("CASH_IN")?._count._all ?? 0,
    cashOutCount: pick("CASH_OUT")?._count._all ?? 0,
    closingBalance: closing.balance,
  };
}

export async function listGcash(range: Range | null, take = 100) {
  const rows = await db.gcashTransaction.findMany({
    where: range ? { createdAt: inRange(range) } : undefined,
    orderBy: { createdAt: "desc" },
    take,
    include: { createdBy: { select: { name: true } } },
  });
  return rows.map((t) => ({
    id: t.id,
    type: t.type,
    amount: toCents(t.amount),
    serviceFee: toCents(t.serviceFee),
    customerReference: t.customerReference,
    notes: t.notes,
    createdAt: t.createdAt.toISOString(),
    createdBy: t.createdBy.name,
  }));
}

export async function getInventorySummary() {
  const products = await db.product.findMany({
    where: { archived: false },
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    include: { category: { select: { name: true } } },
  });
  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category.name,
    stock: p.stock,
    lowStockLevel: p.lowStockLevel,
    costPrice: toCents(p.costPrice),
    sellingPrice: toCents(p.sellingPrice),
    status: stockStatus(p.stock, p.lowStockLevel),
    stockCost: toCents(p.costPrice) * Math.max(p.stock, 0),
  }));
  return {
    totalProducts: rows.length,
    lowStock: rows.filter((r) => r.status === "LOW_STOCK").length,
    outOfStock: rows.filter((r) => r.status === "OUT_OF_STOCK").length,
    inventoryCost: rows.reduce((a, r) => a + r.stockCost, 0),
    rows,
  };
}

/** The simple profit picture: not formal accounting. */
export async function getProfitSummary(range: Range) {
  const [sales, expenses, gcash] = await Promise.all([getSalesSummary(range), getExpenseSummary(range), getGcashSummary(range)]);
  return {
    productSales: sales.totalSales,
    costOfGoods: sales.costOfGoods,
    grossProfit: sales.grossProfit,
    gcashFees: gcash.serviceFees,
    expenses: expenses.total,
    estimatedNetProfit: sales.grossProfit + gcash.serviceFees - expenses.total,
  };
}

export async function getLowStock(take = 8) {
  const products = await db.product.findMany({
    where: { archived: false },
    select: { id: true, name: true, stock: true, lowStockLevel: true },
    orderBy: { stock: "asc" },
  });
  return products.filter((p) => p.stock <= p.lowStockLevel).slice(0, take);
}

export async function getDashboard(now = new Date()) {
  const today = todayRange(now);
  const [sales, expenses, gcash, balance, lowStock, recentSales] = await Promise.all([
    getSalesSummary(today),
    getExpenseSummary(today),
    getGcashSummary(today),
    getGcashBalance(),
    getLowStock(),
    listSales(null, 8),
  ]);
  return {
    todaySales: sales.totalSales,
    todayExpenses: expenses.total,
    todayGrossProfit: sales.grossProfit,
    gcashBalance: balance.balance,
    lowStock,
    recentSales,
    movement: {
      cashSales: sales.cashSales,
      gcashSales: sales.gcashSales,
      gcashCashIn: gcash.cashIn,
      gcashCashOut: gcash.cashOut,
      serviceFees: gcash.serviceFees,
      expenses: expenses.total,
      estimatedNetProfit: sales.grossProfit + gcash.serviceFees - expenses.total,
    },
  };
}
