import Link from "next/link";

export default function Footer() {
  const paymentLogos = [
    { name: "QRIS", src: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" },
    { name: "BCA", src: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" },
    { name: "Mandiri", src: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg" },
    { name: "BRI", src: "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg" },
    { name: "DANA", src: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" },
    { name: "GoPay", src: "https://upload.wikimedia.org/wikipedia/commons/6/65/Gopay_logo_%282019%29.svg" },
    { name: "Alfamart", src: "https://upload.wikimedia.org/wikipedia/commons/8/86/Alfamart_logo.svg" },
  ];

  return (
    <footer className="border-t border-line-soft bg-canvas text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm">
                R
              </div>
              <span className="text-lg font-black text-white">RXR.</span>
            </Link>
            <p className="max-w-md text-slate-400 text-xs leading-relaxed">
              RXR adalah portal penyedia layanan top-up game dan voucher digital terpercaya di Indonesia dengan pemrosesan instan 24 jam nonstop secara otomatis.
            </p>
            <div className="pt-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Metode Pembayaran:
              </div>
              <div className="flex flex-wrap gap-2">
                {paymentLogos.map((p) => (
                  <div
                    key={p.name}
                    className="flex h-7 items-center justify-center rounded bg-white px-2 py-0.5 border border-slate-200"
                  >
                    <img src={p.src} alt={p.name} className="h-4 max-w-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Menu Utama</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/#katalog-game" className="hover:text-white transition">
                  Katalog Game
                </Link>
              </li>
              <li>
                <Link href="/lacak" className="hover:text-white transition">
                  Lacak Pesanan
                </Link>
              </li>
              <li>
                <Link href="/#promo-section" className="hover:text-white transition">
                  Promo & Voucher
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  Hubungi CS (WhatsApp)
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Bantuan & Ketentuan</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <span className="text-slate-400">Jam Operasional: 24/7 Nonstop</span>
              </li>
              <li>
                <span className="text-slate-400">Garansi: 100% Produk Legal</span>
              </li>
              <li>
                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                  Portal Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-line-soft pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} RXR. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span className="hover:text-slate-200 cursor-pointer">Syarat & Ketentuan</span>
            <span className="hover:text-slate-200 cursor-pointer">Kebijakan Privasi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
