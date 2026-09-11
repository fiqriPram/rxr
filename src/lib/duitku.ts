import { createHmac } from "crypto";

export function getDuitkuConfig() {
  const env = process.env.DUITKU_ENV === "production" ? "production" : "sandbox";
  return {
    env,
    baseUrl:
      env === "production"
        ? "https://passport.duitku.com"
        : "https://sandbox.duitku.com",
    merchantCode: process.env.DUITKU_MERCHANT_CODE || "",
    apiKey: process.env.DUITKU_API_KEY || "",
  };
}

export function isDuitkuConfigured(): boolean {
  const { merchantCode, apiKey } = getDuitkuConfig();
  return Boolean(merchantCode && apiKey);
}

// Kode metode pembayaran di app -> kode paymentMethod Duitku
export const DUITKU_PAYMENT_MAP: Record<string, string> = {
  QRIS: "NQ", // QRIS Nobu (expiry s.d. 1440 menit)
  DANA: "DA",
  GOPAY: "NQ", // GoPay tidak ada kode direct, via QRIS (bisa di-scan GoPay)
  BCA_VA: "BC",
  MANDIRI_VA: "M2",
  BRI_VA: "BR",
  ALFAMART: "FT",
};

// Kode Duitku yang mengembalikan qrString
export const DUITKU_QR_CODES = ["NQ", "GQ", "SQ", "SP"];

function sign(parts: string[]): string {
  const { apiKey } = getDuitkuConfig();
  return createHmac("sha256", apiKey).update(parts.join("")).digest("hex");
}

export interface DuitkuInvoiceParams {
  orderId: string;
  amount: number;
  paymentMethod: string;
  productDetails: string;
  customerName: string;
  email?: string;
  phone?: string;
  callbackUrl: string;
  returnUrl: string;
  expiryMinutes?: number;
}

export interface DuitkuInvoiceResult {
  ok: boolean;
  reference?: string;
  vaNumber?: string;
  qrString?: string;
  paymentUrl?: string;
  amount?: number;
  statusCode?: string;
  message?: string;
}

export async function createDuitkuInvoice(
  params: DuitkuInvoiceParams
): Promise<DuitkuInvoiceResult> {
  const { baseUrl, merchantCode } = getDuitkuConfig();
  const signature = sign([merchantCode, params.orderId, String(params.amount)]);

  const body: Record<string, unknown> = {
    merchantCode,
    paymentAmount: params.amount,
    paymentMethod: params.paymentMethod,
    merchantOrderId: params.orderId,
    productDetails: params.productDetails.slice(0, 255),
    customerVaName: params.customerName.slice(0, 20),
    email: params.email || "customer@rxr.topup",
    phoneNumber: params.phone || "",
    callbackUrl: params.callbackUrl,
    returnUrl: params.returnUrl,
    signature,
  };
  if (params.expiryMinutes) body.expiryPeriod = params.expiryMinutes;

  let json: Record<string, unknown> = {};
  try {
    const res = await fetch(`${baseUrl}/webapi/api/merchant/v2/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    json = (await res.json()) as Record<string, unknown>;
  } catch (e) {
    return { ok: false, message: "Gagal menghubungi Duitku." };
  }

  if (json.statusCode === "00") {
    return {
      ok: true,
      reference: typeof json.reference === "string" ? json.reference : undefined,
      vaNumber: typeof json.vaNumber === "string" ? json.vaNumber : undefined,
      qrString: typeof json.qrString === "string" ? json.qrString : undefined,
      paymentUrl: typeof json.paymentUrl === "string" ? json.paymentUrl : undefined,
      amount: Number(json.amount) || params.amount,
      statusCode: "00",
    };
  }
  return {
    ok: false,
    statusCode: typeof json.statusCode === "string" ? json.statusCode : undefined,
    message:
      typeof json.statusMessage === "string"
        ? json.statusMessage
        : "Gagal membuat tagihan Duitku.",
  };
}

export interface DuitkuStatusResult {
  ok: boolean;
  statusCode?: string;
  statusMessage?: string;
}

export async function checkDuitkuStatus(orderId: string): Promise<DuitkuStatusResult> {
  const { baseUrl, merchantCode } = getDuitkuConfig();
  const signature = sign([merchantCode, orderId]);
  try {
    const res = await fetch(`${baseUrl}/webapi/api/merchant/transactionStatus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantCode, merchantOrderId: orderId, signature }),
      cache: "no-store",
    });
    const json = (await res.json()) as Record<string, unknown>;
    return {
      ok: true,
      statusCode: typeof json.statusCode === "string" ? json.statusCode : undefined,
      statusMessage: typeof json.statusMessage === "string" ? json.statusMessage : undefined,
    };
  } catch {
    return { ok: false };
  }
}

// Verifikasi signature callback Duitku (form-urlencoded POST).
// Formula: HMAC_SHA256(merchantCode + amount + merchantOrderId, apiKey)
export function verifyDuitkuCallback(params: {
  merchantCode: string;
  amount: string;
  merchantOrderId: string;
  signature: string;
}): boolean {
  const { merchantCode: ours } = getDuitkuConfig();
  if (!params.merchantCode || params.merchantCode !== ours) return false;
  if (!params.amount || !params.merchantOrderId || !params.signature) return false;
  const expected = sign([params.merchantCode, params.amount, params.merchantOrderId]);
  if (expected.length !== params.signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ params.signature.charCodeAt(i);
  }
  return diff === 0;
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
