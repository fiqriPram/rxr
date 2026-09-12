export const metadata = {
  title: "Syarat & Ketentuan - RXR",
  description: "Syarat dan ketentuan penggunaan layanan top-up game RXR.",
};

const sections = [
  {
    title: "1. Umum",
    body: "Dengan mengakses dan menggunakan layanan RXR, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan ini. Jika tidak setuju, mohon tidak menggunakan layanan kami.",
  },
  {
    title: "2. Produk & Harga",
    body: "Seluruh produk berupa item game digital dan voucher. Harga dapat berubah sewaktu-waktu mengikuti harga distributor tanpa pemberitahuan terlebih dahulu. Harga yang berlaku adalah harga saat checkout.",
  },
  {
    title: "3. Data Akun",
    body: "Pengguna wajib memastikan kebenaran User ID, Zone/Server ID, dan data akun lainnya. Kesalahan pengisian data yang mengakibatkan item masuk ke akun yang salah bukan tanggung jawab RXR dan tidak dapat dikembalikan.",
  },
  {
    title: "4. Pembayaran",
    body: "Pesanan diproses setelah pembayaran terverifikasi penuh. Batas waktu pembayaran 24 jam sejak invoice dibuat; order yang tidak dibayar otomatis dibatalkan.",
  },
  {
    title: "5. Pengiriman",
    body: "Item dikirim otomatis 1 detik hingga 5 menit setelah pembayaran. Keterlambatan akibat gangguan server publisher game akan diinformasikan dan diselesaikan maksimal 1x24 jam.",
  },
  {
    title: "6. Penyalahgunaan",
    body: "RXR berhak membatalkan transaksi dan memblokir akun yang terindikasi penipuan, chargeback fiktif, atau penyalahgunaan sistem.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold text-white">Syarat & Ketentuan</h1>
      <p className="mt-1 text-xs text-slate-400">Terakhir diperbarui: September 2026</p>
      <div className="mt-6 space-y-3">
        {sections.map((s) => (
          <div key={s.title} className="rounded-xl border border-line bg-panel p-4">
            <h2 className="text-sm font-bold text-white">{s.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
