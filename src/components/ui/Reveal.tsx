"use client";

import { m, type Variants } from "framer-motion";

const EASE = [0.2, 0.8, 0.2, 1] as const;

const presets: Record<string, Variants> = {
  up: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  // Paper sliding in from the side, like a sheet feeding into a press.
  sheet: { hidden: { opacity: 0, x: -32, rotate: -1.2 }, show: { opacity: 1, x: 0, rotate: 0 } },
  // Clip reveal — like a sheet being uncovered.
  clip: { hidden: { clipPath: "inset(0 0 100% 0)" }, show: { clipPath: "inset(0 0 0% 0)" } },
};

export function Reveal({
  children,
  as = "div",
  variant = "up",
  delay = 0,
  duration = 0.7,
  className,
  once = true,
  amount = 0.25,
}: {
  children: React.ReactNode;
  as?: "div" | "li" | "section" | "span" | "article" | "header";
  variant?: keyof typeof presets;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}) {
  const Comp = m[as];
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={presets[variant]}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

/** Staggered children container. Wrap items in <RevealItem>. */
export function RevealGroup({ children, className, stagger = 0.06, as = "div" }: { children: React.ReactNode; className?: string; stagger?: number; as?: "div" | "ul" | "ol" }) {
  const Comp = m[as];
  return (
    <Comp className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}>
      {children}
    </Comp>
  );
}

export function RevealItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "li" | "article" }) {
  const Comp = m[as];
  return (
    <Comp className={className} variants={presets.up} transition={{ duration: 0.6, ease: EASE }}>
      {children}
    </Comp>
  );
}
