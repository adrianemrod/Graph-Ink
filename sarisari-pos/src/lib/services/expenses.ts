import { db } from "@/lib/db";
import { fromCents, parseMoneyInput } from "@/lib/money";
import { isValidDateKey, manilaDateKey, startOfManilaDay } from "@/lib/time";
import { cleanText, optionalText, UserError } from "./errors";

export type ExpenseInput = {
  name: string;
  categoryId: string;
  amount: string;
  date: string; // YYYY-MM-DD (Manila)
  notes?: string;
};

function parseExpense(input: ExpenseInput) {
  const name = cleanText(input.name, 120);
  if (!name) throw new UserError("Expense name is required.");
  if (!input.categoryId) throw new UserError("Choose a category.");
  const amount = parseMoneyInput(input.amount, { label: "Amount" });
  if ("error" in amount) throw new UserError(amount.error);
  const dateKey = isValidDateKey(input.date) ? input.date : manilaDateKey();
  if (dateKey > manilaDateKey()) throw new UserError("Expense date cannot be in the future.");
  return {
    name,
    categoryId: input.categoryId,
    amount: fromCents(amount.cents),
    spentAt: startOfManilaDay(dateKey),
    notes: optionalText(input.notes, 300),
  };
}

export async function createExpense(input: ExpenseInput, userId: string) {
  return db.expense.create({ data: { ...parseExpense(input), createdById: userId } });
}

export async function updateExpense(id: string, input: ExpenseInput) {
  return db.expense.update({ where: { id }, data: parseExpense(input) });
}

export async function deleteExpense(id: string) {
  await db.expense.delete({ where: { id } });
}

export async function createExpenseCategory(nameRaw: string) {
  const name = cleanText(nameRaw, 60);
  if (!name) throw new UserError("Category name is required.");
  const existing = await db.expenseCategory.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  if (existing) return existing;
  return db.expenseCategory.create({ data: { name } });
}
