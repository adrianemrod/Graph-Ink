/**
 * Frequently asked questions. Answers intentionally avoid fixed turnaround
 * times, prices or guarantees — update them once policies are confirmed.
 */
export type FAQ = { q: string; a: string; category: "General" | "Orders" | "Files" | "Production" | "Delivery" };

export const faqs: FAQ[] = [
  {
    q: "What printing services do you offer?",
    a: "Business printing (business cards, company profiles, folders, certificates, corporate stationery), marketing collateral (brochures, menus, invitations, campaign pieces), paper printing (flyers, posters, booklets, magazines, catalogs, school materials) and custom printing (stickers, labels, packaging and special paper products). If your project isn't listed, send the details through the quote form and we'll tell you honestly whether we can produce it.",
    category: "General",
  },
  {
    q: "Can you handle bulk orders?",
    a: "Yes, we welcome volume orders. Share the quantity, specifications and your target date when you request a quote, and we'll confirm the production plan and schedule for your specific order.",
    category: "Orders",
  },
  {
    q: "Do you provide design assistance?",
    a: "Tell us where your artwork stands — finished, needs adjustment, or not started — in the quote form. We'll review your files for print readiness and let you know what support we can offer for your project.",
    category: "Files",
  },
  {
    q: "What file formats can I submit?",
    a: "PDF is preferred for print-ready artwork. We also accept JPG, PNG, AI, PSD and DOCX. For best results, include bleed, use high-resolution images and embed or outline your fonts. Large files can be shared through a cloud link in the quote form.",
    category: "Files",
  },
  {
    q: "Can you recommend paper?",
    a: "Yes. Tell us what the piece is for, how it will be handled and the impression it should make, and we'll recommend suitable stock and finishing options. Choosing \"Not sure\" in the quote builder is completely fine.",
    category: "Production",
  },
  {
    q: "How long does printing take?",
    a: "Turnaround depends on the project specifications, quantity, materials, finishing requirements, and production schedule. Share your deadline when you request a quote and we'll confirm a realistic timeline before production starts.",
    category: "Production",
  },
  {
    q: "Do you offer delivery?",
    a: "Delivery and pickup options depend on your location and order. Let us know your preferred arrangement in your request and we'll confirm what's available along with your quotation.",
    category: "Delivery",
  },
  {
    q: "Can I request a quotation before ordering?",
    a: "Always. Every project starts with a quotation based on your specifications. There's no commitment until you approve the details.",
    category: "Orders",
  },
  {
    q: "Do you accept rush projects?",
    a: "Rush requests are reviewed case by case, depending on the job and the current production schedule. Mark your deadline clearly in the quote form and we'll tell you honestly whether it can be met.",
    category: "Orders",
  },
  {
    q: "Can you print custom sizes?",
    a: "Custom sizes are often possible. Include the exact finished dimensions — or a dieline or sample, if you have one — and we'll confirm feasibility, materials and finishing in your quotation.",
    category: "Production",
  },
];
