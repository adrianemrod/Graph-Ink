import type { Metadata } from "next";
import { PageHero } from "@/components/page/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Difference } from "@/components/home/Difference";
import { Standards } from "@/components/home/Standards";
import { QuoteCTA } from "@/components/home/QuoteCTA";
import { FacetGlyph } from "@/components/brand/FacetGlyph";
import { CropMarks, RegistrationMark } from "@/components/brand/PrintMarks";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: "GraphInk Media is a Philippine print production brand built on precision, color, material and clear communication.",
  path: "/about",
});

const beliefs = [
  { k: "Print is physical branding.", v: "People judge a brand by what they can hold. A business card, a menu, a proposal — each one is a brand touchpoint that either builds trust or quietly erodes it." },
  { k: "Details are the work.", v: "Bleed, stock, fold, finish, color. None of it is glamorous and all of it matters. We'd rather ask one more question than print the wrong thing." },
  { k: "Honesty beats hype.", v: "We quote from real specifications, confirm timelines before production, and tell you plainly when something isn't possible." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About GraphInk Media"
        title="A modern print production brand."
        lead={`${siteConfig.brandName} exists for businesses and organizations that want their printed materials to carry the same confidence as their brand. We are newly launched — and building our reputation one carefully produced order at a time.`}
        crumbs={[{ label: "About", href: "/about" }]}
        aside={
          <div className="relative flex aspect-square items-center justify-center bg-paper">
            <CropMarks size={16} gap={6} />
            <FacetGlyph colors={["#0898D8", "#E80888", "#F8E808"]} size={260} variant={0} />
            <RegistrationMark className="absolute left-4 top-4 text-ink/25" size={16} />
            <RegistrationMark className="absolute bottom-4 right-4 text-ink/25" size={16} />
            <span className="spec absolute bottom-4 left-4 text-smoke">Paper + ink + precision</span>
          </div>
        }
      />

      <section className="bg-paper py-24 md:py-32" aria-labelledby="believe">
        <div className="container-gi grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="What we believe" title={<span id="believe">Put your brand on something real.</span>} />
          </div>
          <div className="lg:col-span-7">
            {beliefs.map((b, i) => (
              <Reveal key={b.k} className="border-t border-ink/15 py-10 first:pt-0 first:border-t-0 md:first:pt-10 md:first:border-t">
                <p className="spec text-mute">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-title font-semibold uppercase">{b.k}</h3>
                <p className="mt-4 max-w-xl text-lg text-smoke">{b.v}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32" aria-labelledby="name-title">
        <div className="container-gi grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <SectionHeading eyebrow="The name" title={<span id="name-title">Graph + Ink.</span>} lead="Graphic thinking and physical ink — the two halves of every job we take on. Good print needs both: a clear visual idea, and the craft to reproduce it faithfully on paper." />
          </div>
          <div className="lg:col-span-6">
            <div className="grid grid-cols-4 gap-2" aria-hidden>
              {["#0898D8", "#E80888", "#F8E808", "#111111", "#089848", "#E87818", "#582888", "#085888"].map((c) => (
                <div key={c} className="flex aspect-[3/4] flex-col justify-end p-2" style={{ background: c }}>
                  <span className="spec" style={{ color: ["#F8E808"].includes(c) ? "#111" : "#fff" }}>{c}</span>
                </div>
              ))}
            </div>
            <p className="spec mt-3 text-mute">Working palette derived from the GraphInk Media logo</p>
          </div>
        </div>
      </section>

      <Difference />
      <Standards />
      <QuoteCTA title="Let's make something worth holding." />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
    </>
  );
}
