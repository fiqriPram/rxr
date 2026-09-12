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

// Tandai FAILED bila order PENDING sudah lewat batas waktu (lazy expiry,
// dipanggil dari server component agar tidak ada cronjob terpisah).
// Return true bila status berubah.
export async function expireStaleTransaction(invoice: string): Promise<boolean> {
  const tx = await getTransactionByInvoice(invoice);
  if (!tx || tx.status !== "PENDING") return false;
  const expiredAt = new Date(tx.paymentDetails.expiredAt).getTime();
  if (!Number.isFinite(expiredAt) || Date.now() <= expiredAt) return false;
  let notes: string | undefined;
  try {
    const n = tx.notes ? JSON.parse(tx.notes) : {};
    notes = JSON.stringify({ ...n, expired: true });
  } catch {
    notes = tx.notes || undefined;
  }
  await updateTransactionStatus(invoice, "FAILED", { notes });
  return true;
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

  // Fallback demo: mark SUCCESS tanpa provider.
  // Di production JANGAN PERNAH sukses palsu — tahan sebagai PROCESSING untuk follow-up manual.
  if (process.env.NODE_ENV === "production") {
    const held = await updateTransactionStatus(invoice, "PROCESSING", {
      notes: packVipaymentNotes(existing.notes, { hold: "provider_unmapped" }),
    });
    return {
      status: "PROCESSING",
      message: "Pembayaran diterima. Item menunggu pengiriman manual oleh admin.",
      tx: held,
    };
  }
  const updated = await updateTransactionStatus(invoice, "SUCCESS");
  return {
    status: "SUCCESS",
    message: "Pembayaran berhasil disimulasikan! Item segera masuk ke akun game.",
    tx: updated,
  };
}
