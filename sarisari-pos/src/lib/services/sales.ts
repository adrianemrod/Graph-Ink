import { db } from "@/lib/db";
import { computeDiscountCents, fromCents, toCents, type DiscountKind } from "@/lib/money";
import { isUniqueViolation, UserError } from "./errors";

export type SaleInput = {
  clientRequestId: string;
  items: { productId: string; quantity: number }[];
  discountType: DiscountKind;
  discountValue: string; // pesos for FIXED, percent for PERCENT
  paymentMethod: "CASH" | "GCASH";
  amountReceived: string; // only used for CASH
};

export type SaleResult = { saleId: string; receiptNo: number; duplicate: boolean };

/**
 * Complete a product sale. Everything happens in ONE database transaction:
 * create sale + items, reduce stock (never below zero), record inventory movements.
 * If anything fails, nothing is saved. Repeating the same clientRequestId returns the
 * original sale instead of creating a second one.
 */
export async function createSale(input: SaleInput, userId: string): Promise<SaleResult> {
  if (!input.clientRequestId || input.clientRequestId.length > 100) throw new UserError("Invalid request. Please try again.");

  const existing = await db.sale.findUnique({ where: { clientRequestId: input.clientRequestId }, select: { id: true, receiptNo: true } });
  if (existing) return { saleId: existing.id, receiptNo: existing.receiptNo, duplicate: true };

  // Merge repeated lines and validate quantities.
  const qtyById = new Map<string, number>();
  for (const item of input.items ?? []) {
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 9999) throw new UserError("Quantities must be whole numbers from 1 to 9999.");
    qtyById.set(item.productId, (qtyById.get(item.productId) ?? 0) + qty);
  }
  if (qtyById.size === 0) throw new UserError("The cart is empty.");
  if (!["CASH", "GCASH"].includes(input.paymentMethod)) throw new UserError("Choose Cash or GCash.");

  const discountType: DiscountKind = ["PERCENT", "FIXED"].includes(input.discountType) ? input.discountType : "NONE";
  const discountValueCents = discountType === "NONE" ? 0 : toCents(input.discountValue);
  if (Number.isNaN(discountValueCents) || discountValueCents < 0) throw new UserError("Discount is not a valid number.");
  if (discountType === "PERCENT" && discountValueCents > 100_00) throw new UserError("Percentage discount cannot be more than 100%.");

  try {
    return await db.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: [...qtyById.keys()] } } });
      const byId = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      let costTotal = 0;
      const lines = [...qtyById.entries()].map(([productId, quantity]) => {
        const product = byId.get(productId);
        if (!product || product.archived) throw new UserError("A product in the cart is no longer available.");
        const unitPrice = toCents(product.sellingPrice);
        const unitCost = toCents(product.costPrice);
        subtotal += unitPrice * quantity;
        costTotal += unitCost * quantity;
        return { product, quantity, unitPrice, unitCost };
      });

      if (discountType === "FIXED" && discountValueCents > subtotal) throw new UserError("Discount cannot be bigger than the subtotal.");
      const discount = computeDiscountCents(subtotal, discountType, discountValueCents);
      const total = subtotal - discount;

      let received = total;
      let change = 0;
      if (input.paymentMethod === "CASH") {
        received = toCents(input.amountReceived);
        if (Number.isNaN(received)) throw new UserError("Enter the cash amount the customer gave.");
        if (received < total) throw new UserError(`Cash received is short by ₱${fromCents(total - received)}.`);
        change = received - total;
      }

      const sale = await tx.sale.create({
        data: {
          clientRequestId: input.clientRequestId,
          subtotal: fromCents(subtotal),
          discountType,
          discountValue: fromCents(discountValueCents),
          discountAmount: fromCents(discount),
          total: fromCents(total),
          costTotal: fromCents(costTotal),
          grossProfit: fromCents(total - costTotal),
          paymentMethod: input.paymentMethod,
          amountReceived: fromCents(received),
          change: fromCents(change),
          cashierId: userId,
          items: {
            create: lines.map((l) => ({
              productId: l.product.id,
              productName: l.product.name,
              quantity: l.quantity,
              unitPrice: fromCents(l.unitPrice),
              unitCost: fromCents(l.unitCost),
              lineTotal: fromCents(l.unitPrice * l.quantity),
              lineCost: fromCents(l.unitCost * l.quantity),
            })),
          },
        },
        select: { id: true, receiptNo: true },
      });

      for (const l of lines) {
        // Conditional decrement: only succeeds if enough stock remains (safe with concurrent sales).
        const updated = await tx.product.updateMany({
          where: { id: l.product.id, stock: { gte: l.quantity } },
          data: { stock: { decrement: l.quantity } },
        });
        if (updated.count !== 1) {
          const fresh = await tx.product.findUnique({ where: { id: l.product.id }, select: { stock: true } });
          throw new UserError(`Not enough stock for ${l.product.name}. Only ${fresh?.stock ?? 0} left.`);
        }
        const after = await tx.product.findUniqueOrThrow({ where: { id: l.product.id }, select: { stock: true } });
        await tx.inventoryMovement.create({
          data: {
            productId: l.product.id,
            type: "SALE",
            quantity: -l.quantity,
            stockBefore: after.stock + l.quantity,
            stockAfter: after.stock,
            saleId: sale.id,
            userId,
          },
        });
      }

      return { saleId: sale.id, receiptNo: sale.receiptNo, duplicate: false };
    });
  } catch (err) {
    if (isUniqueViolation(err, "clientRequestId")) {
      const again = await db.sale.findUnique({ where: { clientRequestId: input.clientRequestId }, select: { id: true, receiptNo: true } });
      if (again) return { saleId: again.id, receiptNo: again.receiptNo, duplicate: true };
    }
    throw err;
  }
}

export function formatReceiptNo(n: number): string {
  return `R-${String(n).padStart(6, "0")}`;
}
