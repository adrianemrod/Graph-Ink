/**
 * Brand pillars and operating standards.
 *
 * Owner note on `standards`: only keep commitments GraphInk Media actually
 * practices on every order. Remove any line that isn't true yet.
 */
import type { Accent } from "./services";

export const pillars: { title: string; body: string; accent: Accent }[] = [
  { title: "Precision", body: "Every detail matters — from layout and color to paper and finishing.", accent: "cyan" },
  { title: "Color", body: "Print should carry the same visual confidence as your digital brand.", accent: "magenta" },
  { title: "Material", body: "Paper isn't just a surface. It changes how your brand feels in someone's hands.", accent: "yellow" },
  { title: "Consistency", body: "Professional brands deserve consistent output across every printed touchpoint.", accent: "green" },
  { title: "Service", body: "Clear communication from quotation to production and delivery.", accent: "purple" },
];

export const standards: { title: string; body: string }[] = [
  { title: "Clear quotation process", body: "Every job starts with a written quotation based on your actual specifications." },
  { title: "Specification review", body: "We read your specs and ask questions before quoting, not after printing." },
  { title: "Artwork checking", body: "Files are reviewed for bleed, resolution and print readiness." },
  { title: "Material guidance", body: "Honest recommendations on paper and finishing for what the piece needs to do." },
  { title: "Approval before press", body: "Nothing is printed until you've approved the details." },
  { title: "Quality inspection", body: "Finished work is checked against the approved specifications before release." },
  { title: "Professional communication", body: "Clear updates and a direct line throughout the project." },
];
