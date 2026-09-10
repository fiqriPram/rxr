"use client";

import { Game, Item, PaymentMethod } from "@/db/schema";
import { formatRupiah } from "@/lib/utils";
import { X, ArrowRight, Loader2, AlertCircle } from "lucide-react";

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  game: Game;
  item: Item;
  paymentMethod: PaymentMethod;
  accountData: { userId: string; zoneId?: string; server?: string; nickname?: string };
  customerPhone: string;
  subtotal: number;
  fee: number;
  discount: number;
  totalAmount: number;
  errorMessage?: string;
}

export default function OrderSummaryModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  game,
  item,
  paymentMethod,
  accountData,
  customerPhone,
  subtotal,
  fee,
  discount,
  totalAmount,
  errorMessage,
}: OrderSummaryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-line-2 bg-field-2 shadow-2xl">
        {/* Gradient accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent" />
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line-soft px-5 pb-3 pt-4">
          <h3 className="text-base font-bold text-white">Detail Pesanan</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded p-1 text-slate-400 hover:text-white transition disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contents */}
        <div className="mt-4 space-y-3 px-5 text-xs">
          {/* Account Box */}
          <div className="rounded-lg border border-line bg-canvas-soft p-3 space-y-1.5">
            <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
              Tujuan Pengiriman:
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Game:</span>
              <span className="font-semibold text-white">{game.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">User ID:</span>
              <span className="font-mono font-bold text-white">
                {accountData.userId}
                {accountData.zoneId ? ` (${accountData.zoneId})` : ""}
              </span>
            </div>
            {accountData.nickname && (
              <div className="flex justify-between">
                <span className="text-slate-400">Nickname:</span>
                <span className="font-semibold text-emerald-400">{accountData.nickname}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-line-soft">
              <span className="text-slate-400">No. WhatsApp:</span>
              <span className="font-mono text-slate-200">{customerPhone}</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="rounded-lg border border-line bg-canvas-soft p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Item:</span>
              <span className="font-semibold text-white">{item.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Metode Bayar:</span>
              <span className="font-semibold text-white">{paymentMethod.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Harga:</span>
              <span className="text-slate-200">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Biaya Layanan:</span>
              <span className="text-slate-200">{formatRupiah(fee)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Potongan Promo:</span>
                <span>- {formatRupiah(discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-line-soft font-bold text-sm text-white">
              <span>Total Tagihan:</span>
              <span className="text-amber-400">{formatRupiah(totalAmount)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Pastikan data ID Anda sudah tepat sebelum melanjutkan.</span>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/25 p-2.5 text-[11px] text-rose-300">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2.5 px-5 pb-5">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-line-2 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-panel-3"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="btn-primary px-4 py-2 text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Lanjut ke Pembayaran
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
