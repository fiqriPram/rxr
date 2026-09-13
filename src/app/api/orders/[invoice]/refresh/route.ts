import { NextRequest, NextResponse } from "next/server";
import { getTransactionByInvoice } from "@/db/repo";
import { refreshVipaymentStatus } from "@/lib/fulfill";
import { clientKey, rateLimit } from "@/lib/rate-limit";

// Refresh status order yang aman: hanya baca status dari provider.
// Tidak ada jalur pembayaran palsu di sini.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ invoice: string }> }
) {
  try {
    if (!rateLimit(clientKey(req, "order-refresh"), 30, 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Terlalu sering. Coba lagi sebentar." },
        { status: 429 }
      );
    }

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

    // Order sudah dikirim ke provider, tinggal cek statusnya.
    if (existing.status === "PROCESSING") {
      const r = await refreshVipaymentStatus(invoice);
      return NextResponse.json({ success: r.done, message: r.message, data: r.tx });
    }

    return NextResponse.json({
      success: false,
      error: "Pesanan masih menunggu pembayaran.",
    });
  } catch (error) {
    console.error("Error refreshing order:", error);
    return NextResponse.json({ success: false, error: "Gagal memeriksa status" }, { status: 500 });
  }
}
