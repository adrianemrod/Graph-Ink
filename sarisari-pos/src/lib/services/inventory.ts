import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { fromCents, parseMoneyInput } from "@/lib/money";
import { cleanText, optionalText, UserError } from "./errors";

export const ADJUSTMENT_REASONS = ["Damaged", "Expired", "Lost", "Manual Correction"] as const;
export type AdjustmentReason = (typeof ADJUSTMENT_REASONS)[number];

type Tx = Prisma.TransactionClient;

async function lockStock(tx: Tx, productId: string): Promise<number> {
  const rows = await tx.$queryRaw<{ stock: number }[]>`SELECT "stock" FROM "Product" WHERE "id" = ${productId} FOR UPDATE`;
  if (rows.length === 0) throw new UserError("Product not found.");
  return rows[0].stock;
}

function parseQty(raw: unknown, label: string, { allowZero = false } = {}): number {
  const qty = typeof raw === "number" ? raw : Number(String(raw ?? "").trim());
  if (!Number.isInteger(qty) || qty < (allowZero ? 0 : 1) || qty > 999_999) {
    throw new UserError(`${label} must be a whole number${allowZero ? "" : " of at least 1"}.`);
  }
  return qty;
}

/** ADD STOCK: increase stock and record the movement. */
export async function addStock(input: { productId: string; quantity: unknown; notes?: string }, userId: string) {
  const qty = parseQty(input.quantity, "Quantity to add");
  return db.$transaction(async (tx) => {
    const before = await lockStock(tx, input.productId);
    const after = before + qty;
    await tx.product.update({ where: { id: input.productId }, data: { stock: after } });
    await tx.inventoryMovement.create({
      data: { productId: input.productId, type: "STOCK_IN", quantity: qty, stockBefore: before, stockAfter: after, notes: optionalText(input.notes, 300), userId },
    });
    return { before, after };
  });
}

/**
 * STOCK ADJUSTMENT. Damaged / Expired / Lost remove a quantity.
 * Manual Correction sets the stock to the actual count on the shelf.
 */
export async function adjustStock(
  input: { productId: string; reason: string; quantity?: unknown; actualCount?: unknown; notes?: string },
  userId: string,
) {
  const reason = ADJUSTMENT_REASONS.find((r) => r === input.reason);
  if (!reason) throw new UserError("Choose a reason for the adjustment.");

  return db.$transaction(async (tx) => {
    const before = await lockStock(tx, input.productId);
    let after: number;
    if (reason === "Manual Correction") {
      after = parseQty(input.actualCount, "Actual count", { allowZero: true });
    } else {
      const qty = parseQty(input.quantity, "Quantity to remove");
      if (qty > before) throw new UserError(`You can only remove up to ${before} (current stock).`);
      after = before - qty;
    }
    if (after === before) throw new UserError("Stock did not change.");
    await tx.product.update({ where: { id: input.productId }, data: { stock: after } });
    await tx.inventoryMovement.create({
      data: { productId: input.productId, type: "ADJUSTMENT", quantity: after - before, stockBefore: before, stockAfter: after, reason, notes: optionalText(input.notes, 300), userId },
    });
    return { before, after };
  });
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export type ProductInput = {
  name: string;
  categoryId: string;
  costPrice: string;
  sellingPrice: string;
  stock?: string | number; // only when adding a new product
  lowStockLevel: string | number;
  barcode?: string;
  sku?: string;
};

function parseProduct(input: ProductInput) {
  const name = cleanText(input.name, 120);
  if (!name) throw new UserError("Product name is required.");
  if (!input.categoryId) throw new UserError("Choose a category.");
  const cost = parseMoneyInput(input.costPrice, { label: "Cost price", allowZero: true });
  if ("error" in cost) throw new UserError(cost.error);
  const sell = parseMoneyInput(input.sellingPrice, { label: "Selling price" });
  if ("error" in sell) throw new UserError(sell.error);
  const lowStockLevel = parseQty(input.lowStockLevel, "Low stock level", { allowZero: true });
  return {
    name,
    categoryId: input.categoryId,
    costPrice: fromCents(cost.cents),
    sellingPrice: fromCents(sell.cents),
    lowStockLevel,
    barcode: optionalText(input.barcode, 64),
    sku: optionalText(input.sku, 64),
  };
}

function friendlyUnique(err: unknown): never {
  const msg = JSON.stringify((err as { meta?: unknown })?.meta ?? "");
  if ((err as { code?: string })?.code === "P2002") {
    if (msg.includes("barcode")) throw new UserError("Another product already uses this barcode.");
    if (msg.includes("sku")) throw new UserError("Another product already uses this SKU.");
  }
  throw err;
}

export async function createProduct(input: ProductInput, userId: string) {
  const data = parseProduct(input);
  const stock = parseQty(input.stock ?? 0, "Starting stock", { allowZero: true });
  try {
    return await db.$transaction(async (tx) => {
      const product = await tx.product.create({ data: { ...data, stock } });
      if (stock > 0) {
        await tx.inventoryMovement.create({
          data: { productId: product.id, type: "STOCK_IN", quantity: stock, stockBefore: 0, stockAfter: stock, notes: "Starting stock", userId },
        });
      }
      return product;
    });
  } catch (err) {
    friendlyUnique(err);
  }
}

/** Edit product details. Stock is changed only through Add Stock / Adjustment so it is always recorded. */
export async function updateProduct(id: string, input: ProductInput) {
  const data = parseProduct(input);
  try {
    return await db.product.update({ where: { id }, data });
  } catch (err) {
    friendlyUnique(err);
  }
}

export async function setProductArchived(id: string, archived: boolean) {
  return db.product.update({ where: { id }, data: { archived } });
}

/** Products with sales history are never deleted — they can only be archived. */
export async function deleteProductIfUnused(id: string) {
  const sold = await db.saleItem.count({ where: { productId: id } });
  if (sold > 0) throw new UserError("This product has sales history, so it can only be archived.");
  await db.$transaction([db.inventoryMovement.deleteMany({ where: { productId: id } }), db.product.delete({ where: { id } })]);
}
