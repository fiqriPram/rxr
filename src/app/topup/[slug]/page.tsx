import { notFound } from "next/navigation";
import Link from "next/link";
import { getGameBySlug, getItemsByGameId, getPaymentMethods } from "@/db/repo";
import TopUpForm from "@/components/TopUpForm";
import { ArrowLeft, ShieldCheck, Zap, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

interface TopUpPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TopUpPageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return { title: "Game Tidak Ditemukan - RXR" };

  return {
    title: `Top Up ${game.name} Murah & Cepat - RXR`,
    description: `Beli diamond, voucher, atau item resmi ${game.name} dengan harga termurah, proses otomatis 1 detik, pembayaran QRIS, E-Wallet & Transfer Bank.`,
  };
}

export default async function TopUpPage({ params }: TopUpPageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const [items, paymentMethods] = await Promise.all([
    getItemsByGameId(game.id),
    getPaymentMethods(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-4">
      {/* Breadcrumb / Back */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Katalog Game</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Game Info Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-line bg-panel overflow-hidden">
            {/* Cover Banner */}
            <div className="relative aspect-video w-full overflow-hidden bg-canvas-soft">
              <img
                src={game.bannerUrl}
                alt={game.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/40 to-transparent" />
            </div>

            {/* Profile Info */}
            <div className="p-4 sm:p-5 -mt-10 relative z-10 space-y-3">
              <div className="flex items-end gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line-strong bg-canvas-soft shadow-md">
                  <img
                    src={game.thumbnailUrl}
                    alt={game.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="pb-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    {game.developer}
                  </div>
                  <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {game.name}
                  </h1>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {game.description}
              </p>

              {/* Guarantees */}
              <div className="rounded-lg border border-line-soft bg-canvas-soft p-3 space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Pengiriman Otomatis 1-3 Detik</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>100% Legal dari Server Resmi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>Layanan Aktif 24 Jam Nonstop</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Checkout Flow */}
        <div className="lg:col-span-8">
          <TopUpForm
            game={game}
            items={items}
            paymentMethods={paymentMethods}
          />
        </div>
      </div>
    </div>
  );
}
