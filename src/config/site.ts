/**
 * GRAPHINK MEDIA — central site configuration.
 *
 * This is the single place to update business details. Anything left as an
 * empty string is treated as "not provided yet" and is hidden from the site
 * (and from structured data). Never fill these with placeholder numbers or
 * addresses — leave them empty until the real details are confirmed.
 */

export const siteConfig = {
  brandName: "GraphInk Media",
  /** Display form used in headings, loader and footer. */
  brandWordmark: "GRAPHINK MEDIA",
  /** Footer brand line. Change freely. */
  tagline: "Turning ideas into print.",
  positioning: "Premium printing and visual communication for brands that take their image seriously.",
  description:
    "GraphInk Media provides professional printing and visual communication solutions for businesses, brands, organizations, and projects across the Philippines.",

  /**
   * Public URL of the deployed site. Set NEXT_PUBLIC_SITE_URL in production so
   * canonical URLs, sitemap and Open Graph tags resolve correctly.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",

  locale: "en_PH",
  country: "Philippines",
  serviceArea: "Philippines",

  /**
   * Logo — place the official file at /public/brand/graphink-logo.jpeg
   * (.svg, .png or .webp also work; the highest-fidelity format found wins).
   * Until the file exists, the site shows the brand name as plain text.
   */
  logo: {
    basePath: "/brand/graphink-logo",
    alt: "GraphInk Media",
  },

  contact: {
    /** e.g. "+63 9XX XXX XXXX" — leave empty until confirmed. */
    phone: "",
    /** e.g. "hello@yourdomain.ph" */
    email: "",
    /** Full street address. LocalBusiness schema is only emitted when this AND phone are set. */
    address: {
      street: "",
      city: "",
      region: "",
      postalCode: "",
      country: "PH",
    },
    /** Only set if an actual WhatsApp number is in use. Digits only, with country code, e.g. "639XXXXXXXXX". */
    whatsapp: "",
    /** Viber number, digits only with country code. Optional. */
    viber: "",
    /** Google Maps share link, optional. */
    mapUrl: "",
  },

  social: {
    /** Full Facebook page URL, e.g. "https://www.facebook.com/yourpage" */
    facebook: "",
    /** Messenger link, e.g. "https://m.me/yourpage" */
    messenger: "",
    instagram: "",
    tiktok: "",
    linkedin: "",
  },

  /**
   * Business hours. Leave the array empty to hide hours everywhere.
   * Example: { days: "Monday – Friday", hours: "9:00 AM – 6:00 PM" }
   */
  businessHours: [] as { days: string; hours: string }[],

  /** Legal pages — review the copy with counsel before launch. */
  legal: {
    companyLegalName: "", // e.g. registered business name for the footer/legal pages
    lastUpdated: "2026-09-27",
  },

  copyrightYear: 2026,

  seo: {
    defaultTitle: "GraphInk Media | Premium Printing & Print Solutions in the Philippines",
    titleTemplate: "%s | GraphInk Media",
    keywords: [
      "printing Philippines",
      "business printing",
      "commercial printing",
      "brochure printing",
      "business cards",
      "marketing collateral",
      "print production",
    ],
    twitterHandle: "", // e.g. "@graphinkmedia" — only if the account exists
  },

  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  },

  quote: {
    /** Per-file upload limit enforced on client and server. */
    maxFileSizeMB: 10,
    maxFiles: 5,
    maxTotalSizeMB: 25,
    acceptedExtensions: ["pdf", "jpg", "jpeg", "png", "ai", "psd", "docx"],
  },
};

export type SiteConfig = typeof siteConfig;

export const mainNav = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/portfolio" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
] as const;

export const footerNav = {
  services: [
    { label: "Paper Printing", href: "/services/paper-printing" },
    { label: "Business Printing", href: "/services/business-printing" },
    { label: "Marketing Collateral", href: "/services/marketing-collateral" },
    { label: "Custom Printing", href: "/services/custom-printing" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Process", href: "/process" },
    { label: "Work", href: "/portfolio" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} as const;

/** Helpers — derive contact links only from real, supplied values. */
export function contactLinks() {
  const c = siteConfig.contact;
  const s = siteConfig.social;
  const tel = c.phone ? `tel:${c.phone.replace(/[^\d+]/g, "")}` : "";
  return {
    phone: c.phone ? { label: c.phone, href: tel } : null,
    email: c.email ? { label: c.email, href: `mailto:${c.email}` } : null,
    whatsapp: c.whatsapp ? { label: "WhatsApp", href: `https://wa.me/${c.whatsapp}` } : null,
    viber: c.viber ? { label: "Viber", href: `viber://chat?number=%2B${c.viber}` } : null,
    messenger: s.messenger ? { label: "Messenger", href: s.messenger } : null,
    facebook: s.facebook ? { label: "Facebook", href: s.facebook } : null,
    instagram: s.instagram ? { label: "Instagram", href: s.instagram } : null,
    tiktok: s.tiktok ? { label: "TikTok", href: s.tiktok } : null,
    linkedin: s.linkedin ? { label: "LinkedIn", href: s.linkedin } : null,
  };
}

export function formattedAddress() {
  const a = siteConfig.contact.address;
  return [a.street, a.city, a.region, a.postalCode].filter(Boolean).join(", ");
}
