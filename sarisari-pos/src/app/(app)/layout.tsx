import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  const settings = await db.storeSettings.findUnique({ where: { id: 1 }, select: { storeName: true } });
  return (
    <AppShell user={{ name: user.name, role: user.role }} storeName={settings?.storeName ?? "KUYA JE SARISARI STORE"}>
      {children}
    </AppShell>
  );
}
