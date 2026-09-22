import { Suspense } from "react";
import { getGames, getCategories, getItemsByGameId } from "@/db/repo";
import HeroBanner, { HeroSlide } from "@/components/HeroBanner";
import GameGrid from "@/components/GameGrid";
import { formatRupiah } from "@/lib/utils";
import {
  Zap,
  ShieldCheck,
  Headphones,
  CreditCard,
  Tag,
} from "lucide-react";

export const dynamic = "force-dynamic";

const HERO_ORDER: {
  slug: string;
  badge: string;
  headline: string;
  sub: string;
  tint: HeroSlide["tint"];
}[] = [
  {
    slug: "mobile-legends",
    badge: "FLASH SALE",
    headline: "Diamond MLBB Instan",
    sub: "Isi diamond kapan saja — masuk ke akun dalam hitungan detik, tanpa antre.",
    tint: "blue",
  },
  {
    slug: "free-fire",
    badge: "HARGA BERSAHABAT",
    headline: "Diamond Free Fire",
    sub: "Booyah makin mudah: top up cepat dan bayar pakai metode apa saja.",
    tint: "emerald",
  },
  {
    slug: "genshin-impact",
    badge: "RESMI & AMAN",
    headline: "Genesis Crystal",
    sub: "Top up langsung via UID. Aman untuk akunmu dan bergaransi penuh.",
    tint: "indigo",
  },
  {
    slug: "valorant",
    badge: "SIAP MAIN",
    headline: "Valorant Points",
    sub: "Amankan skin incaranmu sebelum match berikutnya dimulai.",
    tint: "rose",
  },
];

export default async function HomePage() {
  const [games, categories] = await Promise.all([
    getGames(),
    getCategories(),
  ]);

  const featured = HERO_ORDER.map((h) => games.find((g) => g.slug === h.slug))
    .filter((g) => !!g);

  const itemLists = await Promise.all(
    featured.map((g) => getItemsByGameId(g!.id))
  );

  // Official artwork mapping for reliable game images
  const artworkMap: Record<string, string> = {
    "mobile-legends": "/images/banner/mlbb.png",
    "free-fire": "/images/banner/ff.png",
    "genshin-impact": "/images/banner/genshin-impact.png",
    "valorant": "/images/banner/valorant.png",
    "pubg-mobile": "/images/banner/pubgm.png",
    "steam-wallet": "/images/voucher/steam.png",
    "call-of-duty-mobile": "/images/banner/codm.png",
    "roblox": "/images/banner/roblox.png",
  };

  const heroSlides: HeroSlide[] = featured.map((game, i) => {
    const items = (itemLists[i] || []).filter((it) => it.isActive);
    const minPrice = items.reduce((m, it) => Math.min(m, it.price), 0) || 0;
    return {
      id: i + 1,
      badge: HERO_ORDER[i].badge,
      title: HERO_ORDER[i].headline,
      subtitle: HERO_ORDER[i].sub,
      tag: minPrice > 0 ? `Mulai ${formatRupiah(minPrice)}` : "Lihat Harga",
      linkText: "Top Up Sekarang",
      href: `/topup/${game!.slug}`,
      image: artworkMap[game!.slug] || game!.bannerUrl,
      tint: HERO_ORDER[i].tint,
    };
  });

  heroSlides.push({
    id: 99,
    badge: "HEMAT 10%",
    title: "Voucher Diskon: RXHEMAT",
    subtitle:
      "Klaim potongan hingga Rp 15.000 untuk semua game tanpa antre. Masukkan kode saat checkout.",
    tag: "Kode: RXRHEMAT",
    linkText: "Lihat Katalog",
    href: "/#katalog-game",
    image: null,
    tint: "amber",
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner Section */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <HeroBanner slides={heroSlides} />
      </section>

      {/* Promo Voucher Strip */}
      <section id="promo-section" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Voucher & Kode Diskon Hari Ini
              </div>
              <p className="text-xs text-slate-400">
                Gunakan kode voucher promo di bawah saat checkout untuk potongan harga langsung.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-panel border border-line px-3 py-1.5 text-xs">
                <Tag className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-mono font-bold text-white">RXRHEMAT</span>
                <span className="text-emerald-400 font-semibold">-10%</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-panel border border-line px-3 py-1.5 text-xs">
                <Tag className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-mono font-bold text-white">NEONBARU</span>
                <span className="text-emerald-400 font-semibold">-Rp5rb</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Game Catalog Grid */}
      <Suspense fallback={null}>
        <GameGrid games={games} categories={categories} />
      </Suspense>

      {/* Service Guarantees */}
      <section className="border-t border-line-soft py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h3 className="mb-4 text-base font-bold text-white text-center">
            Kenapa Belanja di RXR?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-start gap-3 rounded-xl border border-line bg-panel p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Kirim Otomatis</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Item masuk sesaat setelah bayar</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-line bg-panel p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Stok Resmi</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Dari jalur distributor resmi</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-line bg-panel p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Bayar Fleksibel</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">QRIS, virtual account & e-wallet</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-line bg-panel p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-600 text-white">
                <Headphones className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">CS Siaga</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Tim kami siap membantu kapan pun</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 space-y-3">
        <h3 className="text-base font-bold text-white text-center">
          Pertanyaan Umum
        </h3>

        <div className="space-y-2 text-xs">
          <div className="rounded-xl border border-line bg-panel p-4">
            <span className="font-bold text-white">Berapa lama proses pengisian top-up?</span>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Begitu pembayaranmu terverifikasi, item langsung dikirim otomatis ke akun — biasanya hanya butuh beberapa detik.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-panel p-4">
            <span className="font-bold text-white">Apakah diamond dan voucher ini legal?</span>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Ya. Semua produk RXR diambil dari jalur distributor resmi, jadi akunmu tetap aman.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}