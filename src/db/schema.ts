import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user, session, account, verification } from "./auth-schema";

export { user, session, account, verification };

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 100 }).default("Gamepad2"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  categoryId: text("category_id").references(() => categories.id),
  developer: varchar("developer", { length: 150 }).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url").notNull(),
  bannerUrl: text("banner_url").notNull(),
  accountInputs: jsonb("account_inputs").$type<{
    userId: boolean;
    userLabel?: string;
    userPlaceholder?: string;
    zoneId?: boolean;
    zoneLabel?: string;
    zonePlaceholder?: string;
    serverList?: { label: string; value: string }[];
    helperText?: string;
  }>().notNull(),
  hasServerCheck: boolean("has_server_check").default(true).notNull(),
  isPopular: boolean("is_popular").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: text("id").primaryKey(),
  gameId: text("game_id").references(() => games.id).notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  price: integer("price").notNull(),
  originalPrice: integer("original_price"),
  iconUrl: text("icon_url"),
  isPromo: boolean("is_promo").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: text("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'QRIS' | 'EWALLET' | 'VA' | 'RETAIL'
  feeFlat: integer("fee_flat").default(0).notNull(),
  feePercentage: numeric("fee_percentage", { precision: 5, scale: 2 }).default("0.00").notNull(),
  iconUrl: text("icon_url").notNull(),
  accountNumber: text("account_number"),
  instructions: jsonb("instructions").$type<string[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const promoCodes = pgTable("promo_codes", {
  id: text("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: varchar("discount_type", { length: 20 }).notNull(), // 'PERCENTAGE' | 'FLAT'
  discountValue: integer("discount_value").notNull(),
  maxDiscount: integer("max_discount").default(0),
  minPurchase: integer("min_purchase").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  userId: text("user_id").references(() => user.id),
  gameId: text("game_id").references(() => games.id).notNull(),
  gameName: varchar("game_name", { length: 150 }).notNull(),
  itemId: text("item_id").references(() => items.id).notNull(),
  itemName: varchar("item_name", { length: 150 }).notNull(),
  paymentMethodId: text("payment_method_id").references(() => paymentMethods.id).notNull(),
  paymentMethodName: varchar("payment_method_name", { length: 100 }).notNull(),
  accountData: jsonb("account_data").$type<{
    userId: string;
    zoneId?: string;
    server?: string;
    nickname?: string;
  }>().notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  customerEmail: varchar("customer_email", { length: 100 }),
  subtotal: integer("subtotal").notNull(),
  fee: integer("fee").notNull(),
  discount: integer("discount").default(0).notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: varchar("status", { length: 50 }).default("PENDING").notNull(), // 'PENDING' | 'PAID' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  paymentDetails: jsonb("payment_details").$type<{
    qrString?: string;
    qrImageUrl?: string;
    vaNumber?: string;
    vaExtra?: string;
    expiredAt: string;
    paidAt?: string;
  }>().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Category = typeof categories.$inferSelect;
export type User = typeof user.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Item = typeof items.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type PromoCode = typeof promoCodes.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
