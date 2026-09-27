import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { PrintJourney } from "@/components/home/PrintJourney";
import { WhatWePrint } from "@/components/home/WhatWePrint";
import { Difference } from "@/components/home/Difference";
import { MaterialShowcase } from "@/components/home/MaterialShowcase";
import { PrintVisualizer } from "@/components/home/PrintVisualizer";
import { Industries } from "@/components/home/Industries";
import { Showcase } from "@/components/home/Showcase";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Standards } from "@/components/home/Standards";
import { QuoteCTA } from "@/components/home/QuoteCTA";
import { FAQSection } from "@/components/home/FAQSection";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ path: "/" });

export default function HomePage() {
  return (
    <>
      <Hero />
      <PrintJourney />
      <WhatWePrint />
      <Difference />
      <MaterialShowcase />
      <PrintVisualizer />
      <Industries />
      <Showcase />
      <HowItWorks />
      <Standards />
      <QuoteCTA />
      <FAQSection />
    </>
  );
}
