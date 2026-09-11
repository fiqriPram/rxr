import { NextRequest, NextResponse } from "next/server";
import { getTransactionByInvoice, updateTransactionStatus } from "@/db/repo";
import { verifyMidtransNotification, type MidtransNotification } from "@/lib/midtrans";
import { fulfillVipaymentOrder, refreshVipaymentStatus } from "@/lib/fulfill";
import { packVipaymentNotes } from "@/lib/vipayment";

// Notifikasi pembayaran Midtrans (JSON POST, butuh URL publik).
// URL ini didaftarkan di dashboard Midtrans: Settings -> Configuration.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<MidtransNotification>;

    const notif: MidtransNotification = {
      order_id: String(body.order_id || ""),
      status_code: String(body.status_code || ""),
      gross_amount: String(body.gross_amount || ""),
      signature_key: String(body.signature_key || ""),
      transaction_status: String(body.transaction_status || ""),
      fraud_status: typeof body.fraud_status === "string" ? body.fraud_status : undefined,
      payment_type: typeof body.payment_type === "string" ? body.payment_type : undefined,
    };

    if (!verifyMidtransNotification(notif)) {
      console.warn("Midtrans notification: bad signature for", notif.order_id);
      return NextResponse.json({ error: "Bad signature" }, { status: 400 });
    }

    const tx = await getTransactionByInvoice(notif.order_id);
    if (!tx) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Cegah double-proses & pastikan nominal cocok
    if (Number(notif.gross_amount) !== tx.totalAmount) {
      console.warn("Midtrans notification: amount mismatch for", notif.order_id);
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    if (tx.status === "SUCCESS") {
      return NextResponse.json({ ok: true });
    }

    const paid =
      notif.transaction_status === "settlement" ||
      (notif.transaction_status === "capture" && notif.fraud_status === "accept");

    if (!paid) {
      if (["deny", "expire", "cancel"].includes(notif.transaction_status)) {
        await updateTransactionStatus(notif.order_id, "FAILED", {
          notes: packVipaymentNotes(tx.notes, { midtransStatus: notif.transaction_status }),
        });
      }
      return NextResponse.json({ ok: true });
    }

    // Pembayaran lunas
    if (tx.status === "PROCESSING") {
      const r = await refreshVipaymentStatus(notif.order_id);
      console.log("Midtrans notification PROCESSING refresh:", notif.order_id, r.message);
      return NextResponse.json({ ok: true });
    }

    if (tx.status !== "PENDING") {
      return NextResponse.json({ ok: true });
    }

    await updateTransactionStatus(notif.order_id, "PAID", {
      notes: packVipaymentNotes(tx.notes, { midtransPaymentType: notif.payment_type }),
    });

    const result = await fulfillVipaymentOrder(notif.order_id);
    console.log("Midtrans notification fulfill:", notif.order_id, result.status, result.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
