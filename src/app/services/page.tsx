import type { Metadata } from "next";
import { serviceCategories, productsIn } from "@/content/services";
import { PageHero } from "@/components/page/PageHero";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ProductIndex } from "@/components/services/ProductIndex";
import { MaterialShowcase } from "@/components/home/MaterialShowcase";
import { QuoteCTA } from "@/components/home/QuoteCTA";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Printing Services",
  description: "Business printing, marketing collateral, paper printing and custom printing — produced with attention to materials, finishing and consistency. Explore GraphInk Media services.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Print with intention."
        lead="Four areas of production. One standard for all of them: the right material, careful preparation, and output that looks like you meant it."
        crumbs={[{ label: "Services", href: "/services" }]}
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/quote" arrow>Request a quote</ButtonLink>
          <ButtonLink href="#index" variant="secondary">Browse the print index</ButtonLink>
        </div>
      </PageHero>

      <section className="pb-24 md:pb-36" aria-label="Service areas">
        <div className="container-gi grid gap-px bg-line md:grid-cols-2">
          {serviceCategories.map((s) => (
            <div key={s.slug} className="flex flex-col bg-paper">
              <ServiceCard service={s} large className="flex-1" />
              <div className="border-t border-line px-5 pb-6 pt-4 sm:px-7">
                <p className="spec text-smoke">Includes</p>
                <p className="mt-2 text-sm">{productsIn(s.slug).map((p) => p.name).join(" · ")}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="index" className="bg-paper py-24 md:py-36" aria-labelledby="index-title">
        <div className="container-gi">
          <SectionHeading eyebrow="The print index" title={<span id="index-title">Everything we print.</span>} lead="Select an item to start a quote with it pre-selected. Don't see it? Describe it in the quote builder under “Other”." />
          <div className="mt-14">
            <ProductIndex />
          </div>
        </div>
      </section>

      <MaterialShowcase />
      <QuoteCTA title="Have a spec sheet ready?" lead="Send it over. Or start from scratch — the quote builder walks you through every detail." />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />
    </>
  );
}
