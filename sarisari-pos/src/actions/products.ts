"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { requireActionUser } from "@/lib/auth";
import { runAction } from "@/lib/action";
import { cleanText, UserError } from "@/lib/services/errors";
import {
  addStock as addStockService,
  adjustStock as adjustStockService,
  createProduct,
  deleteProductIfUnused,
  setProductArchived,
  updateProduct,
  type ProductInput,
} from "@/lib/services/inventory";

async function owner() {
  return requireActionUser("OWNER");
}

function done<T>(r: T) {
  refresh();
  return r;
}

export async function saveProduct(id: string | null, input: ProductInput) {
  return runAction(async () => {
    const user = await owner();
    if (id) await updateProduct(id, input);
    else await createProduct(input, user.id);
    return done(undefined);
  });
}

export async function archiveProduct(id: string, archived: boolean) {
  return runAction(async () => {
    await owner();
    await setProductArchived(id, archived);
    return done(undefined);
  });
}

export async function deleteProduct(id: string) {
  return runAction(async () => {
    await owner();
    await deleteProductIfUnused(id);
    return done(undefined);
  });
}

export async function addStock(input: { productId: string; quantity: string; notes?: string }) {
  return runAction(async () => {
    const user = await owner();
    return done(await addStockService(input, user.id));
  });
}

export async function adjustStock(input: { productId: string; reason: string; quantity?: string; actualCount?: string; notes?: string }) {
  return runAction(async () => {
    const user = await owner();
    return done(await adjustStockService(input, user.id));
  });
}

// ---- Categories (editable) ----

export async function saveCategory(id: string | null, nameRaw: string) {
  return runAction(async () => {
    await owner();
    const name = cleanText(nameRaw, 60);
    if (!name) throw new UserError("Category name is required.");
    const clash = await db.category.findFirst({ where: { name: { equals: name, mode: "insensitive" }, NOT: id ? { id } : undefined } });
    if (clash) throw new UserError("A category with this name already exists.");
    if (id) await db.category.update({ where: { id }, data: { name } });
    else {
      const max = await db.category.aggregate({ _max: { sortOrder: true } });
      await db.category.create({ data: { name, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
    }
    return done(undefined);
  });
}

export async function deleteCategory(id: string) {
  return runAction(async () => {
    await owner();
    const count = await db.product.count({ where: { categoryId: id } });
    if (count > 0) throw new UserError(`This category still has ${count} product(s). Move them first.`);
    await db.category.delete({ where: { id } });
    return done(undefined);
  });
}
