import Link from "next/link";
import { faqs } from "@/content/faq";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { ArrowRight } from "@/components/ui/Icons";

export function FAQSection() {
  return (
    <section className="bg-paper py-24 md:py-36" aria-labelledby="faq-title">
      <div className="container-gi grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading index="11" eyebrow="FAQ" title={<span id="faq-title">Good questions.</span>} lead="Straight answers about how ordering works." />
          <Link href="/faq" className="group mt-8 inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em]">
            All questions <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
          </Link>
        </div>
        <div className="lg:col-span-8">
          <FAQAccordion items={faqs.slice(0, 6)} />
        </div>
      </div>
    </section>
  );
}
