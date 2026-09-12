import { z } from "zod";

export const orderSchema = z.object({
  gameSlug: z.string().min(1).max(150),
  itemId: z.string().min(1).max(100),
  paymentMethodId: z.string().min(1).max(100),
  accountData: z.object({
    userId: z.string().trim().min(3).max(100),
    zoneId: z.string().trim().max(50).optional(),
    server: z.string().trim().max(100).optional(),
    nickname: z.string().trim().max(100).optional(),
  }),
  customerPhone: z
    .string()
    .trim()
    .min(9)
    .max(20)
    .regex(/^[+0-9][0-9\s-]*$/, "Nomor WhatsApp tidak valid."),
  customerEmail: z.string().trim().email().max(100).optional().or(z.literal("")),
  promoCode: z.string().trim().max(50).optional(),
});

export const nicknameSchema = z.object({
  gameSlug: z.string().min(1).max(150),
  userId: z.string().trim().min(3).max(100),
  zoneId: z.string().trim().max(50).optional().default(""),
  server: z.string().trim().max(100).optional().default(""),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1).max(200),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SUCCESS", "FAILED"]),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type NicknameInput = z.infer<typeof nicknameSchema>;
