import { createHash } from "crypto";

export function getMidtransConfig() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const envOverride = process.env.MIDTRANS_ENV;
  const isProduction =
    envOverride === "production" || (envOverride !== "sandbox" && !serverKey.startsWith("SB-"));
  return {
    isProduction,
    apiBase: isProduction ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com",
    merchantId: process.env.MIDTRANS_MERCHANT_ID || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    serverKey,
  };
}

export function isMidtransConfigured(): boolean {
  const { serverKey } = getMidtransConfig();
  return Boolean(serverKey);
}

function basicAuth(): string {
  const { serverKey } = getMidtransConfig();
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}

// Kode metode pembayaran di app -> payment_type Midtrans Core API
export type MidtransChargeKind =
  | { kind: "qris" }
  | { kind: "bank_transfer"; bank: "bca" | "bri" | "mandiri" }
  | { kind: "gopay" }
  | { kind: "cstore"; store: "indomaret" };

export const MIDTRANS_PAYMENT_MAP: Record<string, MidtransChargeKind> = {
  QRIS: { kind: "qris" },
  DANA: { kind: "qris" }, // DANA tidak ada channel direct, via QRIS (bisa di-scan DANA)
  GOPAY: { kind: "gopay" },
  BCA_VA: { kind: "bank_transfer", bank: "bca" },
  MANDIRI_VA: { kind: "bank_transfer", bank: "mandiri" },
  BRI_VA: { kind: "bank_transfer", bank: "bri" },
  // ALFAMART tidak didukung Midtrans (cstore hanya Indomaret) -> dinonaktifkan
};

export interface MidtransChargeParams {
  orderId: string;
  amount: number;
  method: MidtransChargeKind;
  customerName: string;
  email?: string;
  phone?: string;
}

export interface MidtransChargeResult {
  ok: boolean;
  vaNumber?: string;
  vaExtra?: string; // mis. company/biller code Mandiri
  qrImageUrl?: string;
  deeplinkUrl?: string;
  transactionId?: string;
  statusCode?: string;
  statusMessage?: string;
}

function expiryFor(method: MidtransChargeKind): { unit: "minute" | "hour"; duration: number } {
  if (method.kind === "bank_transfer") return { unit: "hour", duration: 24 };
  if (method.kind === "qris") return { unit: "minute", duration: 120 };
  return { unit: "minute", duration: 60 };
}

export async function createMidtransCharge(
  params: MidtransChargeParams
): Promise<MidtransChargeResult> {
  const { apiBase } = getMidtransConfig();

  const body: Record<string, unknown> = {
    payment_type: params.method.kind === "cstore" ? "cstore" : params.method.kind,
    transaction_details: { order_id: params.orderId, gross_amount: params.amount },
    customer_details: {
      first_name: params.customerName.slice(0, 50),
      email: params.email || "customer@rxr.topup",
      phone: params.phone || "",
    },
    custom_expiry: {
      // Format Midtrans: "yyyy-MM-dd HH:mm:ss +0700" (WIB)
      order_time:
        new Date(Date.now() + 7 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ") + " +0700",
      expiry_duration:
        expiryFor(params.method).unit === "hour"
          ? expiryFor(params.method).duration
          : expiryFor(params.method).duration,
      unit: expiryFor(params.method).unit,
    },
  };

  if (params.method.kind === "bank_transfer") {
    body.bank_transfer = { bank: params.method.bank };
  } else if (params.method.kind === "cstore") {
    body.cstore = { store: params.method.store };
  } else if (params.method.kind === "gopay") {
    body.gopay = { enable_callback: true, callback_url: "" };
  }

  let json: Record<string, unknown> = {};
  try {
    const res = await fetch(`${apiBase}/v2/charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: basicAuth(),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    return { ok: false, statusMessage: "Gagal menghubungi Midtrans." };
  }

  const okCodes = ["200", "201"];
  if (!okCodes.includes(String(json.status_code))) {
    const msgs = Array.isArray(json.validation_messages)
      ? json.validation_messages.join("; ")
      : undefined;
    return {
      ok: false,
      statusCode: String(json.status_code ?? ""),
      statusMessage: msgs || (typeof json.status_message === "string" ? json.status_message : "Gagal membuat tagihan Midtrans."),
    };
  }

  const result: MidtransChargeResult = {
    ok: true,
    statusCode: String(json.status_code),
    statusMessage: typeof json.status_message === "string" ? json.status_message : undefined,
    transactionId: typeof json.transaction_id === "string" ? json.transaction_id : undefined,
  };

  const vaNumbers = json.va_numbers as Array<{ bank?: string; va_number?: string }> | undefined;
  if (vaNumbers && vaNumbers.length > 0 && vaNumbers[0].va_number) {
    result.vaNumber = vaNumbers[0].va_number;
  }
  if (typeof json.bill_key === "string") {
    result.vaNumber = json.bill_key;
    if (typeof json.biller_code === "string") result.vaExtra = json.biller_code;
  }
  if (typeof json.permata_va_number === "string") {
    result.vaNumber = json.permata_va_number;
  }
  const actions = json.actions as Array<{ name?: string; url?: string }> | undefined;
  if (actions) {
    const qr = actions.find((a) => a.name === "generate-qr-code" && a.url);
    if (qr?.url) result.qrImageUrl = qr.url;
    const deep = actions.find((a) => a.name === "deeplink-redirect" && a.url);
    if (deep?.url) result.deeplinkUrl = deep.url;
    const paycode = actions.find((a) => a.name === "generate-payment-code" && a.url);
    if (paycode?.url && !result.vaNumber) result.vaNumber = paycode.url;
  }

  return result;
}

export interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
}

// Verifikasi signature notifikasi: SHA512(order_id + status_code + gross_amount + serverKey)
export function verifyMidtransNotification(n: MidtransNotification): boolean {
  const { serverKey } = getMidtransConfig();
  if (!n.order_id || !n.status_code || !n.gross_amount || !n.signature_key || !serverKey) {
    return false;
  }
  const expected = createHash("sha512")
    .update(`${n.order_id}${n.status_code}${n.gross_amount}${serverKey}`)
    .digest("hex");
  if (expected.length !== n.signature_key.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ n.signature_key.charCodeAt(i);
  }
  return diff === 0;
}

export async function checkMidtransStatus(orderId: string): Promise<{
  ok: boolean;
  transactionStatus?: string;
  statusMessage?: string;
}> {
  const { apiBase } = getMidtransConfig();
  try {
    const res = await fetch(`${apiBase}/v2/${encodeURIComponent(orderId)}/status`, {
      headers: { Accept: "application/json", Authorization: basicAuth() },
      cache: "no-store",
    });
    const json = (await res.json()) as Record<string, unknown>;
    return {
      ok: true,
      transactionStatus:
        typeof json.transaction_status === "string" ? json.transaction_status : undefined,
      statusMessage: typeof json.status_message === "string" ? json.status_message : undefined,
    };
  } catch {
    return { ok: false };
  }
}
