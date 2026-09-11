import { NextRequest, NextResponse } from "next/server";
import { getAllTransactions } from "@/db/repo";
import { extractVipaymentTrxId } from "@/lib/vipayment";
import { refreshVipaymentStatus } from "@/lib/fulfill";

// Webhook VIPayment game-feature.
// Daftarkan URL ini di VIPayment: Profile -> Pengaturan API -> URL Callback:
//   https://domainmu.com/api/webhooks/vipayment
//
// Desain: payload webhook TIDAK dipercaya mentah-mentah. Kita ambil trxid,
// cocokkan ke transaksi kita, lalu verifikasi status ASLI via API VIPayment
// (checkVipaymentOrderStatus) sebelum mengubah status apa pun.
async function parsePayload(req: NextRequest): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const contentType = req.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const json = (await req.json()) as Record<string, unknown>;
      const flat = json.data && typeof json.data === "object"
        ? { ...(json as Record<string, unknown>), ...((json.data as Record<string, unknown>)) }
        : json;
      for (const [k, v] of Object.entries(flat)) {
        if (v !== null && v !== undefined) out[k] = String(v);
      }
    } else {
      // form-urlencoded (default webhook VIPayment) maupun multipart
      const form = await req.formData();
      for (const [k, v] of form.entries()) {
        if (typeof v === "string") out[k] = v;
      }
    }
  } catch {
    // abaikan body rusak, tetap balas 200 agar tidak di-retry spam
  }
  return out;
}

function pickTrxid(p: Record<string, string>): string {
  const keys = ["trxid", "trx_id", "trxId", "id_trx", "reference", "ref_id", "order_id"];
  for (const k of keys) {
    if (p[k]) return p[k];
  }
  return "";
}

export async function POST(req: NextRequest) {
  const payload = await parsePayload(req);
  const trxid = pickTrxid(payload);

  if (!trxid) {
    console.log("VIPayment webhook: tanpa trxid, diabaikan.", payload);
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Cocokkan trxid ke transaksi kita (trxid tersimpan di notes)
  let invoice: string | undefined;
  try {
    const all = await getAllTransactions();
    invoice = all.find((t) => extractVipaymentTrxId(t.notes) === trxid)?.invoiceNumber;
  } catch (e) {
    console.error("VIPayment webhook: gagal baca transaksi:", e);
  }

  if (!invoice) {
    // Kemungkinan Callback Tester / trx asing — catat formatnya untuk dipelajari
    console.log("VIPayment webhook: trxid tidak dikenal (mungkin tester).", { trxid, payload });
    return NextResponse.json({ ok: true, ignored: true });
  }

  const r = await refreshVipaymentStatus(invoice);
  console.log("VIPayment webhook:", trxid, "->", invoice, r.message);
  return NextResponse.json({ ok: true });
}

// Terima juga GET agar mudah dites manual: /api/webhooks/vipayment?trxid=XXX
export async function GET(req: NextRequest) {
  const trxid = new URL(req.url).searchParams.get("trxid") || "";
  if (!trxid) {
    return NextResponse.json({
      ok: true,
      usage: "POST webhook VIPayment ke URL ini, atau GET ?trxid=XXX untuk refresh manual.",
    });
  }
  try {
    const all = await getAllTransactions();
    const invoice = all.find((t) => extractVipaymentTrxId(t.notes) === trxid)?.invoiceNumber;
    if (!invoice) {
      return NextResponse.json({ ok: true, ignored: true });
    }
    const r = await refreshVipaymentStatus(invoice);
    return NextResponse.json({ ok: true, message: r.message });
  } catch (e) {
    console.error("VIPayment webhook GET error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
