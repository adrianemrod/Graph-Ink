/** An error whose message is safe and friendly enough to show the user. */
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}

export function isUniqueViolation(err: unknown, field?: string): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { code?: string; meta?: { target?: unknown; driverAdapterError?: { cause?: { constraint?: { fields?: string[] } } } } };
  if (e.code !== "P2002") return false;
  if (!field) return true;
  const target = e.meta?.target;
  const fields = e.meta?.driverAdapterError?.cause?.constraint?.fields;
  const haystack = JSON.stringify([target, fields]);
  return haystack.includes(field);
}

export function cleanText(value: unknown, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function optionalText(value: unknown, max = 200): string | null {
  const text = cleanText(value, max);
  return text === "" ? null : text;
}
