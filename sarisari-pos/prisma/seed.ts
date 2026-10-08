/**
 * Seeds the development database.
 *  - Owner and cashier logins
 *  - Store settings (KUYA JE SARISARI STORE)
 *  - Product and expense categories
 *  - SAMPLE products (isSample = true). Remove them later with: npm run db:clear-samples
 *
 * Safe to run more than once.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

const PRODUCT_CATEGORIES = ["Drinks", "Snacks", "Noodles", "Canned Goods", "Coffee", "Personal Care", "Household", "Laundry", "Others"];
const EXPENSE_CATEGORIES = ["Electricity", "Water", "Internet", "Transportation", "Supplies", "Store Maintenance", "Other"];

// [name, category, cost, selling, stock, lowStockLevel, barcode]
const SAMPLE_PRODUCTS: [string, string, string, string, number, number, string | null][] = [
  ["Coca-Cola 1.5L", "Drinks", "65.00", "85.00", 20, 5, "4801981118502"],
  ["Sprite 1.5L", "Drinks", "63.00", "82.00", 12, 5, "4801981118519"],
  ["Royal Tru-Orange 1.5L", "Drinks", "63.00", "82.00", 3, 5, null],
  ["Bottled Water 500ml", "Drinks", "10.00", "15.00", 48, 12, null],
  ["C2 Green Tea Apple 500ml", "Drinks", "21.00", "28.00", 18, 6, null],
  ["Piattos Cheese 40g", "Snacks", "15.50", "20.00", 24, 6, null],
  ["Nova Country Cheddar 40g", "Snacks", "15.50", "20.00", 20, 6, null],
  ["SkyFlakes Crackers", "Snacks", "7.00", "9.00", 40, 10, null],
  ["Lucky Me Pancit Canton", "Noodles", "13.00", "17.00", 5, 10, "4807770270017"],
  ["Lucky Me Beef Mami", "Noodles", "9.00", "12.00", 30, 10, null],
  ["Century Tuna Flakes 155g", "Canned Goods", "30.00", "38.00", 16, 5, null],
  ["Argentina Corned Beef 150g", "Canned Goods", "35.00", "43.00", 14, 5, null],
  ["Ligo Sardines 155g", "Canned Goods", "21.00", "26.00", 20, 6, null],
  ["Nescafé 3-in-1 Original", "Coffee", "7.00", "9.00", 60, 15, null],
  ["Milo Sachet 22g", "Coffee", "9.00", "12.00", 40, 10, null],
  ["Bear Brand Sachet 33g", "Coffee", "10.00", "13.00", 36, 10, null],
  ["Safeguard Soap 60g", "Personal Care", "25.00", "32.00", 4, 5, null],
  ["Palmolive Shampoo Sachet", "Personal Care", "6.00", "8.00", 48, 12, null],
  ["Colgate Toothpaste 50ml", "Personal Care", "35.00", "45.00", 10, 3, null],
  ["Joy Dishwashing Sachet", "Household", "6.00", "8.00", 30, 10, null],
  ["Surf Powder Sachet 65g", "Laundry", "8.00", "10.00", 40, 10, null],
  ["Downy Sachet", "Laundry", "6.00", "8.00", 36, 10, null],
  ["Datu Puti Vinegar 385ml", "Others", "18.00", "23.00", 12, 4, null],
  ["Silver Swan Soy Sauce 385ml", "Others", "20.00", "25.00", 12, 4, null],
];

async function main() {
  const owner = await db.user.upsert({
    where: { username: "owner" },
    update: {},
    create: { username: "owner", name: "Kuya Je", role: "OWNER", passwordHash: await bcrypt.hash("owner123", 10) },
  });
  await db.user.upsert({
    where: { username: "cashier" },
    update: {},
    create: { username: "cashier", name: "Cashier", role: "CASHIER", passwordHash: await bcrypt.hash("cashier123", 10) },
  });

  await db.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, storeName: "KUYA JE SARISARI STORE", startingGcashBalance: "5000.00", receiptFooter: "Thank you! Come again." },
  });

  for (const [i, name] of PRODUCT_CATEGORIES.entries()) {
    await db.category.upsert({ where: { name }, update: {}, create: { name, sortOrder: i } });
  }
  for (const name of EXPENSE_CATEGORIES) {
    await db.expenseCategory.upsert({ where: { name }, update: {}, create: { name } });
  }

  const categories = new Map((await db.category.findMany()).map((c) => [c.name, c.id]));
  let created = 0;
  for (const [name, category, cost, sell, stock, low, barcode] of SAMPLE_PRODUCTS) {
    const exists = await db.product.findFirst({ where: { name } });
    if (exists) continue;
    await db.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: { name, categoryId: categories.get(category)!, costPrice: cost, sellingPrice: sell, stock, lowStockLevel: low, barcode, isSample: true },
      });
      await tx.inventoryMovement.create({
        data: { productId: p.id, type: "STOCK_IN", quantity: stock, stockBefore: 0, stockAfter: stock, notes: "Sample starting stock", userId: owner.id, isSample: true },
      });
    });
    created++;
  }

  console.log(`Seed complete. ${created} sample products added.`);
  console.log("Logins → owner / owner123   ·   cashier / cashier123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
