"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, m } from "framer-motion";
import { portfolio, portfolioFilters, type PortfolioFilter, type PortfolioItem } from "@/content/portfolio";
import { availableProducts } from "@/content/services";
import { PrintArtwork, accentHex } from "@/components/print/PrintArtwork";
import { ArrowRight, ArrowUpRight, Close } from "@/components/ui/Icons";
import { ButtonLink } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const EASE = [0.2, 0.8, 0.2, 1] as const;

function Label({ item, className }: { item: PortfolioItem; className?: string }) {
  return (
    <span className={cn("spec inline-flex items-center gap-1.5 bg-paper/90 px-2 py-1 text-ink backdrop-blur", className)}>
      <span className="block size-1.5" style={{ background: accentHex[item.accent] }} />
      {item.kind === "client" ? item.client ?? "Client work" : "Conceptual showcase"}
    </span>
  );
}

function Visual({ item, featured }: { item: PortfolioItem; featured?: boolean }) {
  if (item.image) {
    return <Image src={item.image} alt={item.title} fill sizes={featured ? "(min-width:1024px) 66vw, 100vw" : "(min-width:1024px) 33vw, 100vw"} className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />;
  }
  return (
    <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-press)] group-hover:scale-[1.05] group-hover:rotate-[-0.8deg]">
      <PrintArtwork kind={item.art} accent={item.accent} className="h-full w-full" />
    </div>
  );
}

export function PortfolioGrid({ limit, showFilters = true }: { limit?: number; showFilters?: boolean }) {
  const [filter, setFilter] = useState<PortfolioFilter>("All");
  const [open, setOpen] = useState<PortfolioItem | null>(null);

  const list = portfolio.filter((p) => filter === "All" || p.category === filter);
  const sorted = [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  const items = limit ? sorted.slice(0, limit) : sorted;

  return (
    <div>
      {showFilters && (
        <div role="toolbar" aria-label="Filter work" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          {portfolioFilters.map((f) => {
            const count = f === "All" ? portfolio.length : portfolio.filter((p) => p.category === f).length;
            if (count === 0) return null;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "relative h-10 shrink-0 border px-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] transition-colors",
                  filter === f ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/70 hover:border-ink/50 hover:text-ink",
                )}
              >
                {f}
                <span className="spec ml-2 opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <LayoutGroup>
        <m.ul layout className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => {
              const featured = i === 0 && filter === "All";
              return (
                <m.li
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className={cn(featured && "sm:col-span-2 lg:row-span-2")}
                >
                  <button
                    type="button"
                    onClick={() => { setOpen(item); track("portfolio_viewed", { id: item.id }); }}
                    className="group relative flex h-full w-full flex-col bg-paper text-left"
                    aria-haspopup="dialog"
                  >
                    <div className={cn("relative w-full overflow-hidden bg-paper-warm", featured ? "aspect-[4/3] lg:aspect-auto lg:flex-1" : "aspect-[4/3]")}>
                      <Visual item={item} featured={featured} />
                      <Label item={item} className="absolute left-3 top-3" />
                      <span className="absolute bottom-3 right-3 flex size-10 items-center justify-center bg-ink text-paper opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4 p-5">
                      <div>
                        <h3 className={cn("font-semibold uppercase tracking-[-0.02em]", featured ? "text-2xl md:text-3xl" : "text-lg")}>{item.title}</h3>
                        <p className="spec mt-2 text-smoke">{item.category}</p>
                        {featured && <p className="mt-3 max-w-lg text-smoke">{item.summary}</p>}
                      </div>
                    </div>
                  </button>
                </m.li>
              );
            })}
          </AnimatePresence>
        </m.ul>
      </LayoutGroup>

      <AnimatePresence>{open && <ProjectDialog item={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}

function ProjectDialog({ item, onClose }: { item: PortfolioItem; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const product = availableProducts.find((p) => p.art === item.art);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>("a,button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <m.div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/70 backdrop-blur-sm sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <m.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-title"
        onClick={(e) => e.stopPropagation()}
        className="relative grid max-h-[92svh] w-full max-w-5xl overflow-y-auto bg-paper-soft md:grid-cols-2"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <div className="relative aspect-[4/3] bg-paper-warm md:aspect-auto md:min-h-[520px]">
          {item.image ? <Image src={item.image} alt={item.title} fill className="object-cover" sizes="50vw" /> : <PrintArtwork kind={item.art} accent={item.accent} className="absolute inset-0 h-full w-full" />}
          <Label item={item} className="absolute left-4 top-4" />
        </div>
        <div className="flex flex-col p-6 sm:p-10">
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 flex size-11 items-center justify-center bg-paper-soft/80 text-ink hover:bg-paper">
            <Close size={22} />
          </button>
          <p className="spec text-smoke">{item.category}</p>
          <h3 id="project-title" className="mt-3 text-title font-semibold uppercase">{item.title}</h3>
          <p className="mt-5 text-smoke">{item.summary}</p>
          <h4 className="spec mt-8 text-smoke">{item.kind === "client" ? "Project details" : "What a project like this involves"}</h4>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {item.demonstrates.map((d) => (
              <li key={d} className="flex items-center gap-3 py-3 text-sm">
                <span className="block size-1.5 shrink-0" style={{ background: accentHex[item.accent] }} />
                {d}
              </li>
            ))}
          </ul>
          {item.kind === "concept" && (
            <p className="mt-6 text-xs text-mute">Conceptual showcase — an illustration of the kind of work we produce, not a completed client project.</p>
          )}
          <div className="mt-auto flex flex-col gap-3 pt-10 sm:flex-row">
            <ButtonLink href={product ? `/quote?product=${product.id}` : "/quote"} arrow>Start a similar project</ButtonLink>
          </div>
        </div>
      </m.div>
    </m.div>
  );
}

export function PortfolioTeaserLink() {
  return (
    <Link href="/portfolio" className="group inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em]">
      View all work <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
    </Link>
  );
}
