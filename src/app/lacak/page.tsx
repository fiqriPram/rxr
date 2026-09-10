"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Transaction } from "@/db/schema";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import {
  Receipt,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<"invoice" | "phone">("invoice");
  const [invoiceInput, setInvoiceInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneOrders, setPhoneOrders] = useState<Transaction[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearchInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceInput.trim()) {
      setErrorMessage("Silakan masukkan nomor invoice.");
      return;
    }
    setErrorMessage("");
    router.push(`/order/${invoiceInput.trim().toUpperCase()}`);
  };

  const handleSearchPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim() || phoneInput.length < 9) {
      setErrorMessage("Masukkan nomor WhatsApp yang valid (min. 10 digit).");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setPhoneOrders(null);

    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phoneInput.trim())}`);
      const data = await res.json();
      if (data.success) {
        setPhoneOrders(data.data || []);
      } else {
        setErrorMessage(data.error || "Gagal mencari riwayat transaksi");
      }
    } catch {
      setErrorMessage("Gangguan saat mencari riwayat transaksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Lacak Pesanan
        </h1>
        <p className="text-xs text-slate-400">
          Cek status transaksi dan bukti pembayaran faktur Anda.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg bg-panel p-1 border border-line text-xs font-medium">
          <button
            onClick={() => {
              setSearchType("invoice");
              setErrorMessage("");
            }}
            className={`rounded-md px-3.5 py-1.5 transition ${
              searchType === "invoice"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Nomor Invoice
          </button>
          <button
            onClick={() => {
              setSearchType("phone");
              setErrorMessage("");
            }}
            className={`rounded-md px-3.5 py-1.5 transition ${
              searchType === "phone"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Nomor WhatsApp
          </button>
        </div>
      </div>

      {/* Search Form Card */}
      <div className="rounded-xl border border-line bg-panel p-5 sm:p-6 shadow-sm">
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {searchType === "invoice" ? (
          <form onSubmit={handleSearchInvoice} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nomor Invoice Transaksi
              </label>
              <input
                type="text"
                value={invoiceInput}
                onChange={(e) => setInvoiceInput(e.target.value.toUpperCase())}
                placeholder="Contoh: TPY-20260910-OFE6O"
                className="w-full rounded-lg border border-line-2 bg-canvas-soft px-3.5 py-2 text-xs text-white placeholder-slate-500 uppercase font-mono focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-2.5 text-xs"
            >
              Cari Status Pesanan
            </button>
          </form>
        ) : (
          <form onSubmit={handleSearchPhone} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nomor WhatsApp Pembeli
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full rounded-lg border border-line-2 bg-canvas-soft px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-xs disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mencari...
                </>
              ) : (
                "Cari Riwayat Pesanan"
              )}
            </button>
          </form>
        )}
      </div>

      {/* Phone History Results */}
      {phoneOrders !== null && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Riwayat Pesanan Ditemukan ({phoneOrders.length})
          </h3>

          {phoneOrders.length > 0 ? (
            <div className="space-y-2">
              {phoneOrders.map((order) => (
                <div
                  key={order.id}
                  className="card-hover flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-line bg-panel p-3 hover:border-line-strong transition gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">
                        {order.invoiceNumber}
                      </span>
                      {order.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Sukses
                        </span>
                      ) : order.status === "PROCESSING" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-950/80 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
                          <Loader2 className="h-3 w-3 animate-spin" /> Diproses
                        </span>
                      ) : order.status === "FAILED" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-950/80 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">
                          <AlertCircle className="h-3 w-3" /> Gagal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-950/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                          <Clock className="h-3 w-3" /> Menunggu Bayar
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-slate-300">
                      {order.gameName} • {order.itemName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ID: {order.accountData.userId} • Total: {formatRupiah(order.totalAmount)}
                    </div>
                  </div>

                  <Link
                    href={`/order/${order.invoiceNumber}`}
                    className="inline-flex items-center justify-center gap-1 rounded-md bg-panel-3 border border-line-strong px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-panel-4 transition self-start sm:self-auto"
                  >
                    <span>Faktur</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-line p-6 text-center text-xs text-slate-400">
              Tidak ditemukan pesanan dengan nomor WhatsApp tersebut.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
