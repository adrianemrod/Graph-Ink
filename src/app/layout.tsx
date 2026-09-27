import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { getBrandLogo } from "@/lib/brand";
import { localBusinessJsonLd, organizationJsonLd } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { PageLoader, loaderScript } from "@/components/layout/PageLoader";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { Analytics } from "@/components/analytics/Analytics";
import { JsonLd } from "@/components/seo/JsonLd";

const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.seo.defaultTitle, template: siteConfig.seo.titleTemplate },
  description: siteConfig.description,
  applicationName: siteConfig.brandName,
  keywords: [...siteConfig.seo.keywords],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.brandName,
    locale: siteConfig.locale,
    url: "/",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image", title: siteConfig.seo.defaultTitle, description: siteConfig.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#F7F7F5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const logo = getBrandLogo();
  return (
    <html lang="en-PH" className={`${interTight.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only z-[100] bg-ink px-4 py-3 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <PageLoader logo={logo} />
        <MotionProvider>
          <Navbar logo={logo} />
          <main id="main">{children}</main>
          <Footer logo={logo} />
          <StickyCTA />
        </MotionProvider>
        <JsonLd data={organizationJsonLd(logo?.src)} />
        <JsonLd data={localBusinessJsonLd(logo?.src)} />
        <Analytics />
      </body>
    </html>
  );
}
