"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Game, Item, PaymentMethod } from "@/db/schema";
import { formatRupiah, calculateFee } from "@/lib/utils";
import OrderSummaryModal from "./OrderSummaryModal";
import {
  Check,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Info,
  CreditCard,
  Phone,
  Tag,
} from "lucide-react";

interface TopUpFormProps {
  game: Game;
  items: Item[];
  paymentMethods: PaymentMethod[];
}

export default function TopUpForm({ game, items, paymentMethods }: TopUpFormProps) {
  const router = useRouter();

  // Account inputs
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [server, setServer] = useState(
    game.accountInputs?.serverList?.[0]?.value || ""
  );
  const [nickname, setNickname] = useState("");
  const [isCheckingNick, setIsCheckingNick] = useState(false);
  const [nickChecked, setNickChecked] = useState(false);
  const [nickError, setNickError] = useState("");

  // Selections
  const [selectedItem, setSelectedItem] = useState<Item | null>(items[0] || null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    paymentMethods[0] || null
  );

  // Customer contact & Promo
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    message: string;
  } | null>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  // Prefill kontak dari akun yang login
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          if (d.data.phone) setCustomerPhone((p) => p || d.data.phone);
          if (d.data.email) setCustomerEmail((p) => p || d.data.email);
        }
      })
      .catch(() => {});
  }, []);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Price calculations
  const subtotal = selectedItem ? selectedItem.price : 0;
  const fee =
    selectedItem && selectedPayment
      ? calculateFee(subtotal, selectedPayment.feeFlat, selectedPayment.feePercentage)
      : 0;
  const discount = appliedPromo ? appliedPromo.discount : 0;
  const totalAmount = Math.max(0, subtotal + fee - discount);

  // Group payments
  const paymentCategories = [
    { type: "QRIS", title: "QRIS (Realtime Semua E-Wallet & Bank)", items: paymentMethods.filter((p) => p.type === "QRIS") },
    { type: "EWALLET", title: "E-Wallet", items: paymentMethods.filter((p) => p.type === "EWALLET") },
    { type: "VA", title: "Virtual Account Transfer", items: paymentMethods.filter((p) => p.type === "VA") },
    { type: "RETAIL", title: "Minimarket (Retail)", items: paymentMethods.filter((p) => p.type === "RETAIL") },
  ].filter((g) => g.items.length > 0);

  const handleCheckNickname = async () => {
    if (!userId.trim()) {
      setNickError("Silakan isi User ID terlebih dahulu.");
      return;
    }

    setIsCheckingNick(true);
    setNickError("");

    try {
      const res = await fetch("/api/check-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSlug: game.slug,
          userId,
          zoneId,
          server,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNickname(data.data.nickname);
        setNickChecked(true);
      } else {
        setNickError(data.error || "Gagal verifikasi ID");
      }
    } catch {
      setNickError("Gangguan saat verifikasi ID.");
    } finally {
      setIsCheckingNick(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;

    setIsCheckingPromo(true);
    setPromoError("");

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCodeInput,
          subtotal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedPromo({
          code: promoCodeInput.trim().toUpperCase(),
          discount: data.data.discount,
          message: data.data.message,
        });
      } else {
        setPromoError(data.error || "Kode promo tidak valid");
        setAppliedPromo(null);
      }
    } catch {
      setPromoError("Gagal validasi promo");
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const handleOrderSubmit = () => {
    setErrorMessage("");
    setSubmitError("");

    if (!userId.trim()) {
      setErrorMessage("Silakan lengkapi User ID Anda.");
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }
    if (game.accountInputs.zoneId && !zoneId.trim()) {
      setErrorMessage("Silakan lengkapi Zone ID Anda.");
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }
    if (!selectedItem) {
      setErrorMessage("Pilih salah satu nominal top up.");
      return;
    }
    if (!selectedPayment) {
      setErrorMessage("Pilih metode pembayaran.");
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 9) {
      setErrorMessage("Nomor WhatsApp wajib diisi.");
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSlug: game.slug,
          itemId: selectedItem!.id,
          paymentMethodId: selectedPayment!.id,
          accountData: {
            userId: userId.trim(),
            zoneId: zoneId.trim() || undefined,
            server: server || undefined,
            nickname: nickname || undefined,
          },
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          promoCode: appliedPromo?.code,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/order/${data.data.invoiceNumber}`);
      } else {
        setSubmitError(data.error || "Gagal membuat pesanan.");
        setIsSubmitting(false);
      }
    } catch {
      setSubmitError("Terjadi kesalahan jaringan.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Data Akun */}
      <div className="rounded-xl border border-line bg-panel p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-line-soft pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            1
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white">
            Masukkan Data Akun
          </h3>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {game.accountInputs.userLabel || "User ID"} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setNickChecked(false);
                }}
                placeholder={game.accountInputs.userPlaceholder || "Contoh: 12345678"}
                className="w-full rounded-lg border border-line-2 bg-canvas-soft px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:bg-field-2"
              />
            </div>

            {game.accountInputs.zoneId && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {game.accountInputs.zoneLabel || "Zone ID"} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={zoneId}
                  onChange={(e) => {
                    setZoneId(e.target.value);
                    setNickChecked(false);
                  }}
                  placeholder={game.accountInputs.zonePlaceholder || "Contoh: 2105"}
                  className="w-full rounded-lg border border-line-2 bg-canvas-soft px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:bg-field-2"
                />
              </div>
            )}

            {game.accountInputs.serverList && game.accountInputs.serverList.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pilih Server <span className="text-rose-400">*</span>
                </label>
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full rounded-lg border border-line-2 bg-canvas-soft px-3.5 py-2 text-xs text-white focus:border-blue-500"
                >
                  {game.accountInputs.serverList.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Nickname verification action */}
          {game.hasServerCheck && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={isCheckingNick || !userId.trim()}
                className="flex items-center gap-1.5 rounded-lg border border-line-strong bg-panel-3 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-panel-4 transition disabled:opacity-50"
              >
                {isCheckingNick ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Memeriksa...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                    Verifikasi ID Akun
                  </>
                )}
              </button>

              {nickChecked && nickname && (
                <span className="flex items-center gap-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 text-xs text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Akun: <strong>{nickname}</strong></span>
                </span>
              )}

              {nickError && (
                <span className="text-xs text-rose-400">{nickError}</span>
              )}
            </div>
          )}

          {game.accountInputs.helperText && (
            <div className="flex items-start gap-2 text-[11px] text-slate-400 pt-1">
              <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{game.accountInputs.helperText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Pilih Nominal */}
      <div className="rounded-xl border border-line bg-panel p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-line-soft pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            2
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white">
            Pilih Nominal Top Up
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {items.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`relative flex flex-col justify-between rounded-xl p-3 text-left transition border-2 ${
                  isSelected
                    ? "border-blue-500 bg-blue-950/30"
                    : "border-line bg-panel hover:border-line-strong"
                }`}
              >
                {/* Active check icon */}
                {isSelected && (
                  <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}

                <div className="pr-4">
                  <div className="text-xs sm:text-sm font-semibold text-white line-clamp-2">
                    {item.name}
                  </div>
                </div>

                {(item.isPromo || (item.originalPrice && item.originalPrice > item.price)) && (
                  <span className="mt-1.5 self-start rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                    {item.originalPrice && item.originalPrice > item.price
                      ? `Disc ${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%`
                      : "Diskon"}
                  </span>
                )}

                <div className="mt-2 pt-2 border-t border-line-soft flex items-baseline justify-between gap-1">
                  <div className="text-xs sm:text-sm font-bold text-white">
                    {formatRupiah(item.price)}
                  </div>
                  {item.originalPrice && (
                    <div className="text-[10px] text-slate-500 line-through">
                      {formatRupiah(item.originalPrice)}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Pilih Pembayaran */}
      <div className="rounded-xl border border-line bg-panel p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-line-soft pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            3
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white">
            Pilih Metode Pembayaran
          </h3>
        </div>

        <div className="mt-4 space-y-4">
          {paymentCategories.map((group) => (
            <div key={group.type} className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((payment) => {
                  const isSelected = selectedPayment?.id === payment.id;
                  const methodFee = selectedItem
                    ? calculateFee(selectedItem.price, payment.feeFlat, payment.feePercentage)
                    : 0;
                  const estimatedTotal = selectedItem
                    ? Math.max(0, selectedItem.price + methodFee - discount)
                    : 0;

                  return (
                    <button
                      key={payment.id}
                      type="button"
                      onClick={() => setSelectedPayment(payment)}
                      className={`flex items-center justify-between rounded-xl p-2.5 text-left transition border-2 ${
                        isSelected
                          ? "border-blue-500 bg-blue-950/30"
                          : "border-line bg-panel hover:border-line-strong"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-11 shrink-0 items-center justify-center rounded bg-white p-1">
                          <img
                            src={payment.iconUrl}
                            alt={payment.name}
                            className="max-h-6 max-w-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white line-clamp-1">
                            {payment.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Biaya: {payment.feeFlat > 0 ? formatRupiah(payment.feeFlat) : "0.7%"}
                          </div>
                        </div>
                      </div>

                      <div className="text-right pl-2">
                        <div className="text-xs font-bold text-white">
                          {selectedItem ? formatRupiah(estimatedTotal) : "-"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 4: Kontak & Promo */}
      <div className="rounded-xl border border-line bg-panel p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-line-soft pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            4
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white">
            Kontak & Voucher
          </h3>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nomor WhatsApp <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full rounded-lg border border-line-2 bg-canvas-soft px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Bukti pembayaran otomatis dikirimkan ke WhatsApp.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kode Promo / Voucher
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="RXRHEMAT"
                  className="w-full rounded-lg border border-line-2 bg-canvas-soft px-3 py-2 text-xs text-white placeholder-slate-500 uppercase focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={isCheckingPromo || !promoCodeInput.trim()}
                  className="rounded-lg bg-panel-3 border border-line-strong px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-panel-4 transition disabled:opacity-50"
                >
                  {isCheckingPromo ? "..." : "Gunakan"}
                </button>
              </div>

              {appliedPromo && (
                <div className="mt-1 text-xs text-emerald-400">
                  ✓ {appliedPromo.message}
                </div>
              )}
              {promoError && (
                <div className="mt-1 text-xs text-rose-400">{promoError}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-3 z-40 rounded-2xl border border-line bg-panel p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-slate-400">Total Tagihan:</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-amber-400">
                {selectedItem ? formatRupiah(totalAmount) : "Rp 0"}
              </span>
              {discount > 0 && (
                <span className="text-[11px] font-semibold text-emerald-400">
                  (Hemat {formatRupiah(discount)})
                </span>
              )}
            </div>
            <div className="hidden sm:block text-[11px] text-slate-400">
              {selectedItem?.name} • {selectedPayment?.name}
            </div>
          </div>

          <button
            type="button"
            onClick={handleOrderSubmit}
            disabled={!selectedItem || !selectedPayment}
            className="rounded-xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-blue-500 transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>Beli Sekarang</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary Modal */}
      {selectedItem && selectedPayment && (
        <OrderSummaryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSubmitError("");
          }}
          onConfirm={handleConfirmPayment}
          isSubmitting={isSubmitting}
          game={game}
          item={selectedItem}
          paymentMethod={selectedPayment}
          accountData={{
            userId,
            zoneId: zoneId || undefined,
            server: server || undefined,
            nickname: nickname || undefined,
          }}
          customerPhone={customerPhone}
          subtotal={subtotal}
          fee={fee}
          discount={discount}
          totalAmount={totalAmount}
          errorMessage={submitError}
        />
      )}
    </div>
  );
}
