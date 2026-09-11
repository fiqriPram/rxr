import { createHash, createHmac } from "crypto";

export function getIpaymuConfig() {
  const env = process.env.IPAYMU_ENV === "production" ? "production" : "sandbox";
  return {
    env,
    baseUrl: env === "production" ? "https://my.ipaymu.com" : "https://sandbox.ipaymu.com",
    va: process.env.IPAYMU_VA || "",
    apiKey: process.env.IPAYMU_API_KEY || "",
  };
}

export function isIpaymuConfigured(): boolean {
  const { va, apiKey } = getIpaymuConfig();
  return Boolean(va && apiKey);
}

// Kode metode pembayaran di app -> { paymentMethod, paymentChannel } iPaymu
export interface IpaymuChannel {
  paymentMethod: "va" | "cstore" | "qris" | "ewallet";
  paymentChannel: string;
}

export const IPAYMU_PAYMENT_MAP: Record<string, IpaymuChannel> = {
  QRIS: { paymentMethod: "qris", paymentChannel: "mpm" },
  DANA: { paymentMethod: "ewallet", paymentChannel: "dana" },
  GOPAY: { paymentMethod: "qris", paymentChannel: "mpm" }, // GoPay tidak ada channel direct, via QRIS
  BCA_VA: { paymentMethod: "va", paymentChannel: "bca" },
  MANDIRI_VA: { paymentMethod: "va", paymentChannel: "mandiri" },
  BRI_VA: { paymentMethod: "va", paymentChannel: "bri" },
  ALFAMART: { paymentMethod: "cstore", paymentChannel: "alfamart" },
};

function timestampNow(): string {
  const d = new Date();
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(
    d.getMinutes()
  )}${p(d.getSeconds())}`;
}

// Signature request: HMAC_SHA256("POST:{va}:{SHA256(bodyJson)}:{apiKey}", apiKey)
function signRequest(bodyJson: string): { signature: string; timestamp: string } {
  const { va, apiKey } = getIpaymuConfig();
  const bodyHash = createHash("sha256").update(bodyJson).digest("hex");
  const stringToSign = `POST:${va}:${bodyHash}:${apiKey}`;
  const signature = createHmac("sha256", apiKey).update(stringToSign).digest("hex");
  return { signature, timestamp: timestampNow() };
}

export interface IpaymuPaymentParams {
  orderId: string;
  amount: number;
  channel: IpaymuChannel;
  customerName: string;
  email?: string;
  phone?: string;
  productName: string;
  notifyUrl: string;
  expiryHours?: number;
}

export interface IpaymuPaymentResult {
  ok: boolean;
  transactionId?: number;
  referenceId?: string;
  paymentNo?: string;
  paymentName?: string;
  url?: string;
  total?: number;
  expired?: string;
  message?: string;
}

export async function createIpaymuPayment(
  params: IpaymuPaymentParams
): Promise<IpaymuPaymentResult> {
  const { baseUrl, va } = getIpaymuConfig();

  const body = {
    name: params.customerName.slice(0, 100),
    phone: (params.phone || "").slice(0, 20),
    email: params.email || "customer@rxr.topup",
    amount: params.amount,
    notifyUrl: params.notifyUrl,
    expired: params.expiryHours ?? 24,
    expiredType: "hours",
    comments: params.productName.slice(0, 200),
    referenceId: params.orderId,
    paymentMethod: params.channel.paymentMethod,
    paymentChannel: params.channel.paymentChannel,
    product: [params.productName.slice(0, 100)],
    qty: ["1"],
    price: [String(params.amount)],
  };
  const bodyJson = JSON.stringify(body);
  const { signature, timestamp } = signRequest(bodyJson);

  let json: Record<string, unknown> = {};
  try {
    const res = await fetch(`${baseUrl}/api/v2/payment/direct`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        signature,
        va,
        timestamp,
      },
      body: bodyJson,
      cache: "no-store",
    });
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    return { ok: false, message: "Gagal menghubungi iPaymu." };
  }

  if (json.Status === 200 && json.Data && typeof json.Data === "object") {
    const d = json.Data as Record<string, unknown>;
    const str = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
    return {
      ok: true,
      transactionId: typeof d.TransactionId === "number" ? d.TransactionId : undefined,
      referenceId: str(d.ReferenceId),
      paymentNo: d.PaymentNo != null ? String(d.PaymentNo) : undefined,
      paymentName: str(d.PaymentName),
      url: str(d.Url),
      total: typeof d.Total === "number" ? d.Total : undefined,
      expired: str(d.Expired),
    };
  }
  return {
    ok: false,
    message: typeof json.Message === "string" ? json.Message : "Gagal membuat tagihan iPaymu.",
  };
}

// ---- Verifikasi callback ----
// X-Signature = HMAC_SHA256(JSON(sorted keys, slash-escaped), VA)
// Normalisasi tipe: trx_id/status_code/transaction_status_code/paid_off -> int,
// is_escrow -> bool, additional_info "[]" -> [].

function normalizeCallbackValue(v: unknown): unknown {
  if (typeof v !== "string") return v;
  if (v === "[]") return [];
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}

const INT_KEYS = new Set(["trx_id", "status_code", "transaction_status_code", "paid_off"]);

export function normalizeCallbackBody(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (k === "signature" || k === "X-Signature") continue;
    let nv = normalizeCallbackValue(v);
    if (INT_KEYS.has(k) && typeof nv === "string" && /^-?\d+$/.test(nv)) {
      nv = parseInt(nv, 10);
    }
    if (k === "is_escrow" && typeof nv === "string") {
      nv = nv === "1" || nv.toLowerCase() === "true";
    }
    out[k] = nv;
  }
  if (!("additional_info" in out)) out.additional_info = [];
  return out;
}

export function signCallbackBody(normalized: Record<string, unknown>): string {
  const { va } = getIpaymuConfig();
  const sorted: Record<string, unknown> = {};
  for (const k of Object.keys(normalized).sort()) {
    sorted[k] = normalized[k];
  }
  const jsonBody = JSON.stringify(sorted).replace(/\//g, "\\/");
  return createHmac("sha256", va).update(jsonBody).digest("hex");
}

export function verifyIpaymuCallback(
  rawBody: Record<string, unknown>,
  receivedSignature: string
): boolean {
  if (!receivedSignature) return false;
  const normalized = normalizeCallbackBody(rawBody);
  const expected = signCallbackBody(normalized);
  if (expected.length !== receivedSignature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ receivedSignature.charCodeAt(i);
  }
  return diff === 0;
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
}
