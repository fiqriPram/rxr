"use client";

import { useState } from "react";
import { Transaction, Game, PaymentMethod } from "@/db/schema";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import {
  Shield,
  TrendingUp,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Gamepad2,
  Search,
  ExternalLink,
  Loader2,
  Database,
} from "lucide-react";

interface AdminDashboardProps {
  initialTransactions: Transaction[];
  games: Game[];
  paymentMethods: PaymentMethod[];
  isDbConnected: boolean;
}

export default function AdminDashboardClient({
  initialTransactions,
  games,
  paymentMethods,
  isDbConnected,
}: AdminDashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activeTab, setActiveTab] = useState<"orders" | "games" | "payments">("orders");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [updatingInvoice, setUpdatingInvoice] = useState<string | null>(null);

  // Calculations
  const totalRevenue = transactions
    .filter((t) => t.status === "SUCCESS")
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const totalOrders = transactions.length;
  const successOrders = transactions.filter((t) => t.status === "SUCCESS").length;
  const pendingOrders = transactions.filter((t) => t.status === "PENDING" || t.status === "PAID").length;

  // Filtered orders
  const filteredOrders = transactions.filter((t) => {
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchSearch =
      searchQuery === "" ||
      t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerPhone.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const handleUpdateStatus = async (invoice: string, newStatus: string) => {
    setUpdatingInvoice(invoice);
    try {
      const res = await fetch(`/api/admin/orders/${invoice}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTransactions((prev) =>
          prev.map((t) => (t.invoiceNumber === invoice ? data.data : t))
        );
      } else {
        alert(data.error || "Gagal mengubah status pesanan");
      }
    } catch {
      alert("Terjadi gangguan saat mengupdate status.");
    } finally {
      setUpdatingInvoice(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-line-soft gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola transaksi, status pesanan, dan metode pembayaran RXR.
          </p>
        </div>

        {/* Database info */}
        <div className="flex items-center gap-2 rounded-lg border border-line-2 bg-panel px-3 py-1.5 text-xs">
          <Database className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-slate-400">Database:</span>
          {isDbConnected ? (
            <span className="font-semibold text-emerald-400">Neon PostgreSQL (Aktif)</span>
          ) : (
            <span className="font-semibold text-amber-400">Local Fallback</span>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-line bg-panel p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Pendapatan</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-lg sm:text-xl font-extrabold text-white">
            {formatRupiah(totalRevenue)}
          </div>
          <span className="text-[10px] text-emerald-400">Dari pesanan sukses</span>
        </div>

        <div className="rounded-xl border border-line bg-panel p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Pesanan</span>
            <CreditCard className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-lg sm:text-xl font-extrabold text-white">{totalOrders}</div>
          <span className="text-[10px] text-slate-400">Semua transaksi</span>
        </div>

        <div className="rounded-xl border border-line bg-panel p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Transaksi Sukses</span>
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-2 text-lg sm:text-xl font-extrabold text-white">{successOrders}</div>
          <span className="text-[10px] text-slate-400">
            Tingkat sukses: {totalOrders > 0 ? Math.round((successOrders / totalOrders) * 100) : 0}%
          </span>
        </div>

        <div className="rounded-xl border border-line bg-panel p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Menunggu Bayar</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-lg sm:text-xl font-extrabold text-amber-400">{pendingOrders}</div>
          <span className="text-[10px] text-slate-400">Status pending</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-line-soft pb-2 text-xs">
        <button
          onClick={() => setActiveTab("orders")}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === "orders"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Daftar Transaksi ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab("games")}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === "games"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Katalog Game ({games.length})
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === "payments"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Metode Pembayaran ({paymentMethods.length})
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              {["ALL", "PENDING", "SUCCESS", "FAILED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                    statusFilter === st
                      ? "bg-blue-600 text-white"
                      : "bg-field text-slate-400 hover:text-white border border-line-2"
                  }`}
                >
                  {st === "ALL" ? "Semua Status" : st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari invoice / nomor HP..."
                className="w-full rounded-lg border border-line-2 bg-panel py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-line bg-panel">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line-soft bg-canvas-soft text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-3.5 py-3">Invoice</th>
                  <th className="px-3.5 py-3">Game & Item</th>
                  <th className="px-3.5 py-3">Akun</th>
                  <th className="px-3.5 py-3">Total & Metode</th>
                  <th className="px-3.5 py-3">Status</th>
                  <th className="px-3.5 py-3 text-right">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const isUpdating = updatingInvoice === order.invoiceNumber;
                    return (
                      <tr key={order.id} className="hover:bg-panel-3 transition">
                        <td className="px-3.5 py-3 font-mono font-bold text-white whitespace-nowrap">
                          <Link
                            href={`/order/${order.invoiceNumber}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 hover:text-blue-400 hover:underline"
                          >
                            <span>{order.invoiceNumber}</span>
                            <ExternalLink className="h-3 w-3 text-slate-400" />
                          </Link>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {new Date(order.createdAt).toLocaleDateString("id-ID")}
                          </div>
                        </td>

                        <td className="px-3.5 py-3">
                          <div className="font-semibold text-white">{order.gameName}</div>
                          <div className="text-[11px] text-slate-400">{order.itemName}</div>
                        </td>

                        <td className="px-3.5 py-3">
                          <div className="font-mono text-slate-200">
                            {order.accountData.userId}
                            {order.accountData.zoneId && ` (${order.accountData.zoneId})`}
                          </div>
                          {order.accountData.nickname && (
                            <div className="text-[10px] text-emerald-400">
                              {order.accountData.nickname}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400">
                            WA: {order.customerPhone}
                          </div>
                        </td>

                        <td className="px-3.5 py-3">
                          <div className="font-bold text-white">
                            {formatRupiah(order.totalAmount)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {order.paymentMethodName}
                          </div>
                        </td>

                        <td className="px-3.5 py-3">
                          {order.status === "SUCCESS" ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                              <CheckCircle2 className="h-3 w-3" /> Sukses
                            </span>
                          ) : order.status === "PENDING" ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-800">
                              <Clock className="h-3 w-3" /> Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800">
                              <AlertCircle className="h-3 w-3" /> {order.status}
                            </span>
                          )}
                        </td>

                        <td className="px-3.5 py-3 text-right">
                          {isUpdating ? (
                            <Loader2 className="inline h-3.5 w-3.5 animate-spin text-blue-400" />
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              {order.status !== "SUCCESS" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(order.invoiceNumber, "SUCCESS")
                                  }
                                  className="rounded bg-emerald-950/80 border border-emerald-600/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-900"
                                >
                                  Sukses
                                </button>
                              )}
                              {order.status !== "PENDING" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(order.invoiceNumber, "PENDING")
                                  }
                                  className="rounded bg-amber-950/80 border border-amber-600/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300 hover:bg-amber-900"
                                >
                                  Pending
                                </button>
                              )}
                              {order.status !== "FAILED" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(order.invoiceNumber, "FAILED")
                                  }
                                  className="rounded bg-rose-950/80 border border-rose-600/30 px-2 py-0.5 text-[10px] font-semibold text-rose-300 hover:bg-rose-900"
                                >
                                  Gagal
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Tidak ada transaksi ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Games Tab */}
      {activeTab === "games" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {games.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 rounded-lg border border-line bg-panel p-3"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-canvas-soft">
                <img src={g.thumbnailUrl} alt={g.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{g.name}</h4>
                <div className="text-[10px] text-slate-400">{g.developer}</div>
              </div>
              <Link
                href={`/topup/${g.slug}`}
                target="_blank"
                className="rounded p-1.5 text-slate-400 hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === "payments" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="flex items-center justify-between rounded-lg border border-line bg-panel p-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-11 shrink-0 items-center justify-center rounded bg-white p-1">
                  <img src={pm.iconUrl} alt={pm.name} className="max-h-6 object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{pm.name}</h4>
                  <div className="text-[10px] text-slate-400">
                    Biaya: {formatRupiah(pm.feeFlat)} ({pm.feePercentage}%)
                  </div>
                </div>
              </div>
              <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                AKTIF
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
