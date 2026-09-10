import { NextRequest, NextResponse } from "next/server";
import {
  updateTransactionStatus,
  getTransactionByInvoice,
  getAllGamesAdmin,
  getItemsByGameId,
} from "@/db/repo";
import {
  checkVipaymentOrderStatus,
  createVipaymentOrder,
  extractVipaymentTrxId,
  isVipaymentConfigured,
  packVipaymentNotes,
  resolveVipaymentService,
  VIPAYMENT_NICKNAME_CODE,
} from "@/lib/vipayment";

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
      const trxid = extractVipaymentTrxId(existing.notes);
      if (trxid && isVipaymentConfigured()) {
        try {
          const st = await checkVipaymentOrderStatus(trxid);
          if (st.ok && st.status === "success") {
            const updated = await updateTransactionStatus(invoice, "SUCCESS");
            return NextResponse.json({
              success: true,
              message: "Item berhasil dikirim ke akun game Anda!",
              data: updated,
            });
          }
          if (st.ok && st.status === "error") {
            const updated = await updateTransactionStatus(invoice, "FAILED", {
              notes: packVipaymentNotes(existing.notes, { error: st.note || st.message }),
            });
            return NextResponse.json({
              success: true,
              message: `Pesanan gagal diproses provider: ${st.note || "Error tidak diketahui"}`,
              data: updated,
            });
          }
        } catch (e) {
          console.warn("VIPayment status check failed:", e);
        }
      }
      return NextResponse.json({
        success: true,
        message: "Pesanan masih diproses oleh provider (diamond/UC belum masuk). Silakan cek lagi.",
        data: existing,
      });
    }

    // Konfirmasi pembayaran + kirim order real ke provider VIPayment
    const games = await getAllGamesAdmin();
    const game = games.find((g) => g.id === existing.gameId);

    if (isVipaymentConfigured() && game && VIPAYMENT_NICKNAME_CODE[game.slug]) {
      const items = await getItemsByGameId(existing.gameId);
      const item = items.find((i) => i.id === existing.itemId);

      if (item) {
        const service = await resolveVipaymentService(game.slug, item.name);

        if (service.code) {
          // Pembayaran dianggap lunas
          await updateTransactionStatus(invoice, "PAID");

          const zone = existing.accountData.zoneId || existing.accountData.server || "";

          try {
            const order = await createVipaymentOrder({
              service: service.code,
              userId: existing.accountData.userId,
              zoneId: zone,
            });

            if (order.ok && order.trxid) {
              const notes = packVipaymentNotes(existing.notes, {
                trxid: order.trxid,
                serviceCode: service.code,
                serviceName: service.serviceName,
              });

              // Coba cek status langsung; jika belum selesai, tandai PROCESSING
              try {
                const st = await checkVipaymentOrderStatus(order.trxid);
                if (st.ok && st.status === "success") {
                  const updated = await updateTransactionStatus(invoice, "SUCCESS", {
                    notes: packVipaymentNotes(notes, { finalStatus: "success" }),
                  });
                  return NextResponse.json({
                    success: true,
                    message: "Pembayaran terverifikasi! Item berhasil dikirim ke akun game Anda.",
                    data: updated,
                  });
                }
                if (st.ok && st.status === "error") {
                  const updated = await updateTransactionStatus(invoice, "FAILED");
                  return NextResponse.json({
                    success: true,
                    message: `Pesanan gagal diproses provider: ${st.note || "Error tidak diketahui"}`,
                    data: updated,
                  });
                }
              } catch (e) {
                console.warn("VIPayment status check after order failed:", e);
              }

              const processing = await updateTransactionStatus(invoice, "PROCESSING", { notes });
              return NextResponse.json({
                success: true,
                message: "Pembayaran terverifikasi. Item sedang diproses provider, biasanya masuk 1-5 menit.",
                data: processing,
              });
            }

            // Order gagal
            await updateTransactionStatus(invoice, "FAILED", {
              notes: packVipaymentNotes(existing.notes, { error: order.message }),
            });
            return NextResponse.json(
              { success: false, error: order.message || "Order top-up gagal diproses." },
              { status: 502 }
            );
          } catch (e) {
            console.error("VIPayment order submission failed:", e);
            await updateTransactionStatus(invoice, "FAILED", {
              notes: packVipaymentNotes(existing.notes, { error: "network_error" }),
            });
            return NextResponse.json(
              { success: false, error: "Gagal menghubungi provider top-up. Silakan coba lagi." },
              { status: 502 }
            );
          }
        }
      }
    }

    // Fallback demo: mark SUCCESS tanpa provider
    const updated = await updateTransactionStatus(invoice, "SUCCESS");

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil disimulasikan! Item segera masuk ke akun game.",
      data: updated,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json({ success: false, error: "Gagal memproses pembayaran" }, { status: 500 });
  }
}