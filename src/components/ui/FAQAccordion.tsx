"use client";

import { useId, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import type { FAQ } from "@/content/faq";
import { Plus } from "./Icons";
import { cn } from "@/lib/cn";

export function FAQAccordion({ items, defaultOpen = 0 }: { items: FAQ[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const uid = useId();
  return (
    <div className="border-t border-ink/15">
      {items.map((f, i) => {
        const isOpen = open === i;
        const btn = `${uid}-b${i}`;
        const panel = `${uid}-p${i}`;
        return (
          <div key={f.q} className="border-b border-ink/15">
            <h3>
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center gap-6 py-6 text-left"
              >
                <span className="spec w-8 shrink-0 text-mute">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-lg font-semibold tracking-[-0.02em] md:text-xl">{f.q}</span>
                <span className={cn("flex size-9 shrink-0 items-center justify-center border transition-all duration-300", isOpen ? "rotate-45 border-ink bg-ink text-paper" : "border-ink/20 group-hover:border-ink")}>
                  <Plus size={16} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  id={panel}
                  role="region"
                  aria-labelledby={btn}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pb-7 pl-14 pr-12 leading-relaxed text-smoke">{f.a}</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
