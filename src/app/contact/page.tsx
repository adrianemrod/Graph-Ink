import type { Metadata } from "next";
import { PageHero } from "@/components/page/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { contactLinks, formattedAddress, siteConfig } from "@/config/site";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { ArrowUpRight, Chat, Clock, Facebook, Mail, Phone, Pin } from "@/components/ui/Icons";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Talk to GraphInk Media about your next print project. Send a message or request a quotation.",
  path: "/contact",
});

export default function ContactPage() {
  const l = contactLinks();
  const address = formattedAddress();
  const channels = [
    l.messenger && { ...l.messenger, icon: <Chat size={20} />, note: "Fastest for quick questions", event: "contact_clicked" as const },
    l.phone && { ...l.phone, icon: <Phone size={20} />, note: "Call or text", event: "phone_clicked" as const },
    l.email && { ...l.email, icon: <Mail size={20} />, note: "For files and detailed briefs", event: "contact_clicked" as const },
    l.whatsapp && { ...l.whatsapp, icon: <Chat size={20} />, note: "WhatsApp", event: "contact_clicked" as const },
    l.viber && { ...l.viber, icon: <Chat size={20} />, note: "Viber", event: "contact_clicked" as const },
    l.facebook && { ...l.facebook, icon: <Facebook size={20} />, note: "Follow our work", event: "facebook_clicked" as const },
  ].filter(Boolean) as { label: string; href: string; icon: React.ReactNode; note: string; event: "contact_clicked" | "phone_clicked" | "facebook_clicked" }[];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to GraphInk."
        lead="Questions about a project, a material, or a deadline? Send a message. For pricing, the quote builder gets you the most accurate answer."
        crumbs={[{ label: "Contact", href: "/contact" }]}
      >
        <div className="mt-10">
          <ButtonLink href="/quote" arrow>Request a quote instead</ButtonLink>
        </div>
      </PageHero>

      <section className="pb-24 md:pb-36">
        <div className="container-gi grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <aside className="space-y-6 lg:col-span-5">
            {channels.length > 0 && (
              <ul className="divide-y divide-ink/10 border-y border-ink/10">
                {channels.map((c) => (
                  <li key={c.href}>
                    <TrackedLink href={c.href} event={c.event} params={{ source: "contact_page" }} className="group flex items-center gap-4 py-5">
                      <span className="flex size-11 items-center justify-center border border-ink/15 transition-colors group-hover:bg-ink group-hover:text-paper">{c.icon}</span>
                      <span className="flex-1">
                        <span className="block font-semibold">{c.label}</span>
                        <span className="spec text-mute">{c.note}</span>
                      </span>
                      <ArrowUpRight size={18} className="text-mute transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                    </TrackedLink>
                  </li>
                ))}
              </ul>
            )}
            {(address || siteConfig.businessHours.length > 0) && (
              <div className="space-y-4 bg-paper p-6">
                {address && (
                  <p className="flex gap-3"><Pin size={20} className="mt-0.5 shrink-0" /><span>{address}{siteConfig.contact.mapUrl && <> · <a href={siteConfig.contact.mapUrl} target="_blank" rel="noopener noreferrer" className="underline">Map</a></>}</span></p>
                )}
                {siteConfig.businessHours.map((h) => (
                  <p key={h.days} className="flex gap-3"><Clock size={20} className="mt-0.5 shrink-0" /><span>{h.days}: {h.hours}</span></p>
                ))}
              </div>
            )}
            <div className="bg-ink p-8 text-paper">
              <p className="spec text-paper/50">Based in the {siteConfig.country}</p>
              <p className="mt-3 text-2xl font-semibold uppercase tracking-[-0.03em]">Built for businesses and organizations that care about the final print.</p>
              <p className="mt-4 text-paper/60">Delivery and pickup arrangements are confirmed with each quotation.</p>
            </div>
          </aside>
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
    </>
  );
}
