import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "./schema";
import { initialCategories, initialGames, initialItems, initialPaymentMethods, initialPromoCodes } from "../lib/mock-data";

dotenv.config({ path: ".env" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function seed() {
  console.log("🌱 Memulai seeding Neon Database...");

  if (!connectionString || connectionString.includes("username:password@ep-cool-sample")) {
    console.error("❌ DATABASE_URL belum diisi atau masih berupa placeholder.");
    console.log("👉 Silakan isi DATABASE_URL valid dari Neon di file .env.local terlebih dahulu.");
    process.exit(1);
  }

  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  try {
    console.log("🧹 Membersihkan data lama di database...");
    await db.delete(schema.transactions);
    await db.delete(schema.items);
    await db.delete(schema.games);
    await db.delete(schema.categories);
    await db.delete(schema.paymentMethods);
    await db.delete(schema.promoCodes);

    console.log("📦 Memasukkan Kategori...");
    for (const cat of initialCategories) {
      await db.insert(schema.categories).values(cat).onConflictDoNothing();
    }

    console.log("🎮 Memasukkan Game...");
    for (const game of initialGames) {
      await db.insert(schema.games).values(game).onConflictDoNothing();
    }

    console.log("💎 Memasukkan Item & Denominasi...");
    for (const item of initialItems) {
      await db.insert(schema.items).values(item).onConflictDoNothing();
    }

    console.log("💳 Memasukkan Metode Pembayaran...");
    for (const pm of initialPaymentMethods) {
      await db.insert(schema.paymentMethods).values(pm).onConflictDoNothing();
    }

    console.log("🎟️ Memasukkan Kode Promo...");
    for (const promo of initialPromoCodes) {
      await db.insert(schema.promoCodes).values(promo).onConflictDoNothing();
    }

    console.log("✅ Seeding Neon Database berhasil 100%!");
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat seeding:", error);
    process.exit(1);
  }
}

seed();
