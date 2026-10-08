/**
 * End-to-end check of the store's money logic against a real PostgreSQL database.
 * Runs the "final test" scenario and a few safety checks (duplicate clicks, rollback).
 *
 *   DATABASE_URL=postgresql://.../kuyaje_pos_test npm run test:scenario
 *
 * It works on any database by comparing numbers BEFORE and AFTER, but use a test database
 * so the scenario's records don't mix with real store data.
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { db } from "../src/lib/db";
import { pesoCents } from "../src/lib/money";
import { createSale } from "../src/lib/services/sales";
import { recordGcashTransaction } from "../src/lib/services/gcash";
import { createExpense } from "../src/lib/services/expenses";
import { getDashboard, getProfitSummary } from "../src/lib/services/reports";
import { manilaDateKey, todayRange } from "../src/lib/time";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures++;
  const fmt = (v: unknown) => (typeof v === "number" && label.includes("₱") ? pesoCents(v) : String(v));
  console.log(`${ok ? "  ✔" : "  ✘"} ${label}: ${fmt(actual)}${ok ? "" : `   (expected ${fmt(expected)})`}`);
}

async function main() {
  const owner = await db.user.findUniqueOrThrow({ where: { username: "owner" } });
  const coke = await db.product.findFirstOrThrow({ where: { name: "Coca-Cola 1.5L" } });
  // Put the product into the exact starting state of the scenario.
  await db.product.update({ where: { id: coke.id }, data: { costPrice: "65.00", sellingPrice: "85.00", stock: 20 } });

  const before = await getDashboard();
  const profitBefore = await getProfitSummary(todayRange());

  console.log("\n1) Sell 2 × Coca-Cola 1.5L, customer pays ₱200 cash");
  const requestId = randomUUID();
  const saleInput = {
    clientRequestId: requestId,
    items: [{ productId: coke.id, quantity: 2 }],
    discountType: "NONE" as const,
    discountValue: "",
    paymentMethod: "CASH" as const,
    amountReceived: "200",
  };
  const sale = await createSale(saleInput, owner.id);
  const saved = await db.sale.findUniqueOrThrow({ where: { id: sale.saleId } });
  check("Total ₱", Math.round(Number(saved.total) * 100), 170_00);
  check("Change ₱", Math.round(Number(saved.change) * 100), 30_00);
  check("Gross profit ₱", Math.round(Number(saved.grossProfit) * 100), 40_00);
  const cokeAfter = await db.product.findUniqueOrThrow({ where: { id: coke.id } });
  check("Inventory left", cokeAfter.stock, 18);
  const movements = await db.inventoryMovement.count({ where: { saleId: sale.saleId } });
  check("Inventory movement recorded", movements, 1);

  console.log("\n   Double-click protection: submit the same sale again");
  const dup = await createSale(saleInput, owner.id);
  check("Same receipt returned", dup.saleId, sale.saleId);
  check("Stock still", (await db.product.findUniqueOrThrow({ where: { id: coke.id } })).stock, 18);

  console.log("\n   Rollback: try to sell more than in stock");
  const salesCountBefore = await db.sale.count();
  try {
    await createSale({ ...saleInput, clientRequestId: randomUUID(), items: [{ productId: coke.id, quantity: 500 }], amountReceived: "100000" }, owner.id);
    check("Oversell blocked", "sale created", "error");
  } catch (e) {
    check("Oversell blocked", (e as Error).message.startsWith("Not enough stock"), true);
  }
  check("No sale saved", await db.sale.count(), salesCountBefore);
  check("Stock unchanged", (await db.product.findUniqueOrThrow({ where: { id: coke.id } })).stock, 18);

  console.log("\n2) GCash Cash In ₱1,000, fee ₱10");
  const cashInId = randomUUID();
  await recordGcashTransaction({ clientRequestId: cashInId, type: "CASH_IN", amount: "1000", serviceFee: "10" }, owner.id);
  await recordGcashTransaction({ clientRequestId: cashInId, type: "CASH_IN", amount: "1000", serviceFee: "10" }, owner.id); // repeated click
  const afterCashIn = await getDashboard();
  check("GCash balance change ₱", afterCashIn.gcashBalance - before.gcashBalance, 1000_00);
  check("Service income change ₱", afterCashIn.movement.serviceFees - before.movement.serviceFees, 10_00);
  check("Product sales NOT affected ₱", afterCashIn.todaySales - before.todaySales, 170_00);

  console.log("\n3) GCash Cash Out ₱500, fee ₱5");
  await recordGcashTransaction({ clientRequestId: randomUUID(), type: "CASH_OUT", amount: "500", serviceFee: "5" }, owner.id);
  const afterCashOut = await getDashboard();
  check("GCash balance change ₱", afterCashOut.gcashBalance - afterCashIn.gcashBalance, -500_00);
  check("Service income change ₱", afterCashOut.movement.serviceFees - afterCashIn.movement.serviceFees, 5_00);

  console.log("\n4) Expense ₱300");
  const cat = await db.expenseCategory.findFirstOrThrow({ where: { name: "Supplies" } });
  await createExpense({ name: "Plastic bags", categoryId: cat.id, amount: "300", date: manilaDateKey() }, owner.id);

  console.log("\n5) Dashboard after everything (change since start of test)");
  const after = await getDashboard();
  const profitAfter = await getProfitSummary(todayRange());
  check("Today's sales ₱", after.todaySales - before.todaySales, 170_00);
  check("Cash sales ₱", after.movement.cashSales - before.movement.cashSales, 170_00);
  check("GCash sales ₱", after.movement.gcashSales - before.movement.gcashSales, 0);
  check("GCash Cash In ₱", after.movement.gcashCashIn - before.movement.gcashCashIn, 1000_00);
  check("GCash Cash Out ₱", after.movement.gcashCashOut - before.movement.gcashCashOut, 500_00);
  check("Today's expenses ₱", after.todayExpenses - before.todayExpenses, 300_00);
  check("Today's gross profit ₱", after.todayGrossProfit - before.todayGrossProfit, 40_00);
  check("GCash balance ₱", after.gcashBalance - before.gcashBalance, 500_00);
  check("Service fees ₱", profitAfter.gcashFees - profitBefore.gcashFees, 15_00);
  // 40 gross profit + 15 fees − 300 expense = −245
  check("Estimated net profit ₱", profitAfter.estimatedNetProfit - profitBefore.estimatedNetProfit, -245_00);

  console.log(failures === 0 ? "\nALL CHECKS PASSED\n" : `\n${failures} CHECK(S) FAILED\n`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
