import { db, isDatabaseConfigured, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { MemoryStore, initialGames, initialItems, initialPaymentMethods, initialCategories } from "@/lib/mock-data";
import { Game, Item, PaymentMethod, Transaction, PromoCode, Category } from "@/db/schema";

export async function getCategories(): Promise<Category[]> {
  if (isDatabaseConfigured && db) {
    try {
      const data = await db.select().from(schema.categories);
      if (data.length > 0) return data;
    } catch (e) {
      console.warn("Neon DB query failed, falling back to local memory store:", e);
    }
  }
  return MemoryStore.categories;
}

export async function getGames(categoryId?: string): Promise<Game[]> {
  if (isDatabaseConfigured && db) {
    try {
      const query = db.select().from(schema.games).where(eq(schema.games.isActive, true));
      const data = await query;
      if (data.length > 0) {
        if (categoryId && categoryId !== "all") {
          return data.filter((g) => g.categoryId === categoryId);
        }
        return data;
      }
    } catch (e) {
      console.warn("Neon DB query failed, falling back to local memory store:", e);
    }
  }
  let results = MemoryStore.games.filter((g) => g.isActive);
  if (categoryId && categoryId !== "all") {
    results = results.filter((g) => g.categoryId === categoryId);
  }
  return results;
}

export async function getAllGamesAdmin(): Promise<Game[]> {
  if (isDatabaseConfigured && db) {
    try {
      const data = await db.select().from(schema.games);
      if (data.length > 0) return data;
    } catch (e) {
      console.warn("Neon DB query failed:", e);
    }
  }
  return MemoryStore.games;
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  if (isDatabaseConfigured && db) {
    try {
      const data = await db.select().from(schema.games).where(eq(schema.games.slug, slug)).limit(1);
      if (data.length > 0) return data[0];
    } catch (e) {
      console.warn("Neon DB query failed, falling back to memory store:", e);
    }
  }
  return MemoryStore.games.find((g) => g.slug === slug) || null;
}

export async function getItemsByGameId(gameId: string): Promise<Item[]> {
  if (isDatabaseConfigured && db) {
    try {
      const data = await db
        .select()
        .from(schema.items)
        .where(eq(schema.items.gameId, gameId))
        .orderBy(schema.items.sortOrder);
      if (data.length > 0) return data;
    } catch (e) {
      console.warn("Neon DB query failed, falling back to memory store:", e);
    }
  }
  return MemoryStore.items.filter((i) => i.gameId === gameId && i.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  if (isDatabaseConfigured && db) {
    try {
      const data = await db.select().from(schema.paymentMethods).where(eq(schema.paymentMethods.isActive, true));
      if (data.length > 0) return data;
    } catch (e) {
      console.warn("Neon DB query failed, falling back to memory store:", e);
    }
  }
  return MemoryStore.paymentMethods.filter((p) => p.isActive);
}

export async function getAllPaymentMethodsAdmin(): Promise<PaymentMethod[]> {
  if (isDatabaseConfigured && db) {
    try {
      const data = await db.select().from(schema.paymentMethods);
      if (data.length > 0) return data;
    } catch (e) {
      console.warn("Neon DB query failed:", e);
    }
  }
  return MemoryStore.paymentMethods;
}

export async function validatePromoCode(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string }> {
  const normalized = code.trim().toUpperCase();
  let promo: PromoCode | undefined;

  if (isDatabaseConfigured && db) {
    try {
      const res = await db.select().from(schema.promoCodes).where(eq(schema.promoCodes.code, normalized)).limit(1);
      if (res.length > 0) promo = res[0];
    } catch (e) {
      console.warn("Promo check error:", e);
    }
  }

  if (!promo) {
    promo = MemoryStore.promoCodes.find((p) => p.code === normalized && p.isActive);
  }

  if (!promo) {
    return { valid: false, discount: 0, message: "Kode promo tidak ditemukan atau sudah tidak aktif." };
  }

  if (subtotal < promo.minPurchase) {
    return { valid: false, discount: 0, message: `Minimal pembelian untuk promo ini adalah Rp ${promo.minPurchase.toLocaleString("id-ID")}` };
  }

  let discount = 0;
  if (promo.discountType === "PERCENTAGE") {
    discount = Math.round((subtotal * promo.discountValue) / 100);
    if (promo.maxDiscount && promo.maxDiscount > 0) {
      discount = Math.min(discount, promo.maxDiscount);
    }
  } else {
    discount = promo.discountValue;
  }

  return { valid: true, discount, message: `Promo berhasil digunakan! Diskon Rp ${discount.toLocaleString("id-ID")}` };
}

export async function createTransaction(data: {
  invoiceNumber: string;
  gameId: string;
  gameName: string;
  itemId: string;
  itemName: string;
  paymentMethodId: string;
  paymentMethodName: string;
  accountData: { userId: string; zoneId?: string; server?: string; nickname?: string };
  customerPhone: string;
  customerEmail?: string;
  subtotal: number;
  fee: number;
  discount: number;
  totalAmount: number;
  paymentDetails: { qrString?: string; vaNumber?: string; expiredAt: string };
  notes?: string;
}): Promise<Transaction> {
  const newTx: Transaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...data,
    status: "PENDING",
    notes: data.notes || null,
    customerEmail: data.customerEmail || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (isDatabaseConfigured && db) {
    try {
      await db.insert(schema.transactions).values(newTx);
    } catch (e) {
      console.warn("Neon DB insert failed, storing in memory:", e);
    }
  }

  // Always persist in memory/file store
  MemoryStore.saveTransaction(newTx);
  return newTx;
}

export async function getTransactionByInvoice(invoiceNumber: string): Promise<Transaction | null> {
  const norm = invoiceNumber.trim().toUpperCase();
  if (isDatabaseConfigured && db) {
    try {
      const data = await db.select().from(schema.transactions).where(eq(schema.transactions.invoiceNumber, norm)).limit(1);
      if (data.length > 0) return data[0];
    } catch (e) {
      console.warn("Neon DB query failed, checking memory:", e);
    }
  }
  const all = MemoryStore.getTransactions();
  return all.find((t) => t.invoiceNumber.toUpperCase() === norm) || null;
}

export async function getTransactionsByPhone(phone: string): Promise<Transaction[]> {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  if (isDatabaseConfigured && db) {
    try {
      const data = await db.select().from(schema.transactions).where(eq(schema.transactions.customerPhone, cleanPhone));
      if (data.length > 0) return data;
    } catch (e) {
      console.warn("Neon DB query failed:", e);
    }
  }
  return MemoryStore.getTransactions().filter((t) => t.customerPhone.replace(/[^0-9]/g, "").includes(cleanPhone));
}

export async function getAllTransactions(): Promise<Transaction[]> {
  if (isDatabaseConfigured && db) {
    try {
      const data = await db.select().from(schema.transactions).orderBy(desc(schema.transactions.createdAt));
      if (data.length > 0) return data;
    } catch (e) {
      console.warn("Neon DB query failed:", e);
    }
  }
  return MemoryStore.getTransactions();
}

export async function updateTransactionStatus(
  invoiceNumber: string,
  status: "PENDING" | "PAID" | "PROCESSING" | "SUCCESS" | "FAILED",
  extra?: { notes?: string }
): Promise<Transaction | null> {
  const norm = invoiceNumber.trim().toUpperCase();

  const all = MemoryStore.getTransactions();
  const tx = all.find((t) => t.invoiceNumber.toUpperCase() === norm);
  if (tx) {
    tx.status = status;
    tx.updatedAt = new Date();
    if (extra?.notes !== undefined) {
      tx.notes = extra.notes;
    }
    if (status === "SUCCESS" || status === "PAID") {
      tx.paymentDetails.paidAt = new Date().toISOString();
    }
    MemoryStore.saveTransaction(tx);
  }

  if (isDatabaseConfigured && db) {
    try {
      const setValues: Partial<Transaction> = {
        status,
        updatedAt: new Date(),
        paymentDetails: tx?.paymentDetails || { expiredAt: new Date().toISOString(), paidAt: new Date().toISOString() },
      };
      if (extra?.notes !== undefined) {
        setValues.notes = extra.notes;
      }
      await db
        .update(schema.transactions)
        .set(setValues)
        .where(eq(schema.transactions.invoiceNumber, norm));
    } catch (e) {
      console.warn("Neon DB update failed:", e);
    }
  }

  return tx || null;
}
