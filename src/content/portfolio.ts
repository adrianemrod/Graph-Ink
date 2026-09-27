/**
 * Portfolio.
 *
 * IMPORTANT: Every item below is a CONCEPTUAL SHOWCASE — an illustration of the
 * kind of work GraphInk Media produces, not a completed client project.
 * When real, client-approved work is available:
 *   1. add images to /public/portfolio/
 *   2. add an entry with `kind: "client"`, `client`, and `image`
 *   3. remove or keep the conceptual entries as you prefer.
 * Never set `kind: "client"` on a conceptual piece.
 */
import type { ArtworkKind } from "@/components/print/PrintArtwork";
import type { Accent } from "./services";

export const portfolioFilters = ["All", "Corporate", "Marketing", "Packaging", "Editorial", "Events", "Education", "Retail"] as const;
export type PortfolioFilter = (typeof portfolioFilters)[number];

export type PortfolioItem = {
  id: string;
  title: string;
  kind: "concept" | "client";
  client?: string;
  category: Exclude<PortfolioFilter, "All">;
  art: ArtworkKind;
  accent: Accent;
  summary: string;
  /** What a project like this typically involves — framed as a sample application. */
  demonstrates: string[];
  image?: string;
  featured?: boolean;
};

export const portfolio: PortfolioItem[] = [
  {
    id: "corporate-identity-kit",
    title: "Corporate Identity Kit",
    kind: "concept",
    category: "Corporate",
    art: "corporate",
    accent: "cyan",
    featured: true,
    summary: "A consistent stationery system: business cards, letterhead, envelopes and a presentation folder, planned as one family.",
    demonstrates: ["Color consistency across multiple stocks", "Matched finishing across pieces", "Coordinated production of a full kit"],
  },
  {
    id: "restaurant-menu-system",
    title: "Restaurant Menu System",
    kind: "concept",
    category: "Retail",
    art: "menu",
    accent: "orange",
    summary: "Main menu, drinks card and table tent designed to survive daily service.",
    demonstrates: ["Durable lamination choices", "Multi-piece consistency", "Easy reprint planning for price updates"],
  },
  {
    id: "real-estate-brochure",
    title: "Property Launch Brochure",
    kind: "concept",
    category: "Marketing",
    art: "brochure",
    accent: "green",
    summary: "A folded brochure and price-sheet insert for a residential launch.",
    demonstrates: ["Folding and scoring", "Photo-heavy reproduction", "Insert and folder pairing"],
  },
  {
    id: "product-label-range",
    title: "Product Label Range",
    kind: "concept",
    category: "Packaging",
    art: "label",
    accent: "magenta",
    summary: "A family of product labels with shared structure and variant colors.",
    demonstrates: ["Variant management", "Die-cut label shapes", "Surface-appropriate materials"],
  },
  {
    id: "editorial-magazine",
    title: "Editorial Magazine Issue",
    kind: "concept",
    category: "Editorial",
    art: "magazine",
    accent: "purple",
    summary: "A multi-page publication with a heavier cover and consistent inside pages.",
    demonstrates: ["Cover and text stock pairing", "Binding", "Page-to-page color consistency"],
  },
  {
    id: "event-invitation-suite",
    title: "Event Invitation Suite",
    kind: "concept",
    category: "Events",
    art: "invitation",
    accent: "pink",
    summary: "Invitation, program and place cards for a corporate evening.",
    demonstrates: ["Textured and specialty stocks", "Coordinated suite production", "Deadline-driven scheduling"],
  },
  {
    id: "school-module-set",
    title: "School Module Set",
    kind: "concept",
    category: "Education",
    art: "school",
    accent: "yellow",
    summary: "Learning modules and certificates organized for volume and distribution.",
    demonstrates: ["High-volume collation", "Clear, legible reproduction", "Batch labeling for distribution"],
  },
  {
    id: "retail-packaging",
    title: "Retail Packaging Sleeve",
    kind: "concept",
    category: "Packaging",
    art: "packaging",
    accent: "green",
    summary: "A printed paper sleeve and sticker seal for a small-batch product.",
    demonstrates: ["Cardstock structure", "Die-cut sleeves", "Sticker and sleeve color matching"],
  },
  {
    id: "company-profile",
    title: "Company Profile Book",
    kind: "concept",
    category: "Corporate",
    art: "company-profile",
    accent: "blue",
    summary: "A bound company profile for bids, proposals and partner meetings.",
    demonstrates: ["Premium cover finishing", "Bound multi-page production", "Consistent brand color"],
  },
  {
    id: "campaign-posters",
    title: "Campaign Poster Series",
    kind: "concept",
    category: "Marketing",
    art: "poster",
    accent: "magenta",
    summary: "A poster series with a shared grid and bold color for a seasonal campaign.",
    demonstrates: ["Large-format reproduction", "Series consistency", "Coordinated flyer run"],
  },
];
