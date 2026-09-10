export default function KebijakanPrivasiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold text-white mb-6">Kebijakan Privasi</h1>
      <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
        <p>RXR menghargai privasi pengguna. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Data akun game (User ID / UID) hanya digunakan untuk verifikasi dan pengisian produk.</li>
          <li>Nomor WhatsApp digunakan untuk mengirim bukti transaksi otomatis.</li>
          <li>Email (opsional) digunakan untuk pengiriman invoice dan notifikasi.</li>
          <li>Kami tidak menyimpan data kartu kredit atau informasi keuangan pengguna.</li>
          <li>Data transaksi disimpan selama 30 hari untuk keperluan verifikasi.</li>
          <li>Kami menggunakan cookie teknis untuk menjaga sesi pengguna.</li>
        </ul>

      </div>
    </div>
  );
}
