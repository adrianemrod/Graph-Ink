"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { mainNav, siteConfig, contactLinks } from "@/config/site";
import type { BrandLogo } from "@/lib/brand";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Close, Menu } from "@/components/ui/Icons";
import { ColorStrip } from "@/components/brand/PrintMarks";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";

const EASE = [0.2, 0.8, 0.2, 1] as const;
const accents = ["bg-gi-cyan", "bg-gi-magenta", "bg-gi-yellow", "bg-gi-green", "bg-gi-purple"];

export function Navbar({ logo }: { logo: BrandLogo }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      // Over dark sections, the glass bar turns solid paper for legibility.
      const probe = 40;
      const dark = Array.from(document.querySelectorAll<HTMLElement>("[data-nav='dark']")).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= probe && r.bottom >= probe;
      });
      setOverDark(dark);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const toggle = toggleRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>("a,button");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("a")?.focus());
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const links = contactLinks();

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500",
          scrolled
            ? overDark
              ? "bg-paper-soft shadow-[0_1px_0_rgba(17,17,17,0.08)]"
              : "bg-paper-soft/80 shadow-[0_1px_0_rgba(17,17,17,0.08)] backdrop-blur-xl backdrop-saturate-150"
            : "bg-transparent",
        )}
      >
        <div className={cn("container-gi flex items-center justify-between gap-6 transition-[height] duration-500 ease-[var(--ease-press)]", scrolled ? "h-16" : "h-20 md:h-24")}>
          <Link href="/" aria-label={`${siteConfig.brandName} — home`} className="relative z-10 shrink-0">
            <Logo logo={logo} height={scrolled ? 32 : 38} priority />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "group relative inline-flex h-10 items-center px-4 text-[0.75rem] font-semibold uppercase tracking-[0.12em] transition-colors",
                      isActive(item.href) ? "text-ink" : "text-ink/60 hover:text-ink",
                    )}
                  >
                    {item.label}
                    <span aria-hidden className={cn("absolute inset-x-4 bottom-1.5 h-px origin-left bg-ink transition-transform duration-300", isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Magnetic className="hidden sm:block">
              <ButtonLink href="/quote" size="sm" arrow onClick={() => track("quote_started", { source: "nav" })}>
                Get a quote
              </ButtonLink>
            </Magnetic>
            <button
              ref={toggleRef}
              type="button"
              className="relative z-10 -mr-2 inline-flex size-11 items-center justify-center text-ink lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[60] flex flex-col bg-ink text-paper lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <ColorStrip />
            <div className="container-gi flex h-20 items-center justify-between">
              <Link href="/" aria-label="Home" onClick={() => setOpen(false)}>
                <Logo logo={logo} height={32} surface="dark" />
              </Link>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="-mr-2 inline-flex size-11 items-center justify-center">
                <Close size={26} />
              </button>
            </div>
            <nav aria-label="Mobile" className="container-gi flex-1 overflow-y-auto pt-6">
              <ul className="border-t border-paper/10">
                {[{ label: "Home", href: "/" }, ...mainNav, { label: "Contact", href: "/contact" }].map((item, i) => (
                  <m.li key={item.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.04, duration: 0.45, ease: EASE }} className="border-b border-paper/10">
                    <Link href={item.href} onClick={() => setOpen(false)} className="group flex items-center justify-between py-4 text-[clamp(2rem,9vw,3.25rem)] font-semibold uppercase leading-none tracking-[-0.04em]">
                      <span>{item.label}</span>
                      <span aria-hidden className={cn("size-3 transition-transform group-hover:scale-150", accents[i % accents.length])} />
                    </Link>
                  </m.li>
                ))}
              </ul>
            </nav>
            <div className="container-gi space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
              <ButtonLink href="/quote" variant="light" size="lg" arrow className="w-full" onClick={() => { track("quote_started", { source: "mobile_menu" }); setOpen(false); }}>
                Get a quote
              </ButtonLink>
              {(links.messenger || links.phone) && (
                <div className="flex gap-3">
                  {links.messenger && <ButtonLink href={links.messenger.href} variant="outline-light" className="flex-1" onClick={() => track("contact_clicked", { channel: "messenger" })}>Messenger</ButtonLink>}
                  {links.phone && <ButtonLink href={links.phone.href} variant="outline-light" className="flex-1" onClick={() => track("phone_clicked", { source: "mobile_menu" })}>Call</ButtonLink>}
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
