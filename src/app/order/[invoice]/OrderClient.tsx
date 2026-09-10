"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@/db/schema";
import { formatRupiah } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
  Zap,
  HelpCircle,
  FlaskConical,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface OrderClientProps {
  initialTransaction: Transaction;
  instructions: string[];
  paymentMethodType: string;
}

export default function OrderClient({
  initialTransaction,
  instructions,
  paymentMethodType,
}: OrderClientProps) {
  const [transaction, setTransaction] = useState<Transaction>(initialTransaction);
  const [copiedVa, setCopiedVa] = useState(false);
  const [copiedTotal, setCopiedTotal] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isSuccess = transaction.status === "SUCCESS";
  const isPending = transaction.status === "PENDING";
  const isProcessing = transaction.status === "PROCESSING";
  const isFailed = transaction.status === "FAILED";

  useEffect(() => {
    if (isSuccess) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [isSuccess]);

  const handleCopy = (text: string, type: "va" | "total" | "invoice") => {
    navigator.clipboard.writeText(text);
    if (type === "va") {
      setCopiedVa(true);
      setTimeout(() => setCopiedVa(false), 2000);
    } else if (type === "total") {
      setCopiedTotal(true);
      setTimeout(() => setCopiedTotal(false), 2000);
    } else {
      setCopiedInvoice(true);
      setTimeout(() => setCopiedInvoice(false), 2000);
    }
  };

  const handlePaymentAction = async () => {
    setIsSimulating(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/orders/${transaction.invoiceNumber}/simulate`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTransaction(data.data);
      } else if (data.error) {
        setErrorMsg(data.error);
      }
    } catch {
      alert("Gagal memproses permintaan");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 space-y-5">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Invoice:</span>
          <button
            onClick={() => handleCopy(transaction.invoiceNumber, "invoice")}
            className="flex items-center gap-1 font-mono font-bold text-white hover:text-blue-400"
          >
            <span>{transaction.invoiceNumber}</span>
            {copiedInvoice ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {isSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Pembayaran Terverifikasi
              </h2>
              <p className="text-xs text-emerald-300">
                Item <strong>{transaction.itemName}</strong> telah dikirimkan ke akun ID <strong>{transaction.accountData.userId}</strong>. Terima kasih!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Processing Banner */}
      {isProcessing && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-950/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Item Sedang Diproses
              </h2>
              <p className="text-xs text-blue-300">
                Pembayaran kamu sudah diterima. Item <strong>{transaction.itemName}</strong> sedang diproses oleh provider, biasanya masuk 1-5 menit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Failed Banner */}
      {isFailed && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Pesanan Gagal
              </h2>
              <p className="text-xs text-rose-300">
                Mohon hubungi admin untuk informasi lebih lanjut. {errorMsg}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Payment Checkout Box */}
      <div className="rounded-xl border border-line bg-panel p-5 sm:p-7 space-y-6">
        {/* Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line-soft gap-2">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Status Tagihan
            </div>
            <div className="mt-1 flex items-center gap-2">
              {isSuccess ? (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Lunas / Selesai
                </span>
              ) : isProcessing ? (
                <span className="inline-flex items-center gap-1 rounded bg-blue-950/80 border border-blue-500/30 px-2 py-0.5 text-xs font-bold text-blue-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sedang Diproses
                </span>
              ) : isFailed ? (
                <span className="inline-flex items-center gap-1 rounded bg-rose-950/80 border border-rose-500/30 px-2 py-0.5 text-xs font-bold text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5" /> Gagal
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-400">
                  <Clock className="h-3.5 w-3.5" /> Menunggu Pembayaran
                </span>
              )}
            </div>
          </div>

          {isPending && (
            <div className="text-xs text-slate-400 sm:text-right">
              Batas Waktu Bayar: <span className="font-semibold text-white">24 Jam</span>
            </div>
          )}
        </div>

        {/* QRIS / VA Presentation */}
        {isPending && (
          <div className="rounded-xl border border-line bg-canvas-soft p-6 text-center space-y-4">
            {paymentMethodType === "QRIS" ? (
              <div className="space-y-3">
                <div className="text-xs font-medium text-slate-300">
                  Scan QRIS dengan aplikasi Bank atau E-Wallet apa saja
                </div>

                {/* QR Code Container */}
                <div className="mx-auto w-56 h-56 rounded-xl bg-white p-3 shadow-md flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      transaction.paymentDetails.qrString || transaction.invoiceNumber
                    )}`}
                    alt="QRIS Pembayaran"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="text-[11px] text-slate-400">
                  GoPay • DANA • OVO • ShopeePay • BCA Mobile • Livin&apos; • BRImo
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                <div className="text-xs font-medium text-slate-400">
                  Nomor {transaction.paymentMethodName}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-bold text-white tracking-wider">
                    {transaction.paymentDetails.vaNumber || "8077708123456789"}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        transaction.paymentDetails.vaNumber || "8077708123456789",
                        "va"
                      )
                    }
                    className="rounded p-1.5 text-slate-400 hover:text-white transition"
                    title="Salin Nomor VA"
                  >
                    {copiedVa ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Total to pay */}
            <div className="max-w-sm mx-auto rounded-lg border border-line-soft bg-panel-2 p-3 flex items-center justify-between text-xs">
              <div className="text-left">
                <div className="text-slate-400">Total Harus Dibayar</div>
                <div className="text-base font-extrabold text-amber-400">
                  {formatRupiah(transaction.totalAmount)}
                </div>
              </div>
              <button
                onClick={() => handleCopy(transaction.totalAmount.toString(), "total")}
                className="flex items-center gap-1 rounded bg-panel-3 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-panel-4 transition"
              >
                {copiedTotal ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedTotal ? "Disalin" : "Salin"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Breakdown */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Rincian Transaksi
          </div>
          <div className="rounded-lg border border-line bg-canvas-soft p-3.5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Game:</span>
              <span className="font-semibold text-white">{transaction.gameName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Paket / Item:</span>
              <span className="font-semibold text-white">{transaction.itemName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Data Akun:</span>
              <span className="font-mono text-white">
                {transaction.accountData.userId}
                {transaction.accountData.zoneId ? ` (${transaction.accountData.zoneId})` : ""}
              </span>
            </div>
            {transaction.accountData.nickname && (
              <div className="flex justify-between">
                <span className="text-slate-400">Nickname:</span>
                <span className="font-semibold text-emerald-400">
                  {transaction.accountData.nickname}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Metode Pembayaran:</span>
              <span className="text-slate-200">{transaction.paymentMethodName}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-line-soft font-bold text-sm text-white">
              <span>Total Tagihan:</span>
              <span className="text-amber-400">{formatRupiah(transaction.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {instructions.length > 0 && isPending && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Cara Pembayaran
            </div>
            <div className="rounded-lg border border-line bg-canvas-soft p-3.5">
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
                {instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Clean Developer / Testing Sandbox Bar */}
      {(isPending || isProcessing) && (
        <div className="rounded-lg border border-dashed border-line-strong bg-field-2 p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              {isProcessing
                ? "Item sedang diproses provider. Klik untuk memeriksa status pengiriman."
                : "Mode Sandbox: Konfirmasi pembayaran untuk pengujian alur."}
            </span>
          </div>
          <button
            onClick={handlePaymentAction}
            disabled={isSimulating}
            className="rounded bg-panel-3 border border-line-strong px-3 py-1 text-xs font-semibold text-amber-400 hover:bg-panel-4 transition disabled:opacity-50"
          >
            {isSimulating ? (
              "Memproses..."
            ) : isProcessing ? (
              "Periksa Status Pesanan"
            ) : (
              "Konfirmasi Pembayaran"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
