import { availableProducts } from "./services";

export const quoteProductOptions = [
  ...availableProducts
    .filter((p) =>
      [
        "business-cards", "flyers", "brochures", "folders", "booklets", "magazines", "catalogs", "posters",
        "menus", "labels", "stickers", "packaging", "certificates", "school-materials", "corporate-materials",
      ].includes(p.id),
    )
    .map((p) => ({ id: p.id, label: p.name, art: p.art })),
  { id: "other", label: "Other", art: "custom" as const },
];

export const sidesOptions = ["Single-sided", "Double-sided", "Not sure"] as const;
export const colorOptions = ["Full Color", "Black & White", "Not Sure"] as const;
export const paperOptions = [
  { id: "Not sure", hint: "We'll recommend a stock" },
  { id: "Standard", hint: "Everyday, dependable" },
  { id: "Premium", hint: "Heavier, more substantial" },
  { id: "Matte", hint: "Low sheen, refined" },
  { id: "Gloss", hint: "High sheen, vivid" },
  { id: "Textured", hint: "Tactile surface" },
  { id: "Custom", hint: "Describe it below" },
] as const;
export const finishingOptions = [
  "None", "Matte Lamination", "Gloss Lamination", "Folding", "Binding", "Cutting", "Die-cut", "Other",
] as const;
export const deadlineOptions = [
  { id: "flexible", label: "Flexible", hint: "No fixed date" },
  { id: "date", label: "By a specific date", hint: "Pick the date" },
  { id: "asap", label: "As soon as possible", hint: "We'll confirm what's realistic" },
] as const;
export const deliveryOptions = ["Pickup", "Delivery", "Not sure yet"] as const;
export const artworkOptions = ["Print-ready files", "Files need adjustment", "No artwork yet"] as const;
