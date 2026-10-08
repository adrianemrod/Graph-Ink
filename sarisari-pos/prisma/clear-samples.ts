/**
 * Removes SAMPLE products (isSample = true).
 * Products that already have real sales are archived instead of deleted,
 * so your sales history stays correct.
 */
import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  const samples = await db.product.findMany({ where: { isSample: true }, select: { id: true, name: true, _count: { select: { saleItems: true } } } });
  let deleted = 0;
  let archived = 0;
  for (const p of samples) {
    if (p._count.saleItems > 0) {
      await db.product.update({ where: { id: p.id }, data: { archived: true } });
      archived++;
    } else {
      await db.$transaction([db.inventoryMovement.deleteMany({ where: { productId: p.id } }), db.product.delete({ where: { id: p.id } })]);
      deleted++;
    }
  }
  console.log(`Sample products removed: ${deleted} deleted, ${archived} archived (they had sales).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
