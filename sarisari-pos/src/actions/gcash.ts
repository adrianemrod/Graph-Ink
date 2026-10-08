"use server";

import { refresh } from "next/cache";
import { requireActionUser } from "@/lib/auth";
import { runAction } from "@/lib/action";
import { recordGcashTransaction, type GcashInput } from "@/lib/services/gcash";

export async function recordGcash(input: GcashInput) {
  const result = await runAction(async () => {
    const user = await requireActionUser();
    const { transaction, duplicate } = await recordGcashTransaction(input, user.id);
    return { id: transaction.id, duplicate };
  });
  if (result.ok) refresh();
  return result;
}
