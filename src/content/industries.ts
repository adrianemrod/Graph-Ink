import type { Accent } from "./services";

export type Industry = {
  id: string;
  name: string;
  line: string;
  prints: string[];
  accent: Accent;
  glyph: "grid" | "stack" | "plate" | "key" | "book" | "cross" | "tag" | "ticket" | "palette" | "flag" | "spark" | "brief";
};

export const industries: Industry[] = [
  { id: "businesses", name: "Businesses", line: "Everyday print that keeps a brand consistent.", prints: ["Business cards", "Letterheads", "Flyers"], accent: "cyan", glyph: "grid" },
  { id: "corporate", name: "Corporate Teams", line: "Materials that survive the boardroom.", prints: ["Company profiles", "Folders", "Certificates"], accent: "blue", glyph: "stack" },
  { id: "restaurants", name: "Restaurants", line: "Menus and table pieces that match the room.", prints: ["Menus", "Table tents", "Labels"], accent: "orange", glyph: "plate" },
  { id: "real-estate", name: "Real Estate", line: "Brochures that sell before the site visit.", prints: ["Brochures", "Price sheets", "Folders"], accent: "green", glyph: "key" },
  { id: "schools", name: "Schools", line: "Organized print for classrooms and campuses.", prints: ["Modules", "Certificates", "Yearbooks"], accent: "yellow", glyph: "book" },
  { id: "healthcare", name: "Healthcare", line: "Clear, calm materials for patients and staff.", prints: ["Forms", "Patient leaflets", "Clinic stationery"], accent: "cyan", glyph: "cross" },
  { id: "retail", name: "Retail", line: "Point-of-sale print that moves product.", prints: ["Labels", "Posters", "Packaging"], accent: "magenta", glyph: "tag" },
  { id: "events", name: "Events", line: "Everything the guest touches, on schedule.", prints: ["Invitations", "Programs", "Passes"], accent: "purple", glyph: "ticket" },
  { id: "creative", name: "Creative Teams", line: "A production partner that respects the file.", prints: ["Portfolios", "Zines", "Posters"], accent: "pink", glyph: "palette" },
  { id: "organizations", name: "Organizations", line: "Communication for members and communities.", prints: ["Newsletters", "Booklets", "Event programs"], accent: "green", glyph: "flag" },
  { id: "startups", name: "Startups", line: "Look established from the first meeting.", prints: ["Pitch folders", "Stickers", "Cards"], accent: "orange", glyph: "spark" },
  { id: "professional", name: "Professional Services", line: "Understated print for trusted advisors.", prints: ["Stationery", "Reports", "Profiles"], accent: "blue", glyph: "brief" },
];
