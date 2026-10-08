"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESETS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom" },
];

export function RangeFilter({ preset, fromKey, toKey }: { preset: string; fromKey: string; toKey: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [from, setFrom] = useState(fromKey);
  const [to, setTo] = useState(toKey);
  const [showCustom, setShowCustom] = useState(preset === "custom");

  function go(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const k of ["range", "from", "to"]) sp.delete(k);
    for (const [k, v] of Object.entries(next)) sp.set(k, v);
    start(() => router.push(`${pathname}?${sp.toString()}`, { scroll: false }));
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 transition-opacity", pending && "opacity-60")}>
      <div className="inline-flex rounded-xl border border-line bg-white p-1 shadow-soft">
        {PRESETS.map((p) => {
          const active = showCustom ? p.value === "custom" : preset === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                if (p.value === "custom") setShowCustom(true);
                else {
                  setShowCustom(false);
                  go({ range: p.value });
                }
              }}
              className={cn(
                "h-8 rounded-lg px-3 text-[13px] font-semibold transition",
                active ? "bg-ink-900 text-white" : "text-slate-500 hover:text-ink-900",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      {showCustom ? (
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-1 pl-3 shadow-soft">
          <CalendarDays className="size-4 text-slate-400" />
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="h-8 bg-transparent text-[13px] outline-none" aria-label="From date" />
          <span className="text-slate-300">–</span>
          <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="h-8 bg-transparent text-[13px] outline-none" aria-label="To date" />
          <button type="button" onClick={() => go({ range: "custom", from, to })} className="h-8 rounded-lg bg-ink-900 px-3 text-[13px] font-semibold text-white">
            Apply
          </button>
        </div>
      ) : null}
    </div>
  );
}
