import Link from "next/link";
import { contactLinks, footerNav, formattedAddress, siteConfig } from "@/config/site";
import type { BrandLogo } from "@/lib/brand";
import { Logo } from "@/components/brand/Logo";
import { ColorStrip, RegistrationMark } from "@/components/brand/PrintMarks";
import { ButtonLink } from "@/components/ui/Button";
import { TrackedLink } from "@/components/analytics/TrackedLink";

export function Footer({ logo }: { logo: BrandLogo }) {
  const links = contactLinks();
  const address = formattedAddress();
  const socials = [links.facebook, links.instagram, links.tiktok, links.linkedin].filter(Boolean) as { label: string; href: string }[];
  const channels = [links.phone, links.email, links.messenger, links.whatsapp, links.viber].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer data-nav="dark" className="relative overflow-hidden bg-ink text-paper">
      <ColorStrip />
      <div className="container-gi pb-10 pt-20 md:pt-28">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo logo={logo} height={40} surface="dark" />
            <p className="mt-10 max-w-md text-title font-semibold uppercase text-balance">{siteConfig.tagline}</p>
            <p className="mt-5 max-w-sm text-paper/60">{siteConfig.positioning}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/quote" variant="light" arrow>Request a quote</ButtonLink>
              <ButtonLink href="/contact" variant="outline-light">Talk to GraphInk</ButtonLink>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            <FooterCol title="Services" items={footerNav.services} />
            <FooterCol title="Company" items={footerNav.company} />
            <div>
              <h2 className="eyebrow text-paper/50">Contact</h2>
              <ul className="mt-6 space-y-3 text-sm">
                {channels.map((c) => (
                  <li key={c.href}>
                    <TrackedLink href={c.href} event={c.href.startsWith("tel:") ? "phone_clicked" : "contact_clicked"} params={{ source: "footer" }} className="link-draw text-paper/80 hover:text-paper">{c.label}</TrackedLink>
                  </li>
                ))}
                {address && <li className="text-paper/60">{address}</li>}
                {siteConfig.businessHours.map((h) => (
                  <li key={h.days} className="text-paper/60">{h.days}: {h.hours}</li>
                ))}
                {channels.length === 0 && (
                  <li className="text-paper/60">
                    Start with a <Link href="/quote" className="link-draw text-paper">quote request</Link> or the <Link href="/contact" className="link-draw text-paper">contact form</Link>.
                  </li>
                )}
              </ul>
              {socials.length > 0 && (
                <ul className="mt-8 flex flex-wrap gap-4 text-sm">
                  {socials.map((s) => (
                    <li key={s.href}>
                      <TrackedLink href={s.href} event={s.label === "Facebook" ? "facebook_clicked" : "contact_clicked"} params={{ source: "footer" }} className="link-draw text-paper/80 hover:text-paper">{s.label}</TrackedLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div aria-hidden className="relative mt-24 select-none">
          <p className="whitespace-nowrap text-[20.4vw] font-semibold uppercase leading-[0.8] tracking-[-0.06em] text-paper/[0.06] min-[1440px]:text-[296px]">GraphInk</p>
          <div className="absolute bottom-3 left-0 flex items-center gap-3 text-paper/30">
            <RegistrationMark size={14} />
            <span className="spec">Sheet 01 — Final proof</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-paper/10 pt-8 text-xs text-paper/50 md:flex-row md:items-center md:justify-between">
          <p>© {siteConfig.copyrightYear} {siteConfig.brandName}. All rights reserved.</p>
          <ul className="flex gap-6">
            {footerNav.legal.map((l) => (
              <li key={l.href}><Link href={l.href} className="link-draw hover:text-paper">{l.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="eyebrow text-paper/50">{title}</h2>
      <ul className="mt-6 space-y-3 text-sm">
        {items.map((i) => (
          <li key={i.href}><Link href={i.href} className="link-draw text-paper/80 hover:text-paper">{i.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
