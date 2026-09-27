import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { serviceCategories, getCategory, productsIn, type ServiceSlug } from "@/content/services";
import { faqs } from "@/content/faq";
import { PageHero } from "@/components/page/PageHero";
import { PrintArtwork, accentHex } from "@/components/print/PrintArtwork";
import { CropMarks } from "@/components/brand/PrintMarks";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { QuoteCTA } from "@/components/home/QuoteCTA";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageEvent } from "@/components/analytics/PageEvent";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceCategories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getCategory(slug);
  if (!s) return {};
  return pageMetadata({ title: s.seoTitle, description: s.seoDescription, path: `/services/${s.slug}`, ogTitle: `${s.name} | ${siteConfig.brandName}` });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getCategory(slug);
  if (!service) notFound();
  const items = productsIn(service.slug as ServiceSlug);
  const others = serviceCategories.filter((s) => s.slug !== service.slug);
  const relatedFaqs = faqs.filter((f) => ["Production", "Files"].includes(f.category)).slice(0, 4);
  const accent = accentHex[service.accent];

  return (
    <>
      <PageEvent event="service_viewed" params={{ service: service.slug }} />
      <PageHero
        eyebrow={`${service.index} / ${service.name}`}
        title={service.headline}
        lead={service.description}
        crumbs={[{ label: "Services", href: "/services" }, { label: service.name, href: `/services/${service.slug}` }]}
        aside={
          <div className="relative aspect-[4/3] bg-paper">
            <CropMarks size={14} gap={5} />
            <PrintArtwork kind={service.art} accent={service.accent} className="absolute inset-0 h-full w-full" title={`${service.name} illustration`} />
            <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: accent }} />
          </div>
        }
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href={`/quote?product=${items[0]?.id ?? ""}`} arrow>Request this print</ButtonLink>
          <ButtonLink href="#products" variant="secondary">See what&apos;s included</ButtonLink>
        </div>
      </PageHero>

      <section id="products" className="bg-paper py-24 md:py-32" aria-labelledby="products-title">
        <div className="container-gi">
          <SectionHeading eyebrow="What's included" title={<span id="products-title">{service.name}, piece by piece.</span>} lead={`Typical uses: ${service.useCase}`} />
          <RevealGroup className="mt-14 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <RevealItem key={p.id} className="flex">
                <article className="group flex flex-1 flex-col bg-paper p-6">
                  <div className="relative aspect-[4/3] bg-paper-soft">
                    <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-press)] group-hover:-translate-y-1 group-hover:rotate-[-1deg]">
                      <PrintArtwork kind={p.art} accent={p.accent} className="h-full w-full" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold uppercase tracking-[-0.03em]">{p.name}</h3>
                  <p className="mt-2 text-smoke">{p.description}</p>
                  <p className="spec mt-4 text-mute">{p.useCase}</p>
                  <Link href={`/quote?product=${p.id}`} className="mt-6 inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em]">
                    Request this print <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
                  </Link>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="py-24 md:py-32" aria-labelledby="spec-title">
        <div className="container-gi grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Before you request" title={<span id="spec-title">What helps us quote accurately.</span>} lead="Have these ready and your quotation comes back faster and more precise. Not sure about some of them? That's what we're here for." />
          </div>
          <div className="lg:col-span-7">
            <ol className="border-t border-ink/15">
              {service.specChecklist.map((c, i) => (
                <li key={c} className="flex items-baseline gap-5 border-b border-ink/15 py-5">
                  <span className="spec w-6 text-mute">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-lg">{c}</span>
                </li>
              ))}
            </ol>
            <div className="mt-10">
              <p className="spec text-smoke">Finishing often requested</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {service.finishingNotes.map((f) => (
                  <li key={f} className="border border-ink/15 bg-paper px-3 py-1.5 text-sm">{f}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-mute">Finishing availability is confirmed per project in your quotation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-24 text-paper md:py-32" data-nav="dark" aria-labelledby="svc-process">
        <div className="container-gi">
          <SectionHeading tone="light" eyebrow="How it works" title={<span id="svc-process">From request to ready.</span>} />
          <div className="mt-16">
            <ProcessSteps tone="dark" />
          </div>
        </div>
      </section>

      <section className="bg-paper py-24 md:py-32" aria-labelledby="svc-faq">
        <div className="container-gi grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Questions" title={<span id="svc-faq">Before you order.</span>} />
          </div>
          <div className="lg:col-span-8">
            <FAQAccordion items={relatedFaqs} />
          </div>
        </div>
      </section>

      <section className="py-20" aria-labelledby="other-services">
        <div className="container-gi">
          <h2 id="other-services" className="eyebrow text-smoke">Other services</h2>
          <ul className="mt-6 grid border-t border-ink/15 md:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug} className="border-b border-ink/15 md:border-r md:last:border-r-0">
                <Link href={`/services/${o.slug}`} className="group flex items-center justify-between py-6 md:px-6 md:first:pl-0">
                  <span className="flex items-center gap-3">
                    <span className="block size-2.5" style={{ background: accentHex[o.accent] }} />
                    <span className="text-xl font-semibold uppercase tracking-[-0.02em]">{o.name}</span>
                  </span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <QuoteCTA title={`Ready to print your ${service.shortName.toLowerCase()} pieces?`} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          description: service.description,
          serviceType: "Printing",
          url: absoluteUrl(`/services/${service.slug}`),
          areaServed: { "@type": "Country", name: siteConfig.country },
          provider: { "@type": "Organization", name: siteConfig.brandName, url: siteConfig.url },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: service.name,
            itemListElement: items.map((p) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: p.name, description: p.description } })),
          },
        }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: service.name, path: `/services/${service.slug}` }])} />
    </>
  );
}
