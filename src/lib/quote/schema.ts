/**
 * Quote request data model + validation. Shared by the client wizard and the
 * API route so rules never drift. Kept dependency-free on purpose.
 */
import { siteConfig } from "@/config/site";

export type QuoteRequest = {
  product: string;
  productOther: string;
  quantity: string;
  size: string;
  sides: string;
  color: string;
  paper: string;
  paperNotes: string;
  finishing: string[];
  finishingNotes: string;
  deadlineType: string;
  deadlineDate: string;
  delivery: string;
  artwork: string;
  fileLink: string;
  name: string;
  company: string;
  email: string;
  mobile: string;
  message: string;
  consent: boolean;
};

export const emptyQuote: QuoteRequest = {
  product: "",
  productOther: "",
  quantity: "",
  size: "",
  sides: "",
  color: "",
  paper: "",
  paperNotes: "",
  finishing: [],
  finishingNotes: "",
  deadlineType: "",
  deadlineDate: "",
  delivery: "",
  artwork: "",
  fileLink: "",
  name: "",
  company: "",
  email: "",
  mobile: "",
  message: "",
  consent: false,
};

export type QuoteErrors = Partial<Record<keyof QuoteRequest | "files", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Philippine mobile (09XXXXXXXXX / +639XXXXXXXXX) or any reasonable international number.
const PHONE = /^\+?[\d\s()-]{7,20}$/;

export const quoteStepFields: (keyof QuoteRequest)[][] = [
  ["product", "productOther"],
  ["quantity", "size", "sides", "color"],
  ["paper", "paperNotes"],
  ["finishing", "finishingNotes"],
  ["deadlineType", "deadlineDate", "delivery"],
  ["artwork", "fileLink"],
  ["name", "company", "email", "mobile", "message", "consent"],
];

const LIMITS: Partial<Record<keyof QuoteRequest, number>> = {
  productOther: 120, quantity: 60, size: 120, paperNotes: 500, finishingNotes: 500,
  fileLink: 500, name: 120, company: 160, email: 200, mobile: 40, message: 3000,
};

export function validateQuote(q: QuoteRequest, fields?: (keyof QuoteRequest)[]): QuoteErrors {
  const e: QuoteErrors = {};
  const check = (k: keyof QuoteRequest) => !fields || fields.includes(k);

  if (check("product") && !q.product) e.product = "Choose what you'd like printed.";
  if (check("productOther") && q.product === "other" && !q.productOther.trim()) e.productOther = "Tell us briefly what you need.";
  if (check("quantity")) {
    if (!q.quantity.trim()) e.quantity = "Enter an approximate quantity.";
    else if (!/\d/.test(q.quantity)) e.quantity = "Include a number, e.g. 500 or 1,000.";
  }
  if (check("sides") && !q.sides) e.sides = "Select single- or double-sided.";
  if (check("color") && !q.color) e.color = "Select a color option.";
  if (check("paper") && !q.paper) e.paper = "Select a paper option — \"Not sure\" is fine.";
  if (check("paperNotes") && q.paper === "Custom" && !q.paperNotes.trim()) e.paperNotes = "Describe the paper or material you have in mind.";
  if (check("finishing") && q.finishing.length === 0) e.finishing = "Select at least one option, or \"None\".";
  if (check("finishingNotes") && q.finishing.includes("Other") && !q.finishingNotes.trim()) e.finishingNotes = "Describe the finishing you have in mind.";
  if (check("deadlineType") && !q.deadlineType) e.deadlineType = "Let us know your timing.";
  if (check("deadlineDate") && q.deadlineType === "date") {
    if (!q.deadlineDate) e.deadlineDate = "Pick the date you need the project.";
    else {
      const d = new Date(q.deadlineDate + "T23:59:59");
      if (Number.isNaN(d.getTime())) e.deadlineDate = "Enter a valid date.";
      else if (d.getTime() < Date.now() - 86_400_000) e.deadlineDate = "That date has already passed.";
    }
  }
  if (check("fileLink") && q.fileLink.trim()) {
    try {
      const u = new URL(q.fileLink.trim());
      if (!/^https?:$/.test(u.protocol)) throw new Error();
    } catch {
      e.fileLink = "Enter a full link starting with https://";
    }
  }
  if (check("name") && q.name.trim().length < 2) e.name = "Enter your name.";
  if (check("email")) {
    if (!q.email.trim()) e.email = "Enter your email so we can send the quotation.";
    else if (!EMAIL.test(q.email.trim())) e.email = "Enter a valid email address.";
  }
  if (check("mobile") && q.mobile.trim() && !PHONE.test(q.mobile.trim())) e.mobile = "Enter a valid mobile number, e.g. 0917 123 4567.";
  if (check("consent") && !q.consent) e.consent = "Please confirm so we can contact you about this request.";

  for (const [k, max] of Object.entries(LIMITS) as [keyof QuoteRequest, number][]) {
    if (!check(k)) continue;
    const v = q[k];
    if (typeof v === "string" && v.length > max) e[k] = `Please keep this under ${max} characters.`;
  }
  return e;
}

export type FileLike = { name: string; size: number };

export function validateFiles(files: FileLike[]): string | null {
  const { maxFiles, maxFileSizeMB, maxTotalSizeMB, acceptedExtensions } = siteConfig.quote;
  if (files.length > maxFiles) return `You can attach up to ${maxFiles} files. Share the rest with a cloud link.`;
  let total = 0;
  for (const f of files) {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!(acceptedExtensions as readonly string[]).includes(ext)) return `"${f.name}" isn't a supported format. Use ${acceptedExtensions.map((x) => x.toUpperCase()).join(", ")}.`;
    if (f.size > maxFileSizeMB * 1024 * 1024) return `"${f.name}" is larger than ${maxFileSizeMB} MB. Share it with a cloud link instead.`;
    total += f.size;
  }
  if (total > maxTotalSizeMB * 1024 * 1024) return `Attachments exceed ${maxTotalSizeMB} MB in total. Share larger files with a cloud link.`;
  return null;
}

/** Normalises untrusted input into a QuoteRequest (server side). */
export function coerceQuote(raw: unknown): QuoteRequest {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const s = (k: keyof QuoteRequest) => (typeof r[k] === "string" ? (r[k] as string).trim() : "");
  return {
    product: s("product"),
    productOther: s("productOther"),
    quantity: s("quantity"),
    size: s("size"),
    sides: s("sides"),
    color: s("color"),
    paper: s("paper"),
    paperNotes: s("paperNotes"),
    finishing: Array.isArray(r.finishing) ? (r.finishing as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 10) : [],
    finishingNotes: s("finishingNotes"),
    deadlineType: s("deadlineType"),
    deadlineDate: s("deadlineDate"),
    delivery: s("delivery"),
    artwork: s("artwork"),
    fileLink: s("fileLink"),
    name: s("name"),
    company: s("company"),
    email: s("email"),
    mobile: s("mobile"),
    message: s("message"),
    consent: r.consent === true || r.consent === "true",
  };
}

export function makeReference(date = new Date()) {
  const y = String(date.getFullYear()).slice(2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let tail = "";
  const bytes = new Uint8Array(5);
  globalThis.crypto.getRandomValues(bytes);
  for (const b of bytes) tail += alphabet[b % alphabet.length];
  return `GI-${y}${m}${d}-${tail}`;
}
