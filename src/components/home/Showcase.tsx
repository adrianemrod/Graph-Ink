import { SectionHeading } from "@/components/ui/SectionHeading";
import { PortfolioGrid, PortfolioTeaserLink } from "@/components/portfolio/PortfolioGrid";

export function Showcase() {
  return (
    <section className="py-24 md:py-36" aria-labelledby="showcase-title">
      <div className="container-gi">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            index="08"
            eyebrow="Selected work"
            title={<span id="showcase-title">Print with intention.</span>}
            lead="Conceptual showcases of the kind of pieces we produce. Real client projects will appear here as they're completed and approved for sharing."
          />
          <PortfolioTeaserLink />
        </div>
        <div className="mt-12">
          <PortfolioGrid limit={5} />
        </div>
      </div>
    </section>
  );
}
