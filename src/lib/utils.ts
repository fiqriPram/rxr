import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TPY-${dateStr}-${randomStr}`;
}

export function calculateFee(
  subtotal: number,
  feeFlat: number,
  feePercentage: number | string
): number {
  const pct = typeof feePercentage === "string" ? parseFloat(feePercentage) : feePercentage;
  const percentageFee = Math.round((subtotal * (pct || 0)) / 100);
  return (feeFlat || 0) + percentageFee;
}

export function mockGameNickname(gameSlug: string, userId: string, zoneId?: string): string {
  const prefixes = ["Gamer", "Pro", "King", "Lord", "Shadow", "Ace", "Mythic", "Legend"];
  const titles = ["ID", "Gz", "Tzy", "Gaming", "Rival", "Slayer", "Star"];
  
  const hash = (userId + (zoneId || "")).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const p = prefixes[hash % prefixes.length];
  const t = titles[(hash * 3) % titles.length];
  const num = (hash % 899) + 100;

  if (gameSlug.includes("mobile-legends")) {
    return `${p}_${t}${num}`;
  } else if (gameSlug.includes("free-fire")) {
    return `FF•${p}${t}`;
  } else if (gameSlug.includes("genshin")) {
    return `Traveler_${p}`;
  } else if (gameSlug.includes("valorant")) {
    return `${p}#ID1`;
  }
  return `${p}${t}_${num}`;
}
