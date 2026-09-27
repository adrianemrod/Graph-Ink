/**
 * Paper & material showcase.
 *
 * Owner notes: `weight` is deliberately empty — fill in real options
 * (e.g. "Available in several weights") only once your stock list is set.
 * Empty fields render as "Confirmed at quotation".
 */
export type Material = {
  id: string;
  name: string;
  finish: string;
  weight: string;
  texture: "smooth" | "matte" | "gloss" | "tooth" | "linen" | "pearl" | "heavy" | "natural";
  tone: string; // paper colour for the sample
  feels: string;
  looks: string;
  bestFor: string[];
};

export const materials: Material[] = [
  {
    id: "uncoated",
    name: "Uncoated",
    finish: "Natural, no coating",
    weight: "",
    texture: "natural",
    tone: "#F4F1EA",
    feels: "Soft and slightly toothy. Easy to write on.",
    looks: "Warm and honest. Colors sit into the fibers for a calmer, understated result.",
    bestFor: ["Letterheads", "Notepads", "Forms", "Books"],
  },
  {
    id: "coated",
    name: "Coated",
    finish: "Smooth coating",
    weight: "",
    texture: "smooth",
    tone: "#FFFFFF",
    feels: "Smooth and even under the fingertips.",
    looks: "Crisp detail and brighter colors, since ink stays on the surface.",
    bestFor: ["Flyers", "Catalogs", "Magazines", "Brochures"],
  },
  {
    id: "matte",
    name: "Matte",
    finish: "Low-sheen surface",
    weight: "",
    texture: "matte",
    tone: "#FAFAF8",
    feels: "Velvety and calm, with no slick feel.",
    looks: "Refined and glare-free. Text reads comfortably under any light.",
    bestFor: ["Company profiles", "Menus", "Business cards", "Reports"],
  },
  {
    id: "gloss",
    name: "Gloss",
    finish: "High-sheen surface",
    weight: "",
    texture: "gloss",
    tone: "#FFFFFF",
    feels: "Slick and bright, almost like a photograph.",
    looks: "Punchy contrast and saturated color that catches the light.",
    bestFor: ["Posters", "Photo-heavy flyers", "Product sheets"],
  },
  {
    id: "textured",
    name: "Textured",
    finish: "Embossed or felt surface",
    weight: "",
    texture: "linen",
    tone: "#F6F3EE",
    feels: "Tactile. A pattern you notice the moment you touch it.",
    looks: "Crafted and premium, with a subtle play of light across the surface.",
    bestFor: ["Invitations", "Certificates", "Premium cards"],
  },
  {
    id: "premium",
    name: "Premium",
    finish: "Specialty premium stock",
    weight: "",
    texture: "tooth",
    tone: "#F8F6F1",
    feels: "Substantial and deliberate — the piece people keep.",
    looks: "Deep, rich and understated. Quiet luxury.",
    bestFor: ["Executive cards", "Luxury menus", "Brand kits"],
  },
  {
    id: "cardstock",
    name: "Cardstock",
    finish: "Rigid board",
    weight: "",
    texture: "heavy",
    tone: "#FBFAF7",
    feels: "Firm and durable. Holds its shape.",
    looks: "Clean edges and structure that stands up on its own.",
    bestFor: ["Folders", "Tags", "Packaging", "Covers"],
  },
  {
    id: "specialty",
    name: "Specialty",
    finish: "Metallic, pearl or colored",
    weight: "",
    texture: "pearl",
    tone: "#F3F1F6",
    feels: "Unexpected. Made for moments that need to stand out.",
    looks: "A subtle shimmer or color that plain paper can't reproduce.",
    bestFor: ["Invitations", "Special editions", "Gift packaging"],
  },
];
