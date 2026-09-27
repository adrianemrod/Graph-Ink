/**
 * Services & products.
 *
 * Owner notes:
 * - Set `available: false` on any product GraphInk Media does not offer yet.
 *   It will disappear from the site, the service pages and the quote builder.
 * - Keep descriptions factual. Avoid stating paper weights, machine names or
 *   turnaround times here unless they are confirmed for every order.
 */

import type { ArtworkKind } from "@/components/print/PrintArtwork";

export type Accent = "cyan" | "magenta" | "yellow" | "green" | "orange" | "purple" | "blue" | "pink";

export type Product = {
  id: string;
  name: string;
  category: ServiceSlug;
  description: string;
  useCase: string;
  art: ArtworkKind;
  accent: Accent;
  available: boolean;
};

export type ServiceSlug = "paper-printing" | "business-printing" | "marketing-collateral" | "custom-printing";

export type ServiceCategory = {
  slug: ServiceSlug;
  index: string;
  name: string;
  shortName: string;
  headline: string;
  summary: string;
  description: string;
  useCase: string;
  accent: Accent;
  art: ArtworkKind;
  /** Things to decide before requesting a quote. Keeps the conversation specific. */
  specChecklist: string[];
  /** Common finishing directions — offered subject to confirmation per job. */
  finishingNotes: string[];
  seoTitle: string;
  seoDescription: string;
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "business-printing",
    index: "01",
    name: "Business Printing",
    shortName: "Business",
    headline: "Print that represents you after the handshake.",
    summary: "Professional print pieces designed to represent your brand long after the first handshake.",
    description:
      "Business cards, company profiles, folders, certificates and corporate stationery — the pieces people hold when they decide whether to trust you. We help you choose stock and finishing that match the way your brand should feel.",
    useCase: "Client meetings, onboarding kits, proposals, corporate events.",
    accent: "cyan",
    art: "business-card",
    specChecklist: [
      "Quantity per item and per person (for name-based cards)",
      "Finished size and orientation",
      "Single- or double-sided printing",
      "Paper preference — or ask us to recommend",
      "Finishing such as lamination, rounded corners or folding",
      "Date you need the pieces in hand",
    ],
    finishingNotes: ["Matte or gloss lamination", "Precision cutting", "Folding and scoring", "Pocket folders"],
    seoTitle: "Business Printing — Cards, Company Profiles & Corporate Materials",
    seoDescription:
      "Business cards, company profiles, folders, certificates and corporate stationery printed with care for materials, finishing and consistency. Request a quotation from GraphInk Media.",
  },
  {
    slug: "marketing-collateral",
    index: "02",
    name: "Marketing Collateral",
    shortName: "Marketing",
    headline: "Campaigns you can hand to someone.",
    summary: "Brochures, menus and campaign materials that carry the same confidence as your digital brand.",
    description:
      "When a campaign leaves the screen, the print has to hold up. Brochures, menus, invitations and promotional pieces produced with attention to color, fold, paper and finish.",
    useCase: "Product launches, restaurant menus, sales kits, events, promotions.",
    accent: "magenta",
    art: "brochure",
    specChecklist: [
      "Piece type — brochure, menu, leaflet, invitation",
      "Fold style (if any) and finished size",
      "Quantity and whether versions differ",
      "Paper feel — matte, gloss, textured or not sure",
      "Any lamination or special finishing",
      "Campaign or event date",
    ],
    finishingNotes: ["Bi-fold, tri-fold and custom folds", "Lamination for durability", "Die-cut shapes", "Scoring for heavy stocks"],
    seoTitle: "Marketing Collateral Printing — Brochures, Menus & Campaign Materials",
    seoDescription:
      "Brochures, menus, invitations and campaign collateral printed with attention to color, paper and finishing. Tell GraphInk Media what you need and receive a quotation.",
  },
  {
    slug: "paper-printing",
    index: "03",
    name: "Paper Printing",
    shortName: "Paper",
    headline: "Pages that hold attention.",
    summary: "Flyers, posters, booklets, magazines and catalogs — produced for clarity, color and consistency across every copy.",
    description:
      "From single sheets to bound multi-page documents. We look at page count, stock, binding and quantity together so the finished piece reads, handles and lasts the way it should.",
    useCase: "Announcements, publications, product catalogs, school and training materials.",
    accent: "yellow",
    art: "booklet",
    specChecklist: [
      "Page count (for booklets, magazines and catalogs)",
      "Finished size",
      "Cover and inside paper, if different",
      "Binding preference, or ask us",
      "Quantity",
      "Delivery or pickup date",
    ],
    finishingNotes: ["Saddle-stitch and other binding options", "Trimming to size", "Cover lamination", "Collating"],
    seoTitle: "Paper Printing — Flyers, Posters, Booklets, Magazines & Catalogs",
    seoDescription:
      "Flyers, posters, booklets, magazines, catalogs and school materials printed for clarity and consistency. Request a quotation from GraphInk Media in the Philippines.",
  },
  {
    slug: "custom-printing",
    index: "04",
    name: "Custom Printing",
    shortName: "Custom",
    headline: "When the brief doesn't fit a template.",
    summary: "Stickers, labels, packaging and custom paper products built around your specifications.",
    description:
      "Non-standard sizes, shapes and applications. Tell us what the piece needs to do — hold a product, seal a bag, carry a label — and we'll work through materials and finishing with you before production.",
    useCase: "Product labels, packaging inserts, branded stickers, special projects.",
    accent: "green",
    art: "packaging",
    specChecklist: [
      "What the piece needs to do, and where it will be used",
      "Dimensions or a sample/dieline, if available",
      "Material or surface requirements",
      "Quantity",
      "Finishing — die-cut, lamination, kiss-cut",
      "Target date",
    ],
    finishingNotes: ["Die-cut and kiss-cut shapes", "Custom sizes", "Lamination", "Assembly requirements discussed per project"],
    seoTitle: "Custom Printing — Stickers, Labels, Packaging & Special Projects",
    seoDescription:
      "Custom stickers, labels, packaging and paper products built around your specifications. Share your brief with GraphInk Media and receive a quotation.",
  },
];

export const products: Product[] = [
  // Business printing
  { id: "business-cards", name: "Business Cards", category: "business-printing", description: "The smallest piece of your brand — and often the first one kept.", useCase: "Teams, founders, sales, events", art: "business-card", accent: "cyan", available: true },
  { id: "company-profiles", name: "Company Profiles", category: "business-printing", description: "A bound introduction to who you are and what you do.", useCase: "Proposals, bids, partner meetings", art: "company-profile", accent: "blue", available: true },
  { id: "folders", name: "Folders", category: "business-printing", description: "Presentation folders that keep documents organized and on-brand.", useCase: "Proposals, onboarding, press kits", art: "folder", accent: "purple", available: true },
  { id: "certificates", name: "Certificates", category: "business-printing", description: "Recognition that feels as significant as the achievement.", useCase: "Awards, training, completion", art: "certificate", accent: "orange", available: true },
  { id: "corporate-materials", name: "Corporate Materials", category: "business-printing", description: "Letterheads, envelopes, notepads and internal print, kept consistent.", useCase: "Offices, HR, administration", art: "corporate", accent: "cyan", available: true },

  // Marketing collateral
  { id: "brochures", name: "Brochures", category: "marketing-collateral", description: "Folded storytelling for products, services and places.", useCase: "Sales, tourism, real estate", art: "brochure", accent: "magenta", available: true },
  { id: "menus", name: "Menus", category: "marketing-collateral", description: "Menus that match the room — and survive service.", useCase: "Restaurants, cafés, hotels", art: "menu", accent: "orange", available: true },
  { id: "marketing-collateral", name: "Marketing Collateral", category: "marketing-collateral", description: "Leaflets, inserts, cards and campaign pieces in one consistent run.", useCase: "Launches, promotions, retail", art: "collateral", accent: "pink", available: true },
  { id: "invitations", name: "Invitations", category: "marketing-collateral", description: "The first impression of an event, printed with intent.", useCase: "Corporate events, launches, celebrations", art: "invitation", accent: "purple", available: true },

  // Paper printing
  { id: "flyers", name: "Flyers", category: "paper-printing", description: "Single sheets with a single job: get noticed and get read.", useCase: "Announcements, promotions, events", art: "flyer", accent: "yellow", available: true },
  { id: "posters", name: "Posters", category: "paper-printing", description: "Large-format presence for walls, windows and venues.", useCase: "Retail, events, campaigns", art: "poster", accent: "magenta", available: true },
  { id: "booklets", name: "Booklets", category: "paper-printing", description: "Multi-page documents bound for easy reading and handling.", useCase: "Programs, manuals, guides", art: "booklet", accent: "yellow", available: true },
  { id: "magazines", name: "Magazines", category: "paper-printing", description: "Editorial layouts reproduced with consistent color, page after page.", useCase: "Publications, newsletters, yearbooks", art: "magazine", accent: "cyan", available: true },
  { id: "catalogs", name: "Catalogs", category: "paper-printing", description: "Product pages that stay accurate and easy to browse.", useCase: "Retail, distributors, B2B sales", art: "catalog", accent: "green", available: true },
  { id: "school-materials", name: "School Materials", category: "paper-printing", description: "Modules, handouts, forms and school publications, organized for volume.", useCase: "Schools, training centers, review programs", art: "school", accent: "blue", available: true },

  // Custom printing
  { id: "stickers", name: "Stickers", category: "custom-printing", description: "Branded stickers in the shapes and sizes your project calls for.", useCase: "Packaging, giveaways, merchandise", art: "sticker", accent: "green", available: true },
  { id: "labels", name: "Labels", category: "custom-printing", description: "Product and packaging labels planned around the surface they sit on.", useCase: "Food, beauty, retail products", art: "label", accent: "orange", available: true },
  { id: "packaging", name: "Packaging", category: "custom-printing", description: "Paper-based packaging and sleeves that carry the brand to the shelf.", useCase: "Retail, food, gifting", art: "packaging", accent: "green", available: true },
  { id: "custom-paper-products", name: "Custom Paper Products", category: "custom-printing", description: "Special paper pieces built around a specific brief.", useCase: "Special projects, events, branded kits", art: "custom", accent: "purple", available: true },
];

export const availableProducts = products.filter((p) => p.available);

export function getCategory(slug: string) {
  return serviceCategories.find((c) => c.slug === slug);
}

export function productsIn(slug: ServiceSlug) {
  return availableProducts.filter((p) => p.category === slug);
}
