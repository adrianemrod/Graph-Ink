"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Smartphone,
  X,
} from "lucide-react";
import { logout } from "@/actions/auth";
import { BrandMark } from "@/components/brand";
import { cn } from "@/lib/utils";

type Role = "OWNER" | "CASHIER";

const NAV: { href: string; label: string; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["OWNER"] },
  { href: "/pos", label: "POS", icon: ShoppingCart, roles: ["OWNER", "CASHIER"] },
  { href: "/products", label: "Products", icon: Package, roles: ["OWNER"] },
  { href: "/inventory", label: "Inventory", icon: Boxes, roles: ["OWNER"] },
  { href: "/expenses", label: "Expenses", icon: ReceiptText, roles: ["OWNER"] },
  { href: "/gcash", label: "GCash", icon: Smartphone, roles: ["OWNER", "CASHIER"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["OWNER"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["OWNER"] },
];

export function AppShell({ user, storeName, children }: { user: { name: string; role: Role }; storeName: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => n.roles.includes(user.role));
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => setOpen(false), [pathname]);

  const nav = (variant: "rail" | "drawer") => (
    <nav className={cn("flex flex-col gap-1", variant === "rail" ? "px-3" : "px-4")}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center rounded-xl text-[13px] font-medium transition-colors",
              variant === "rail"
                ? "flex-col gap-1 px-1 py-2.5 xl:flex-row xl:gap-3 xl:px-3 xl:text-sm"
                : "gap-3 px-3 py-3 text-[15px]",
              active ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            <Icon className={cn("size-5 shrink-0", active ? "text-accent-500" : "")} strokeWidth={active ? 2.2 : 1.8} />
            <span className={cn(variant === "rail" && "text-[11px] xl:text-sm")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const footer = (variant: "rail" | "drawer") => (
    <div className={cn("border-t border-white/[0.06] pt-4", variant === "rail" ? "px-3" : "px-4")}>
      <div className={cn("mb-2 hidden px-3 xl:block", variant === "drawer" && "block")}>
        <p className="truncate text-sm font-medium text-white">{user.name}</p>
        <p className="text-xs text-slate-500">{user.role === "OWNER" ? "Owner" : "Cashier"}</p>
      </div>
      <form action={logout}>
        <button
          className={cn(
            "flex w-full items-center rounded-xl text-[13px] font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white",
            variant === "rail" ? "flex-col gap-1 py-2.5 xl:flex-row xl:gap-3 xl:px-3 xl:text-sm" : "gap-3 px-3 py-3 text-[15px]",
          )}
        >
          <LogOut className="size-5" strokeWidth={1.8} />
          <span className={cn(variant === "rail" && "text-[11px] xl:text-sm")}>Log out</span>
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-dvh lg:pl-[88px] xl:pl-60">
      {/* Desktop / tablet-landscape rail */}
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-[88px] flex-col justify-between bg-ink-900 py-5 lg:flex xl:w-60">
        <div>
          <div className="mb-6 flex items-center gap-3 px-5 xl:px-6">
            <BrandMark />
            <div className="hidden min-w-0 xl:block">
              <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-white">{storeName}</p>
              <p className="text-[11px] text-slate-500">Store Manager</p>
            </div>
          </div>
          {nav("rail")}
        </div>
        {footer("rail")}
      </aside>

      {/* Mobile / tablet-portrait top bar */}
      <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-ink-900 px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark className="size-8" />
          <p className="truncate text-[13px] font-semibold text-white">{storeName}</p>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink-950/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] animate-pop-in flex-col justify-between bg-ink-900 py-5">
            <div>
              <div className="mb-5 flex items-center justify-between px-6">
                <p className="text-sm font-semibold text-white">Menu</p>
                <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10" aria-label="Close menu">
                  <X className="size-5" />
                </button>
              </div>
              {nav("drawer")}
            </div>
            {footer("drawer")}
          </div>
        </div>
      ) : null}

      <main>{children}</main>
    </div>
  );
}
