import Link from "next/link";
import { cn } from "@/lib/cn";
import { ArrowRight } from "./Icons";

type Variant = "primary" | "secondary" | "ghost" | "light" | "outline-light";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-black",
  secondary: "border border-ink/80 text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink hover:text-ink/70 px-0!",
  light: "bg-paper text-ink hover:bg-paper-soft",
  "outline-light": "border border-paper/40 text-paper hover:border-paper hover:bg-paper hover:text-ink",
};
const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[0.75rem]",
  md: "h-12 px-6 text-[0.8125rem]",
  lg: "h-14 px-7 text-[0.875rem]",
};

type Common = { variant?: Variant; size?: Size; arrow?: boolean; className?: string; children: React.ReactNode };

/**
 * Premium CTA. Primary buttons carry a hairline of the GraphInk spectrum that
 * slides in on hover; the arrow nudges 6px.
 */
export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string }) {
  return cn(
    "group/btn relative isolate inline-flex select-none whitespace-nowrap items-center justify-center gap-3 overflow-hidden rounded-xs font-semibold uppercase tracking-[0.08em] transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-press)] active:scale-[0.98] disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

function Inner({ children, arrow, variant }: { children: React.ReactNode; arrow?: boolean; variant: Variant }) {
  return (
    <>
      <span className="relative z-10">{children}</span>
      {arrow && <ArrowRight size={16} className="relative z-10 transition-transform duration-300 ease-[var(--ease-press)] group-hover/btn:translate-x-1.5" />}
      {(variant === "primary" || variant === "light") && (
        <span aria-hidden className="spectrum-bar absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 ease-[var(--ease-press)] group-hover/btn:scale-x-100" />
      )}
    </>
  );
}

export function ButtonLink({ href, variant = "primary", size, arrow, className, children, ...rest }: Common & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const external = /^(https?:|mailto:|tel:|viber:)/.test(href);
  if (external) {
    return (
      <a href={href} className={buttonClasses({ variant, size, className })} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} onClick={rest.onClick as React.MouseEventHandler<HTMLAnchorElement>}>
        <Inner arrow={arrow} variant={variant}>{children}</Inner>
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })} {...rest}>
      <Inner arrow={arrow} variant={variant}>{children}</Inner>
    </Link>
  );
}

export function Button({ variant = "primary", size, arrow, className, children, ...rest }: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses({ variant, size, className })} {...rest}>
      <Inner arrow={arrow} variant={variant}>{children}</Inner>
    </button>
  );
}
