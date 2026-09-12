import Link from "next/link";

export const metadata = {
  title: "Kebijakan Pengembalian Dana - RXR",
  description: "Kebijakan refund dan pengembalian dana transaksi RXR.",
};

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold text-white">Kebijakan Pengembalian Dana</h1>
      <p className="mt-1 text-xs text-slate-400">Terakhir diperbarui: September 2026</p>

      <div className="mt-6 space-y-3 text-xs leading-relaxed text-slate-300">
        <div className="rounded-xl border border-line bg-panel p-4">
          <h2 className="text-sm font-bold text-white">1. Produk digital bersifat final</h2>
          <p className="mt-1">
            Item game dan voucher yang sudah berhasil terkirim ke akun tidak dapat dibatalkan,
            ditukar, atau dikembalikan dananya dalam bentuk apa pun.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-panel p-4">
          <h2 className="text-sm font-bold text-white">2. Refund diberikan bila</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Pembayaran berhasil tetapi item tidak masuk dalam 1x24 jam.</li>
            <li>Sistem kami gagal memproses order karena kesalahan teknis dari pihak kami.</li>
            <li>Order dibatalkan sistem sebelum pembayaran (tidak ada dana yang ditarik).</li>
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-panel p-4">
          <h2 className="text-sm font-bold text-white">3. Refund TIDAK diberikan bila</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Salah mengisi User ID / Zone ID / Server ID.</li>
            <li>Berubah pikiran setelah item terkirim.</li>
            <li>Akun game dibatasi publisher karena pelanggaran pemain sendiri.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-panel p-4">
          <h2 className="text-sm font-bold text-white">4. Cara klaim & waktu proses</h2>
          <p className="mt-1">
            Hubungi CS melalui halaman{" "}
            <Link href="/contact" className="font-semibold text-blue-400 hover:text-blue-300">
              Kontak
            </Link>{" "}
            dengan menyertakan nomor invoice dan bukti pembayaran. Refund yang disetujui diproses
            maksimal 7 hari kerja ke sumber dana asal atau saldo akun.
          </p>
        </div>
      </div>
    </div>
  );
}
