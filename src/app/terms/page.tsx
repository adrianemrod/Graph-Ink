import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Terms", description: "Terms for using the GraphInk Media website and requesting quotations.", path: "/terms" });

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      path="/terms"
      sections={[
        { h: "Quotations", p: ["Submitting a request through this website does not create an order. Quotations are prepared after reviewing your specifications and are subject to the terms stated in the quotation itself."] },
        { h: "Approval before production", p: ["Production begins only after you approve the final specifications, artwork and schedule in writing."] },
        { h: "Your artwork", p: ["You confirm that you have the right to use and reproduce any artwork, text, logos or images you submit. You remain the owner of your content."] },
        { h: "Color and materials", p: ["Printed color can differ from how artwork appears on screen, and can vary between paper stocks and finishes. We'll discuss expectations during quotation."] },
        { h: "Timelines", p: ["Turnaround depends on the project specifications, quantity, materials, finishing requirements, and production schedule. Timelines are confirmed per order."] },
        { h: "Website content", p: ["Illustrations labeled as conceptual showcases are examples of the type of work we produce and do not represent completed client projects."] },
      ]}
    />
  );
}
