"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { contactLinks } from "@/config/site";
import { ArrowRight, Chat, Phone } from "@/components/ui/Icons";
import { track } from "@/lib/analytics";

/**
 * Mobile: a slim bottom bar (quote + message/call when configured).
 * Desktop: a compact floating quote button after the hero.
 * Hidden on the quote page itself.
 */
export function StickyCTA() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const footer = document.querySelector("footer");
      const footerVisible = footer ? footer.getBoundingClientRect().top < window.innerHeight - 40 : false;
      setShow(window.scrollY > window.innerHeight * 0.6 && !footerVisible);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/quote")) return null;
  const links = contactLinks();
  const secondary = links.messenger
    ? { href: links.messenger.href, label: "Message", icon: <Chat size={18} />, ev: () => track("contact_clicked", { channel: "messenger", source: "sticky" }) }
    : links.phone
      ? { href: links.phone.href, label: "Call", icon: <Phone size={18} />, ev: () => track("phone_clicked", { source: "sticky" }) }
      : null;

  return (
    <AnimatePresence>
      {show && (
        <>
          <m.div
            key="mobile"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper-soft/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden"
          >
            <div className="flex gap-2">
              <Link href="/quote" onClick={() => track("quote_started", { source: "sticky_mobile" })} className="relative flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xs bg-ink text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-paper">
                Get a quote <ArrowRight size={16} />
                <span aria-hidden className="spectrum-flow absolute inset-x-0 bottom-0 h-[2px]" />
              </Link>
              {secondary && (
                <a href={secondary.href} onClick={secondary.ev} target={secondary.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-xs border border-ink/20 px-4 text-[0.8125rem] font-semibold uppercase tracking-[0.08em]">
                  {secondary.icon}
                  {secondary.label}
                </a>
              )}
            </div>
          </m.div>
          <m.div key="desktop" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.35 }} className="fixed bottom-6 right-6 z-40 hidden md:block">
            <Link
              href="/quote"
              onClick={() => track("quote_started", { source: "floating" })}
              className="group relative flex h-12 items-center gap-3 overflow-hidden rounded-xs bg-ink pl-5 pr-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-paper shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)]"
            >
              Get a quote
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              <span aria-hidden className="spectrum-flow absolute inset-x-0 bottom-0 h-[2px]" />
            </Link>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
