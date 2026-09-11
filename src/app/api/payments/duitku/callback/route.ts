import { NextRequest, NextResponse } from "next/server";
import { getTransactionByInvoice, updateTransactionStatus } from "@/db/repo";
import { verifyDuitkuCallback } from "@/lib/duitku";
import { fulfillVipaymentOrder, refreshVipaymentStatus } from "@/lib/fulfill";
import { packVipaymentNotes } from "@/lib/vipayment";

// Callback pembayaran Duitku (form-urlencoded POST, butuh URL publik).
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const get = (k: string): string => {
      const v = form.get(k);
      return typeof v === "string" ? v : "";
    };

    const params = {
      merchantCode: get("merchantCode"),
      amount: get("amount"),
      merchantOrderId: get("merchantOrderId"),
      signature: get("signature"),
    };
    const resultCode = get("resultCode");
    const reference = get("reference");

    if (!verifyDuitkuCallback(params)) {
      console.warn("Duitku callback: bad signature for", params.merchantOrderId);
      return new NextResponse("Bad Signature", { status: 400 });
    }

    const tx = await getTransactionByInvoice(params.merchantOrderId);
    if (!tx) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Cegah double-proses & pastikan nominal cocok
    if (Number(params.amount) !== tx.totalAmount) {
      console.warn("Duitku callback: amount mismatch for", params.merchantOrderId);
      return new NextResponse("Amount mismatch", { status: 400 });
    }

    if (tx.status === "SUCCESS") {
      return new NextResponse("OK", { status: 200 });
    }

    if (resultCode !== "00") {
      await updateTransactionStatus(params.merchantOrderId, "FAILED", {
        notes: packVipaymentNotes(tx.notes, { duitkuResult: resultCode }),
      });
      return new NextResponse("OK", { status: 200 });
    }

    // Pembayaran lunas
    if (tx.status === "PROCESSING") {
      const r = await refreshVipaymentStatus(params.merchantOrderId);
      console.log("Duitku callback PROCESSING refresh:", params.merchantOrderId, r.message);
      return new NextResponse("OK", { status: 200 });
    }

    if (tx.status !== "PENDING") {
      return new NextResponse("OK", { status: 200 });
    }

    await updateTransactionStatus(params.merchantOrderId, "PAID", {
      notes: packVipaymentNotes(tx.notes, { duitkuReference: reference || undefined }),
    });

    const result = await fulfillVipaymentOrder(params.merchantOrderId);
    console.log("Duitku callback fulfill:", params.merchantOrderId, result.status, result.message);
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Duitku callback error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
