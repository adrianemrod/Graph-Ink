import type { Metadata } from "next";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getInventorySummary } from "@/lib/services/reports";
import { InventoryView } from "./inventory-view";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage(props: PageProps<"/inventory">) {
  await requirePageUser("OWNER");
  const sp = await props.searchParams;
  const [inv, movements] = await Promise.all([
    getInventorySummary(),
    db.inventoryMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { product: { select: { name: true } }, user: { select: { name: true } }, sale: { select: { receiptNo: true } } },
    }),
  ]);
  return (
    <InventoryView
      rows={inv.rows}
      initialFilter={sp.filter === "low" ? "low" : sp.filter === "out" ? "out" : "all"}
      counts={{ total: inv.totalProducts, low: inv.lowStock, out: inv.outOfStock }}
      movements={movements.map((m) => ({
        id: m.id,
        product: m.product.name,
        type: m.type,
        quantity: m.quantity,
        stockAfter: m.stockAfter,
        reason: m.reason,
        notes: m.notes,
        receiptNo: m.sale?.receiptNo ?? null,
        user: m.user.name,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}
