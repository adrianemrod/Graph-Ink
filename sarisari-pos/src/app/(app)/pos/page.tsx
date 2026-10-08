import type { Metadata } from "next";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCents } from "@/lib/money";
import { PosScreen, type PosProduct } from "./pos-screen";

export const metadata: Metadata = { title: "POS" };

export default async function PosPage() {
  await requirePageUser();
  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { archived: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true, barcode: true, sellingPrice: true, stock: true, lowStockLevel: true, categoryId: true },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  const list: PosProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode,
    price: toCents(p.sellingPrice),
    stock: p.stock,
    lowStockLevel: p.lowStockLevel,
    categoryId: p.categoryId,
  }));
  const used = new Set(list.map((p) => p.categoryId));

  return <PosScreen products={list} categories={categories.filter((c) => used.has(c.id))} />;
}
