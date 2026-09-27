import type { Metadata } from "next";
import { QuoteWizard } from "@/components/quote/QuoteWizard";
import { getBrandLogo } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo";
import { Eyebrow } from "@/components/ui/SectionHeading";

export const metadata: Metadata = pageMetadata({
  title: "Request a Quote",
  description: "Tell GraphInk Media what you're printing, how many you need and when you need it. We'll review your specifications and send a quotation.",
  path: "/quote",
});

export default async function QuotePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const product = typeof sp.product === "string" ? sp.product : undefined;
  const logo = getBrandLogo();
  return (
    <section className="relative min-h-svh pb-24 pt-28 md:pt-36">
      <div className="grid-lines pointer-events-none absolute inset-x-0 top-0 h-[480px] [mask-image:linear-gradient(to_bottom,black,transparent)] [--grid-size:64px]" aria-hidden />
      <div className="container-gi relative">
        <div className="mb-12 flex flex-col justify-between gap-6 border-b border-ink/10 pb-10 md:mb-16 md:flex-row md:items-end">
          <div>
            <Eyebrow>Quote builder</Eyebrow>
            <h1 className="mt-6 text-[clamp(2.4rem,1rem+4.6vw,5.5rem)] font-semibold uppercase leading-[0.92] tracking-[-0.05em]">Request a quote.</h1>
          </div>
          <p className="max-w-sm text-smoke">Eight short steps. No pricing guesswork — we review your specifications and send a proper quotation.</p>
        </div>
        <QuoteWizard initialProduct={product} logo={logo} />
      </div>
    </section>
  );
}
