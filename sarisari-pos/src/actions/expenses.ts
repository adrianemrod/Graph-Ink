"use server";

import { refresh } from "next/cache";
import { requireActionUser } from "@/lib/auth";
import { runAction } from "@/lib/action";
import { createExpense, createExpenseCategory, deleteExpense, updateExpense, type ExpenseInput } from "@/lib/services/expenses";

export async function saveExpense(id: string | null, input: ExpenseInput) {
  const result = await runAction(async () => {
    const user = await requireActionUser("OWNER");
    if (id) await updateExpense(id, input);
    else await createExpense(input, user.id);
  });
  if (result.ok) refresh();
  return result;
}

export async function removeExpense(id: string) {
  const result = await runAction(async () => {
    await requireActionUser("OWNER");
    await deleteExpense(id);
  });
  if (result.ok) refresh();
  return result;
}

export async function addExpenseCategory(name: string) {
  const result = await runAction(async () => {
    await requireActionUser("OWNER");
    const c = await createExpenseCategory(name);
    return { id: c.id, name: c.name };
  });
  if (result.ok) refresh();
  return result;
}
