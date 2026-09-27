import type { Metadata } from "next";
import { PageHero } from "@/components/page/PageHero";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { PrintJourney } from "@/components/home/PrintJourney";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { QuoteCTA } from "@/components/home/QuoteCTA";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Process",
  description: "How ordering print with GraphInk Media works: tell us what you need, receive a quotation, approve the details, production, quality check, and delivery or pickup.",
  path: "/process",
});

const fileTips = [
  { t: "Send PDF when you can", d: "Print-ready PDF keeps fonts, images and layout exactly as designed. JPG, PNG, AI, PSD and DOCX are also accepted." },
  { t: "Include bleed", d: "Extend background colors and images past the trim edge so nothing white shows after cutting." },
  { t: "Keep text inside the safe zone", d: "Important text and logos should sit comfortably inside the trim so nothing gets cut." },
  { t: "Use high-resolution images", d: "Images that look fine on screen can print soft. Send the largest originals you have." },
  { t: "Outline or embed fonts", d: "This prevents font substitution when your file is opened for production." },
  { t: "Tell us about color expectations", d: "If a brand color is critical, mention it. We'll discuss what's achievable on your chosen stock." },
];

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="Process"
        title="Clear from quote to delivery."
        lead="No guesswork, no surprises. Every order follows the same six steps — and nothing is printed until you've approved the details."
        crumbs={[{ label: "Process", href: "/process" }]}
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/quote" arrow>Start step one</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">Talk to GraphInk</ButtonLink>
        </div>
      </PageHero>

      <section className="bg-paper py-24 md:py-32" aria-labelledby="steps">
        <div className="container-gi">
          <SectionHeading eyebrow="Six steps" title={<span id="steps">What happens, and when.</span>} />
          <div className="mt-16">
            <ProcessSteps detailed />
          </div>
        </div>
      </section>

      <PrintJourney />

      <section className="py-24 md:py-32" aria-labelledby="files">
        <div className="container-gi grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Preparing files" title={<span id="files">Files that print well.</span>} lead="A few habits make a big difference. If your file isn't there yet, send it anyway — we'll tell you what needs attention." />
          </div>
          <ul className="grid gap-px bg-line sm:grid-cols-2 lg:col-span-7">
            {fileTips.map((f, i) => (
              <li key={f.t} className="bg-paper-soft p-6">
                <p className="spec text-mute">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em]">{f.t}</h3>
                <p className="mt-2 text-sm text-smoke">{f.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-paper py-20" aria-labelledby="timing">
        <div className="container-gi max-w-4xl">
          <h2 id="timing" className="eyebrow text-smoke">About timing</h2>
          <p className="mt-6 text-title font-semibold text-balance">Turnaround depends on the project specifications, quantity, materials, finishing requirements, and production schedule.</p>
          <p className="mt-6 text-lg text-smoke">Share your deadline in the quote request. We&apos;ll confirm a realistic schedule for your order before production begins — never after.</p>
        </div>
      </section>

      <QuoteCTA title="Talk to GraphInk." lead={`Questions about a project? ${siteConfig.brandName} will walk you through the specifics.`} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Process", path: "/process" }])} />
    </>
  );
}
