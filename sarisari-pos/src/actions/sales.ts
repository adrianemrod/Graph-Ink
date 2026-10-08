"use server";

import { refresh } from "next/cache";
import { requireActionUser } from "@/lib/auth";
import { runAction } from "@/lib/action";
import { createSale, type SaleInput } from "@/lib/services/sales";

export async function completeSale(input: SaleInput) {
  const result = await runAction(async () => {
    const user = await requireActionUser();
    return createSale(input, user.id);
  });
  if (result.ok) refresh();
  return result;
}
