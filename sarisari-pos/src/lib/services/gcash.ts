import { db } from "@/lib/db";
import { fromCents, parseMoneyInput, toCents } from "@/lib/money";
import { isUniqueViolation, optionalText, UserError } from "./errors";

/**
 * How each GCash service changes the store's GCash wallet balance.
 * Store rule: Cash In raises the GCash balance, Cash Out lowers it.
 * The service fee is store income and never changes the GCash balance.
 */
export const GCASH_BALANCE_DIRECTION = { CASH_IN: 1, CASH_OUT: -1 } as const;

export type GcashInput = {
  clientRequestId: string;
  type: "CASH_IN" | "CASH_OUT";
  amount: string;
  serviceFee: string;
  customerReference?: string;
  notes?: string;
};

export async function recordGcashTransaction(input: GcashInput, userId: string) {
  if (!input.clientRequestId || input.clientRequestId.length > 100) throw new UserError("Invalid request. Please try again.");
  if (input.type !== "CASH_IN" && input.type !== "CASH_OUT") throw new UserError("Choose Cash In or Cash Out.");
  const amount = parseMoneyInput(input.amount, { label: "Amount" });
  if ("error" in amount) throw new UserError(amount.error);
  const fee = parseMoneyInput(input.serviceFee, { label: "Service fee", allowZero: true });
  if ("error" in fee) throw new UserError(fee.error);

  const existing = await db.gcashTransaction.findUnique({ where: { clientRequestId: input.clientRequestId } });
  if (existing) return { transaction: existing, duplicate: true };

  try {
    const transaction = await db.gcashTransaction.create({
      data: {
        clientRequestId: input.clientRequestId,
        type: input.type,
        amount: fromCents(amount.cents),
        serviceFee: fromCents(fee.cents),
        customerReference: optionalText(input.customerReference, 120),
        notes: optionalText(input.notes, 300),
        createdById: userId,
      },
    });
    return { transaction, duplicate: false };
  } catch (err) {
    if (isUniqueViolation(err, "clientRequestId")) {
      const again = await db.gcashTransaction.findUnique({ where: { clientRequestId: input.clientRequestId } });
      if (again) return { transaction: again, duplicate: true };
    }
    throw err;
  }
}

export type GcashBalanceParts = {
  starting: number;
  cashIn: number;
  cashOut: number;
  gcashSales: number;
  balance: number;
};

/**
 * Running GCash wallet balance (in centavos) up to `before` (exclusive), or up to now.
 * = Starting balance + Cash In − Cash Out + product sales paid by GCash.
 */
export async function getGcashBalance(before?: Date): Promise<GcashBalanceParts> {
  const createdAt = before ? { lt: before } : undefined;
  const [settings, grouped, sales] = await Promise.all([
    db.storeSettings.findUnique({ where: { id: 1 }, select: { startingGcashBalance: true } }),
    db.gcashTransaction.groupBy({ by: ["type"], where: { createdAt }, _sum: { amount: true } }),
    db.sale.aggregate({ where: { paymentMethod: "GCASH", createdAt }, _sum: { total: true } }),
  ]);
  const starting = toCents(settings?.startingGcashBalance ?? 0);
  const cashIn = toCents(grouped.find((g) => g.type === "CASH_IN")?._sum.amount ?? 0);
  const cashOut = toCents(grouped.find((g) => g.type === "CASH_OUT")?._sum.amount ?? 0);
  const gcashSales = toCents(sales._sum.total ?? 0);
  const balance =
    starting + GCASH_BALANCE_DIRECTION.CASH_IN * cashIn + GCASH_BALANCE_DIRECTION.CASH_OUT * cashOut + gcashSales;
  return { starting, cashIn, cashOut, gcashSales, balance };
}
