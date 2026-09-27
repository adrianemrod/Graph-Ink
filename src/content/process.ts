export type ProcessStep = { n: string; title: string; body: string; detail: string };

export const processSteps: ProcessStep[] = [
  { n: "01", title: "Tell us what you need", body: "Share what you're printing, how many, and when you need it.", detail: "The quote builder walks you through specifications. \"Not sure\" is always a valid answer." },
  { n: "02", title: "Receive your quote", body: "We review your specifications and send a clear quotation.", detail: "If something is unclear or could be done better, we'll ask before quoting." },
  { n: "03", title: "Approve the details", body: "Confirm specs, artwork and schedule before anything is printed.", detail: "Nothing goes to press without your approval." },
  { n: "04", title: "Production begins", body: "Your job is prepared, printed and finished to the approved specs.", detail: "Prepress, printing and finishing follow the approved details." },
  { n: "05", title: "Quality check", body: "Finished pieces are checked against the approved details.", detail: "Color, cut, count and finishing are reviewed before release." },
  { n: "06", title: "Ready for delivery / pickup", body: "Your order is packed and ready for delivery or pickup.", detail: "Arrangements are confirmed with your quotation." },
];

export const journeyStages = [
  { key: "idea", label: "Idea", title: "It starts as a brief.", body: "A launch, a menu, a proposal. We start with what the print needs to do.", product: "Brief" },
  { key: "design", label: "Design", title: "Layout meets purpose.", body: "Your artwork arrives — or takes shape — with the finished piece in mind.", product: "Flyer" },
  { key: "prepress", label: "Prepress", title: "Every file, checked.", body: "Bleed, safe zones, resolution and color are reviewed before press.", product: "Brochure" },
  { key: "print", label: "Print", title: "Ink meets paper.", body: "Cyan, magenta, yellow and black — laid down in register.", product: "Business card" },
  { key: "finish", label: "Finish", title: "Cut, fold, bind.", body: "Trimming, folding, lamination and binding turn sheets into objects.", product: "Booklet" },
  { key: "deliver", label: "Deliver", title: "Ready to represent you.", body: "Checked, packed and prepared for pickup or delivery.", product: "Packaging" },
] as const;
