// Date helpers for Asia/Manila (UTC+8, no daylight saving time).

export const TIMEZONE = "Asia/Manila";
const OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** "2026-10-08" for the given instant, in Manila time. */
export function manilaDateKey(date: Date = new Date()): string {
  return new Date(date.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

/** The instant Manila midnight starts for a "YYYY-MM-DD" key. */
export function startOfManilaDay(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) - OFFSET_MS);
}

export function isValidDateKey(key: unknown): key is string {
  if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const d = new Date(`${key}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === key;
}

export function addDaysKey(key: string, days: number): string {
  return manilaDateKey(new Date(startOfManilaDay(key).getTime() + days * DAY_MS));
}

export type RangePreset = "today" | "week" | "month" | "custom";

export type DateRange = {
  preset: RangePreset;
  from: Date; // inclusive
  to: Date; // exclusive
  fromKey: string;
  toKey: string; // inclusive, for display
  label: string;
};

function weekdayOfKey(key: string): number {
  return new Date(`${key}T00:00:00Z`).getUTCDay(); // 0 = Sunday
}

export function todayRange(now = new Date()): DateRange {
  return resolveRange({ preset: "today" }, now);
}

/** Build a Manila-time range. Weeks start on Monday. */
export function resolveRange(
  input: { preset?: string | null; from?: string | null; to?: string | null },
  now = new Date(),
): DateRange {
  const today = manilaDateKey(now);
  const preset = (["today", "week", "month", "custom"].includes(input.preset ?? "") ? input.preset : "today") as RangePreset;

  let fromKey = today;
  let toKey = today;
  if (preset === "week") {
    const dow = weekdayOfKey(today);
    fromKey = addDaysKey(today, -((dow + 6) % 7));
  } else if (preset === "month") {
    fromKey = `${today.slice(0, 8)}01`;
  } else if (preset === "custom") {
    fromKey = isValidDateKey(input.from) ? input.from : today;
    toKey = isValidDateKey(input.to) ? input.to : fromKey;
    if (toKey < fromKey) [fromKey, toKey] = [toKey, fromKey];
  }

  const labels: Record<RangePreset, string> = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    custom: fromKey === toKey ? formatDateKey(fromKey) : `${formatDateKey(fromKey)} – ${formatDateKey(toKey)}`,
  };

  return {
    preset,
    from: startOfManilaDay(fromKey),
    to: startOfManilaDay(addDaysKey(toKey, 1)),
    fromKey,
    toKey,
    label: labels[preset],
  };
}

const dateFmt = new Intl.DateTimeFormat("en-PH", { timeZone: TIMEZONE, month: "short", day: "numeric", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-PH", { timeZone: TIMEZONE, hour: "numeric", minute: "2-digit" });
const shortDateFmt = new Intl.DateTimeFormat("en-PH", { timeZone: TIMEZONE, month: "short", day: "numeric" });

export function formatDate(d: Date | string): string {
  return dateFmt.format(new Date(d));
}
export function formatShortDate(d: Date | string): string {
  return shortDateFmt.format(new Date(d));
}
export function formatTime(d: Date | string): string {
  return timeFmt.format(new Date(d));
}
export function formatDateTime(d: Date | string): string {
  return `${formatDate(d)}, ${formatTime(d)}`;
}
export function formatDateKey(key: string): string {
  return formatDate(startOfManilaDay(key));
}
