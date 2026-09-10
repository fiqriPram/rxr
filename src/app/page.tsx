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
  tint: HeroSlide["tint"];
}[] = [
  { slug: "mobile-legends", badge: "EVENT PROMO", tint: "blue" },
  { slug: "free-fire", badge: "TOP UP BOOYAH", tint: "emerald" },
  { slug: "genshin-impact", badge: "RESMI HOYOVERSE", tint: "indigo" },
  { slug: "valorant", badge: "RANKED READY", tint: "rose" },
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
    "mobile-legends": "https://wacdn.mlbb.com/image/1511512578-dfb367046420_mobile-legends-bang-bang.jpg",
    "free-fire": "https://d1j1u4tjg8uq8g.cloudfront.net/banner-free-fire.jpg",
    "genshin-impact": "https://webstatic.mihoyo.com/banner/Genshin_Impact_Thumbnail.jpg",
    "valorant": "https://media.valorantpoint.com/banner/valorant-hero.jpg",
    "pubg-mobile": "https://static.pubg.com/banner/pubg-mobile-hero.jpg",
    "steam-wallet": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/753/hero.jpg",
    "call-of-duty-mobile": "https://media.valorantpoint.com/banner/codm-hero.jpg",
    "roblox": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/753/hero.jpg",
    "minecraft": "https://wacdn.mlbb.com/image/minecraft_banner.jpg",
  };

  const heroSlides: HeroSlide[] = featured.map((game, i) => {
    const items = (itemLists[i] || []).filter((it) => it.isActive);
    const minPrice = items.reduce((m, it) => Math.min(m, it.price), 0) || 0;
    return {
      id: i + 1,
      badge: HERO_ORDER[i].badge,
      title: game!.name,
      subtitle: game!.description || game!.name,
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
        <div className="rounded-xl border border-line bg-panel p-4">
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
              <div className="flex items-center gap-2 rounded-lg bg-canvas-soft border border-line-2 px-3 py-1.5 text-xs">
                <Tag className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-mono font-bold text-white">RXRHEMAT</span>
                <span className="text-emerald-400 font-semibold">(Diskon 10%)</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-canvas-soft border border-line-2 px-3 py-1.5 text-xs">
                <Tag className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-mono font-bold text-white">NEONBARU</span>
                <span className="text-emerald-400 font-semibold">(Diskon Rp 5.000)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Game Catalog Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <Suspense fallback={null}>
          <GameGrid games={games} categories={categories} />
        </Suspense>
      </section>

      {/* Service Guarantees */}
      <section className="border-t border-line-soft bg-canvas-soft py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-hover flex items-start gap-3 rounded-lg border border-line bg-panel-2 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Pengiriman Instan</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Diamond masuk 1-3 detik</p>
              </div>
            </div>

            <div className="card-hover flex items-start gap-3 rounded-lg border border-line bg-panel-2 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">100% Resmi & Legal</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Langsung dari publisher</p>
              </div>
            </div>

            <div className="card-hover flex items-start gap-3 rounded-lg border border-line bg-panel-2 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-600/10 text-amber-400 border border-amber-500/20">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Pembayaran Lengkap</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">QRIS, VA Bank & E-Wallet</p>
              </div>
            </div>

            <div className="card-hover flex items-start gap-3 rounded-lg border border-line bg-panel-2 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                <Headphones className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Bantuan CS 24 Jam</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Siap bantu kendala Anda</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 text-center">
          Pertanyaan Umum (FAQ)
        </h3>

        <div className="space-y-2 text-xs">
          <div className="card-hover rounded-lg border border-line bg-panel p-3.5">
            <span className="font-bold text-white">Berapa lama proses pengisian top-up?</span>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Setelah pembayaran selesai dan terverifikasi oleh sistem, diamond/voucher akan masuk secara otomatis dalam kurun waktu 1 hingga 3 detik.
            </p>
          </div>

          <div className="card-hover rounded-lg border border-line bg-panel p-3.5">
            <span className="font-bold text-white">Apakah diamond dan voucher ini legal?</span>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Semua produk di RXR diisi melalui jalur API distributor resmi publisher game terkait sehingga dijamin 100% legal dan aman dari banned.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}