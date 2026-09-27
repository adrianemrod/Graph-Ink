"use client";

import { useState } from "react";
import { m } from "framer-motion";
import type { BrandLogo } from "@/lib/brand";
import { Logo } from "@/components/brand/Logo";
import { RegistrationMark } from "@/components/brand/PrintMarks";
import { ButtonLink } from "@/components/ui/Button";
import { contactLinks } from "@/config/site";
import { Check } from "@/components/ui/Icons";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/**
 * Confirmation. Signature moment: four process plates slide into register,
 * then the untouched logo lands on the sheet.
 */
export function QuoteSuccess({ reference, email, logo, onReset }: { reference: string; email: string; logo: BrandLogo; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const links = contactLinks();
  const channels = [links.messenger, links.phone, links.email, links.whatsapp].filter(Boolean) as { label: string; href: string }[];
  const plates = [
    { c: "#00A3E0", x: -40, y: 0 },
    { c: "#E5007E", x: 40, y: 0 },
    { c: "#FFE500", x: 0, y: -40 },
    { c: "#1A1A1A", x: 0, y: 40 },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:items-center" role="status" aria-live="polite">
      <div className="lg:col-span-5">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-paper">
          <RegistrationMark className="absolute left-5 top-5 text-ink/30" size={16} />
          <RegistrationMark className="absolute right-5 top-5 text-ink/30" size={16} />
          <RegistrationMark className="absolute bottom-5 left-5 text-ink/30" size={16} />
          <RegistrationMark className="absolute bottom-5 right-5 text-ink/30" size={16} />
          <div className="relative flex h-24 items-center gap-1.5">
            {plates.map((p, i) => (
              <m.span
                key={i}
                className="block h-24 w-5"
                style={{ background: p.c, mixBlendMode: "multiply" }}
                initial={{ x: p.x, y: p.y, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: [0, 1, 1, 0], scaleY: [1, 1, 1, 0.2] }}
                transition={{ duration: 1.3, delay: i * 0.08, ease: EASE, times: [0, 0.3, 0.75, 1] }}
              />
            ))}
          </div>
          <m.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.15, duration: 0.5, ease: EASE }}>
            <Logo logo={logo} height={64} />
          </m.div>
          <m.span className="spectrum-bar absolute inset-x-0 bottom-0 h-1 origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.3, duration: 0.8, ease: EASE }} />
        </div>
      </div>

      <div className="lg:col-span-7">
        <p className="spec text-smoke">Request received</p>
        <h2 tabIndex={-1} data-step-title className="mt-4 text-[clamp(2.6rem,1.2rem+4.5vw,5.5rem)] font-semibold uppercase leading-[0.92] tracking-[-0.05em] outline-none">
          Your request is in.
        </h2>
        <p className="mt-6 max-w-xl text-lg text-smoke">Thank you. GraphInk Media has received your project details.</p>

        <div className="mt-8 inline-flex flex-wrap items-center gap-4 border border-ink/15 bg-paper px-5 py-4">
          <div>
            <p className="spec text-smoke">Reference number</p>
            <p className="mt-1 font-mono text-xl font-medium tracking-wider">{reference}</p>
          </div>
          <button type="button" onClick={copy} className="spec h-9 border border-ink/20 px-3 hover:border-ink">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <h3 className="spec mt-10 text-smoke">What happens next</h3>
        <ol className="mt-4 space-y-3">
          {[
            "We review your specifications and files.",
            "If anything needs clarifying, we'll contact you before quoting.",
            `We send your quotation${email ? ` to ${email}` : ""}. Nothing is printed until you approve it.`,
          ].map((t, i) => (
            <li key={t} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center bg-ink text-paper"><span className="spec">{i + 1}</span></span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex items-center gap-2 text-sm text-smoke"><Check size={16} /> Keep your reference number for any follow-up.</p>

        <div className="mt-10 flex flex-wrap gap-3">
          {channels.map((c) => (
            <ButtonLink key={c.href} href={c.href} variant="secondary" size="sm">{c.label}</ButtonLink>
          ))}
          <ButtonLink href="/" size="sm" arrow>Back to GraphInk</ButtonLink>
          <button type="button" onClick={onReset} className="h-10 px-2 text-[0.75rem] font-semibold uppercase tracking-[0.08em] underline-offset-4 hover:underline">
            Start another request
          </button>
        </div>
      </div>
    </div>
  );
}
