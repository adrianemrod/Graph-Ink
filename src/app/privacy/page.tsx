import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({ title: "Privacy", description: "How GraphInk Media collects and uses information submitted through this website.", path: "/privacy" });

const contact = siteConfig.contact.email ? ` at ${siteConfig.contact.email}` : " through the contact page";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      path="/privacy"
      sections={[
        { h: "What we collect", p: ["When you request a quote or send a message, we collect the details you provide: your name, company, email, mobile number, project specifications, message and any files or links you share.", "If analytics are enabled on this site, we also collect anonymous usage data such as pages visited and device type."] },
        { h: "How we use it", p: ["We use your information to review your request, prepare a quotation, communicate with you about your project, and produce your order if you proceed.", "We do not sell your personal information."] },
        { h: "Files you share", p: ["Artwork and documents you upload are used only to evaluate and produce your project. Treat anything confidential accordingly and let us know if special handling is needed."] },
        { h: "Service providers", p: ["We may use trusted third-party services (for example, email delivery, file storage or analytics) to operate this website. They process data on our behalf."] },
        { h: "Retention", p: ["We keep request information for as long as needed to serve you and meet legal or accounting obligations, then delete or anonymize it."] },
        { h: "Your rights", p: [`You may ask to access, correct or delete your personal information by contacting ${siteConfig.brandName}${contact}.`] },
      ]}
    />
  );
}
