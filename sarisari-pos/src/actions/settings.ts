"use server";

import bcrypt from "bcryptjs";
import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { requireActionUser } from "@/lib/auth";
import { runAction } from "@/lib/action";
import { fromCents, parseMoneyInput } from "@/lib/money";
import { cleanText, UserError } from "@/lib/services/errors";

export async function saveSettings(input: { storeName: string; storeAddress: string; contactNumber: string; startingGcashBalance: string; receiptFooter: string }) {
  const result = await runAction(async () => {
    await requireActionUser("OWNER");
    const storeName = cleanText(input.storeName, 80);
    if (!storeName) throw new UserError("Store name is required.");
    const balance = parseMoneyInput(input.startingGcashBalance, { label: "Starting GCash balance", allowZero: true });
    if ("error" in balance) throw new UserError(balance.error);
    const data = {
      storeName,
      storeAddress: cleanText(input.storeAddress, 200),
      contactNumber: cleanText(input.contactNumber, 40),
      startingGcashBalance: fromCents(balance.cents),
      receiptFooter: cleanText(input.receiptFooter, 200),
    };
    await db.storeSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  });
  if (result.ok) refresh();
  return result;
}

export async function changePassword(input: { userId: string; password: string }) {
  return runAction(async () => {
    await requireActionUser("OWNER");
    if (input.password.length < 6) throw new UserError("Password must be at least 6 characters.");
    await db.user.update({ where: { id: input.userId }, data: { passwordHash: await bcrypt.hash(input.password, 10) } });
  });
}
