import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

export const USER_COOKIE_NAME = "rxr_user";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari

function sessionSecret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

// ---- Password hashing (scrypt, tanpa dependensi tambahan) ----

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  let derived: Buffer;
  try {
    derived = scryptSync(password, salt, 64);
  } catch {
    return false;
  }
  try {
    return timingSafeEqual(derived, Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

// ---- Session cookie (stateless, HMAC) ----

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

export async function createUserSession(userId: string): Promise<string> {
  const payload = `${userId}.${Date.now()}`;
  const sig = await hmacHex(sessionSecret(), payload);
  return `${payload}.${sig}`;
}

export async function verifyUserSession(
  value: string | undefined | null
): Promise<{ userId: string } | null> {
  const secret = sessionSecret();
  if (!value || !secret) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [userId, ts, sig] = parts;
  if (!userId || !/^\d+$/.test(ts)) return null;
  const age = Date.now() - Number(ts);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_TTL_MS) return null;
  const expected = await hmacHex(secret, `${userId}.${ts}`);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0 ? { userId } : null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
