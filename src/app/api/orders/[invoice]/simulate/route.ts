import { NextRequest, NextResponse } from "next/server";
import { getTransactionByInvoice } from "@/db/repo";
import { fulfillVipaymentOrder, refreshVipaymentStatus } from "@/lib/fulfill";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ invoice: string }> }
) {
  try {
    const { invoice } = await params;
    const existing = await getTransactionByInvoice(invoice);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (existing.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        message: "Pesanan sudah berstatus sukses sebelumnya.",
        data: existing,
      });
    }

    // Status refresh: order sudah dikirim ke provider, tinggal cek statusnya
    if (existing.status === "PROCESSING") {
      const r = await refreshVipaymentStatus(invoice);
      return NextResponse.json({ success: r.done, message: r.message, data: r.tx });
    }

    // Konfirmasi pembayaran + kirim order real ke provider VIPayment
    const result = await fulfillVipaymentOrder(invoice);
    if (result.status === "FAILED") {
      return NextResponse.json({ success: false, error: result.message }, { status: 502 });
    }
    return NextResponse.json({ success: true, message: result.message, data: result.tx });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json({ success: false, error: "Gagal memproses pembayaran" }, { status: 500 });
  }
}
