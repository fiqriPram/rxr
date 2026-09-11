import {
  getTransactionByInvoice,
  updateTransactionStatus,
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
import type { Transaction } from "@/db/schema";

export interface FulfillResult {
  status: "SUCCESS" | "PROCESSING" | "FAILED";
  message: string;
  tx: Transaction | null;
}

// Cek status order yang sudah dikirim ke provider (status PROCESSING)
export async function refreshVipaymentStatus(invoice: string): Promise<{
  done: boolean;
  message: string;
  tx: Transaction | null;
}> {
  const existing = await getTransactionByInvoice(invoice);
  if (!existing) return { done: false, message: "Pesanan tidak ditemukan", tx: null };

  const trxid = extractVipaymentTrxId(existing.notes);
  if (trxid && isVipaymentConfigured()) {
    try {
      const st = await checkVipaymentOrderStatus(trxid);
      if (st.ok && st.status === "success") {
        const updated = await updateTransactionStatus(invoice, "SUCCESS");
        return { done: true, message: "Item berhasil dikirim ke akun game Anda!", tx: updated };
      }
      if (st.ok && st.status === "error") {
        const updated = await updateTransactionStatus(invoice, "FAILED", {
          notes: packVipaymentNotes(existing.notes, { error: st.note || st.message }),
        });
        return {
          done: true,
          message: `Pesanan gagal diproses provider: ${st.note || "Error tidak diketahui"}`,
          tx: updated,
        };
      }
    } catch (e) {
      console.warn("VIPayment status check failed:", e);
    }
  }
  return {
    done: false,
    message: "Pesanan masih diproses oleh provider. Silakan cek lagi.",
    tx: existing,
  };
}

// Kirim order ke provider VIPayment (dipanggil setelah pembayaran PAID).
// Mengembalikan status akhir fulfillment.
export async function fulfillVipaymentOrder(invoice: string): Promise<FulfillResult> {
  const existing = await getTransactionByInvoice(invoice);
  if (!existing) {
    return { status: "FAILED", message: "Pesanan tidak ditemukan", tx: null };
  }

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

            try {
              const st = await checkVipaymentOrderStatus(order.trxid);
              if (st.ok && st.status === "success") {
                const updated = await updateTransactionStatus(invoice, "SUCCESS", {
                  notes: packVipaymentNotes(notes, { finalStatus: "success" }),
                });
                return {
                  status: "SUCCESS",
                  message: "Pembayaran terverifikasi! Item berhasil dikirim ke akun game Anda.",
                  tx: updated,
                };
              }
              if (st.ok && st.status === "error") {
                const updated = await updateTransactionStatus(invoice, "FAILED");
                return {
                  status: "FAILED",
                  message: `Pesanan gagal diproses provider: ${st.note || "Error tidak diketahui"}`,
                  tx: updated,
                };
              }
            } catch (e) {
              console.warn("VIPayment status check after order failed:", e);
            }

            const processing = await updateTransactionStatus(invoice, "PROCESSING", { notes });
            return {
              status: "PROCESSING",
              message: "Pembayaran terverifikasi. Item sedang diproses provider, biasanya masuk 1-5 menit.",
              tx: processing,
            };
          }

          await updateTransactionStatus(invoice, "FAILED", {
            notes: packVipaymentNotes(existing.notes, { error: order.message }),
          });
          return {
            status: "FAILED",
            message: order.message || "Order top-up gagal diproses.",
            tx: await getTransactionByInvoice(invoice),
          };
        } catch (e) {
          console.error("VIPayment order submission failed:", e);
          await updateTransactionStatus(invoice, "FAILED", {
            notes: packVipaymentNotes(existing.notes, { error: "network_error" }),
          });
          return {
            status: "FAILED",
            message: "Gagal menghubungi provider top-up. Silakan coba lagi.",
            tx: await getTransactionByInvoice(invoice),
          };
        }
      }
    }
  }

  // Fallback demo: mark SUCCESS tanpa provider
  const updated = await updateTransactionStatus(invoice, "SUCCESS");
  return {
    status: "SUCCESS",
    message: "Pembayaran berhasil disimulasikan! Item segera masuk ke akun game.",
    tx: updated,
  };
}
