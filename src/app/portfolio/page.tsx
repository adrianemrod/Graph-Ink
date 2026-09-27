import type { Metadata } from "next";
import { PageHero } from "@/components/page/PageHero";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { QuoteCTA } from "@/components/home/QuoteCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { portfolio } from "@/content/portfolio";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description: "Conceptual showcases of the print work GraphInk Media produces — corporate kits, menus, brochures, packaging, editorial and event materials.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  const hasClientWork = portfolio.some((p) => p.kind === "client");
  return (
    <>
      <PageHero
        eyebrow="Selected work"
        title="The kind of work we put on paper."
        lead={
          hasClientWork
            ? "A selection of client projects and conceptual showcases. Filter by category and open any piece for details."
            : "GraphInk Media is newly launched, so everything here is a clearly labeled conceptual showcase — an honest illustration of the pieces we produce. Real client work will be added as projects are completed and approved for sharing."
        }
        crumbs={[{ label: "Work", href: "/portfolio" }]}
      />
      <section className="pb-24 md:pb-36" aria-label="Portfolio">
        <div className="container-gi">
          <PortfolioGrid />
        </div>
      </section>
      <QuoteCTA title="Start a similar project." lead="Tell us which piece caught your eye and what you need. We'll take it from there." />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/portfolio" }])} />
    </>
  );
}
