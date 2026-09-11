export const ADMIN_COOKIE_NAME = "rxr_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createAdminSession(): Promise<string> {
  const ts = Date.now().toString();
  const sig = await hmacHex(process.env.ADMIN_PASSWORD || "", ts);
  return `${ts}.${sig}`;
}

export async function verifyAdminSession(value: string | undefined | null): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD || "";
  if (!value || !secret) return false;
  const [ts, sig] = value.split(".");
  if (!ts || !sig || !/^\d+$/.test(ts)) return false;
  const age = Date.now() - Number(ts);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_TTL_MS) return false;
  const expected = await hmacHex(secret, ts);
  return constantTimeEqual(sig, expected);
}
