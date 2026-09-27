import type { Metadata } from "next";
import { PageHero } from "@/components/page/PageHero";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { QuoteCTA } from "@/components/home/QuoteCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { faqs } from "@/content/faq";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: "Answers about printing services, bulk orders, file formats, paper recommendations, turnaround, delivery and quotations at GraphInk Media.",
  path: "/faq",
});

export default function FAQPage() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Straight answers." lead="Everything you might want to know before requesting a quotation. Can't find it? Ask us directly." crumbs={[{ label: "FAQ", href: "/faq" }]} />
      <section className="pb-24 md:pb-36">
        <div className="container-gi grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <FAQAccordion items={faqs} />
          </div>
          <aside className="lg:col-span-4">
            <div className="bg-ink p-8 text-paper lg:sticky lg:top-28">
              <p className="spec text-paper/50">Still unsure?</p>
              <p className="mt-4 text-2xl font-semibold uppercase tracking-[-0.03em]">Send us the details. We&apos;ll answer with specifics.</p>
              <div className="mt-8 flex flex-col gap-3">
                <ButtonLink href="/quote" variant="light" arrow>Request a quote</ButtonLink>
                <ButtonLink href="/contact" variant="outline-light">Ask a question</ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <QuoteCTA />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }])} />
    </>
  );
}
