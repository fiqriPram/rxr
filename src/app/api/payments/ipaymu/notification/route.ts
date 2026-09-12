import { NextRequest, NextResponse } from "next/server";
import { getTransactionByInvoice, updateTransactionStatus } from "@/db/repo";
import { verifyIpaymuCallback } from "@/lib/ipaymu";
import { fulfillVipaymentOrder, refreshVipaymentStatus } from "@/lib/fulfill";
import { packVipaymentNotes } from "@/lib/vipayment";
import { clientKey, rateLimit } from "@/lib/rate-limit";

// Notifikasi pembayaran iPaymu (JSON atau form-urlencoded POST, butuh URL publik).
// Daftarkan URL ini sebagai notifyUrl (otomatis per transaksi).
export async function POST(req: NextRequest) {
  // Anti-spam: provider me-retry callback yang gagal, tapi request palsu
  // beruntun dari satu IP tetap dibatasi.
  if (!rateLimit(clientKey(req, "ipaymu-notif"), 60, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const contentType = req.headers.get("content-type") || "";
    let raw: Record<string, unknown> = {};
    if (contentType.includes("application/json")) {
      raw = (await req.json()) as Record<string, unknown>;
    } else {
      const form = await req.formData();
      for (const [k, v] of form.entries()) {
        if (typeof v === "string") raw[k] = v;
      }
    }

    const receivedSignature =
      req.headers.get("x-signature") ||
      (typeof raw.signature === "string" ? raw.signature : "");

    if (!verifyIpaymuCallback(raw, receivedSignature)) {
      console.warn("iPaymu notification: bad signature", {
        keys: Object.keys(raw).sort(),
        reference: raw.reference_id ?? raw.referenceId ?? null,
        status: raw.status ?? raw.status_code ?? null,
        receivedSigPrefix:
          typeof receivedSignature === "string" ? receivedSignature.slice(0, 12) : null,
      });
      return NextResponse.json({ error: "Bad signature" }, { status: 400 });
    }

    const orderId =
      typeof raw.reference_id === "string"
        ? raw.reference_id
        : typeof raw.referenceId === "string"
        ? raw.referenceId
        : "";
    const statusText = typeof raw.status === "string" ? raw.status.toLowerCase() : "";
    const statusCode = Number(raw.status_code ?? NaN);

    if (!orderId) {
      return NextResponse.json({ error: "No reference" }, { status: 400 });
    }

    const tx = await getTransactionByInvoice(orderId);
    if (!tx) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Cocokkan nominal (abaikan jika tidak ada di payload)
    const amount = Number(raw.total ?? raw.amount ?? NaN);
    if (Number.isFinite(amount) && amount !== tx.totalAmount) {
      console.warn("iPaymu notification: amount mismatch for", orderId);
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    if (tx.status === "SUCCESS") {
      return NextResponse.json({ ok: true });
    }

    const paid = statusText === "berhasil" || statusCode === 1;

    if (!paid) {
      if (statusText === "expired" || statusCode === -2) {
        await updateTransactionStatus(orderId, "FAILED", {
          notes: packVipaymentNotes(tx.notes, { ipaymuStatus: statusText || statusCode }),
        });
      }
      return NextResponse.json({ ok: true });
    }

    // Pembayaran lunas
    if (tx.status === "PROCESSING") {
      const r = await refreshVipaymentStatus(orderId);
      console.log("iPaymu notification PROCESSING refresh:", orderId, r.message);
      return NextResponse.json({ ok: true });
    }

    if (tx.status !== "PENDING") {
      return NextResponse.json({ ok: true });
    }

    await updateTransactionStatus(orderId, "PAID", {
      notes: packVipaymentNotes(tx.notes, {
        ipaymuTrxId: typeof raw.trx_id !== "undefined" ? String(raw.trx_id) : undefined,
      }),
    });

    const result = await fulfillVipaymentOrder(orderId);
    console.log("iPaymu notification fulfill:", orderId, result.status, result.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("iPaymu notification error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
