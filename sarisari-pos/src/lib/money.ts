// Money helpers. All arithmetic is done in whole centavos (integers), which is exact.
// Values from the database (Prisma Decimal) are converted with toCents(); results are
// converted back with fromCents() to a "123.45" string for Decimal columns.

type DecimalLike = { toFixed: (dp: number) => string };
export type MoneyInput = string | number | DecimalLike | null | undefined;

/** Parse a money value into integer centavos without going through floating point math. */
export function toCents(value: MoneyInput): number {
  if (value === null || value === undefined || value === "") return 0;
  let str: string;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return 0;
    str = value.toFixed(2);
  } else if (typeof value === "string") {
    str = value.trim().replace(/[₱,\s]/g, "");
  } else {
    str = value.toFixed(2);
  }
  const match = /^(-)?(\d*)(?:\.(\d*))?$/.exec(str);
  if (!match) return NaN;
  const [, sign, whole = "", frac = ""] = match;
  if (whole === "" && frac === "") return NaN;
  const frac3 = (frac + "000").slice(0, 3);
  let cents = parseInt(whole || "0", 10) * 100 + parseInt(frac3.slice(0, 2), 10);
  if (parseInt(frac3[2], 10) >= 5) cents += 1; // round half up on the 3rd decimal
  return sign ? -cents : cents;
}

/** Centavos -> "123.45" (for Decimal columns and inputs). */
export function fromCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

/** Display as Philippine Peso: ₱1,250.00 (or ₱1,250 when `compact` and no centavos). */
export function peso(value: MoneyInput, opts: { compact?: boolean } = {}): string {
  const cents = toCents(value);
  if (Number.isNaN(cents)) return "₱—";
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100).toLocaleString("en-PH");
  const frac = String(abs % 100).padStart(2, "0");
  if (opts.compact && frac === "00") return `${sign}₱${whole}`;
  return `${sign}₱${whole}.${frac}`;
}

/** Validate a user-typed money amount. Returns centavos or an error message. */
export function parseMoneyInput(
  raw: unknown,
  { allowZero = false, label = "Amount" }: { allowZero?: boolean; label?: string } = {},
): { cents: number } | { error: string } {
  const str = typeof raw === "string" ? raw : raw == null ? "" : String(raw);
  if (str.trim() === "") return allowZero ? { cents: 0 } : { error: `${label} is required.` };
  const cents = toCents(str);
  if (Number.isNaN(cents)) return { error: `${label} must be a valid amount.` };
  if (cents < 0) return { error: `${label} cannot be negative.` };
  if (!allowZero && cents === 0) return { error: `${label} must be more than ₱0.` };
  if (cents > 99_999_999_99) return { error: `${label} is too large.` };
  return { cents };
}

// ---------------------------------------------------------------------------
// Cart math — shared by the POS screen and the server, so both agree exactly.
// ---------------------------------------------------------------------------

export type DiscountKind = "NONE" | "PERCENT" | "FIXED";

export function computeDiscountCents(subtotalCents: number, kind: DiscountKind, valueCents: number): number {
  if (kind === "PERCENT") {
    // valueCents holds the percentage * 100 (e.g. 10% -> 1000)
    const pct = Math.min(Math.max(valueCents, 0), 100_00);
    return Math.round((subtotalCents * pct) / 100_00);
  }
  if (kind === "FIXED") return Math.min(Math.max(valueCents, 0), subtotalCents);
  return 0;
}

/** Format an integer centavo amount as pesos. */
export function pesoCents(cents: number, opts: { compact?: boolean } = {}): string {
  return peso(fromCents(cents), opts);
}
