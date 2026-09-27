"use client";

import { cn } from "@/lib/cn";
import { Check } from "@/components/ui/Icons";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-center gap-2 text-sm font-medium text-gi-pink" role="alert">
      <span aria-hidden className="block size-1.5 bg-gi-magenta" />
      {message}
    </p>
  );
}

export function StepHeader({ n, total, title, lead }: { n: number; total: number; title: string; lead?: string }) {
  return (
    <header>
      <p className="spec text-smoke">
        Step {String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
      <h2 tabIndex={-1} data-step-title className="mt-3 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.04em] outline-none">
        {title}
      </h2>
      {lead && <p className="mt-4 max-w-xl text-smoke">{lead}</p>}
    </header>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  optional?: boolean;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  min?: string;
  maxLength?: number;
  className?: string;
};

export function TextField({ id, label, value, onChange, error, hint, optional, type = "text", multiline, placeholder, autoComplete, inputMode, min, maxLength, className }: TextFieldProps) {
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  const base = cn(
    "mt-2 block w-full rounded-none border bg-paper px-4 text-base text-ink placeholder:text-mute transition-colors focus:border-ink focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-gi-cyan/30",
    error ? "border-gi-magenta" : "border-ink/20 hover:border-ink/40",
  );
  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-4 text-sm font-semibold">
        <span>{label}</span>
        {optional && <span className="spec font-normal text-mute">Optional</span>}
      </label>
      {hint && <p id={`${id}-hint`} className="mt-1 text-sm text-smoke">{hint}</p>}
      {multiline ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} maxLength={maxLength} aria-invalid={!!error} aria-describedby={describedBy} className={cn(base, "resize-y py-3")} />
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode} min={min} maxLength={maxLength} aria-invalid={!!error} aria-describedby={describedBy} className={cn(base, "h-12")} />
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/** Radio group rendered as selectable cards. */
export function ChoiceGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  columns = "sm:grid-cols-3",
  hideLegend,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string; hint?: string; visual?: React.ReactNode }[];
  value: string;
  onChange: (v: T) => void;
  error?: string;
  columns?: string;
  hideLegend?: boolean;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined} aria-invalid={!!error || undefined}>
      <legend className={cn("text-sm font-semibold", hideLegend && "sr-only")}>{legend}</legend>
      <div className={cn("mt-3 grid grid-cols-2 gap-2", columns)}>
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "group relative flex cursor-pointer flex-col justify-between border bg-paper p-4 transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gi-cyan",
                checked ? "border-ink shadow-[inset_0_0_0_1px_var(--color-ink)]" : "border-ink/15 hover:border-ink/40",
                o.visual ? "min-h-[9rem]" : "min-h-[4.5rem]",
              )}
            >
              <input type="radio" name={name} value={o.value} checked={checked} onChange={() => onChange(o.value)} className="sr-only" />
              {o.visual && <span className="pointer-events-none -mx-2 -mt-2 mb-2 block aspect-[4/3] transition-transform duration-500 group-hover:-translate-y-0.5">{o.visual}</span>}
              <span className="flex items-start justify-between gap-2">
                <span>
                  <span className="block font-semibold leading-tight">{o.label}</span>
                  {o.hint && <span className="mt-1 block text-xs text-smoke">{o.hint}</span>}
                </span>
                <span aria-hidden className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center border transition-colors", checked ? "border-ink bg-ink text-paper" : "border-ink/25")}>
                  {checked && <Check size={12} />}
                </span>
              </span>
              {checked && <span aria-hidden className="spectrum-bar absolute inset-x-0 bottom-0 h-[3px]" />}
            </label>
          );
        })}
      </div>
      <FieldError id={`${name}-error`} message={error} />
    </fieldset>
  );
}

export function CheckGroup({
  name,
  legend,
  options,
  values,
  onToggle,
  error,
}: {
  name: string;
  legend: string;
  options: readonly string[];
  values: string[];
  onToggle: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((o) => {
          const checked = values.includes(o);
          return (
            <label key={o} className={cn("relative flex min-h-[4rem] cursor-pointer items-center justify-between gap-3 border bg-paper p-4 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gi-cyan", checked ? "border-ink shadow-[inset_0_0_0_1px_var(--color-ink)]" : "border-ink/15 hover:border-ink/40")}>
              <input type="checkbox" name={name} value={o} checked={checked} onChange={() => onToggle(o)} className="sr-only" />
              <span className="font-semibold leading-tight">{o}</span>
              <span aria-hidden className={cn("flex size-5 shrink-0 items-center justify-center border", checked ? "border-ink bg-ink text-paper" : "border-ink/25")}>{checked && <Check size={12} />}</span>
            </label>
          );
        })}
      </div>
      <FieldError id={`${name}-error`} message={error} />
    </fieldset>
  );
}

export function Chips({ label, options, onPick, active }: { label: string; options: string[]; onPick: (v: string) => void; active?: string }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onPick(o)}
          aria-pressed={active === o}
          className={cn("h-8 border px-3 text-xs font-semibold transition-colors", active === o ? "border-ink bg-ink text-paper" : "border-ink/15 bg-paper hover:border-ink/50")}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
