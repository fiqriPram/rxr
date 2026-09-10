export default function SyaratKetentuanPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold text-white mb-6">Syarat & Ketentuan</h1>
      <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
        <p>Dengan menggunakan layanan RXR, Anda menyetujui syarat dan ketentuan berikut:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Semua transaksi bersifat final dan tidak dapat dibatalkan setelah pembayaran berhasil.</li>
          <li>Pengguna bertanggung jawab atas keakuratan data akun game (User ID / UID).</li>
          <li>RXR tidak bertanggung jawab atas kesalahan pengisian data oleh pengguna.</li>
          <li>Garansi 100% legal hanya berlaku jika menggunakan jalur API resmi publisher.</li>
          <li>Waktu proses pengisian bervariasi antara 1 detik hingga 3 menit tergantung kondisi server game.</li>
          <li>Pengguna wajib memastikan saldo mencukupi sebelum melakukan transaksi.</li>
        </ul>

      </div>
    </div>
  );
}
