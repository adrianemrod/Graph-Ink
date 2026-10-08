import type { Metadata } from "next";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCents } from "@/lib/money";
import { ProductsView, type ProductRow } from "./products-view";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  await requirePageUser("OWNER");
  const [products, categories] = await Promise.all([
    db.product.findMany({ orderBy: { name: "asc" }, include: { category: { select: { name: true } }, _count: { select: { saleItems: true } } } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } }),
  ]);
  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    categoryId: p.categoryId,
    category: p.category.name,
    cost: toCents(p.costPrice),
    price: toCents(p.sellingPrice),
    stock: p.stock,
    lowStockLevel: p.lowStockLevel,
    barcode: p.barcode,
    sku: p.sku,
    archived: p.archived,
    isSample: p.isSample,
    hasSales: p._count.saleItems > 0,
  }));
  return <ProductsView products={rows} categories={categories.map((c) => ({ id: c.id, name: c.name, count: c._count.products }))} />;
}
