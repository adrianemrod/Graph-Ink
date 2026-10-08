import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { BrandMark } from "@/components/brand";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  await connection(); // render per request so the current store name shows
  const settings = await db.storeSettings.findUnique({ where: { id: 1 }, select: { storeName: true } });
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-ink-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 size-[480px] rounded-full bg-accent-600/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <BrandMark />
          <span className="text-sm font-semibold tracking-wide text-slate-300">Store Manager</span>
        </div>
        <div className="relative">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-accent-500">Welcome back</p>
          <h1 className="mt-4 max-w-md text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">{settings?.storeName ?? "KUYA JE SARISARI STORE"}</h1>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-slate-400">
            Sales, stock, expenses and GCash — all in one simple place.
          </p>
        </div>
        <p className="relative text-xs text-slate-500">₱ PHP · Asia/Manila</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandMark />
            <h1 className="mt-5 text-2xl font-semibold tracking-[-0.02em]">{settings?.storeName ?? "KUYA JE SARISARI STORE"}</h1>
          </div>
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink-900">Log in</h2>
          <p className="mt-1 text-sm text-slate-500">Use your owner or cashier account.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
