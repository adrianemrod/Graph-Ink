import "server-only";

/**
 * Lightweight in-memory abuse protection. On serverless platforms memory is
 * per-instance, so treat this as a speed bump — use a shared store (Upstash,
 * Supabase) or a CAPTCHA provider for stronger guarantees.
 */
const hits = new Map<string, number[]>();
const idempotency = new Map<string, { reference: string; at: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60_000) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= limit) return false;
  list.push(now);
  hits.set(key, list);
  return true;
}

export function recall(key: string) {
  const hit = idempotency.get(key);
  if (hit && Date.now() - hit.at < 30 * 60_000) return hit.reference;
  return null;
}

export function remember(key: string, reference: string) {
  idempotency.set(key, { reference, at: Date.now() });
  if (idempotency.size > 2000) {
    const oldest = [...idempotency.entries()].sort((a, b) => a[1].at - b[1].at).slice(0, 500);
    for (const [k] of oldest) idempotency.delete(k);
  }
}

export function clientKey(headers: Headers) {
  return (headers.get("x-forwarded-for")?.split(",")[0] || headers.get("x-real-ip") || "anon").trim();
}
