// Rate limiter in-memory sederhana (per instance).
// Cukup untuk 1 instance PM2; naikkan ke Redis jika multi-instance.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export function clientKey(req: Request, suffix: string): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0] : "").trim() || "unknown";
  return `${ip}:${suffix}`;
}

// Bersihkan bucket kadaluarsa setiap 5 menit agar memori tidak bocor
const interval = setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (now > b.resetAt) buckets.delete(k);
  }
}, 5 * 60 * 1000);
if (typeof interval === "object" && "unref" in interval) {
  (interval as unknown as { unref: () => void }).unref();
}
