import { serviceCategories } from "@/content/services";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ProductIndex } from "@/components/services/ProductIndex";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export function WhatWePrint() {
  return (
    <section className="py-24 md:py-36" aria-labelledby="what-we-print">
      <div className="container-gi">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading index="03" eyebrow="What we print" title={<span id="what-we-print">Put your brand on something real.</span>} lead="Four areas of production, one standard. Choose a starting point — or tell us about the project and we'll recommend the right approach." />
          <ButtonLink href="/services" variant="secondary" arrow className="shrink-0">All services</ButtonLink>
        </div>

        <RevealGroup className="mt-16 grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
          {serviceCategories.map((s) => (
            <RevealItem key={s.slug} className="flex">
              <ServiceCard service={s} className="flex-1" />
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-24">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h3 className="text-title font-semibold uppercase">The print index</h3>
            <p className="max-w-sm text-sm text-smoke">Select any item to start a quotation with it pre-filled. Not listed? Choose &ldquo;Other&rdquo; in the quote builder.</p>
          </div>
          <ProductIndex />
        </Reveal>
      </div>
    </section>
  );
}
