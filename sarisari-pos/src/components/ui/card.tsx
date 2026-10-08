import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-line bg-white shadow-soft", className)} {...props} />;
}

export function CardHeader({ title, description, action, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-900">{title}</h2>
        {description ? <p className="mt-0.5 text-[13px] text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({ tone = "slate", children, className }: { tone?: "slate" | "green" | "amber" | "red" | "blue" | "ink"; children: ReactNode; className?: string }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-accent-50 text-accent-700 ring-accent-600/15",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
    red: "bg-red-50 text-red-700 ring-red-600/15",
    blue: "bg-sky-50 text-sky-700 ring-sky-600/15",
    ink: "bg-ink-900 text-white",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-transparent ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon ? <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 [&_svg]:size-5">{icon}</div> : null}
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      {children ? <div className="mt-1 text-[13px] text-slate-500">{children}</div> : null}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink-900 sm:text-[28px]">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** A big, readable number. */
export function Stat({ label, value, hint, tone = "default", className }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "default" | "accent" | "dark"; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-soft",
        tone === "dark" ? "border-ink-800 bg-ink-900 text-white" : "border-line bg-white",
        className,
      )}
    >
      <p className={cn("text-[11px] font-semibold uppercase tracking-[0.08em]", tone === "dark" ? "text-slate-400" : "text-slate-500")}>{label}</p>
      <p className={cn("num mt-2 text-[26px] font-semibold leading-none tracking-[-0.03em] sm:text-[30px]", tone === "accent" && "text-accent-700")}>{value}</p>
      {hint ? <p className={cn("mt-2 text-xs", tone === "dark" ? "text-slate-400" : "text-slate-500")}>{hint}</p> : null}
    </div>
  );
}

/** A label / amount row used in summaries. */
export function Row({ label, value, strong, muted, sign, className }: { label: ReactNode; value: ReactNode; strong?: boolean; muted?: boolean; sign?: "+" | "−"; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-2.5", className)}>
      <span className={cn("text-sm", strong ? "font-semibold text-ink-900" : muted ? "text-slate-400" : "text-slate-600")}>{label}</span>
      <span className={cn("num text-sm", strong ? "text-base font-semibold text-ink-900" : "font-medium text-ink-900", muted && "text-slate-400")}>
        {sign ? <span className="mr-1 text-slate-400">{sign}</span> : null}
        {value}
      </span>
    </div>
  );
}
