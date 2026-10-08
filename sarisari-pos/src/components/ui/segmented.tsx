"use client";

import { cn } from "@/lib/utils";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[];
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <div className={cn("inline-flex rounded-xl bg-slate-100 p-1", className)} role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 font-semibold transition",
            size === "lg" ? "h-12 text-[15px]" : "h-8 text-[13px]",
            value === o.value ? "bg-white text-ink-900 shadow-soft" : "text-slate-500 hover:text-ink-900",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
