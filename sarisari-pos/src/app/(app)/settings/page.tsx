import type { Metadata } from "next";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fromCents, toCents } from "@/lib/money";
import { SettingsView } from "./settings-view";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePageUser("OWNER");
  const [s, users] = await Promise.all([
    db.storeSettings.findUnique({ where: { id: 1 } }),
    db.user.findMany({ orderBy: { role: "asc" }, select: { id: true, name: true, username: true, role: true } }),
  ]);
  return (
    <SettingsView
      initial={{
        storeName: s?.storeName ?? "KUYA JE SARISARI STORE",
        storeAddress: s?.storeAddress ?? "",
        contactNumber: s?.contactNumber ?? "",
        startingGcashBalance: fromCents(toCents(s?.startingGcashBalance ?? 0)),
        receiptFooter: s?.receiptFooter ?? "",
      }}
      users={users}
    />
  );
}
